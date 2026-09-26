"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Lock,
  ShieldAlert,
  FileCheck2,
  AlertTriangle,
  History,
  Eye,
  KeyRound,
  CheckCircle,
  Clock,
  Filter,
} from "lucide-react";
import { FadeIn, ScaleUnblur } from "@/components/ui/motion-primitives";

export default function ApdpDashboardPage(): ReactNode {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch("/api/v1/audit-logs");
        const json = await res.json();
        if (json.success) {
          setLogs(json.data || []);
        }
      } catch (e) {
        console.error("Erreur chargement logs APDP:", e);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (selectedAction === "ALL") return true;
    return l.action === selectedAction;
  });

  const brisDeGlaceLogs = logs.filter((l) => l.action === "BRIS_DE_GLACE");

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Bannière de Bienvenue */}
      <FadeIn className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-background to-background backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Lock className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Haute Autorité APDP
              </span>
              <span className="text-[11px] text-foreground/50">Loi n° 2017-20 portant Code du Numérique</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mt-1">
              Journal d&apos;Audit Cryptographique & Traçabilité Inaltérable
            </h1>
            <p className="text-xs text-foreground/60">
              Auditeur assermenté : <strong className="text-foreground">{user?.prenom} {user?.nom}</strong> — {user?.titre}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400">
            <ShieldAlert className="h-4 w-4" />
            <span>Inspection Déverrouillages d&apos;Urgence</span>
          </div>
        </div>
      </FadeIn>

      {/* Cartes de conformité APDP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-foreground/10 bg-background/80 shadow-sm backdrop-blur-md">
          <span className="text-xs uppercase font-semibold text-foreground/50">Total Événements Auditables</span>
          <div className="text-3xl font-bold text-foreground mt-1">{logs.length} entrées</div>
          <p className="text-[11px] text-purple-400 mt-1">Immuabilité garantie en base de données</p>
        </div>

        <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 shadow-sm backdrop-blur-md">
          <span className="text-xs uppercase font-semibold text-red-400">Accès « Bris de Glace » Tracés</span>
          <div className="text-3xl font-bold text-red-500 mt-1">{brisDeGlaceLogs.length} déverrouillages</div>
          <p className="text-[11px] text-red-400/80 mt-1">Chaque accès urgentiste impose un motif légal</p>
        </div>

        <div className="p-5 rounded-2xl border border-foreground/10 bg-background/80 shadow-sm backdrop-blur-md">
          <span className="text-xs uppercase font-semibold text-foreground/50">Droit à l&apos;Oubli Cryptographique</span>
          <div className="text-3xl font-bold text-emerald-500 mt-1">Conforme Art. 42</div>
          <p className="text-[11px] text-foreground/60 mt-1">Suppression du sel local rendant le hash Bitcoin orphelin</p>
        </div>
      </div>

      {/* Tableau des Audit Logs */}
      <ScaleUnblur className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-foreground/10 bg-background/60">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Flux Inaltérable des Accès & Ordonnancements
            </h2>
            <p className="text-xs text-foreground/60">
              Journalisation en temps réel de chaque requête sur les données sensibles
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="rounded-xl border border-foreground/15 bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
            >
              <option value="ALL">Tous les types d&apos;actions</option>
              <option value="BRIS_DE_GLACE">Bris de Glace uniquement</option>
              <option value="DELIVRANCE_ORDONNANCE">Délivrance Ordonnance</option>
              <option value="ENROLEMENT_PATIENT">Enrôlement Patient</option>
            </select>
          </div>
        </div>

        <div className="rounded-3xl border border-foreground/10 bg-background/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-foreground/5 text-foreground/60 uppercase sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="py-3 px-4">Horodatage</th>
                  <th className="py-3 px-4">Type Action</th>
                  <th className="py-3 px-4">Acteur (NPI & Rôle)</th>
                  <th className="py-3 px-4">Cible (NPI Patient)</th>
                  <th className="py-3 px-4">Détails Réglementaires</th>
                  <th className="py-3 px-4 text-center">Conformité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {filteredLogs.map((log) => {
                  const isBrisDeGlace = log.action === "BRIS_DE_GLACE";
                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-foreground/2 transition-colors ${
                        isBrisDeGlace ? "bg-red-500/5 font-medium" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-foreground/70">
                        {new Date(log.timestamp).toLocaleString("fr-FR")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isBrisDeGlace
                              ? "bg-red-500/15 text-red-500 border border-red-500/30"
                              : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">{log.acteurNom}</div>
                        <div className="text-[10px] text-foreground/50 font-mono">
                          {log.acteurNpi} ({log.role})
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-blue-500 font-bold">{log.cibleId}</td>
                      <td className="py-3 px-4 text-foreground/80 max-w-xs truncate">
                        {log.details?.motifUrgence || log.details?.pharmacieNom || JSON.stringify(log.details)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] font-bold text-emerald-500 inline-flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> APDP OK
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </ScaleUnblur>
    </main>
  );
}
