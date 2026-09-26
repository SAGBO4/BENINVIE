"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CampagneDon } from "@/lib/types";

interface MobileCampaignsTrackerProps {
  campagnes: CampagneDon[];
  onAddCampaign?: () => void;
}

export function MobileCampaignsTracker({ campagnes, onAddCampaign }: MobileCampaignsTrackerProps) {
  const [filterCommune, setFilterCommune] = useState("");

  const filtered = filterCommune
    ? campagnes.filter((c) => c.commune.toLowerCase().includes(filterCommune.toLowerCase()))
    : campagnes;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <span>🚐</span>
            <span>Campagnes Mobiles de Collecte de Sang (77 Communes)</span>
          </h4>
          <p className="text-xs text-slate-400">
            Mobilisation itinérante pour le rapprochement des banques de sang des populations.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Filtrer par commune..."
            value={filterCommune}
            onChange={(e) => setFilterCommune(e.target.value)}
            className="h-8 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          {onAddCampaign && (
            <Button size="sm" variant="default" onClick={onAddCampaign} className="text-xs shrink-0">
              <span>➕ Planifier</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const progress = Math.min(100, Math.round((c.pochesCollectees / c.objectifPoches) * 100));

          const statusBadge = {
            EN_COURS: <Badge variant="warning">En cours</Badge>,
            PLANIFIEE: <Badge variant="default">Planifiée</Badge>,
            TERMINEE: <Badge variant="success">Terminée</Badge>,
          }[c.statut];

          return (
            <Card key={c.id} className="border border-slate-800 bg-slate-900/80 shadow-md">
              <CardHeader className="p-4 pb-2 border-b border-slate-800/60">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-bold text-white leading-tight">
                      {c.titre}
                    </CardTitle>
                    <span className="text-[11px] text-emerald-400 font-medium">
                      📍 {c.commune} — {c.lieuCollecte}
                    </span>
                  </div>
                  {statusBadge}
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-3 space-y-3">
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Progression objectif</span>
                    <span className="font-bold text-white">
                      {c.pochesCollectees} / {c.objectifPoches} poches ({progress}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800/50">
                  <span>Période : {c.dateDebut} au {c.dateFin}</span>
                  <span className="font-mono text-slate-500">{c.codeCampagne}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
