"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Thermometer,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Clock,
  Building2,
} from "lucide-react";
import { TransfertSang } from "@/lib/types";

interface BloodTransferHubProps {
  transferts: TransfertSang[];
  onNewTransfer?: (data: {
    sourceHopital: string;
    destinationHopital: string;
    groupeSanguin: string;
    quantitePoches: number;
    urgenceLevel: "STANDARD" | "VITALE";
  }) => Promise<void>;
  onMarkDelivered?: (transferId: string) => Promise<void>;
}

export function BloodTransferHub({
  transferts,
  onNewTransfer,
  onMarkDelivered,
}: BloodTransferHubProps) {
  const [showModal, setShowModal] = useState(false);
  const [source, setSource] = useState("CHUD Borgou (Parakou)");
  const [destination, setDestination] = useState("Hôpital de Zone de Nikki");
  const [groupe, setGroupe] = useState("O+");
  const [quantite, setQuantite] = useState(3);
  const [urgence, setUrgence] = useState<"STANDARD" | "VITALE">("VITALE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onNewTransfer) return;
    setIsSubmitting(true);
    try {
      await onNewTransfer({
        sourceHopital: source,
        destinationHopital: destination,
        groupeSanguin: groupe,
        quantitePoches: Number(quantite),
        urgenceLevel: urgence,
      });
      setShowModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-cyan-500/20 bg-slate-900/90 text-slate-100 shadow-xl backdrop-blur">
      <CardHeader className="border-b border-slate-800 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <span>Régulation & Transferts Inter-Hospitaliers d&apos;Urgence</span>
                <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 bg-cyan-500/10">
                  Chaîne du Froid 2°C - 6°C
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Acheminement sécurisé de concentrés érythrocytaires entre banques de sang hospitalières avec capteurs thermiques connectés.
              </CardDescription>
            </div>
          </div>

          <Button
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-900/40"
            onClick={() => setShowModal(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Déclarer un Acheminement</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        {/* Modal / Dialog de Création de Transfert */}
        {showModal && (
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-cyan-400" />
                <span>Ordre de Transfert Sanguin d&apos;Urgence</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕ Fermer
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Hôpital Source (Expéditeur)</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="CHUD Borgou (Parakou)">CHUD Borgou (Parakou)</option>
                  <option value="CHIC Calavi">CHIC Calavi</option>
                  <option value="CNHU-HKM Cotonou">CNHU-HKM Cotonou</option>
                  <option value="CHD Zou (Abomey)">CHD Zou (Abomey)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Hôpital Destinataire (Receveur)</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Hôpital de Zone de Nikki">Hôpital de Zone de Nikki</option>
                  <option value="CSC Kalalé">CSC Kalalé</option>
                  <option value="HZ Allada">HZ Allada</option>
                  <option value="HZ Tanguiéta">HZ Tanguiéta</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Groupe Requis & Nombre de Poches</label>
                <div className="flex gap-2">
                  <select
                    value={groupe}
                    onChange={(e) => setGroupe(e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={quantite}
                    onChange={(e) => setQuantite(Number(e.target.value))}
                    className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Priorité Régulatrice</label>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setUrgence("VITALE")}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-bold ${
                      urgence === "VITALE"
                        ? "bg-rose-600 text-white border border-rose-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    🚨 Vitale (Immédiate)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgence("STANDARD")}
                    className={`flex-1 py-1.5 px-3 rounded-lg font-bold ${
                      urgence === "STANDARD"
                        ? "bg-cyan-600 text-white border border-cyan-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    Standard
                  </button>
                </div>
              </div>

              <div className="md:col-span-2 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  {isSubmitting ? "Expédition en cours..." : "Valider l'Ordre de Transfert & Notifier le Convoi ➔"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des Transferts en cours ou archivés */}
        <div className="space-y-3">
          {transferts.map((trf) => (
            <div
              key={trf.id}
              className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">{trf.codeTransfert}</span>
                  <Badge
                    className={
                      trf.urgenceLevel === "VITALE"
                        ? "bg-rose-600/30 text-rose-300 border-rose-500/40 text-[10px]"
                        : "bg-cyan-600/30 text-cyan-300 border-cyan-500/40 text-[10px]"
                    }
                  >
                    {trf.urgenceLevel}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-slate-700 text-slate-300 text-[10px] flex items-center gap-1"
                  >
                    <Thermometer className="h-3 w-3 text-cyan-400" />
                    3.8°C Conforme
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-white">
                  <span>{trf.sourceHopital}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{trf.destinationHopital}</span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>
                    Volume : <strong className="text-emerald-400">{trf.quantitePoches} poches</strong> ({trf.groupeSanguin})
                  </span>
                  <span>•</span>
                  <span>Expédié le {new Date(trf.dateEnvoi).toLocaleTimeString("fr-BJ", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {trf.statut === "EN_TRANSIT" ? (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse text-xs px-2.5 py-1">
                    🚛 En Transit
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs px-2.5 py-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Réceptionné
                  </Badge>
                )}

                {trf.statut === "EN_TRANSIT" && onMarkDelivered && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/20 text-xs"
                    onClick={() => onMarkDelivered(trf.id)}
                  >
                    Accuser Réception
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
