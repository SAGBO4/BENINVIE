"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Heart, Lock, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 py-12 px-4 mt-20">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Marque & Mission */}
          <div className="space-y-3 md:col-span-2">
            <Logo variant="compact" onDark />
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              <strong>Gbɛ (BENINVIE)</strong> est la plateforme numérique souveraine de santé de la République du Bénin, intégrant le Système d&apos;Information Hospitalier Fédéré (SANTÉ+) et le Réseau d&apos;Urgence Transfusionnelle (HEMORA).
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 bg-emerald-950/20 text-[10px]">
                Programme Wadagni - Talata 2026
              </Badge>
              <Badge variant="outline" className="border-slate-700 text-slate-300 bg-slate-900 text-[10px]">
                77 Communes IASO
              </Badge>
            </div>
          </div>

          {/* Cadre Réglementaire & Sécurité */}
          <div className="space-y-2 text-xs">
            <p className="font-semibold uppercase tracking-wider text-slate-200">Cadre Réglementaire</p>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Loi n° 2017-20 (Code du Numérique & APDP)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>Loi n° 2020-37 (Protection Sociale ARCH)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-rose-400" />
                <span>Décret Zéro Refus d&apos;Urgence Vitale</span>
              </li>
            </ul>
          </div>

          {/* Partenaires Institutionnels */}
          <div className="space-y-2 text-xs">
            <p className="font-semibold uppercase tracking-wider text-slate-200">Institutions Publiques</p>
            <ul className="space-y-1.5 text-slate-400">
              <li>Ministère de la Santé du Bénin</li>
              <li>Agence Nationale d&apos;Identification des Personnes (ANIP)</li>
              <li>Autorité de Régulation du secteur de la Santé (ARS)</li>
              <li>Centre National de Transfusion Sanguine (CNTS)</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 République du Bénin — Ministère de la Santé. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <span className="text-emerald-500 font-mono text-[11px]">● Tous les systèmes sont opérationnels (34/34 routes)</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono text-[11px]">Ancrage Cryptographique OTS Vérifié</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
