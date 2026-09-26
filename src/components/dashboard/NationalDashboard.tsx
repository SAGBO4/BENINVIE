"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BloodStockMonitor } from "@/components/hemora/BloodStockMonitor";
import { BloodTransferHub } from "@/components/hemora/BloodTransferHub";
import { EmergencyDispatchConsole } from "@/components/hemora/EmergencyDispatchConsole";
import { MobileCampaignsTracker } from "@/components/hemora/MobileCampaignsTracker";
import { DonorBadgeCard } from "@/components/hemora/DonorBadgeCard";
import {
  Bell,
  Droplet,
  CalendarHeart,
  Users,
  ShieldAlert,
  ArrowRight,
  MapPin,
  Search,
  Filter,
} from "lucide-react";
import { StockSang, TransfertSang, CampagneDon, DonneurHemora, UrgenceTransfusion, GroupeSanguin } from "@/lib/types";

interface NationalDashboardProps {
  stocks: StockSang[];
  transferts: TransfertSang[];
  campagnes: CampagneDon[];
  donneurs: DonneurHemora[];
  onTriggerTransfer: (source: string, groupe: string) => Promise<void>;
  onNewTransfer: (data: any) => Promise<void>;
  onAddCampaign: () => Promise<void>;
  onTriggerMobileMoney: (donneur: DonneurHemora) => void;
  onBroadcastSms: (donneurs: DonneurHemora[], hopital: string) => Promise<void>;
  onBroadcastCall: (donneurs: DonneurHemora[], hopital: string) => Promise<void>;
}

export function NationalDashboard({
  stocks,
  transferts,
  campagnes,
  donneurs,
  onTriggerTransfer,
  onNewTransfer,
  onAddCampaign,
  onTriggerMobileMoney,
  onBroadcastSms,
  onBroadcastCall,
}: NationalDashboardProps) {
  const [selectedBloodFilter, setSelectedBloodFilter] = useState<string>("ALL");
  const [searchCommune, setSearchCommune] = useState<string>("");

  // Calcul des métriques nationales
  const totalPochesDisponibles = stocks.reduce((sum, s) => sum + s.quantitePoches, 0);
  const stocksCritiques = stocks.filter((s) => s.quantitePoches < s.seuilAlerte);
  const campagnesActives = campagnes.filter((c) => c.statut === "EN_COURS");
  const transfertsEnTransit = transferts.filter((t) => t.statut === "EN_TRANSIT");

  // Filtrage des donneurs
  const filteredDonneurs = donneurs.filter((d) => {
    const matchBlood = selectedBloodFilter === "ALL" || d.groupeSanguin === selectedBloodFilter;
    const matchCommune = searchCommune === "" || d.commune.toLowerCase().includes(searchCommune.toLowerCase());
    return matchBlood && matchCommune;
  });

  return (
    <div className="space-y-8 py-4">
      {/* 1. SECTION CHIFFRES CLÉS (METRICS CARDS BMM STYLE) */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Métrique 1 : Urgences / Alertes */}
        <Card className="border-rose-500/30 bg-slate-900/80 shadow-lg">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle as="h3" className="text-xs font-semibold uppercase text-slate-400">
              Alertes de Stock Critique
            </CardTitle>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Bell className="h-5 w-5 animate-bounce" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl font-extrabold text-rose-400">
              {stocksCritiques.length} Hôpitaux
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {stocksCritiques.map((c) => `${c.hopitalNom} (${c.groupe})`).join(", ")}
            </p>
          </CardContent>
        </Card>

        {/* Métrique 2 : Réserve Totale */}
        <Card className="border-emerald-500/30 bg-slate-900/80 shadow-lg">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle as="h3" className="text-xs font-semibold uppercase text-slate-400">
              Poches Disponibles
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Droplet className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl font-extrabold text-emerald-400">
              {totalPochesDisponibles} Poches
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sur l&apos;ensemble des 10 banques de sang connectées
            </p>
          </CardContent>
        </Card>

        {/* Métrique 3 : Transferts Inter-Hospitaliers */}
        <Card className="border-cyan-500/30 bg-slate-900/80 shadow-lg">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle as="h3" className="text-xs font-semibold uppercase text-slate-400">
              Transferts en Transit
            </CardTitle>
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl font-extrabold text-cyan-400">
              {transfertsEnTransit.length} Convois
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Chaîne du froid 2°C - 6°C sous contrôle
            </p>
          </CardContent>
        </Card>

        {/* Métrique 4 : Campagnes Mobiles */}
        <Card className="border-amber-500/30 bg-slate-900/80 shadow-lg">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle as="h3" className="text-xs font-semibold uppercase text-slate-400">
              Campagnes Actives
            </CardTitle>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <CalendarHeart className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl font-extrabold text-amber-400">
              {campagnesActives.length} Communes
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Collectes citoyennes en cours de déploiement
            </p>
          </CardContent>
        </Card>
      </section>

      {/* 2. CONSOLE DE DISPATCH D'URGENCE & MATCHING HAVERSINE */}
      <EmergencyDispatchConsole
        onSearchMatch={async (latVal, lngVal, grp) => {
          const res = await fetch(`/api/v1/hemora/matching?lat=${latVal}&lng=${lngVal}&groupe=${encodeURIComponent(grp)}`);
          const json = await res.json();
          return json.data || [];
        }}
        onTriggerMobileMoney={onTriggerMobileMoney}
        onBroadcastSms={onBroadcastSms}
        onBroadcastCall={onBroadcastCall}
      />

      {/* 3. MONITORING DES STOCKS PAR ÉTABLISSEMENT */}
      <BloodStockMonitor
        stocks={stocks}
        onTriggerTransfer={onTriggerTransfer}
      />

      {/* 4. CONSOLE DE RÉGULATION DES TRANSFERTS DE SANG INTER-HOSPITALIERS */}
      <BloodTransferHub
        transferts={transferts}
        onNewTransfer={onNewTransfer}
      />

      {/* 5. SUIVI DES CAMPAGNES MOBILES DANS LES 77 COMMUNES */}
      <MobileCampaignsTracker
        campagnes={campagnes}
        onAddCampaign={onAddCampaign}
      />

      {/* 6. ANNUAIRE & EXPLORATEUR DES DONNEURS VOLONTAIRES */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <span>👥</span>
              <span>Annuaire National des Donneurs Volontaires Vérifiés</span>
            </h3>
            <p className="text-xs text-slate-400">
              Recherchez des donneurs par groupe sanguin ou par commune de résidence.
            </p>
          </div>

          {/* Filtres de recherche */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedBloodFilter}
                onChange={(e) => setSelectedBloodFilter(e.target.value)}
                className="bg-transparent text-white font-semibold cursor-pointer outline-none"
              >
                <option value="ALL">Tous les Groupes</option>
                <option value="O+">Groupe O+</option>
                <option value="O-">Groupe O-</option>
                <option value="A+">Groupe A+</option>
                <option value="A-">Groupe A-</option>
                <option value="B+">Groupe B+</option>
                <option value="B-">Groupe B-</option>
                <option value="AB+">Groupe AB+</option>
                <option value="AB-">Groupe AB-</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrer par commune..."
                value={searchCommune}
                onChange={(e) => setSearchCommune(e.target.value)}
                className="bg-transparent text-white placeholder-slate-500 outline-none w-32 sm:w-40"
              />
            </div>
          </div>
        </div>

        {/* Grille des badges donneurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDonneurs.map((d) => (
            <DonorBadgeCard
              key={d.id}
              donneur={d}
              onRequestCard={() => {}}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
