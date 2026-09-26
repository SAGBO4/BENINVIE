import { ContactCard } from "@/components/contact/contact-card";
import { Projects } from "@/components/projects/projects";
import { FadeIn } from "@/components/ui/motion-primitives";
import { createMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = createMetadata({
  title: "Modules & Consoles Opérationnelles",
  description: "Dispositif Bris de Glace, Matching Haversine 0-45 km, Supervision des Stocks et Passeport Donneur.",
  path: "/projects",
});

export default function ProjectsPage(): ReactNode {
  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-275 px-6 pt-44 pb-16 sm:px-10 sm:pt-48 sm:pb-20">
        <FadeIn className="flex flex-col items-center gap-5 text-center">
          <h1 className="font-serif text-[2.75rem] font-medium leading-[1.05] tracking-tight text-foreground md:text-[3.25rem] lg:text-[3.75rem]">
            Consoles d&apos;Urgence & Modules BMM
          </h1>
          <p className="max-w-[44ch] text-[18px] leading-[1.45] tracking-tight text-foreground/70 sm:text-[21px]">
            Supervision temps réel, matching géodésique Haversine (&lt; 45 km) et garantie de prise en charge immédiate Bris de Glace dans les 77 communes.
          </p>
        </FadeIn>
      </section>
      <Projects />
      <ContactCard />
      <div className="h-12 sm:h-16" />
    </main>
  );
}
