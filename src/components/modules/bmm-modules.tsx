"use client";

import React from "react";
import Image from "next/image";
import { FadeIn } from "@/components/ui/motion-primitives";
import { HeartPulse, Droplet, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";

interface BmmModule {
  id: string;
  icon: any;
  iconLabel: string;
  title: string;
  description: string;
  meta: string;
  image: string;
  href: string;
}

const BMM_MODULES: BmmModule[] = [
  {
    id: "matching",
    icon: HeartPulse,
    iconLabel: "ALGORITHME HAVERSINE",
    title: "Régulation & Matching Géodésique des Donneurs",
    description:
      "Calcul instantané de la distance et notification ciblée par SMS et appel vocal IVR en langues nationales (Bariba, Fon, Dendi) pour mobiliser les poches en moins de 30 minutes.",
    meta: "Rayon d'action utile 0 à 45 km • Score Proximité + Assiduité",
    image: "/emergency-banner.png",
    href: "#urgences",
  },
  {
    id: "stocks",
    icon: Droplet,
    iconLabel: "CNTS • 77 COMMUNES",
    title: "Supervision Prédictive des Stocks Sanguins",
    description:
      "Monitoring en temps réel des concentrés érythrocytaires disponibles dans les centres hospitaliers (CHIC, CNHU, CHUD, Hôpitaux de Zone). Alertes automatiques dès franchissement des seuils critiques.",
    meta: "8 Groupes ABO/Rh • Réseau Froid 2°C - 6°C Certifié",
    image: "/how-it-works.png",
    href: "#stocks",
  },
  {
    id: "urgences",
    icon: ShieldAlert,
    iconLabel: "RÈGLE D'OR 2026",
    title: "Admission Vitale Bris de Glace & Paiement Différé",
    description:
      "Zéro refus pour motif financier. L'urgentiste accède instantanément au dossier vital sécurisé avec traçabilité APDP, sans exiger aucune avance ni caution préalable.",
    meta: "Garantie Trésor Public • Prise en charge intégrale ARCH",
    image: "/trust-shield.png",
    href: "#urgences",
  },
  {
    id: "donneur",
    icon: Sparkles,
    iconLabel: "ANCRAGE OPENTIMESTAMPS",
    title: "Carte Donneur QR Plastifiée & Indemnité MoMo",
    description:
      "Vérification hors-ligne des antécédents médicaux par QR code cryptographique. Versement automatisé de 2 000 FCFA sur MTN MoMo ou Moov Money pour chaque don achevé.",
    meta: "Preuve Bitcoin OTS • SHA-256 APDP • Cartes physiques livrées",
    image: "/bitcoin-verified.png",
    href: "#donneur",
  },
];

export function BmmModules(): React.ReactNode {
  return (
    <section id="modules" className="relative w-full py-16 sm:py-24">
      {/* Séparateur élégant façon Guy */}
      <div className="flex flex-col items-center justify-center pb-10">
        <div className="h-14 w-[1px] bg-gradient-to-b from-transparent via-emerald-500/30 to-emerald-500/60" />
        <div className="my-2.5 flex items-center rounded-full border border-emerald-500/20 bg-slate-950/80 px-4 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-400 backdrop-blur-md shadow-sm">
          <span>02 • Piliers & Modules Opérationnels</span>
        </div>
        <div className="h-8 w-[1px] bg-gradient-to-b from-emerald-500/60 to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="flex flex-col items-center gap-3 text-center pb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Architecture Transfusionnelle Intégrée
          </h2>
          <p className="max-w-[42ch] text-base sm:text-lg text-slate-300">
            Conçue pour garantir une résilience maximale même en réseau téléphonique dégradé.
          </p>
        </FadeIn>

        {/* Grille de cartes épurées façon Guy Dribbble */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {BMM_MODULES.map((module, index) => {
            const Icon = module.icon;
            return (
              <FadeIn
                key={module.id}
                delay={index * 0.08}
                className="flex flex-col"
              >
                <article className="group flex flex-col justify-between h-full rounded-3xl border border-slate-800/90 bg-slate-900/60 p-5 sm:p-6 shadow-xl hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all duration-300">
                  <div className="space-y-4">
                    {/* Header badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/50 text-emerald-400">
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <span className="text-xs font-bold tracking-wider uppercase text-emerald-400 font-mono">
                          {module.iconLabel}
                        </span>
                      </div>
                      <a
                        href={module.href}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>

                    {/* Image visuelle */}
                    <div className="relative aspect-16/9 w-full overflow-hidden rounded-2xl bg-slate-950 border border-slate-800">
                      <Image
                        src={module.image}
                        alt={module.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    </div>

                    {/* Titre & Description */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed font-normal">
                        {module.description}
                      </p>
                    </div>
                  </div>

                  {/* Meta footer */}
                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[11px] text-slate-400 font-medium">{module.meta}</span>
                    <a
                      href={module.href}
                      className="font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <span>Accéder</span>
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </article>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
