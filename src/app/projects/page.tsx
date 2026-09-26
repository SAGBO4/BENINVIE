import { ContactCard } from "@/components/contact/contact-card";
import { Projects } from "@/components/projects/projects";
import { FadeIn } from "@/components/ui/motion-primitives";
import { createMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = createMetadata({
  title: "Consoles Cliniques & Modules HEMORA",
  description: "Dispositif Bris de Glace, Matching Haversine 0-45 km, Supervision des Stocks et Passeport Donneur.",
  path: "/projects",
});

export default function ProjectsPage(): ReactNode {
  return (
    <main id="main-content" className="flex flex-1 flex-col bg-[#f6f8fb] text-slate-900">
      <section className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12 pt-10 pb-16 border-b border-slate-200/90 bg-white">
        <FadeIn className="flex flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0a3764]/20 bg-[#0a3764]/5 px-4 py-1.5 text-xs font-bold text-[#0a3764]">
            <span className="h-2 w-2 rounded-full bg-[#008751] animate-pulse" />
            <span>RÉSEAU TRANSFUSIONNEL & URGENCES SANITAIRES DU BÉNIN</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Consoles Opérationnelles & Modules Cliniques
          </h1>

          <p className="max-w-[58ch] text-base sm:text-lg leading-relaxed text-slate-600">
            Supervision télémétrique en temps réel, matching géodésique Haversine (&lt; 45 km) du Centre National de Transfusion Sanguine (CNTS) et garantie de prise en charge immédiate Bris de Glace dans les 77 communes.
          </p>
        </FadeIn>
      </section>

      <div className="w-full bg-[#f6f8fb] py-8 sm:py-12">
        <Projects />
      </div>

      <ContactCard />
      <div className="h-12 sm:h-16" />
    </main>
  );
}
