"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/shared/logo";
import {
  Activity,
  ShieldAlert,
  HeartHandshake,
  Leaf,
  LayoutDashboard,
  Sparkles,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const tabs = [
    {
      id: "vitrine",
      label: "Présentation Nationale",
      icon: Sparkles,
      tag: "HEMORA",
    },
    {
      id: "dashboard",
      label: "Tableau de Bord & Stocks",
      icon: LayoutDashboard,
      tag: "77 Communes",
    },
    {
      id: "scenario",
      label: "Démo Officielle Bio à Kalalé",
      icon: Activity,
      tag: "Wadagni-Talata",
    },
    {
      id: "donneur",
      label: "Espace Donneur & Cartes QR",
      icon: Award,
      tag: "OTS Scellé",
    },
    {
      id: "urgences",
      label: "Urgences & Bris de Glace",
      icon: ShieldAlert,
      tag: "Zéro Refus",
    },
    {
      id: "pharmacopee",
      label: "Pharmacopée ARS",
      icon: Leaf,
      tag: "MTA Certifié",
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      {/* Bandeau Supérieur Républicain */}
      <div className="border-b border-slate-900 bg-slate-950/90 py-1.5 px-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-300">
              RÉPUBLIQUE DU BÉNIN • Ministère de la Santé
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-slate-400">Programme Wadagni - Talata 2026</span>
            <span className="text-slate-700">|</span>
            <span className="text-emerald-400 font-medium">SANTÉ+ & HEMORA Unifiés</span>
            <span className="text-slate-700">|</span>
            <span className="text-amber-400 font-medium">Conformité APDP Loi 2017-20</span>
          </div>
        </div>
      </div>

      {/* Barre Principale de Navigation */}
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & Titre */}
          <div className="flex items-center gap-3">
            <Logo variant="compact" onDark />
            <div className="border-l border-slate-800 pl-3">
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-white text-base tracking-tight">
                  Gbɛ (BENINVIE)
                </span>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-950/30 text-[10px] px-1.5 py-0.2">
                  Souverain
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Plateforme Nationale Hospitalière & Secours Transfusionnel
              </p>
            </div>
          </div>

          {/* Badges d'État */}
          <div className="hidden lg:flex items-center gap-2">
            <Badge variant="outline" className="border-slate-800 bg-slate-900 text-slate-300 text-xs">
              ⚡ 77 Communes Connectées
            </Badge>
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs">
              🛡️ ARCH Tiers-Payant Actif
            </Badge>
            <Badge variant="outline" className="border-amber-500/30 bg-amber-950/20 text-amber-300 text-xs">
              🔗 Ancrage OTS Bitcoin
            </Badge>
          </div>
        </div>

        {/* Barre d'Onglets Segmentée */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border",
                  isActive
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/40"
                    : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:bg-slate-800 hover:text-slate-200"
                )}
              >
                <Icon className={cn("size-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded uppercase font-mono tracking-wider",
                    isActive ? "bg-emerald-700/80 text-white" : "bg-slate-800 text-slate-500"
                  )}
                >
                  {tab.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
