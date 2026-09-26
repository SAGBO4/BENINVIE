"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Clock, Filter, Layers, RefreshCw, Search, ShieldCheck } from "lucide-react";

type StockItem = {
  id: string;
  nomEtablissement: string;
  commune: string;
  departement: string;
  groupeSanguin: string;
  quantitePoches: number;
  seuilAlerte: number;
  alerteCritique: boolean;
  heuresCouvertureEstimees: number;
  derniereMiseAJour: string;
};

const DEPARTEMENTS = [
  "Tous",
  "Littoral",
  "Ouémé",
  "Borgou",
  "Atlantique",
  "Zou",
  "Atacora",
  "Alibori",
  "Donga",
  "Collines",
  "Mono",
  "Couffo",
  "Plateau",
];

export function NationalStockConsole(): ReactNode {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");

  const loadStocks = async (dept?: string) => {
    try {
      setLoading(true);
      setError(null);
      const url =
        dept && dept !== "Tous"
          ? `/api/v1/hemora/stocks?departement=${encodeURIComponent(dept)}`
          : "/api/v1/hemora/stocks";

      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Impossible de charger les stocks");
      }

      setStocks(json.data || []);
    } catch (err: any) {
      setError(err.message || "Erreur de connexion au superviseur de stocks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStocks(selectedDept);
  }, [selectedDept]);

  const filteredStocks = stocks.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.nomEtablissement.toLowerCase().includes(q) ||
      s.commune.toLowerCase().includes(q) ||
      s.groupeSanguin.toLowerCase().includes(q)
    );
  });

  const totalPoches = filteredStocks.reduce((acc, s) => acc + (s.quantitePoches || 0), 0);
  const alertesCount = filteredStocks.filter((s) => s.alerteCritique).length;

  return (
    <div id="stocks" className="w-full rounded-3xl border border-foreground/10 bg-background/90 p-6 sm:p-8 backdrop-blur-md shadow-xl">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foreground/8 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Layers className="h-3.5 w-3.5" />
            <span>Supervision Télémétrique CNTS • 77 Communes</span>
          </div>
          <h3 className="mt-2 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Moniteur National des Stocks de Sang (CGR)
          </h3>
          <p className="mt-1 text-sm text-foreground/70">
            Données en temps réel des réserves de sang et suivi de la chaîne de froid des hôpitaux.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 rounded-xl border border-foreground/8 bg-foreground/3 px-3 py-2 text-xs">
            <span className="text-foreground/70">
              Total poches : <strong className="text-foreground font-mono">{totalPoches}</strong>
            </span>
            <span className="h-3 w-px bg-foreground/10" />
            <span className={alertesCount > 0 ? "text-amber-500 font-bold" : "text-emerald-500"}>
              {alertesCount} alerte(s) rupture
            </span>
          </div>

          <button
            onClick={() => loadStocks(selectedDept)}
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-foreground/10 bg-background text-foreground transition-colors hover:bg-foreground/5 shadow-xs"
            title="Rafraîchir"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mt-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Department Pills */}
        <div className="flex flex-wrap gap-1.5">
          {DEPARTEMENTS.map((dept) => {
            const active = selectedDept === dept;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "bg-foreground text-background shadow-xs"
                    : "border border-foreground/10 bg-foreground/3 text-foreground/70 hover:bg-foreground/8"
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrer hôpital, commune, groupe..."
            className="w-full rounded-xl border border-foreground/10 bg-background pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-foreground/40 focus:outline-hidden focus:ring-2 focus:ring-foreground/20"
          />
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-xs text-red-500">
          {error}
        </div>
      )}

      {/* Stock Cards Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-sm text-foreground/50">
            Connexion aux dépôts nationaux CNTS en cours...
          </div>
        ) : filteredStocks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-sm text-foreground/50">
            Aucun dépôt trouvé correspondant à ce filtre.
          </div>
        ) : (
          filteredStocks.map((stock) => (
            <div
              key={stock.id}
              className={`flex flex-col justify-between rounded-2xl border p-4 transition-all shadow-xs ${
                stock.alerteCritique
                  ? "border-red-500/40 bg-red-500/5 hover:border-red-500/60"
                  : "border-foreground/8 bg-background hover:border-foreground/15"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm text-foreground leading-tight">
                    {stock.nomEtablissement}
                  </h4>
                  <span
                    className={`rounded-lg px-2 py-0.5 text-xs font-black ${
                      stock.groupeSanguin === "O-"
                        ? "bg-red-600 text-white"
                        : "bg-foreground/10 text-foreground"
                    }`}
                  >
                    {stock.groupeSanguin}
                  </span>
                </div>
                <div className="mt-1 text-xs text-foreground/60">
                  {stock.commune} ({stock.departement})
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-foreground/6 flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold tracking-tight text-foreground font-mono">
                    {stock.quantitePoches}{" "}
                    <span className="text-[11px] font-normal text-foreground/60">poches</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-foreground/50">
                    <Clock className="h-3 w-3" />
                    <span>~{stock.heuresCouvertureEstimees}h de couverture</span>
                  </div>
                </div>

                <div>
                  {stock.alerteCritique ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-3 w-3" />
                      Rupture imminente
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Stock nominal
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
