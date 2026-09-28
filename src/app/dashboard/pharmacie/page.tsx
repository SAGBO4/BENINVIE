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
  ExternalLink,
  Printer,
  ArrowUpRight,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-foreground/50 mr-1">Exemples officiels :</span>
                <button
                  type="button"
                  onClick={() => setCodeOrdonnance("ORD-2026-001")}
                  className="px-2.5 py-1 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-[10px] font-mono font-bold text-foreground transition-colors cursor-pointer"
                >
                  ORD-2026-001
                </button>
                <button
                  type="button"
                  onClick={() => setCodeOrdonnance("ORD-2026-002")}
                  className="px-2.5 py-1 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-[10px] font-mono font-bold text-foreground transition-colors cursor-pointer"
                >
                  ORD-2026-002
                </button>
                <button
                  type="button"
                  onClick={() => setCodeOrdonnance("BON-PHARMA-8871")}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[10px] font-mono font-bold text-emerald-500 transition-colors cursor-pointer"
                >
                  BON-PHARMA-8871
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingVerify}
              className="py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
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

              {/* Scellé QR Code et Vérification */}
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-foreground/5 border border-foreground/10">
                <div className="p-1.5 rounded-xl bg-white shrink-0 shadow-sm">
                  <QRCodeSVG
                    value={`https://beninvie.bj/verify?token=${verificationResult.ordonnance.codeUnique}`}
                    size={72}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <span className="font-bold text-foreground block">Scellé Cryptographique Contrôlé</span>
                  <p className="text-[11px] text-foreground/60 truncate">Certifié par l&apos;ANIP et le Ministère de la Santé.</p>
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    <a
                      href={`/verify?token=${verificationResult.ordonnance.codeUnique}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-cyan-500 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Contrôle APDP (/verify)</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="text-[11px] font-bold text-foreground/75 hover:text-foreground flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="h-3 w-3" />
                      <span>Imprimer Récépissé</span>
                    </button>
                  </div>
                </div>
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
                  className="py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>{loadingDeliver ? "Délivrance en cours..." : "Délivrer Médicaments & Invalider le QR Code"}</span>
                </button>
              )}

              {delivranceResult?.success && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>Délivrance enregistrée avec succès. QR Code définitivement invalidé.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Printer className="h-3 w-3" />
                    <span>Imprimer Quittance</span>
                  </button>
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
