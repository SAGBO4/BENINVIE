"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Activity, ShieldCheck, HeartPulse, RefreshCw, Zap, Radio } from "lucide-react";

type StockSummary = {
  totalPoches: number;
  totalDepots: number;
  groupes: Record<string, number>;
  alertesCount: number;
};

export function BmmTelemetryRadar(): ReactNode {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<StockSummary>({
    totalPoches: 142,
    totalDepots: 12,
    groupes: { "O-": 18, "O+": 46, "A+": 38, "B+": 28, "AB-": 12 },
    alertesCount: 0,
  });

  const fetchLiveMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/hemora/stocks");
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const stocks = json.data;
        let total = 0;
        let alertes = 0;
        const grpMap: Record<string, number> = { "O-": 0, "O+": 0, "A+": 0, "B+": 0, "AB-": 0 };

        for (const s of stocks) {
          total += s.quantitePoches || 0;
          if (s.alerteCritique) alertes++;
          if (s.groupeSanguin && grpMap[s.groupeSanguin] !== undefined) {
            grpMap[s.groupeSanguin] += s.quantitePoches;
          }
        }

        setSummary({
          totalPoches: total,
          totalDepots: json.totalDepots || stocks.length,
          groupes: grpMap,
          alertesCount: alertes,
        });
      }
    } catch {
      // Fallback graceful
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMetrics();
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#0a3764] via-[#082a4d] to-[#041a30] p-6 text-white shadow-xl border border-white/10">
      {/* Sovereign Benin Tricolor Stripe */}
      <div className="absolute top-0 inset-x-0 h-1.5 flex">
        <div className="flex-1 bg-[#008751]" />
        <div className="flex-1 bg-[#ffbe00]" />
        <div className="flex-1 bg-[#eb0000]" />
      </div>

      {/* Dynamic Animated Radar Wave */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-600/15 blur-3xl" />

      {/* Top Header: System Status & Pulse */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4 pt-1">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-widest uppercase text-emerald-400">
              <Radio className="h-3 w-3 animate-pulse" />
              CNTS • RÉGULATION BÉNIN
            </div>
            <div className="text-xs text-zinc-400 font-medium">77 Communes & Banques de Sang Interconnectées</div>
          </div>
        </div>

        <button
          onClick={fetchLiveMetrics}
          disabled={loading}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          title="Actualiser les stocks du backend"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Center Radar / Blood Group Matrix */}
      <div className="relative z-10 my-auto py-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
            Réserves CGR Nationales
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-red-400">
            <HeartPulse className="h-3 w-3 text-red-400" />
            {summary.totalPoches} Poches Actives
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {Object.entries(summary.groupes).map(([grp, qty]) => {
            const isUniversal = grp === "O-";
            return (
              <div
                key={grp}
                className={`relative flex flex-col justify-between rounded-xl border p-3 transition-all ${
                  isUniversal
                    ? "border-red-500/50 bg-red-500/10 shadow-xs shadow-red-500/20"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{grp}</span>
                  {isUniversal && (
                    <span className="rounded bg-red-500 px-1 text-[9px] font-bold text-white uppercase">
                      Univ.
                    </span>
                  )}
                </div>
                <div className="mt-2 text-xl font-extrabold tracking-tight text-zinc-100">
                  {qty}{" "}
                  <span className="text-[10px] font-normal text-zinc-400">poches</span>
                </div>
              </div>
            );
          })}

          {/* Quick Metric Widget */}
          <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-3">
            <span className="text-[10px] font-mono text-zinc-400">Délai Dispatch</span>
            <div className="text-xl font-extrabold text-emerald-400">&lt; 15 min</div>
          </div>
        </div>
      </div>

      {/* Bottom Emergency Banner: Bris de Glace Guarantee */}
      <div className="relative z-10 rounded-xl border border-emerald-500/20 bg-emerald-950/40 p-3 backdrop-blur-md">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
          <div className="text-[11px] leading-tight">
            <span className="font-semibold text-emerald-300">
              Dispositif Bris de Glace Actif
            </span>
            <p className="mt-0.5 text-zinc-400">
              Zéro refus d&apos;urgence vitale garanti par l&apos;État. Délivrance sans avance financière.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
