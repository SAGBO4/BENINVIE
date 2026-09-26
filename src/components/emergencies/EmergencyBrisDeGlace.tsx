"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ShieldAlert,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  User,
  Sparkles,
  Stethoscope,
} from "lucide-react";

interface EmergencyBrisDeGlaceProps {
  onTriggerBrisDeGlace: () => void;
  onOpenMobileMoney: (montant: number, motif: string) => void;
  brisDeGlaceActive: boolean;
  brisDeGlaceData: any;
}

export function EmergencyBrisDeGlace({
  onTriggerBrisDeGlace,
  onOpenMobileMoney,
  brisDeGlaceActive,
  brisDeGlaceData,
}: EmergencyBrisDeGlaceProps) {
  const [triageSymptomes, setTriageSymptomes] = useState(
    "Femme en post-partum immédiat, pâleur conjonctivale intense, vertiges, saignements utérins abondants, pouls filant."
  );
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<any>(null);

  const handleRunTriage = async () => {
    setTriageLoading(true);
    try {
      const res = await fetch("/api/v1/triage/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptomes: triageSymptomes, enceinte: true }),
      });
      const data = await res.json();
      if (data.success) {
        setTriageResult(data.data);
      }
    } catch (e) {
      console.error("Erreur de triage :", e);
    } finally {
      setTriageLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* 1. RÈGLE D'OR RÉPUBLICAINE */}
      <Card className="border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-center gap-2 text-rose-400">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <Badge className="bg-rose-600 text-white font-bold text-[10px] tracking-wider uppercase">
                Directive Présidentielle 2026
              </Badge>
              <CardTitle as="h2" className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                Zéro Refus d&apos;Urgence Vitale & Dispositif de Paiement Différé
              </CardTitle>
            </div>
          </div>
          <CardDescription className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
            Aucun citoyen béninois ne peut se voir refuser l&apos;accès immédiat aux soins critiques pour motif d&apos;incapacité financière ou d&apos;absence de caution. L&apos;admission est garantie par l&apos;État avec apurement différé automatisé via le NPI et ARCH.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              variant="destructive"
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 shadow-lg shadow-rose-950/60"
              onClick={onTriggerBrisDeGlace}
            >
              <Lock className="mr-2 h-4 w-4" />
              Déclencher Admission « Bris de Glace » (Audit Tracé APDP)
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800"
              onClick={() => onOpenMobileMoney(85000, "Apurement Garantie État Paiement Différé")}
            >
              <Smartphone className="mr-2 h-4 w-4 text-amber-400" />
              Simuler Apurement Mobile Money (85 000 FCFA)
            </Button>
          </div>

          {/* Fiche d'accès bris de glace si activée */}
          {brisDeGlaceActive && brisDeGlaceData && (
            <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-3 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <span className="font-bold text-rose-300 text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Dossier Vital Déverrouillé Instantanément</span>
                </span>
                <Badge variant="destructive">Journalisé APDP Loi 2017-20</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Patiente :</span>{" "}
                  <strong className="text-white">{brisDeGlaceData.prenom} {brisDeGlaceData.nom}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Groupe Sanguin :</span>{" "}
                  <strong className="text-rose-400 font-bold">{brisDeGlaceData.groupeSanguin}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Allergies Majeures :</span>{" "}
                  <strong className="text-white">{brisDeGlaceData.allergies?.join(", ") || "Néant"}</strong>
                </div>
                <div>
                  <span className="text-slate-400">N° Sécurité ARCH :</span>{" "}
                  <strong className="text-emerald-400 font-mono">{brisDeGlaceData.numeroArch}</strong>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. REGISTRE DES GARANTIES ÉTAT & PAIEMENT DIFFÉRÉ */}
      <Card className="border-slate-800 bg-slate-900/70 shadow-xl">
        <CardHeader className="flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <CardTitle as="h3" className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-400" />
              <span>Registre National des Dossiers sous Paiement Différé Garanti</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Prise en charge sans avance de frais • Recouvrement différé garanti par le Trésor Public
            </CardDescription>
          </div>
          <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30">
            Conforme APDP
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">N° Dossier Garantie</th>
                  <th className="p-3.5">Patient (NPI)</th>
                  <th className="p-3.5">Établissement</th>
                  <th className="p-3.5">Montant Couvert</th>
                  <th className="p-3.5">Régime Tiers-Payant</th>
                  <th className="p-3.5">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3.5 font-mono font-bold text-emerald-400">
                    GARANTIE-ETAT-2026-KAL-9821
                  </td>
                  <td className="p-3.5 font-medium text-white">
                    Bio GOUDA <span className="text-slate-500 font-mono text-[11px]">(2026-KAL-9821)</span>
                  </td>
                  <td className="p-3.5 text-slate-300">Hôpital de Zone de Nikki</td>
                  <td className="p-3.5 font-mono font-extrabold text-white">85 000 FCFA</td>
                  <td className="p-3.5">
                    <Badge className="bg-emerald-600/30 text-emerald-300 border-emerald-500/40">
                      ARCH 100% (Prise en charge totale)
                    </Badge>
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Apurement Garanti
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-3.5 font-mono font-bold text-slate-400">
                    GARANTIE-ETAT-2026-COT-1104
                  </td>
                  <td className="p-3.5 font-medium text-white">
                    Sébastien MENSAH <span className="text-slate-500 font-mono text-[11px]">(2026-COT-1104)</span>
                  </td>
                  <td className="p-3.5 text-slate-300">CNHU-HKM Cotonou</td>
                  <td className="p-3.5 font-mono font-extrabold text-white">142 000 FCFA</td>
                  <td className="p-3.5">
                    <Badge variant="outline" className="border-amber-500/40 text-amber-300 bg-amber-950/20">
                      Échéancier 30 jours
                    </Badge>
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold">
                      <Activity className="h-3.5 w-3.5" />
                      En cours d&apos;apurement
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 3. MOTEUR DE TRIAGE IA CLINIQUE MULTILINGUE */}
      <Card className="border-cyan-500/30 bg-slate-900/70 shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sparkles className="h-5 w-5" />
            <CardTitle as="h3" className="text-lg font-bold text-white">
              Assistant IA de Triage Clinique & Décision d&apos;Urgence
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-400">
            Conforme aux protocoles de l&apos;OMS et du Ministère de la Santé du Bénin pour l&apos;évaluation de la gravité.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Symptômes & Signes Cliniques Observés (Texte ou Dictée Vocale) :
            </label>
            <Textarea
              rows={3}
              value={triageSymptomes}
              onChange={(e) => setTriageSymptomes(e.target.value)}
              className="border-slate-800 bg-slate-950 text-slate-100 text-xs sm:text-sm focus:border-cyan-500"
              placeholder="Décrivez les symptômes du patient..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleRunTriage}
              disabled={triageLoading}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md shadow-cyan-950/60"
            >
              <Stethoscope className="mr-2 h-4 w-4" />
              {triageLoading ? "Analyse IA en cours..." : "Lancer l'Évaluation de Gravité IA"}
            </Button>
          </div>

          {triageResult && (
            <div className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/30 space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-300 text-sm">
                  Niveau de Priorité Recommandé :{" "}
                  <span className="text-rose-400 font-extrabold uppercase">
                    {triageResult.priorite || "URGENCE VITALE (NIVEAU 1)"}
                  </span>
                </span>
                <Badge className="bg-rose-600 text-white font-bold">Transfert Médicalisé Immédiat</Badge>
              </div>
              <p className="text-xs text-slate-200">
                <strong>Orientation Clinique :</strong> {triageResult.recommandation || "Évacuation vers le plateau technique transfusionnel de l'Hôpital de Zone le plus proche. Déclenchement de 2 concentrés érythrocytaires O négatif / O positif."}
              </p>
              {triageResult.justification && (
                <p className="text-[11px] text-slate-400">
                  <strong>Justification :</strong> {triageResult.justification}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
