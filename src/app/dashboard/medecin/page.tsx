"use client";

import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Stethoscope,
  ShieldAlert,
  FilePlus2,
  CheckCircle,
  AlertOctagon,
  HeartPulse,
  QrCode,
  Droplet,
  User,
  Zap,
  Leaf,
  Pill,
} from "lucide-react";
import { FadeIn, ScaleUnblur } from "@/components/ui/motion-primitives";

export default function MedecinDashboardPage(): ReactNode {
  const { user } = useAuth();

  // Mode Bris de Glace State
  const [patientNpi, setPatientNpi] = useState("NPI-BEN-1998-0412-8871");
  const [motifUrgence, setMotifUrgence] = useState("Hémorragie obstétricale de la délivrance - Urgence Vitale Absolue");
  const [brisDeGlaceResult, setBrisDeGlaceResult] = useState<any | null>(null);
  const [loadingBrisDeGlace, setLoadingBrisDeGlace] = useState(false);

  // Admission Urgence Vitale State
  const [admissionResult, setAdmissionResult] = useState<any | null>(null);
  const [loadingAdmission, setLoadingAdmission] = useState(false);

  // Prescription State
  const [typePrescription, setTypePrescription] = useState<"CONVENTIONNELLE" | "MTA_CERTIFIEE">("MTA_CERTIFIEE");
  const [medicamentNom, setMedicamentNom] = useState("MALARIS-MTA (Feuilles de Cassia occidentalis)");
  const [posologie, setPosologie] = useState("1 sachet décoction 3 fois par jour pendant 5 jours");
  const [ordonnanceResult, setOrdonnanceResult] = useState<any | null>(null);
  const [loadingPrescription, setLoadingPrescription] = useState(false);

  // Déclencher le Bris de Glace
  const handleBrisDeGlace = async () => {
    setLoadingBrisDeGlace(true);
    try {
      const res = await fetch("/api/v1/encounters/bris-de-glace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientNpi,
          praticienNpi: user?.npi || "NPI-MED-2026-004",
          praticienNom: `${user?.prenom} ${user?.nom}`,
          etablissementNom: user?.etablissementNom || "Hôpital de Zone de Nikki",
          motifUrgence,
        }),
      });
      const data = await res.json();
      setBrisDeGlaceResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBrisDeGlace(false);
    }
  };

  // Admission d'urgence vitale
  const handleAdmissionVitale = async () => {
    setLoadingAdmission(true);
    try {
      const res = await fetch("/api/v1/urgences/admission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientNpi,
          etablissementId: "etab-hz-nikki-01",
          etablissementNom: "Hôpital de Zone de Nikki",
          praticienNpi: user?.npi || "NPI-MED-2026-004",
          motifAdmission: motifUrgence,
          estimationMontantFcfa: 45000,
        }),
      });
      const data = await res.json();
      setAdmissionResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAdmission(false);
    }
  };

  // Émission d'ordonnance
  const handlePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPrescription(true);
    try {
      const res = await fetch("/api/v1/ordonnances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientNpi,
          praticienNpi: user?.npi || "NPI-MED-2026-004",
          typePrescription,
          medicaments: [
            {
              nom: medicamentNom,
              posologie,
              dureeJours: 5,
            },
          ],
        }),
      });
      const data = await res.json();
      setOrdonnanceResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPrescription(false);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Bannière de Bienvenue */}
      <FadeIn className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border border-red-500/20 bg-gradient-to-r from-red-950/40 via-background to-background backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
            <Stethoscope className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                Service des Urgences & Soins
              </span>
              <span className="text-[11px] text-foreground/50">Prise en charge vitale 24/7</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mt-1">
              Console Clinique & Urgences Vitales
            </h1>
            <p className="text-xs text-foreground/60">
              Praticien : <strong className="text-foreground">{user?.prenom} {user?.nom}</strong> — {user?.etablissementNom}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold">
            <Zap className="h-3.5 w-3.5" />
            <span>Mode Zéro Refus Actif</span>
          </span>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Colonne Gauche : Déclenchement Bris de Glace & Admission */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Card 1 : Dispositif Bris de Glace */}
          <div className="p-6 rounded-3xl border border-red-500/30 bg-background/80 backdrop-blur-md shadow-lg flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Déverrouillage « Bris de Glace »</h2>
                  <p className="text-xs text-foreground/60">Accès urgentiste immédiat aux données vitales (tracé APDP)</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                1 Clic
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] font-bold text-foreground/75 uppercase mb-1">
                  NPI Patient (Numéro Personnel ANIP)
                </label>
                <input
                  type="text"
                  value={patientNpi}
                  onChange={(e) => setPatientNpi(e.target.value)}
                  className="w-full rounded-2xl border border-foreground/15 bg-background px-4 py-2.5 text-xs text-foreground font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground/75 uppercase mb-1">
                  Motif d&apos;Urgence Vitale (Obligatoire APDP)
                </label>
                <input
                  type="text"
                  value={motifUrgence}
                  onChange={(e) => setMotifUrgence(e.target.value)}
                  className="w-full rounded-2xl border border-foreground/15 bg-background px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleBrisDeGlace}
                  disabled={loadingBrisDeGlace}
                  className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span>{loadingBrisDeGlace ? "Déverrouillage en cours..." : "Actionner Bris de Glace"}</span>
                </button>

                <button
                  onClick={handleAdmissionVitale}
                  disabled={loadingAdmission}
                  className="px-4 py-3 rounded-2xl bg-foreground/10 hover:bg-foreground/15 text-foreground font-bold text-xs transition-colors flex items-center gap-1.5"
                  title="Admission sans avance financière"
                >
                  <HeartPulse className="h-4 w-4 text-emerald-500" />
                  <span>{loadingAdmission ? "..." : "Admission Garantie"}</span>
                </button>
              </div>
            </div>

            {/* Résultat Bris de Glace */}
            {brisDeGlaceResult?.success && (
              <ScaleUnblur className="mt-3 p-4 rounded-2xl border border-red-500/30 bg-red-500/5 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-bold text-red-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" /> Profil Vital Déverrouillé avec Succès
                  </span>
                  <span className="font-mono text-[10px] text-foreground/60">Audit ID #{brisDeGlaceResult.auditId}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-red-500/20 text-xs">
                  <div className="p-2 rounded-xl bg-background/60">
                    <span className="text-[10px] text-foreground/50 block">Patient :</span>
                    <span className="font-bold text-foreground">
                      {brisDeGlaceResult.profilVital.prenom} {brisDeGlaceResult.profilVital.nom}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-background/60">
                    <span className="text-[10px] text-foreground/50 block">Groupe Sanguin :</span>
                    <span className="font-bold text-red-500 text-sm">
                      {brisDeGlaceResult.profilVital.groupeSanguin}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-background/60">
                    <span className="text-[10px] text-foreground/50 block">Grossesse :</span>
                    <span className="font-bold text-amber-500">
                      {brisDeGlaceResult.profilVital.estEnceinte
                        ? `${brisDeGlaceResult.profilVital.semaineAmenorrhee} SA`
                        : "Non"}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-background/60">
                    <span className="text-[10px] text-foreground/50 block">Régime ARCH :</span>
                    <span className="font-bold text-emerald-500">
                      {brisDeGlaceResult.profilVital.statutArch ? "Couvert 100%" : "Non"}
                    </span>
                  </div>
                </div>
              </ScaleUnblur>
            )}

            {/* Résultat Admission */}
            {admissionResult?.success && (
              <ScaleUnblur className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-xs text-foreground/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Dossier d&apos;Urgence #{admissionResult.dossier.id} ouvert sous garantie étatique.</span>
                </div>
                <span className="font-mono text-emerald-500 font-bold">
                  {admissionResult.dossier.montantTotalFcfa} FCFA (Différé)
                </span>
              </ScaleUnblur>
            )}
          </div>
        </div>

        {/* Colonne Droite : Prescription Numérique Sécurisée (MTA & Conventionnel) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <form
            onSubmit={handlePrescription}
            className="p-6 rounded-3xl border border-foreground/10 bg-background/80 backdrop-blur-md shadow-lg flex flex-col gap-4"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <FilePlus2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Prescription Sécurisée QR</h2>
                <p className="text-xs text-foreground/60">Conventionnelle ou MTA certifié ARS</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-foreground/75 uppercase mb-1">
                Type de Prescription
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTypePrescription("MTA_CERTIFIEE")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    typePrescription === "MTA_CERTIFIEE"
                      ? "border-amber-500 bg-amber-500/10 text-amber-500"
                      : "border-foreground/10 bg-background text-foreground/60"
                  }`}
                >
                  <Leaf className="h-3.5 w-3.5" />
                  <span>MTA Certifié ARS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTypePrescription("CONVENTIONNELLE")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    typePrescription === "CONVENTIONNELLE"
                      ? "border-blue-500 bg-blue-500/10 text-blue-500"
                      : "border-foreground/10 bg-background text-foreground/60"
                  }`}
                >
                  <Pill className="h-3.5 w-3.5" />
                  <span>Conventionnelle</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-foreground/75 uppercase mb-1">
                Médicament / Remède Homologué
              </label>
              <input
                type="text"
                value={medicamentNom}
                onChange={(e) => setMedicamentNom(e.target.value)}
                className="w-full rounded-2xl border border-foreground/15 bg-background px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-foreground/75 uppercase mb-1">
                Posologie & Durée
              </label>
              <input
                type="text"
                value={posologie}
                onChange={(e) => setPosologie(e.target.value)}
                className="w-full rounded-2xl border border-foreground/15 bg-background px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loadingPrescription}
              className="mt-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <QrCode className="h-4 w-4" />
              <span>{loadingPrescription ? "Génération..." : "Émettre Ordonnance Sécurisée"}</span>
            </button>

            {/* Résultat Ordonnance */}
            {ordonnanceResult?.success && (
              <ScaleUnblur className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col gap-2 mt-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" /> Ordonnance Générée avec Succès
                  </span>
                  <span className="font-mono text-[10px]">{ordonnanceResult.ordonnance.codeUnique}</span>
                </div>
                <p className="text-[11px] text-foreground/70">
                  QR Code cryptographique à usage unique prêt pour délivrance en officine.
                </p>
                <div className="text-[10px] font-mono text-foreground/50 truncate">
                  Hash: {ordonnanceResult.ordonnance.empreinteHash}
                </div>
              </ScaleUnblur>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
