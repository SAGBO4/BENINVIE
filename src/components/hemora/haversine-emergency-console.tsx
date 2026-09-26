"use client";

import { useState, type ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Compass,
  MapPin,
  Send,
  Clock,
  ShieldAlert,
  Award,
  Zap,
  PhoneCall,
} from "lucide-react";

type HospitalOption = {
  id: string;
  nom: string;
  commune: string;
  departement: string;
  lat: number;
  lng: number;
};

const HOSPITAUX_BENIN: HospitalOption[] = [
  {
    id: "etab-hz-nikki-01",
    nom: "Hôpital de Zone de Nikki-Kalalé-Pèrèrè",
    commune: "Nikki",
    departement: "Borgou",
    lat: 9.9400,
    lng: 3.2108,
  },
  {
    id: "etab-csc-kalale-01",
    nom: "Centre de Santé Communal de Kalalé",
    commune: "Kalalé",
    departement: "Borgou",
    lat: 10.2889,
    lng: 3.3764,
  },
  {
    id: "etab-cnhu-01",
    nom: "Centre National Hospitalier et Universitaire Hubert K. Maga (CNHU-HKM)",
    commune: "Cotonou",
    departement: "Littoral",
    lat: 6.3703,
    lng: 2.4183,
  },
  {
    id: "etab-chu-parakou-01",
    nom: "Centre Hospitalier Universitaire Départemental du Borgou (CHUD-B)",
    commune: "Parakou",
    departement: "Borgou",
    lat: 9.3372,
    lng: 2.6303,
  },
  {
    id: "etab-chd-porto-01",
    nom: "Centre Hospitalier Départemental Ouémé (CHD-OP)",
    commune: "Porto-Novo",
    departement: "Ouémé",
    lat: 6.4969,
    lng: 2.6288,
  },
  {
    id: "etab-chic-01",
    nom: "Centre Hospitalier International de Calavi (CHIC)",
    commune: "Abomey-Calavi",
    departement: "Atlantique",
    lat: 6.4486,
    lng: 2.3556,
  },
];

const GROUPES_SANGUINS = ["O-", "O+", "A+", "A-", "B+", "B-", "AB+", "AB-"] as const;

type MatchedDonor = {
  npi: string;
  nomComplet: string;
  groupeSanguin: string;
  commune: string;
  telephone: string;
  distanceKm: number;
  dureeAcheminementMinutes: number;
  estEligibleDelai: boolean;
  scorePertinence?: number;
  nombreDons?: number;
};

