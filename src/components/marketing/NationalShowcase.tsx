"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ArrowRight,
  ShieldCheck,
  HeartPulse,
  BellRing,
  Smartphone,
  MapPin,
  Building2,
  Users,
  Activity,
  CheckCircle2,
  Sparkles,
  QrCode,
  Flame,
} from "lucide-react";

interface NationalShowcaseProps {
  onNavigateToTab: (tabId: string) => void;
}

const BLOOD_GROUPS = [
  { group: "O−", label: "Donneur Universel", rarity: "Très recherché" },
  { group: "O+", label: "Le plus répandu", rarity: "Besoin constant" },
  { group: "A−", label: "Compatible A & AB", rarity: "Rare" },
  { group: "A+", label: "Compatible A+ & AB+", rarity: "Courant" },
  { group: "B−", label: "Compatible B & AB", rarity: "Rare" },
  { group: "B+", label: "Compatible B+ & AB+", rarity: "Courant" },
  { group: "AB−", label: "Receveur négatif", rarity: "Très rare" },
  { group: "AB+", label: "Receveur Universel", rarity: "Polyvalent" },
];

const DEPARTEMENTS_BENIN = [
  "Littoral (Cotonou)",
  "Atlantique (Abomey-Calavi)",
  "Borgou (Parakou / Nikki / Kalalé)",
  "Ouémé (Porto-Novo)",
  "Zou (Abomey)",
  "Alibori (Kandi)",
  "Atacora (Natitingou)",
  "Collines (Dassa)",
  "Donga (Djougou)",
  "Mono (Lokossa)",
  "Couffo (Aplahoué)",
  "Plateau (Pobè)",
];

