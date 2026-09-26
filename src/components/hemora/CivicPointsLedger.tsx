"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  ShieldCheck,
  Sparkles,
  Gift,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Coins,
  QrCode,
  Flame,
} from "lucide-react";
import { PointTransaction } from "@/lib/types";

interface CivicPointsLedgerProps {
  transactions: PointTransaction[];
  donneurNpi?: string;
  onRedeemPoints?: (points: number, motif: string) => Promise<void>;
  onAwardBonus?: (points: number, motif: string) => Promise<void>;
}

export function CivicPointsLedger({
  transactions,
  donneurNpi = "2026-COT-3310-MAT",
  onRedeemPoints,
  onAwardBonus,
}: CivicPointsLedgerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Calcul du solde total pour le donneur sélectionné ou total général
  const relevantTxs = donneurNpi
    ? transactions.filter((t) => t.donneurNpi === donneurNpi)
    : transactions;
  const currentBalance = relevantTxs.reduce((acc, t) => acc + t.points, 0);

  // Rang d'honneur civique
  let tier = "BRONZE";
  let nextTier = "ARGENT";
  let pointsForNext = 150 - currentBalance;
  let progressPct = Math.min(100, Math.round((currentBalance / 150) * 100));

  if (currentBalance >= 500) {
    tier = "PLATINE";
    nextTier = "LÉGENDE NATIONALE";
    pointsForNext = 0;
    progressPct = 100;
  } else if (currentBalance >= 300) {
    tier = "OR";
    nextTier = "PLATINE";
    pointsForNext = 500 - currentBalance;
    progressPct = Math.min(100, Math.round(((currentBalance - 300) / 200) * 100));
  } else if (currentBalance >= 150) {
    tier = "ARGENT";
    nextTier = "OR";
    pointsForNext = 300 - currentBalance;
    progressPct = Math.min(100, Math.round(((currentBalance - 150) / 150) * 100));
  }

  const handleRedeem = async (pointsCost: number, label: string) => {
    if (currentBalance < pointsCost) {
      setFeedbackMsg(`❌ Solde insuffisant (${currentBalance} pts). Requis : ${pointsCost} pts.`);
      return;
    }
    setIsSubmitting(true);
    setFeedbackMsg(null);
    try {
      if (onRedeemPoints) {
        await onRedeemPoints(pointsCost, label);
      }
      setFeedbackMsg(`✅ Échange réussi ! Vous avez débloqué : ${label}. Preuve OTS horodatée.`);
    } catch (e: any) {
      setFeedbackMsg(`Erreur : ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-emerald-500/20 bg-slate-900/90 text-slate-100 shadow-xl backdrop-blur">
      <CardHeader className="border-b border-slate-800 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <span>Grand Livre Civique des Points & Ordre National du Don</span>
                <Badge variant="outline" className="border-amber-500/40 text-amber-300 bg-amber-500/10">
                  OTS Blockchain Verified
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Chaque don de sang confère des points d&apos;honneur civique, certifiés cryptographiquement par SHA-256 et OpenTimestamps.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-600/30 text-emerald-300 border-emerald-500/40 font-mono text-sm px-3 py-1">
              Solde : {currentBalance} pts
            </Badge>
            <Badge className="bg-amber-600/30 text-amber-300 border-amber-500/40 font-bold text-xs uppercase px-2.5 py-1">
              Rang {tier}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Jauge de Progression vers le Rang Supérieur */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Flame className="h-4 w-4 text-amber-400" />
              Progression vers le rang <strong>{nextTier}</strong>
            </span>
            <span className="text-amber-400 font-mono font-semibold">
              {pointsForNext > 0 ? `Encore ${pointsForNext} pts` : "Rang Maximal Atteint !"}
            </span>
          </div>
          <Progress value={progressPct} className="h-2.5 bg-slate-800" />
        </div>

        {/* Catalogue des Avantages & Bons Citoyens */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Gift className="h-4 w-4 text-emerald-400" />
            <span>Conversion des Points en Avantages de Santé & Solidarité</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Avantage 1 : ARCH */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-emerald-400">100 Points</span>
                  <Badge variant="outline" className="border-emerald-500/30 text-[10px] text-emerald-300">Santé ARCH</Badge>
                </div>
                <h5 className="text-sm font-semibold text-white mb-1">Bon de Soins Prénatals ARCH</h5>
                <p className="text-xs text-slate-400">Exonération totale des frais d&apos;échographie ou panier nutritionnel mère-enfant.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full border-emerald-500/30 hover:bg-emerald-600/20 text-emerald-300"
                disabled={isSubmitting || currentBalance < 100}
                onClick={() => handleRedeem(100, "Bon de Soins Prénatals ARCH")}
              >
                Échanger (100 pts)
              </Button>
            </div>

            {/* Avantage 2 : MoMo */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 hover:border-amber-500/40 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-amber-400">200 Points</span>
                  <Badge variant="outline" className="border-amber-500/30 text-[10px] text-amber-300">Mobile Money</Badge>
                </div>
                <h5 className="text-sm font-semibold text-white mb-1">Forfait MoMo Transport (2.000 F)</h5>
                <p className="text-xs text-slate-400">Virement instantané de 2 000 FCFA sur MTN MoMo ou Moov Money.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full border-amber-500/30 hover:bg-amber-600/20 text-amber-300"
                disabled={isSubmitting || currentBalance < 200}
                onClick={() => handleRedeem(200, "Forfait MoMo Transport 2.000 FCFA")}
              >
                Échanger (200 pts)
              </Button>
            </div>

            {/* Avantage 3 : Badge Or & Pharmacopée */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 hover:border-cyan-500/40 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-cyan-400">150 Points</span>
                  <Badge variant="outline" className="border-cyan-500/30 text-[10px] text-cyan-300">Pharmacie MTA</Badge>
                </div>
                <h5 className="text-sm font-semibold text-white mb-1">Bon Pharmacopée Homologuée ARS</h5>
                <p className="text-xs text-slate-400">Kit de phytothérapie certifiée (FACA Drépanocytose ou Tisane Paludisme).</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full border-cyan-500/30 hover:bg-cyan-600/20 text-cyan-300"
                disabled={isSubmitting || currentBalance < 150}
                onClick={() => handleRedeem(150, "Bon Pharmacopée MTA Homologuée ARS")}
              >
                Échanger (150 pts)
              </Button>
            </div>
          </div>
        </div>

        {feedbackMsg && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Historique du Grand Livre (Transactions avec Hash) */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>Dernières Inscriptions au Grand Livre Immuable</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">{relevantTxs.length} écritures</span>
          </h4>

          <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/40">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Type</th>
                  <th className="p-3">Donneur & Motif</th>
                  <th className="p-3">Points</th>
                  <th className="p-3">Empreinte SHA-256 / OTS</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {relevantTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-medium">
                      {tx.action === "AWARD" ? (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                          + GAIN
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">
                          - DÉPENSE
                        </Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{tx.donneurNom}</div>
                      <div className="text-[11px] text-slate-400">{tx.motif}</div>
                    </td>
                    <td className="p-3 font-mono font-bold">
                      <span className={tx.points > 0 ? "text-emerald-400" : "text-rose-400"}>
                        {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-400">
                      <div className="truncate max-w-[160px] text-slate-300" title={tx.transactionHash}>
                        {tx.transactionHash}
                      </div>
                      {tx.otsProof && (
                        <span className="text-[9px] text-amber-400/80">OTS Scellé</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {new Date(tx.dateTransaction).toLocaleDateString("fr-BJ", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