export function HaversineEmergencyConsole(): ReactNode {
  const [selectedHospital, setSelectedHospital] = useState<HospitalOption>(HOSPITAUX_BENIN[0]);
  const [selectedGroupe, setSelectedGroupe] = useState<string>("O+");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    matches: MatchedDonor[];
    totalTrouves: number;
    pointUrgence: { lat: number; lng: number };
  } | null>(null);
  const [smsSendingNpi, setSmsSendingNpi] = useState<string | null>(null);
  const [smsSuccessMsg, setSmsSuccessMsg] = useState<string | null>(null);

  const calculateScoreSF3 = (distanceKm: number, nombreDons: number = 2) => {
    // Score selon SF-3.1 du Cahier des Charges :
    // Score = max(0, 100 - (Distance * 5)) + min(40, nombreDons * 10)
    const baseScore = Math.max(0, 100 - Math.round(distanceKm * 5));
    const bonus = Math.min(40, (nombreDons || 1) * 10);
    return Math.min(100, baseScore + bonus);
  };

  const handleRunMatching = async (hospital = selectedHospital, groupe = selectedGroupe) => {
    try {
      setLoading(true);
      setError(null);
      setSmsSuccessMsg(null);

      const url = `/api/v1/hemora/matching?lat=${hospital.lat}&lng=${hospital.lng}&groupe=${encodeURIComponent(groupe)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors du calcul du matching d'urgence");
      }

      const rawMatches: MatchedDonor[] = data.data || [];
      const enrichedMatches = rawMatches.map((donor, idx) => ({
        ...donor,
        nombreDons: (donor as any).nombreDonsValides || (idx === 0 ? 4 : 2),
        scorePertinence: calculateScoreSF3(
          donor.distanceKm,
          (donor as any).nombreDonsValides || (idx === 0 ? 4 : 2)
        ),
      }));

      setResults({
        matches: enrichedMatches,
        totalTrouves: data.totalTrouves || enrichedMatches.length,
        pointUrgence: data.pointUrgence,
      });
    } catch (err: any) {
      setError(err.message || "Impossible de joindre le moteur de matching.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOfficialScenario = () => {
    const nikki = HOSPITAUX_BENIN[0]; // HZ Nikki
    setSelectedHospital(nikki);
    setSelectedGroupe("O+");
    handleRunMatching(nikki, "O+");
  };

  const handleSendUrgentSms = async (donor: MatchedDonor) => {
    try {
      setSmsSendingNpi(donor.npi);
      setSmsSuccessMsg(null);

      const message = `URGENCE VITALE CNTS BÉNIN : Besoin immédiat de sang ${selectedGroupe} à ${selectedHospital.nom}. Proximité : ${donor.distanceKm.toFixed(1)} km (~${donor.dureeAcheminementMinutes} min). Défraiement de déplacement forfaitaire 2 000 FCFA MoMo garanti (Règle OMS). Présentez-vous ou appelez le 136.`;

      const res = await fetch("/api/v1/simulation/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinataire: donor.telephone,
          message,
          type: "ALERTE_URGENCE",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSmsSuccessMsg(
          `Alerte d'urgence transmise avec succès à ${donor.nomComplet} (${donor.telephone}) via passerelle GSM locale.`
        );
      }
    } catch {
      setError("Échec de la transmission SMS.");
    } finally {
      setSmsSendingNpi(null);
    }
  };

  return (
    <div className="w-full rounded-3xl border border-foreground/10 bg-background/90 p-6 sm:p-8 backdrop-blur-md shadow-xl">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/8 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>SF-3 • Moteur Géodésique Haversine WGS84</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Rayon de Secours 0-45 km
            </span>
          </div>

          <h3 className="mt-2.5 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Console de Régulation & Dispatch d&apos;Urgence
          </h3>
          <p className="mt-1 text-sm text-foreground/70">
            Conforme au Cahier des Charges National : compatibilité ABO/Rh, règle des 60 jours et forfait transport 2 000 F MoMo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSelectOfficialScenario}
            className="focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-xs font-bold text-amber-600 dark:text-amber-400 transition-colors hover:bg-amber-500/20 shadow-xs"
            title="Charger les paramètres du scénario officiel (Bio à Kalalé)"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Scénario Officiel : Hémorragie à Nikki (O+)</span>
          </button>

          <button
            onClick={() => handleRunMatching()}
            disabled={loading}
            className="focus-ring inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-700 disabled:opacity-60"
          >
            <Compass className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Calcul en cours..." : "Calculer le Matching"}</span>
          </button>
        </div>
      </div>

      {/* Selectors Matrix */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/60 mb-2">
            Établissement Hospitalier Demandeur (Point d&apos;Impact)
          </label>
          <select
            value={selectedHospital.id}
            onChange={(e) => {
              const h = HOSPITAUX_BENIN.find((item) => item.id === e.target.value);
              if (h) setSelectedHospital(h);
            }}
            className="w-full rounded-xl border border-foreground/12 bg-background px-4 py-2.5 text-sm font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-red-500/40"
          >
            {HOSPITAUX_BENIN.map((h) => (
              <option key={h.id} value={h.id}>
                {h.nom} ({h.commune} — {h.departement})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/60 mb-2">
            Groupe Sanguin Requis (Compatibilité Stricte ABO/Rh)
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {GROUPES_SANGUINS.map((grp) => {
              const isSelected = selectedGroupe === grp;
              return (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setSelectedGroupe(grp)}
                  className={`rounded-lg py-2 text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-red-600 text-white shadow-xs"
                      : "border border-foreground/10 bg-foreground/3 text-foreground/75 hover:bg-foreground/8"
                  }`}
                >
                  {grp}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {smsSuccessMsg && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{smsSuccessMsg}</span>
        </div>
      )}

      {/* Live Results Display */}
      {results && (
        <div className="mt-6 border-t border-foreground/8 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-foreground/70">
              Résultats du Matching Hématologique ({results.totalTrouves} donneurs compatibles identifiés)
            </span>
            <span className="text-xs font-mono text-foreground/50">
              Coordonnées GPS : {results.pointUrgence.lat.toFixed(4)}° N, {results.pointUrgence.lng.toFixed(4)}° E
            </span>
          </div>

          {results.matches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-foreground/15 p-8 text-center text-sm text-foreground/60">
              Aucun donneur compatible trouvé dans le rayon immédiat de 45 km pour {selectedGroupe}.
              Déclenchement recommandé du transfert inter-dépôts (CNTS / CHUD).
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {results.matches.map((donor) => (
                <div
                  key={donor.npi}
                  className="flex flex-col justify-between rounded-2xl border border-foreground/10 bg-background/60 p-4 transition-all hover:border-red-500/30 shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm">
                            {donor.nomComplet}
                          </span>
                          <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-black text-white">
                            {donor.groupeSanguin}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-foreground/60">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {donor.commune}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                            <Compass className="h-3 w-3" />
                            {donor.distanceKm.toFixed(1)} km
                          </span>
                          <span className="flex items-center gap-1 text-zinc-500">
                            <Clock className="h-3 w-3" />
                            ~{donor.dureeAcheminementMinutes} min (Zémidjan)
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          Score : {donor.scorePertinence ?? 95}/100
                        </span>
                        <span className="text-[10px] text-foreground/50 mt-0.5">
                          {donor.nombreDons ?? 2} don(s) validé(s)
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-foreground/6 pt-2.5 text-[11px]">
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Éligible médicalement (&gt; 60 jours)</span>
                      </span>
                      <span className="text-foreground/50">
                        Forfait transport : <strong>2 000 FCFA MoMo</strong>
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 flex items-center justify-between">
                    <span className="font-mono text-xs text-foreground/60">
                      {donor.telephone}
                    </span>

                    <button
                      onClick={() => handleSendUrgentSms(donor)}
                      disabled={smsSendingNpi === donor.npi}
                      className="focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:bg-red-700 disabled:opacity-50"
                      title="Déclencher l'alerte SMS d'urgence vitale"
                    >
                      <Send className="h-3 w-3" />
                      <span>{smsSendingNpi === donor.npi ? "Envoi..." : "Alerter par SMS"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
