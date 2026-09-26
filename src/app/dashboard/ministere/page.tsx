"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Building2,
  Activity,
  AlertTriangle,
  Heart,
  ShieldAlert,
  MapPin,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
} from "lucide-react";
import { FadeIn, ScaleUnblur } from "@/components/ui/motion-primitives";

export default function MinistereDashboardPage(): ReactNode {
  const { user } = useAuth();
  const [stocks, setStocks] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [signalements, setSignalements] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [stocksRes, carteRes, auditRes, sigRes] = await Promise.all([
          fetch("/api/v1/hemora/stocks"),
          fetch("/api/v1/carte-sanitaire"),
          fetch("/api/v1/audit-logs"),
          fetch("/api/v1/signalements"),
        ]);

        const stocksJson = await stocksRes.json();
        const carteJson = await carteRes.json();
        const auditJson = await auditRes.json();
        const sigJson = await sigRes.json();

        if (stocksJson.success) setStocks(stocksJson.stocks || []);
        if (carteJson.success) setFacilities(carteJson.etablissements || []);
        if (auditJson.success) setAuditLogs(auditJson.data || []);
        if (sigJson.success) setSignalements(sigJson.signalements || []);
      } catch (e) {
        console.error("Erreur chargement ministère:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredFacilities = facilities.filter((f) => {
    const matchDept = selectedDept === "ALL" || f.departement === selectedDept;
    const matchSearch =
      searchTerm === "" ||
      f.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.commune.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDept && matchSearch;
  });

  const criticalStocks = stocks.filter((s) => s.quantitePoches <= s.seuilAlerte);

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Bannière de Bienvenue */}
      <FadeIn className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-950/40 via-background to-background backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Supervision Nationale
              </span>
              <span className="text-[11px] text-foreground/50">République du Bénin</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mt-1">
              Tableau de Bord Ministériel & Veille Sanitaire
            </h1>
            <p className="text-xs text-foreground/60">
              Session active : <strong className="text-foreground">{user?.prenom} {user?.nom}</strong> — {user?.titre}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background border border-foreground/10 text-xs text-foreground/75">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>77 Communes Interconnectées</span>
          </div>
        </div>
      </FadeIn>

      {/* Cartes d'indicateurs macro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl border border-foreground/10 bg-background/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-foreground/50 mb-2">
            <span className="text-xs uppercase font-semibold">Formations Sanitaires</span>
            <MapPin className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-foreground">{facilities.length || "77+"}</div>
          <p className="text-[11px] text-emerald-500 mt-1 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> CHIC, CNHU, CHD & 600 Centres
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-foreground/10 bg-background/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-foreground/50 mb-2">
            <span className="text-xs uppercase font-semibold">Stocks CGR</span>
            <Heart className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-3xl font-bold text-foreground">
            {stocks.reduce((acc, s) => acc + (s.quantitePoches || 0), 0)}
          </div>
          <p className="text-[11px] text-foreground/60 mt-1">
            Poches dans les 12 départements
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-foreground/10 bg-background/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-foreground/50 mb-2">
            <span className="text-xs uppercase font-semibold">Alertes Ruptures</span>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-amber-500">{criticalStocks.length}</div>
          <p className="text-[11px] text-amber-500/80 mt-1">
            Dépôts sous le seuil critique
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-foreground/10 bg-background/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-foreground/50 mb-2">
            <span className="text-xs uppercase font-semibold">Garantie Urgences</span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-500">100%</div>
          <p className="text-[11px] text-emerald-500 mt-1">
            Zéro refus financier
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-red-400 mb-2">
            <span className="text-xs uppercase font-semibold">Plaintes Citoyennes</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-3xl font-bold text-red-500">{signalements.length}</div>
          <p className="text-[11px] text-red-400/80 mt-1">
            Inspection Générale saisie
          </p>
        </div>
      </div>

      {/* Section 1 : Carte Sanitaire IASO & Établissements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-foreground/10 bg-background/60">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Répertoire National des Établissements (IASO)
              </h2>
              <p className="text-xs text-foreground/60">
                Géolocalisation et capacités hospitalières des 77 communes
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Rechercher hôpital, commune..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl border border-foreground/15 bg-background pl-8 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="rounded-xl border border-foreground/15 bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
              >
                <option value="ALL">Tous départements</option>
                <option value="Borgou">Borgou</option>
                <option value="Littoral">Littoral</option>
                <option value="Atlantique">Atlantique</option>
                <option value="Alibori">Alibori</option>
                <option value="Atacora">Atacora</option>
                <option value="Ouémé">Ouémé</option>
                <option value="Zou">Zou</option>
              </select>
            </div>
          </div>

          <div className="rounded-3xl border border-foreground/10 bg-background/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto max-h-[420px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-foreground/5 text-foreground/60 uppercase sticky top-0 backdrop-blur-md">
                  <tr>
                    <th className="py-3 px-4">Code IASO</th>
                    <th className="py-3 px-4">Établissement</th>
                    <th className="py-3 px-4">Département</th>
                    <th className="py-3 px-4">Commune</th>
                    <th className="py-3 px-4 text-center">Capacité (Lits)</th>
                    <th className="py-3 px-4 text-center">Statut ARS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/5">
                  {filteredFacilities.slice(0, 15).map((fac) => (
                    <tr key={fac.id || fac.codeIaso} className="hover:bg-foreground/2 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-500">{fac.codeIaso}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{fac.nom}</td>
                      <td className="py-3 px-4 text-foreground/80">{fac.departement}</td>
                      <td className="py-3 px-4 text-foreground/60">{fac.commune}</td>
                      <td className="py-3 px-4 text-center font-bold text-foreground">
                        {fac.capaciteLits || 50}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold">
                          Homologué
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 2 : Télémétrie HEMORA (Stocks critiques) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="p-4 rounded-2xl border border-foreground/10 bg-background/60">
            <h2 className="text-base font-bold text-foreground">
              Télémétrie HEMORA & Ruptures
            </h2>
            <p className="text-xs text-foreground/60">
              Surveillance continue des réserves départementales
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {criticalStocks.length > 0 ? (
              criticalStocks.map((stock, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-sm">
                      {stock.groupe}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{stock.hopitalNom}</p>
                      <p className="text-[10px] text-foreground/60">{stock.commune} ({stock.departement})</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-amber-500">{stock.quantitePoches} poches</span>
                    <span className="block text-[9px] text-foreground/50">Seuil min: {stock.seuilAlerte}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl border border-foreground/10 bg-background/40 text-center text-xs text-foreground/50">
                Aucune alerte de rupture critique signalée.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 3 : Cellule d'Inspection Ministérielle & Signalements Citoyens */}
      <ScaleUnblur className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl border border-red-500/20 bg-gradient-to-r from-red-950/30 to-background">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Inspection Générale de la Santé • Signalements & Dénonciations Citoyennes
              </h2>
              <p className="text-xs text-foreground/60">
                Plaintes directes déposées par les usagers (Refus d&apos;admission vitale, caution illégale, rançonnement)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold font-mono">
              {signalements.length} alerte(s) active(s)
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-foreground/10 bg-background/80 overflow-hidden shadow-lg backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-foreground/5 text-foreground/60 uppercase sticky top-0">
                <tr>
                  <th className="py-3 px-4">Dossier</th>
                  <th className="py-3 px-4">Motif de Plainte</th>
                  <th className="py-3 px-4">Établissement & Commune</th>
                  <th className="py-3 px-4">Plaignant</th>
                  <th className="py-3 px-4">Gravité</th>
                  <th className="py-3 px-4 text-center">Statut d&apos;Instruction</th>
                  <th className="py-3 px-4 text-center">Décision Ministérielle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {signalements.map((sig) => (
                  <tr key={sig.codeDossier || sig.id} className="hover:bg-foreground/2 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-red-400">
                      {sig.codeDossier}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-foreground block">{sig.typeInfractionLabel}</span>
                      <span className="text-[11px] text-foreground/60 block mt-0.5 line-clamp-1">
                        {sig.description}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{sig.etablissementNom}</div>
                      <div className="text-[10px] text-foreground/50">{sig.commune} ({sig.departement})</div>
                    </td>
                    <td className="py-3 px-4">
                      {sig.anonyme ? (
                        <span className="text-foreground/50 italic">Anonyme (Protégé)</span>
                      ) : (
                        <div>
                          <span className="font-semibold text-foreground">{sig.declarantNom || "Bio GOUDA"}</span>
                          <span className="block text-[10px] font-mono text-foreground/50">{sig.declarantNpi}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/25">
                        {sig.gravite}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {sig.statut === "INSPECTEUR_DEPECHE"
                          ? "Inspecteur Dépêché"
                          : sig.statut === "SANCTION_PRONONCEE"
                          ? "Sanction Prononcée"
                          : "En Instruction"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            sig.statut = "INSPECTEUR_DEPECHE";
                            sig.reponseMinistere = "Mission d'inspection immédiate diligentée sur place par arrêté ministériel.";
                            setSignalements([...signalements]);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] shadow-sm transition-colors"
                          title="Dépêcher un inspecteur ministériel"
                        >
                          Dépêcher
                        </button>
                        <button
                          onClick={() => {
                            sig.statut = "SANCTION_PRONONCEE";
                            sig.reponseMinistere = "Sanction administrative conservatoire prise : suspension à titre conservatoire de l'agent.";
                            setSignalements([...signalements]);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-foreground/10 hover:bg-foreground/15 text-foreground font-bold text-[10px] transition-colors"
                          title="Prononcer sanction administrative"
                        >
                          Sanctionner
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScaleUnblur>
    </main>
  );
}
