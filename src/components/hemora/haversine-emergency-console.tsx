"use client";

import { useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Compass, MapPin, Send, Zap, Clock, ShieldAlert } from "lucide-react";

type HospitalOption = {
  nom: string;
  commune: string;
  lat: number;
  lng: number;
};

const HOSPITAUX_BENIN: HospitalOption[] = [
  { nom: "Hôpital de Zone de Nikki", commune: "Nikki", lat: 9.9400, lng: 3.2108 },
  { nom: "Centre National Hospitalier Universitaire (CNHU-HKM)", commune: "Cotonou", lat: 6.3653, lng: 2.4208 },
  { nom: "Centre Hospitalier Universitaire Départemental (CHUD)", commune: "Parakou", lat: 9.3512, lng: 2.6189 },
  { nom: "Centre Hospitalier Départemental (CHD Ouémé)", commune: "Porto-Novo", lat: 6.4969, lng: 2.6288 },
  { nom: "Hôpital de Zone de Kandi", commune: "Kandi", lat: 11.1342, lng: 2.9381 },
  { nom: "Hôpital de Zone d'Abomey-Calavi", commune: "Abomey-Calavi", lat: 6.4485, lng: 2.3556 },
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
};

export function HaversineEmergencyConsole(): ReactNode {
  const [selectedHospital, setSelectedHospital] = useState<HospitalOption>(HOSPITAUX_BENIN[0]);
  const [selectedGroupe, setSelectedGroupe] = useState<string>("O-");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    matches: MatchedDonor[];
    totalTrouves: number;
    pointUrgence: { lat: number; lng: number };
  } | null>(null);
  const [smsSendingNpi, setSmsSendingNpi] = useState<string | null>(null);
  const [smsSuccessMsg, setSmsSuccessMsg] = useState<string | null>(null);

  const handleRunMatching = async () => {
    try {
      setLoading(true);
      setError(null);
      setSmsSuccessMsg(null);

      const url = `/api/v1/hemora/matching?lat=${selectedHospital.lat}&lng=${selectedHospital.lng}&groupe=${encodeURIComponent(selectedGroupe)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors du calcul du matching d'urgence");
      }

      setResults({
        matches: data.data || [],
        totalTrouves: data.totalTrouves || 0,
        pointUrgence: data.pointUrgence,
      });
    } catch (err: any) {
      setError(err.message || "Impossible de joindre le moteur de matching.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendUrgentSms = async (donor: MatchedDonor) => {
    try {
      setSmsSendingNpi(donor.npi);
      setSmsSuccessMsg(null);

      const message = `🚨 URGENCE TRANSFUSION CNTS BÉNIN : Besoin immédiat de sang ${selectedGroupe} à ${selectedHospital.nom}. Votre proximité : ${donor.distanceKm.toFixed(1)} km. Présentez-vous ou appelez le 136. Défraiement 2 000 FCFA garanti.`;
      
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
        setSmsSuccessMsg(`Alerte SMS transmise avec succès à ${donor.nomComplet} (${donor.telephone}).`);
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
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Moteur Géodésique WGS84 • Rayon 0-45 km</span>
          </div>
          <h3 className="mt-2 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Console de Matching d&apos;Urgence Transfusionnelle
          </h3>
          <p className="mt-1 text-sm text-foreground/70">
            Connectée en temps réel au registre des donneurs HEMORA et aux hôpitaux du Bénin.
          </p>
        </div>

        <button
          onClick={handleRunMatching}
          disabled={loading}
          className="focus-ring inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition-all hover:bg-red-700 disabled:opacity-60"
        >
          <Compass className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Calcul Haversine en cours..." : "Calculer le Matching d'Urgence"}</span>
        </button>
      </div>

      {/* Selectors Matrix */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/60 mb-2">
            Hôpital Demandeur (Point d&apos;Impact)
          </label>
          <select
            value={selectedHospital.nom}
            onChange={(e) => {
              const h = HOSPITAUX_BENIN.find((item) => item.nom === e.target.value);
              if (h) setSelectedHospital(h);
            }}
            className="w-full rounded-xl border border-foreground/12 bg-background px-4 py-2.5 text-sm font-medium text-foreground focus:outline-hidden focus:ring-2 focus:ring-red-500/40"
          >
            {HOSPITAUX_BENIN.map((h) => (
              <option key={h.nom} value={h.nom}>
                {h.nom} ({h.commune})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-foreground/60 mb-2">
            Groupe Sanguin Requis
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
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{smsSuccessMsg}</span>
        </div>
      )}

      {/* Live Results Display */}
      {results && (
        <div className="mt-6 border-t border-foreground/8 pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-foreground/70">
              Résultats du Matching Géodésique ({results.totalTrouves} donneurs éligibles détectés)
            </span>
            <span className="text-xs font-mono text-foreground/50">
              GPS : {results.pointUrgence.lat.toFixed(4)}° N, {results.pointUrgence.lng.toFixed(4)}° E
            </span>
          </div>

          {results.matches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-foreground/15 p-8 text-center text-sm text-foreground/60">
              Aucun donneur compatible trouvé dans le rayon immédiat de 45 km pour {selectedGroupe}.
              Activation du transfert de dépôts inter-départementaux recommandée.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.matches.map((donor) => (
                <div
                  key={donor.npi}
                  className="flex flex-col justify-between rounded-2xl border border-foreground/10 bg-background/60 p-4 transition-all hover:border-red-500/30 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">
                          {donor.nomComplet}
                        </span>
                        <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                          {donor.groupeSanguin}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-foreground/60">
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
                          ~{donor.dureeAcheminementMinutes} min
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendUrgentSms(donor)}
                      disabled={smsSendingNpi === donor.npi}
                      className="focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                      title="Envoyer une alerte SMS d'urgence vitale"
                    >
                      <Send className="h-3 w-3" />
                      <span>{smsSendingNpi === donor.npi ? "Envoi..." : "Alerter SMS"}</span>
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