export function NationalShowcase({ onNavigateToTab }: NationalShowcaseProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>("O−");

  return (
    <div className="space-y-16 py-6">
      {/* 1. SECTION HÉRO MAJEURE */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-linear-to-b from-slate-900/90 via-slate-950 to-slate-950 p-8 lg:p-12 shadow-2xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Réseau National de Souveraineté Sanitaire • République du Bénin</span>
            </div>

            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.08]">
              Le bon sang, <br />
              <span className="text-emerald-400">au bon endroit,</span> <br />
              <span className="text-amber-400">à temps.</span>
            </h1>

            <p className="max-w-xl text-base text-slate-300 leading-relaxed">
              <strong>Gbɛ (BENINVIE)</strong> fédère les structures de santé des 77 communes, les banques de sang du Centre National de Transfusion Sanguine (CNTS) et les donneurs volontaires. Zéro refus d&apos;urgence vitale, défraiement Mobile Money de 2 000 FCFA garanti et ancrage cryptographique OTS immuable.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 shadow-lg shadow-emerald-950/60"
                onClick={() => onNavigateToTab("dashboard")}
              >
                <span>Accéder au Tableau de Bord National</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                onClick={() => onNavigateToTab("scenario")}
              >
                <span>Lancer le Scénario Bio à Kalalé</span>
              </Button>
            </div>

            {/* Sélecteur des 8 Groupes Sanguins */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5 font-medium">
                <span>Registre National des Groupes Sanguins Pris en Charge :</span>
                <span className="text-amber-400 font-mono">
                  Sélectionné : <strong>{selectedGroup}</strong>
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {BLOOD_GROUPS.map((b) => (
                  <button
                    key={b.group}
                    type="button"
                    onClick={() => setSelectedGroup(b.group)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedGroup === b.group
                        ? "border-emerald-500 bg-emerald-950/60 text-white shadow-md shadow-emerald-900/40 scale-105"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <span className="font-display text-sm">{b.group}</span>
                    <span className="text-[9px] text-slate-500">{b.rarity.slice(0, 7)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Visuel Clé Héro (Asset BMM) */}
          <div className="relative">
            <div className="relative mx-auto aspect-4/3 sm:aspect-5/4 w-full max-w-md lg:max-w-none overflow-hidden rounded-2xl border border-slate-800 shadow-2xl bg-slate-900">
              <Image
                src="/hero-background.png"
                alt="Don de sang et régulation hospitalière au Bénin"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-slate-700/60 bg-slate-950/80 p-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-xs font-bold text-white">CHIC Calavi & CNHU-HKM Connectés</p>
                      <p className="text-[11px] text-slate-400">Réseau froid 3.8°C • 14 poches mobilisables</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 bg-emerald-950/30 text-[10px]">
                    OTS Certifié
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. RUBAN DES 12 DÉPARTEMENTS */}
      <div className="overflow-hidden border-y border-slate-800/80 bg-slate-950/60 py-3">
        <div className="flex items-center gap-3 overflow-x-auto px-4 scrollbar-none">
          <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            77 Communes :
          </span>
          {DEPARTEMENTS_BENIN.map((dep, idx) => (
            <span
              key={idx}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300"
            >
              <span>{dep}</span>
            </span>
          ))}
        </div>
      </div>

      {/* 3. COMPTEURS CLÉS EN TEMPS RÉEL */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Communes Déployées", value: "77 / 77", sub: "Couverture nationale 100%", color: "text-emerald-400" },
          { label: "Urgences Vitales", value: "Zéro Refus", sub: "Garantie de Paiement Différé", color: "text-rose-400" },
          { label: "Donneurs Enregistrés", value: "4 820+", sub: "Profils certifiés SHA-256 APDP", color: "text-amber-400" },
          { label: "Délai de Mobilisation", value: "< 15 min", sub: "Matching géodésique Haversine", color: "text-cyan-400" },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-1.5"
          >
            <p className="text-xs font-medium text-slate-400">{stat.label}</p>
            <p className={`font-display text-2xl lg:text-3xl font-extrabold ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-[11px] text-slate-500">{stat.sub}</p>
          </div>
        ))}
      </section>

      {/* 4. RÉCIT EN IMAGES (SCROLL STORY BMM) */}
      <section className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl flex flex-col justify-between">
          <div className="relative aspect-16/9 w-full">
            <Image
              src="/emergency-banner.png"
              alt="Urgence Vitale Transfusionnelle"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute top-3 left-3">
              <Badge className="bg-rose-600 text-white font-bold text-xs">Le Défi</Badge>
            </div>
          </div>
          <div className="p-6 space-y-2">
            <h3 className="font-display text-xl font-bold text-white">
              Quand chaque minute compte
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Une hémorragie obstétricale ou un polytraumatisme routier exige des concentrés de globules rouges en moins de 30 minutes. Grâce au moteur de régulation de Gbɛ, l&apos;hôpital émet l&apos;alerte et notifie automatiquement les donneurs compatibles les plus proches par SMS et IVR vocal en langues nationales (Bariba, Fon, Dendi).
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl flex flex-col justify-between">
          <div className="relative aspect-16/9 w-full">
            <Image
              src="/how-it-works.png"
              alt="Donneur vérifié et vie sauvée"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute top-3 left-3">
              <Badge className="bg-emerald-600 text-white font-bold text-xs">La Réponse</Badge>
            </div>
          </div>
          <div className="p-6 space-y-2">
            <h3 className="font-display text-xl font-bold text-white">
              Un donneur identifié, une vie sauvée
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Le donneur présente sa carte physique ou numérique plastifiée avec QR code scannable. L&apos;intégrité de ses antécédents est prouvée instantanément hors-ligne. Une fois le prélèvement achevé, une indemnité de transport de 2 000 FCFA est virée immédiatement sur son compte MTN MoMo ou Moov Money.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FONCTIONNALITÉS MAJEURES (SHADCN CARDS) */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 bg-emerald-950/30">
            Piliers Technologiques
          </Badge>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Une architecture souveraine, rapide et infalsifiable
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Conçue pour fonctionner en réseau dégradé ou hors-ligne dans les villages les plus reculés du Bénin.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-slate-800 bg-slate-900/60 hover:border-emerald-500/40 transition-colors">
            <CardHeader className="space-y-2">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit">
                <BellRing className="h-5 w-5" />
              </div>
              <CardTitle as="h3" className="text-base text-white">Alertes Ciblées par Commune</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Seuls les donneurs compatibles se trouvant dans un rayon de 0 à 45 km sont sollicités. Aucun spam.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 hover:border-emerald-500/40 transition-colors">
            <CardHeader className="space-y-2">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle as="h3" className="text-base text-white">Conformité APDP & Hash SHA-256</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Données de santé salées et protégées par la Loi n° 2017-20. Aucun identifiant médical personnel n&apos;est exposé publiquement.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 hover:border-emerald-500/40 transition-colors">
            <CardHeader className="space-y-2">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 w-fit">
                <Smartphone className="h-5 w-5" />
              </div>
              <CardTitle as="h3" className="text-base text-white">Forfait Transport Mobile Money</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                2 000 FCFA versés immédiatement sur MTN MoMo ou Moov Money pour compenser le déplacement du donneur citoyen.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 hover:border-emerald-500/40 transition-colors">
            <CardHeader className="space-y-2">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 w-fit">
                <HeartPulse className="h-5 w-5" />
              </div>
              <CardTitle as="h3" className="text-base text-white">Ancrage OTS sur Bitcoin</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Attestations de don et cartes scellées mathématiquement par OpenTimestamps pour une intégrité temporelle incontestable.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* 6. BANNIÈRE D'APPEL À L'ACTION */}
      <section className="rounded-3xl border border-emerald-500/30 bg-linear-to-r from-emerald-950/60 via-slate-900 to-slate-900 p-8 text-center space-y-4 shadow-xl">
        <h3 className="font-display text-2xl font-bold text-white">
          Prêt à tester la chaîne de secours en situation réelle ?
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Explorez le scénario interactif officiel de la femme enceinte Bio à Kalalé ou découvrez la console hospitalière de gestion des stocks de sang.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            onClick={() => onNavigateToTab("scenario")}
          >
            🎬 Dérouler la Démo Bio à Kalalé
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-slate-700 text-slate-200 hover:bg-slate-800"
            onClick={() => onNavigateToTab("dashboard")}
          >
            📊 Consulter les Stocks Hospitaliers
          </Button>
        </div>
      </section>
    </div>
  );
}
