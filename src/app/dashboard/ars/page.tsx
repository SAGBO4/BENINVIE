"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  ShieldCheck,
  CheckCircle,
  FileText,
  Search,
  Filter,
  Leaf,
  PlusCircle,
  AlertCircle,
  Award,
} from "lucide-react";
import { FadeIn, ScaleUnblur } from "@/components/ui/motion-primitives";

export default function ArsDashboardPage(): ReactNode {
  const { user } = useAuth();
  const [tradipraticiens, setTradipraticiens] = useState<any[]>([]);
  const [medicamentsMta, setMedicamentsMta] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"mta" | "praticiens">("mta");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [tradiRes, mtaRes] = await Promise.all([
          fetch("/api/v1/tradipraticiens"),
          fetch("/api/v1/medicaments/mta"),
        ]);
        const tradiJson = await tradiRes.json();
        const mtaJson = await mtaRes.json();

        if (tradiJson.success) setTradipraticiens(tradiJson.tradipraticiens || []);
        if (mtaJson.success) setMedicamentsMta(mtaJson.medicaments || []);
      } catch (e) {
        console.error("Erreur chargement ARS:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Bannière de Bienvenue */}
      <FadeIn className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-background to-background backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-600/30">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Régulation & Homologation Sanitaire
              </span>
              <span className="text-[11px] text-foreground/50">Autorité de Régulation (ARS)</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mt-1">
              Portail Officiel d&apos;Accréditation ARS & MTA
            </h1>
            <p className="text-xs text-foreground/60">
              Session active : <strong className="text-foreground">{user?.prenom} {user?.nom}</strong> — {user?.titre}
            </p>
          </div>
        </div>

        {/* Onglets d'action */}
        <div className="inline-flex p-1 rounded-2xl bg-foreground/5 border border-foreground/10">
          <button
            onClick={() => setActiveTab("mta")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "mta"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            <Leaf className="h-3.5 w-3.5" />
            <span>Catalogue MTA Certifié</span>
          </button>
          <button
            onClick={() => setActiveTab("praticiens")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "praticiens"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Tradipraticiens Accrédités</span>
          </button>
        </div>
      </FadeIn>

      {/* Cartes métriques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-foreground/10 bg-background/80 shadow-sm backdrop-blur-md">
          <span className="text-xs uppercase font-semibold text-foreground/50">Médicaments MTA Homologués</span>
          <div className="text-3xl font-bold text-foreground mt-1">{medicamentsMta.length} remèdes</div>
          <p className="text-[11px] text-emerald-500 mt-1">Contrôlés par l&apos;Agence Nationale du Médicament</p>
        </div>
        <div className="p-5 rounded-2xl border border-foreground/10 bg-background/80 shadow-sm backdrop-blur-md">
          <span className="text-xs uppercase font-semibold text-foreground/50">Tradipraticiens Homologués</span>
          <div className="text-3xl font-bold text-foreground mt-1">{tradipraticiens.length} praticiens</div>
          <p className="text-[11px] text-amber-500 mt-1">Habilités à émettre des ordonnances MTA sécurisées</p>
        </div>
        <div className="p-5 rounded-2xl border border-foreground/10 bg-background/80 shadow-sm backdrop-blur-md">
          <span className="text-xs uppercase font-semibold text-foreground/50">Conformité Loi Pharmacopée</span>
          <div className="text-3xl font-bold text-emerald-500 mt-1">100% Certifié</div>
          <p className="text-[11px] text-foreground/60 mt-1">Traçabilité QR code à usage unique anti-fraude</p>
        </div>
      </div>

      {/* Vue 1 : Référentiel MTA */}
      {activeTab === "mta" && (
        <ScaleUnblur className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-4 rounded-2xl border border-foreground/10 bg-background/60">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Répertoire des Médicaments Traditionnels Améliorés (MTA)
              </h2>
              <p className="text-xs text-foreground/60">
                Spécifications thérapeutiques, posologies et autorisation de mise sur le marché (AMM Bénin)
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-semibold">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Référentiel Contractuel 2026-2031</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicamentsMta.map((med) => (
              <div
                key={med.codeMta}
                className="p-5 rounded-3xl border border-foreground/10 bg-background/80 hover:border-amber-500/40 transition-all flex flex-col justify-between gap-4 backdrop-blur-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      {med.codeMta}
                    </span>
                    <span className="text-[11px] text-foreground/50">{med.forme}</span>
                  </div>

                  <h3 className="text-base font-bold text-foreground">{med.nom}</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                    Indication : {med.indication}
                  </p>

                  <div className="mt-3 p-3 rounded-2xl bg-foreground/5 text-xs text-foreground/75 leading-relaxed">
                    <strong>Posologie validée :</strong> {med.posologie}
                  </div>
                </div>

                <div className="pt-2 border-t border-foreground/5 flex items-center justify-between text-xs">
                  <span className="text-foreground/50">Laboratoire :</span>
                  <span className="font-semibold text-foreground">{med.laboratoire}</span>
                </div>
              </div>
            ))}
          </div>
        </ScaleUnblur>
      )}

      {/* Vue 2 : Tradipraticiens Accrédités */}
      {activeTab === "praticiens" && (
        <ScaleUnblur className="flex flex-col gap-4">
          <div className="rounded-3xl border border-foreground/10 bg-background/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-foreground/5 text-foreground/60 uppercase">
                  <tr>
                    <th className="py-3 px-4">NPI Tradipraticien</th>
                    <th className="py-3 px-4">Nom & Prénom</th>
                    <th className="py-3 px-4">Spécialité</th>
                    <th className="py-3 px-4">Commune / Zone</th>
                    <th className="py-3 px-4">N° Registre ARS</th>
                    <th className="py-3 px-4 text-center">Accréditation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/5">
                  {tradipraticiens.map((tp) => (
                    <tr key={tp.npi} className="hover:bg-foreground/2 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-500">{tp.npi}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{tp.nom} {tp.prenom}</td>
                      <td className="py-3 px-4 text-foreground/80">{tp.specialite}</td>
                      <td className="py-3 px-4 text-foreground/60">{tp.commune} ({tp.departement})</td>
                      <td className="py-3 px-4 font-mono text-foreground/70">{tp.numeroOrdreNational}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Validé ARS
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScaleUnblur>
      )}
    </main>
  );
}
