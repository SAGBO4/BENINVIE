"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DonneurHemora } from "@/lib/types";

interface DonorBadgeCardProps {
  donneur: DonneurHemora;
  onCall?: (tel: string) => void;
  onSendSms?: (tel: string) => void;
  onRequestCard?: (npi: string) => void;
}

export function DonorBadgeCard({
  donneur,
  onCall,
  onSendSms,
  onRequestCard,
}: DonorBadgeCardProps) {
  return (
    <Card className="overflow-hidden border border-slate-800 bg-slate-900/90 shadow-xl transition-all hover:border-emerald-500/50">
      <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500" />
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">
                {donneur.nomComplet}
              </span>
              <Badge variant="benin" className="text-[10px]">
                {donneur.commune}
              </Badge>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              NPI : {donneur.npi}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl bg-red-950/40 border border-red-500/40 px-3 py-1.5 shadow-inner">
            <span className="text-base font-extrabold text-red-400">
              {donneur.groupeSanguin}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-red-300/80">
              Groupe
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-4">
        {/* Grille d'indicateurs de don */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-xs">
          <div>
            <span className="block text-[10px] text-slate-400 uppercase">Dons Validés</span>
            <span className="text-base font-bold text-emerald-400">{donneur.nombreDonsValides}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase">Dernier Don</span>
            <span className="text-[11px] font-semibold text-slate-200">
              {donneur.dateDernierDon || "Premier don"}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase">Défraiements</span>
            <span className="text-xs font-bold text-amber-400">
              {donneur.soldeDefraiementFcfa.toLocaleString()} F
            </span>
          </div>
        </div>

        {/* Empreinte cryptographique APDP */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Empreinte APDP (SHA-256 salé)</span>
            <span className="text-emerald-400 font-semibold">Protégé</span>
          </div>
          <p className="text-[10px] font-mono text-slate-500 truncate bg-slate-950 px-2 py-1 rounded border border-slate-900">
            {donneur.profileHash}
          </p>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center gap-2 pt-1">
          {onSendSms && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs gap-1.5"
              onClick={() => onSendSms(donneur.telephone)}
            >
              <span>💬</span>
              <span>SMS Alerte</span>
            </Button>
          )}
          {onCall && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs gap-1.5"
              onClick={() => onCall(donneur.telephone)}
            >
              <span>📞</span>
              <span>Appel Vocal</span>
            </Button>
          )}
          {onRequestCard && (
            <Button
              variant="secondary"
              size="sm"
              className="text-xs gap-1"
              onClick={() => onRequestCard(donneur.npi)}
              title="Demander la carte physique QR"
            >
              <span>💳</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
