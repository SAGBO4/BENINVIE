"use client";

import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Pill,
  QrCode,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Search,
  Check,
} from "lucide-react";
import { FadeIn, ScaleUnblur } from "@/components/ui/motion-primitives";

export default function PharmacieDashboardPage(): ReactNode {
  const { user } = useAuth();
  const [codeOrdonnance, setCodeOrdonnance] = useState("ORD-2026-001");
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [delivranceResult, setDelivranceResult] = useState<any | null>(null);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingDeliver, setLoadingDeliver] = useState(false);

  // Vérifier l'ordonnance
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingVerify(true);
    setDelivranceResult(null);
    try {
      const res = await fetch(`/api/v1/ordonnances/verifier?code=${encodeURIComponent(codeOrdonnance)}`);
      const data = await res.json();
      setVerificationResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVerify(false);
    }
  };

  // Délivrer l'ordonnance (usage unique)
  const handleDeliver = async () => {
    setLoadingDeliver(true);
    try {
      const res = await fetch("/api/v1/ordonnances/delivrer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codeUnique: codeOrdonnance,
          pharmacieNom: user?.etablissementNom || "Pharmacie Communale de Nikki",
        }),
      });
      const data = await res.json();
      setDelivranceResult(data);
      if (data.success) {
        setVerificationResult((prev: any) => ({
          ...prev,
          ordonnance: { ...prev.ordonnance, statut: "delivree" },
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDeliver(false);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Bannière de Bienvenue */}
      <FadeIn className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-background to-background backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-cyan-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/30">
            <Pill className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Officine Conventionnée
              </span>
              <span className="text-[11px] text-foreground/50">Délivrance Sécurisée & Tiers-Payant ARCH</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mt-1">
              Console Pharmacie & Invalidation d&apos;Ordonnances QR
            </h1>
            <p className="text-xs text-foreground/60">
              Pharmacien : <strong className="text-foreground">{user?.prenom} {user?.nom}</strong> — {user?.etablissementNom}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Guichet Tiers-Payant ARCH Actif</span>
          </span>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Scanner / Recherche d'Ordonnance */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <form
            onSubmit={handleVerify}
            className="p-6 rounded-3xl border border-foreground/10 bg-background/80 backdrop-blur-md shadow-lg flex flex-col gap-4"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-cyan-500/20 text-cyan-500 flex items-center justify-center">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Scan QR Code Ordonnance</h2>
                <p className="text-xs text-foreground/60">Contrôle cryptographique et validité à usage unique</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-foreground/75 uppercase mb-1">
                Code Unique de l&apos;Ordonnance
              </label>
              <input
                type="text"
                value={codeOrdonnance}
                onChange={(e) => setCodeOrdonnance(e.target.value)}
                className="w-full rounded-2xl border border-foreground/15 bg-background px-4 py-2.5 text-xs text-foreground font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-foreground/50 mt-1 block">
                Code test officiel : ORD-2026-001 (Prescription Bio GOUDA à Kalalé)
              </span>
            </div>

            <button
              type="submit"
              disabled={loadingVerify}
              className="py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span>{loadingVerify ? "Vérification en cours..." : "Vérifier l'Ordonnance"}</span>
            </button>
          </form>
        </div>

        {/* Détail & Délivrance */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {verificationResult?.success ? (
            <ScaleUnblur className="p-6 rounded-3xl border border-foreground/10 bg-background/80 backdrop-blur-md shadow-lg flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-500 tracking-wider">
                    {verificationResult.ordonnance.typePrescription}
                  </span>
                  <h3 className="text-lg font-bold text-foreground">
                    Ordonnance #{verificationResult.ordonnance.codeUnique}
                  </h3>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    verificationResult.ordonnance.statut === "active"
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-500 border border-red-500/20"
                  }`}
                >
                  {verificationResult.ordonnance.statut === "active" ? "Valide & Non Délivrée" : "Déjà Délivrée"}
                </span>
              </div>

              {/* Tiers Payant ARCH */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-500">Prise en Charge ARCH (100%)</span>
                  <p className="text-[11px] text-foreground/70">
                    Bénéficiaire indigence ciblée • Zéro reste à charge pour le patient
                  </p>
                </div>
                <span className="text-lg font-bold text-emerald-500">0 FCFA</span>
              </div>

              {/* Médicaments */}
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase mb-2">Traitements Prescrits</h4>
                <div className="flex flex-col gap-2">
                  {verificationResult.ordonnance.medicaments.map((m: any, i: number) => (
                    <div key={i} className="p-3 rounded-2xl bg-foreground/5 text-xs">
                      <span className="font-bold text-foreground">{m.nom}</span>
                      <p className="text-foreground/60 text-[11px] mt-0.5">{m.posologie} ({m.dureeJours} jours)</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bouton Délivrer */}
              {verificationResult.ordonnance.statut === "active" && (
                <button
                  onClick={handleDeliver}
                  disabled={loadingDeliver}
                  className="py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  <span>{loadingDeliver ? "Délivrance en cours..." : "Délivrer Médicaments & Invalider le QR Code"}</span>
                </button>
              )}

              {delivranceResult?.success && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 font-bold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Délivrance enregistrée avec succès. QR Code définitivement invalidé.</span>
                </div>
              )}
            </ScaleUnblur>
          ) : (
            <div className="p-12 rounded-3xl border border-dashed border-foreground/15 bg-background/40 text-center flex flex-col items-center justify-center gap-3">
              <QrCode className="h-10 w-10 text-foreground/30" />
              <p className="text-xs text-foreground/60 max-w-xs">
                Saisissez ou scannez un QR code d&apos;ordonnance pour contrôler son authenticité et son statut ARCH.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
