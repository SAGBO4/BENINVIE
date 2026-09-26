"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DonorBadgeCard } from "@/components/hemora/DonorBadgeCard";
import { CivicPointsLedger } from "@/components/hemora/CivicPointsLedger";
import {
  Award,
  CreditCard,
  QrCode,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Coins,
  MapPin,
  Heart,
  Droplet,
  Send,
} from "lucide-react";
import { DonneurHemora, DemandeCarte, PointTransaction } from "@/lib/types";

interface DonorPortalProps {
  donneurs: DonneurHemora[];
  pointsTransactions: PointTransaction[];
  onOrderCard: (npi: string, commune: string) => Promise<void>;
  onTriggerMobileMoney: (donneur: DonneurHemora) => void;
  onRedeemPoints: (points: number, motif: string) => Promise<void>;
}

export function DonorPortal({
  donneurs,
  pointsTransactions,
  onOrderCard,
  onTriggerMobileMoney,
  onRedeemPoints,
}: DonorPortalProps) {
  const [selectedDonneurNpi, setSelectedDonneurNpi] = useState<string>("2026-COT-3310-MAT");
  const [communeLivraison, setCommuneLivraison] = useState("Cotonou");
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);

  const currentDonneur = donneurs.find((d) => d.npi === selectedDonneurNpi) || donneurs[0];

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDonneur) return;
    setIsOrdering(true);
    setOrderSuccess(null);
    try {
      await onOrderCard(currentDonneur.npi, communeLivraison);
      setOrderSuccess(`✅ Commande confirmée ! La carte plastifiée sécurisée avec QR-code certifié APDP de ${currentDonneur.nomComplet} sera acheminée à la Mairie de ${communeLivraison}.`);
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Sélecteur de profil donneur */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Droplet className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Portail National des Donneurs Volontaires</span>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-950/30 text-[10px]">
                ANIP & APDP Conforme
              </Badge>
            </h3>
            <p className="text-xs text-slate-400">
              Gérez votre carte QR, votre solde de défraiement Mobile Money et vos points civiques d&apos;honneur.
            </p>
          </div>
        </div>

        {/* Choix du profil */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Profil Actif :</span>
          <select
            value={selectedDonneurNpi}
            onChange={(e) => setSelectedDonneurNpi(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-medium"
          >
            {donneurs.map((d) => (
              <option key={d.npi} value={d.npi}>
                {d.nomComplet} ({d.groupeSanguin} - {d.commune})
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentDonneur && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Colonne Gauche : Carte Numérique & Badge Républicain */}
          <div className="lg:col-span-1 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <QrCode className="h-4 w-4 text-emerald-400" />
              <span>Carte Numérique de Donneur Officielle</span>
            </h4>

            <DonorBadgeCard
              donneur={currentDonneur}
              onRequestCard={(npi) => handleOrder({ preventDefault: () => {} } as any)}
            />

            {/* Solde d'indemnité Mobile Money */}
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader className="pb-3">
                <CardTitle as="h4" className="text-sm text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-amber-400" />
                    <span>Défraiement Mobile Money</span>
                  </span>
                  <Badge variant="outline" className="border-amber-500/30 text-amber-300 bg-amber-950/30 text-[10px]">
                    MTN / Moov
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Indemnités forfaitaires de déplacement pour vos dons de sang récents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-[11px] text-slate-400">Solde Disponible</p>
                    <p className="font-display text-2xl font-bold text-amber-400">
                      {currentDonneur.soldeDefraiementFcfa.toLocaleString("fr-BJ")} FCFA
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                    onClick={() => onTriggerMobileMoney(currentDonneur)}
                  >
                    Transférer sur MoMo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne Droite : Commande de Carte Plastifiée & Grand Livre Civique */}
          <div className="lg:col-span-2 space-y-6">
            {/* Formulaire de Commande de Carte Physique */}
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-emerald-400" />
                    <div>
                      <CardTitle as="h4" className="text-base text-white">
                        Commander une Carte Physique Plastifiée QR
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400">
                        Format carte de crédit rigide avec impression QR code haute durabilité, scannable hors-ligne partout au Bénin.
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-emerald-600/30 text-emerald-300 border-emerald-500/40 text-xs">
                    Gratuit pour donneur actif
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleOrder} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Nom Complet</label>
                      <input
                        type="text"
                        disabled
                        value={currentDonneur.nomComplet}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">NPI (Identifiant ANIP)</label>
                      <input
                        type="text"
                        disabled
                        value={currentDonneur.npi}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 cursor-not-allowed font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Groupe Sanguin Certifié</label>
                      <input
                        type="text"
                        disabled
                        value={currentDonneur.groupeSanguin}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-rose-400 font-bold cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Commune de Livraison Souhaitée</label>
                      <input
                        type="text"
                        value={communeLivraison}
                        onChange={(e) => setCommuneLivraison(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500"
                        placeholder="Ex: Cotonou, Parakou, Nikki, Kalalé"
                      />
                    </div>
                  </div>

                  {orderSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{orderSuccess}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isOrdering}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    {isOrdering ? "Génération et expédition..." : "Confirmer la Commande de la Carte Physique QR ➔"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Grand Livre des Points Civiques */}
            <CivicPointsLedger
              transactions={pointsTransactions}
              donneurNpi={currentDonneur.npi}
              onRedeemPoints={onRedeemPoints}
            />
          </div>
        </div>
      )}
    </div>
  );
}
