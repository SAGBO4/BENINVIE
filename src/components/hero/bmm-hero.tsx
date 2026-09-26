"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FadeIn, ScaleUnblur } from "@/components/ui/motion-primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShieldCheck, HeartPulse, Droplet, Sparkles, MapPin } from "lucide-react";

const BLOOD_GROUPS = [
  { group: "O−", label: "Donneur Universel", rarity: "Priorité Absolue" },
  { group: "O+", label: "Le plus répandu", rarity: "Besoin Constant" },
  { group: "A−", label: "Compatible A & AB", rarity: "Besoin Élevé" },
  { group: "A+", label: "Compatible A+ & AB+", rarity: "Courant" },
  { group: "B−", label: "Compatible B & AB", rarity: "Rare" },
  { group: "B+", label: "Compatible B+ & AB+", rarity: "Courant" },
  { group: "AB−", label: "Receveur négatif", rarity: "Très Rare" },
  { group: "AB+", label: "Receveur Universel", rarity: "Polyvalent" },
];

export function BmmHero(): React.ReactNode {
  const [selectedGroup, setSelectedGroup] = useState<string>("O−");

  return (
    <section id="hero" className="relative w-full pt-28 pb-16 sm:pt-36 sm:pb-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Colonne Gauche : Titre et accroche BMM */}
          <FadeIn className="flex flex-col gap-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 w-fit backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>BMM • Blood Management & Matching (HEMORA)</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.06]">
              Le bon sang, <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                au bon endroit,
              </span>{" "}
              <br />
              <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-amber-200 bg-clip-text text-transparent">
                à temps.
              </span>
            </h1>

            <p className="max-w-[48ch] text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Plateforme nationale souveraine fédérant le Centre National de Transfusion Sanguine (CNTS), les hôpitaux des 77 communes et les donneurs volontaires. Zéro refus d&apos;urgence vitale, défraiement Mobile Money de 2 000 FCFA garanti et scellement OpenTimestamps.
            </p>

            {/* CTAs rapides */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#stocks"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 text-sm shadow-xl shadow-emerald-950/80 transition-all hover:scale-[1.02]"
              >
                <span>Consulter les Stocks en Direct</span>
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#scenario"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold px-6 py-3 text-sm transition-all hover:scale-[1.02]"
              >
                <span>🎬 Scénario Bio à Kalalé</span>
              </a>
            </div>

            {/* Registre des 8 groupes sanguins */}
            <div className="pt-5 border-t border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Registre Transfusionnel National :</span>
                <span className="text-amber-400 font-mono font-bold">
                  Sélectionné : {selectedGroup}
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
                        ? "border-emerald-500 bg-emerald-950/70 text-white shadow-lg shadow-emerald-900/40 scale-105"
                        : "border-slate-800/90 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <span className="font-display text-sm">{b.group}</span>
                    <span className="text-[9px] text-slate-500 truncate w-full text-center">{b.rarity.slice(0, 8)}</span>
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Colonne Droite : Carte visuelle BMM & Ancrage OTS */}
          <ScaleUnblur className="flex justify-center lg:col-span-5">
            <div className="relative aspect-4/3 sm:aspect-5/4 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
              <Image
                src="/hero-background.png"
                alt="BMM Régulation Transfusionnelle Bénin"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 450px, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-slate-700/60 bg-slate-950/85 p-4 backdrop-blur-md shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <p className="text-xs font-bold text-white">CNHU-HKM & CHIC Calavi Connectés</p>
                      <p className="text-[11px] text-slate-400">Régulation 24/7 • 128 poches mobilisables</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 bg-emerald-950/40 text-[10px]">
                    OTS Scellé
                  </Badge>
                </div>
              </div>
            </div>
          </ScaleUnblur>
        </div>
      </div>
    </section>
  );
}
