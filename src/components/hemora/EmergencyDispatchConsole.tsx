"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DonneurHemora } from "@/lib/types";

interface EmergencyDispatchConsoleProps {
  onSearchMatch: (lat: number, lng: number, groupeRequis: string) => Promise<any[]>;
  onTriggerMobileMoney: (donneur: DonneurHemora) => void;
  onBroadcastSms: (donneurs: DonneurHemora[], hopital: string) => void;
  onBroadcastCall: (donneurs: DonneurHemora[], hopital: string) => void;
}

export function EmergencyDispatchConsole({
  onSearchMatch,
  onTriggerMobileMoney,
  onBroadcastSms,
  onBroadcastCall,
}: EmergencyDispatchConsoleProps) {
  const [groupe, setGroupe] = useState("O+");
  const [selectedHopital, setSelectedHopital] = useState("Hôpital de Zone de Nikki");
  const [lat, setLat] = useState(9.94);
  const [lng, setLng] = useState(3.2108);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await onSearchMatch(lat, lng, groupe);
      setResults(res || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-red-500/30 bg-slate-900/90 shadow-2xl overflow-hidden">
      <div className="h-2 w-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse" />
      <CardHeader className="p-5 pb-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-extrabold text-white flex items-center gap-2">
              <span>🚨</span>
              <span>Console de Dispatch d&apos;Urgence Transfusionnelle (HEMORA)</span>
            </CardTitle>
            <p className="text-xs text-slate-300 mt-0.5">
              Matching instantané ABO/Rh avec calcul géodésique Haversine (rayon 5-45 km) et alerte GSM/IVR.
            </p>
          </div>
          <Badge variant="destructive" className="animate-bounce">
            URGENCE VITALE ACTIVE
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-5">
        {/* Paramètres de l'urgence */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Établissement demandeur
            </label>
            <select
              value={selectedHopital}
              onChange={(e) => {
                setSelectedHopital(e.target.value);
                if (e.target.value.includes("Nikki")) {
                  setLat(9.94);
                  setLng(3.2108);
                } else if (e.target.value.includes("Calavi")) {
                  setLat(6.4485);
                  setLng(2.3556);
                } else {
                  setLat(9.3372);
                  setLng(2.6303);
                }
              }}
              className="w-full h-9 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white px-2 focus:border-red-500 focus:outline-none"
            >
              <option value="Hôpital de Zone de Nikki">Hôpital de Zone de Nikki (Borgou)</option>
              <option value="Centre Hospitalier International de Calavi (CHIC)">CHIC Calavi (Atlantique)</option>
              <option value="CHUD Borgou (Parakou)">CHUD Borgou (Parakou)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Groupe Sanguin Requis
            </label>
            <div className="grid grid-cols-4 gap-1">
              {["O+", "O-", "A+", "B+"].map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setGroupe(grp)}
                  className={`h-9 rounded-lg font-bold text-xs transition ${
                    groupe === grp
                      ? "bg-red-600 text-white shadow-md shadow-red-900/50"
                      : "bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500"
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end">
            <Button
              variant="destructive"
              className="w-full h-9 text-xs font-bold gap-1.5"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <span>Recherche en cours...</span>
              ) : (
                <>
                  <span>🔍</span>
                  <span>Calculer le matching géodésique</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Résultats du matching */}
        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                {results.length} donneurs compatibles identifiés dans le rayon opérationnel :
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1 h-8"
                  onClick={() =>
                    onBroadcastSms(
                      results.map((r) => r.donneur),
                      selectedHopital
                    )
                  }
                >
                  <span>💬</span>
                  <span>Alerter tous par SMS</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1 h-8"
                  onClick={() =>
                    onBroadcastCall(
                      results.map((r) => r.donneur),
                      selectedHopital
                    )
                  }
                >
                  <span>📞</span>
                  <span>Appel vocal groupé</span>
                </Button>
              </div>
            </div>

            <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
              {results.map((item, idx) => (
                <div
                  key={item.donneur.id || idx}
                  className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-900/50 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {item.donneur.nomComplet}
                      </span>
                      <Badge variant="benin" className="text-[10px]">
                        {item.donneur.commune} ({item.distanceKm.toFixed(1)} km)
                      </Badge>
                      <Badge variant="destructive" className="text-[10px]">
                        {item.donneur.groupeSanguin}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Score de compatibilité :{" "}
                      <strong className="text-emerald-400">{item.scoreTotal}/100</strong> • Délai
                      inter-don : <span className="text-emerald-300">Conforme (&gt; 60j)</span> • Tél :{" "}
                      <span className="font-mono text-slate-300">{item.donneur.telephone}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="default"
                      size="sm"
                      className="text-xs gap-1.5 h-8 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500"
                      onClick={() => onTriggerMobileMoney(item.donneur)}
                    >
                      <span>💸</span>
                      <span>Défraiement 2 000 F (MoMo)</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
