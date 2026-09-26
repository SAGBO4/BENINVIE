"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StockSang } from "@/lib/types";

interface BloodStockMonitorProps {
  stocks: StockSang[];
  onTriggerTransfer?: (sourceHopital: string, groupe: string) => void;
}

export function BloodStockMonitor({ stocks, onTriggerTransfer }: BloodStockMonitorProps) {
  // Regroupement par établissement
  const byEtablissement: Record<string, StockSang[]> = {};
  stocks.forEach((s) => {
    if (!byEtablissement[s.hopitalNom]) {
      byEtablissement[s.hopitalNom] = [];
    }
    byEtablissement[s.hopitalNom].push(s);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <span>🩸</span>
            <span>Surveillance Prédictive des Stocks Régionaux (HEMORA)</span>
          </h4>
          <p className="text-xs text-slate-400">
            Mise à jour en temps réel des réserves de globules rouges et culots sanguins.
          </p>
        </div>
        <Badge variant="warning" className="gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>Seuil critique national : &lt; 5 poches</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(byEtablissement).map(([hopitalNom, stocksList]) => {
          const totalPoches = stocksList.reduce((acc, curr) => acc + curr.quantitePoches, 0);
          const hasCritical = stocksList.some((s) => s.quantitePoches <= s.seuilAlerte);

          return (
            <Card
              key={hopitalNom}
              className={`border transition-all ${
                hasCritical
                  ? "border-red-500/40 bg-red-950/10 shadow-lg shadow-red-950/30"
                  : "border-slate-800 bg-slate-900/80"
              }`}
            >
              <CardHeader className="p-4 pb-2 border-b border-slate-800/60">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-bold text-white line-clamp-1">
                      {hopitalNom}
                    </CardTitle>
                    <p className="text-[11px] text-slate-400">
                      {stocksList[0]?.commune} ({stocksList[0]?.departement})
                    </p>
                  </div>
                  <Badge variant={hasCritical ? "destructive" : "success"} className="text-[10px]">
                    {totalPoches} poches
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-3 space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {stocksList.map((stk) => {
                    const isCritical = stk.quantitePoches <= stk.seuilAlerte;
                    return (
                      <div
                        key={stk.id}
                        className={`p-2 rounded-xl text-center border transition-all ${
                          isCritical
                            ? "bg-red-900/30 border-red-500/50 text-red-200"
                            : "bg-slate-950/70 border-slate-800 text-slate-200"
                        }`}
                      >
                        <span className="block text-[11px] font-extrabold">{stk.groupe}</span>
                        <span
                          className={`text-sm font-black ${
                            isCritical ? "text-red-400 animate-pulse" : "text-emerald-400"
                          }`}
                        >
                          {stk.quantitePoches}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {hasCritical && onTriggerTransfer && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full text-xs gap-1.5 h-8 mt-1"
                    onClick={() => onTriggerTransfer(hopitalNom, "O+")}
                  >
                    <span>⚡</span>
                    <span>Déclencher un transfert d&apos;urgence</span>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
