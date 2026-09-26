"use client";

import { useState, type ReactNode } from "react";
import { Award, Check, CreditCard, Heart, QrCode, Search, ShieldCheck, Sparkles, UserCheck } from "lucide-react";

type DonorData = {
  id: string;
  npi: string;
  nomComplet: string;
  groupeSanguin: string;
  telephone: string;
  commune: string;
  profileHash: string;
  nombreDonsValides: number;
  disponiblePourUrgence: boolean;
  soldeDefraiementFcfa: number;
  eligibleDelai: boolean;
  joursRestantsAvantEligibilite: number;
  carteQrPayload?: string;
};

export function DonorPassportConsole(): ReactNode {
  const [npiInput, setNpiInput] = useState("109876543210");
  const [loading, setLoading] = useState(false);
  const [donor, setDonor] = useState<DonorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [momoTriggered, setMomoTriggered] = useState(false);

  const fetchDonor = async (npiToQuery: string) => {
    try {
      setLoading(true);
      setError(null);
      setMomoTriggered(false);

      const res = await fetch(`/api/v1/hemora/donors?npi=${encodeURIComponent(npiToQuery)}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Donneur introuvable pour ce NPI.");
      }

      setDonor(json.data);
    } catch (err: any) {
      setError(err.message || "Erreur de consultation du registre.");
      setDonor(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateMoMo = async () => {
    if (!donor) return;
    setMomoTriggered(true);
  };

  return (
    <div className="w-full rounded-3xl border border-foreground/10 bg-background/90 p-6 sm:p-8 backdrop-blur-md shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/8 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
            <UserCheck className="h-3.5 w-3.5" />
            <span>Passeport Donneur Numérique • APDP & MoMo</span>
          </div>
          <h3 className="mt-2 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Espace Citoyen Donneur de Sang
          </h3>
          <p className="mt-1 text-sm text-foreground/70">
            Vérification de l&apos;éligibilité médicale (délai 60 jours) et déblocage du forfait de transport (2 000 FCFA).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setNpiInput("109876543210");
              fetchDonor("109876543210");
            }}
            className="rounded-xl border border-foreground/10 bg-foreground/3 px-3 py-2 text-xs font-medium text-foreground hover:bg-foreground/6 transition-colors"
          >
            Donneur Démo (O+)
          </button>
          <button
            onClick={() => {
              setNpiInput("104321876509");
              fetchDonor("104321876509");
            }}
            className="rounded-xl border border-foreground/10 bg-foreground/3 px-3 py-2 text-xs font-medium text-foreground hover:bg-foreground/6 transition-colors"
          >
            Donneur Démo (O-)
          </button>
        </div>
      </div>

      {/* Query Bar */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={npiInput}
            onChange={(e) => setNpiInput(e.target.value)}
            placeholder="Saisir le NPI à 12 chiffres (ex: 109876543210)..."
            className="w-full rounded-xl border border-foreground/12 bg-background px-4 py-2.5 text-sm font-mono text-foreground focus:outline-hidden focus:ring-2 focus:ring-red-500/40"
          />
        </div>
        <button
          onClick={() => fetchDonor(npiInput)}
          disabled={loading || !npiInput}
          className="focus-ring inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Search className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Vérifier le Passeport</span>
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-xs text-red-500">
          {error}
        </div>
      )}

      {/* Result Donor Card */}
      {donor && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Visual Digital Card */}
          <div className="md:col-span-7 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-zinc-900 via-neutral-900 to-black p-6 text-white shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-red-600/20 blur-2xl" />

            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                  <span className="text-xs font-mono tracking-widest uppercase text-zinc-300">
                    RÉPUBLIQUE DU BÉNIN • CNTS
                  </span>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                  DONNEUR VÉRIFIÉ
                </span>
              </div>

              <div className="mt-5 flex items-start justify-between">
                <div>
                  <h4 className="text-xl font-bold tracking-tight text-white">{donor.nomComplet}</h4>
                  <div className="mt-1 font-mono text-xs text-zinc-400">NPI: {donor.npi}</div>
                  <div className="mt-0.5 text-xs text-zinc-400">Commune: {donor.commune}</div>
                </div>

                <div className="flex flex-col items-center justify-center rounded-2xl bg-red-600/90 px-4 py-2 text-white shadow-md">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Groupe</span>
                  <span className="text-2xl font-black">{donor.groupeSanguin}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-400">
                <QrCode className="h-4 w-4 text-white" />
                <span className="font-mono text-[11px] truncate max-w-[200px]">
                  {donor.profileHash}
                </span>
              </div>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" />
                APDP Conforme
              </span>
            </div>
          </div>

          {/* Donor Stats & Allowance Action */}
          <div className="md:col-span-5 flex flex-col justify-between gap-4 rounded-3xl border border-foreground/10 bg-background p-6 shadow-xs">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-foreground/50">
                  Statut Médical
                </span>
                <div className="mt-1 flex items-center gap-2">
                  {donor.eligibleDelai ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5" />
                      Éligible pour un nouveau don
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Repos nécessaire ({donor.joursRestantsAvantEligibilite} jours restants)
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="rounded-xl border border-foreground/8 bg-foreground/2 p-3">
                  <span className="text-[11px] text-foreground/50 block">Dons Accomplis</span>
                  <span className="text-lg font-bold text-foreground font-mono">
                    {donor.nombreDonsValides}
                  </span>
                </div>
                <div className="rounded-xl border border-foreground/8 bg-foreground/2 p-3">
                  <span className="text-[11px] text-foreground/50 block">Points Civiques</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {donor.nombreDonsValides * 100} pts
                  </span>
                </div>
              </div>
            </div>

            {/* MoMo Transport Allowance Button */}
            <div className="pt-2">
              <button
                onClick={handleSimulateMoMo}
                disabled={momoTriggered}
                className="w-full focus-ring flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-xs font-bold text-black transition-all hover:bg-amber-400 shadow-md shadow-amber-500/20 disabled:opacity-75"
              >
                <CreditCard className="h-4 w-4" />
                <span>
                  {momoTriggered
                    ? "✓ Forfait 2 000 FCFA versé (MTN/Moov MoMo)"
                    : "Débloquer Forfait Transport (2 000 FCFA MoMo)"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
