"use client";

import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Activity,
  Mic,
  Send,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Coins,
  WifiOff,
  UserPlus,
} from "lucide-react";
import { FadeIn, ScaleUnblur } from "@/components/ui/motion-primitives";

export default function AscDashboardPage(): ReactNode {
  const { user } = useAuth();

  // Triage IA State
  const [symptomes, setSymptomes] = useState("Bio Gouda présente des céphalées intenses, œdèmes des membres inférieurs et tension élevée à 7 mois de grossesse");
  const [langue, setLangue] = useState("fr");
  const [triageResult, setTriageResult] = useState<any | null>(null);
  const [loadingTriage, setLoadingTriage] = useState(false);

  // Transfert Fléché GBESSOKE State
  const [patientNpi, setPatientNpi] = useState("NPI-BEN-1998-0412-8871");
  const [telephone, setTelephone] = useState("+229 97 45 12 33");
  const [typeActe, setTypeActe] = useState("CPN3");
  const [transfertResult, setTransfertResult] = useState<any | null>(null);
  const [loadingTransfert, setLoadingTransfert] = useState(false);

  // Lancer l'analyse Triage IA
  const handleTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingTriage(true);
    try {
      const res = await fetch("/api/v1/triage/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptomes,
          langue,
          patientAge: 28,
          estEnceinte: true,
        }),
      });
      const data = await res.json();
      setTriageResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTriage(false);
    }
  };

  // Déclencher le transfert fléché GBESSOKE
  const handleTransfert = async () => {
    setLoadingTransfert(true);
    try {
      const res = await fetch("/api/v1/transfers/fleches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientNpi,
          telephone,
          typeActe,
          montantFcfa: 5000,
          ascNpi: user?.npi || "NPI-ASC-2026-005",
        }),
      });
      const data = await res.json();
      setTransfertResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTransfert(false);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Bannière de Bienvenue */}
      <FadeIn className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-background to-background backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PWA Hors-Ligne • 16 000 ASC
              </span>
              <span className="text-[11px] text-foreground/50">Santé Communautaire</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mt-1">
              Console Terrain ASC & Triage IA Multilingue
            </h1>
            <p className="text-xs text-foreground/60">
              Agent de Santé : <strong className="text-foreground">{user?.prenom} {user?.nom}</strong> — {user?.etablissementNom}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background border border-foreground/10 text-xs text-emerald-500 font-semibold">
            <Smartphone className="h-4 w-4" />
            <span>Mode PWA Actif (Borgou / Kalalé)</span>
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Colonne Gauche : Triage Médical IA Multilingue */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <form
            onSubmit={handleTriage}
            className="p-6 rounded-3xl border border-foreground/10 bg-background/80 backdrop-blur-md shadow-lg flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Triage Clinique IA (Gemini)</h2>
                  <p className="text-xs text-foreground/60">Assistance au diagnostic précoce en langues nationales</p>
                </div>
              </div>

              <select
                value={langue}
                onChange={(e) => setLangue(e.target.value)}
                className="rounded-xl border border-foreground/15 bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
              >
                <option value="fr">Français</option>
                <option value="bariba">Bariba (Baatonu)</option>
                <option value="fon">Fon-gbe</option>
                <option value="yoruba">Yoruba</option>
                <option value="dendi">Dendi</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-foreground/75 uppercase mb-1">
                Description des Symptômes / Saisie Vocale
              </label>
              <textarea
                rows={3}
                value={symptomes}
                onChange={(e) => setSymptomes(e.target.value)}
                className="w-full rounded-2xl border border-foreground/15 bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loadingTriage}
              className="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>{loadingTriage ? "Évaluation clinique en cours..." : "Analyser la gravité clinique"}</span>
            </button>

            {/* Résultat Triage IA */}
            {triageResult?.success && (
              <ScaleUnblur className="mt-2 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Évaluation PCIME / Manchester :</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      triageResult.analyse.niveauGravite === "URGENCE_VITALE"
                        ? "bg-red-500/20 text-red-500 border border-red-500/30"
                        : "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                    }`}
                  >
                    {triageResult.analyse.niveauGravite}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-background/80 text-xs text-foreground/85 leading-relaxed">
                  <p><strong>Orientation :</strong> {triageResult.analyse.orientationConseillee}</p>
                  <p className="mt-1"><strong>Diagnostic suspecté :</strong> {triageResult.analyse.diagnosticSuspecte}</p>
                </div>

                {triageResult.analyse.signauxAlarme?.length > 0 && (
                  <div className="text-[11px] text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                    <strong>Signaux d&apos;alarme :</strong> {triageResult.analyse.signauxAlarme.join(", ")}
                  </div>
                )}
              </ScaleUnblur>
            )}
          </form>
        </div>

        {/* Colonne Droite : Transfert Monétaire Fléché GBESSOKE */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-6 rounded-3xl border border-foreground/10 bg-background/80 backdrop-blur-md shadow-lg flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Transfert Fléché GBESSOKE</h2>
                <p className="text-xs text-foreground/60">Incitation nutritionnelle post-CPN / Vaccin</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-foreground/75 uppercase mb-1">
                NPI Patiente
              </label>
              <input
                type="text"
                value={patientNpi}
                onChange={(e) => setPatientNpi(e.target.value)}
                className="w-full rounded-2xl border border-foreground/15 bg-background px-4 py-2.5 text-xs text-foreground font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-foreground/75 uppercase mb-1">
                Numéro Mobile Money (MTN / Moov)
              </label>
              <input
                type="text"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full rounded-2xl border border-foreground/15 bg-background px-4 py-2.5 text-xs text-foreground font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-foreground/75 uppercase mb-1">
                Acte Médical Validé
              </label>
              <select
                value={typeActe}
                onChange={(e) => setTypeActe(e.target.value)}
                className="w-full rounded-2xl border border-foreground/15 bg-background px-4 py-2.5 text-xs text-foreground"
              >
                <option value="CPN3">CPN 3 - Consultation Prénatale Trimestre 3 (5 000 FCFA)</option>
                <option value="PEV_COMPLET">Cycle Vaccinal PEV Complet Nourrisson (5 000 FCFA)</option>
              </select>
            </div>

            <button
              onClick={handleTransfert}
              disabled={loadingTransfert}
              className="py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Coins className="h-4 w-4" />
              <span>{loadingTransfert ? "Versement en cours..." : "Valider Acte & Verser 5 000 FCFA"}</span>
            </button>

            {transfertResult?.success && (
              <ScaleUnblur className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-xs text-emerald-500 flex flex-col gap-1">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" /> {transfertResult.message}
                </span>
                <span className="font-mono text-[10px] text-foreground/60">
                  Réf Mobile Money: {transfertResult.transfert?.transactionRef}
                </span>
              </ScaleUnblur>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
