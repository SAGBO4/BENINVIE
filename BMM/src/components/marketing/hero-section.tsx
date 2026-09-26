import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { LiveStats } from "@/components/marketing/live-stats";
import { Button } from "@/components/ui/button";
import { homeSectionIds } from "@/config/navigation";

/**
 * Les huit groupes sanguins, dans l'ordre du registre de collecte: les
 * négatifs avant les positifs, du plus rare au plus courant. Cet ordre est
 * celui des fiches de stock, pas un ordre alphabétique.
 */
const BLOOD_GROUPS = ["O−", "O+", "A−", "A+", "B−", "B+", "AB−", "AB+"];

/**
 * L'ouverture reprend le vocabulaire du don: la notation des groupes
 * sanguins, composée grande, et une règle de mesure sous la photographie.
 * Pas de carte flottante ni de halo: ce produit tient un registre, il ne
 * fait pas de démonstration technologique.
 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <Container className="grid items-center gap-14 py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-20 lg:py-24">
        <div className="flex flex-col items-start gap-7">
          <p className="text-primary animate-rise-in flex items-center gap-3 text-xs font-semibold tracking-[0.18em] uppercase">
            <span className="bg-primary h-px w-8" aria-hidden="true" />
            Réseau panafricain du don
          </p>

          {/* Trois lignes composées, pas un texte qui se replie au hasard:
              chaque membre de la phrase tient sur sa ligne à toute largeur. */}
          <h1
            className="animate-rise-in font-display text-[2.5rem] leading-[1.05] font-extrabold tracking-[-0.03em] sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "60ms" }}
          >
            <span className="block">Le bon sang,</span>
            <span className="block">au bon endroit,</span>
            <span className="text-primary block">à temps.</span>
          </h1>

          <p
            className="animate-rise-in text-muted-foreground max-w-md text-lg text-pretty"
            style={{ animationDelay: "120ms" }}
          >
            HEMORA relie les donneurs volontaires aux hôpitaux et aux centres de
            collecte, et rend chaque don vérifiable.
          </p>

          <div
            className="animate-rise-in flex flex-wrap items-center gap-3"
            style={{ animationDelay: "180ms" }}
          >
            <Button size="lg" className="group" asChild>
              <Link href="/donate">
                Devenir donneur
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href={`#${homeSectionIds.fonctionnement}`}>
                Comment ça marche
              </Link>
            </Button>
          </div>

          {/* Les huit groupes, comme sur une fiche de collecte. */}
          <ul
            aria-label="Groupes sanguins pris en charge"
            className="animate-rise-in border-border flex flex-wrap gap-x-5 gap-y-2 border-t pt-6"
            style={{ animationDelay: "240ms" }}
          >
            {BLOOD_GROUPS.map((group) => (
              <li
                key={group}
                className="text-muted-foreground font-display text-sm font-bold tracking-tight tabular-nums"
              >
                {group}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="animate-rise-in relative"
          style={{ animationDelay: "140ms" }}
        >
          <Image
            priority
            src="/hero-background.png"
            alt="Une infirmière enregistre un donneur dans un centre de collecte"
            width={1024}
            height={1024}
            sizes="(min-width: 1024px) 30rem, 90vw"
            className="border-border aspect-[4/5] w-full rounded-sm border object-cover"
          />
          {/* Légende en pied d'image, comme sous une planche documentaire. */}
          <p className="text-muted-foreground mt-3 flex items-baseline justify-between gap-4 font-mono text-xs">
            <span>Centre de collecte, Cotonou</span>
            <span aria-hidden="true">HEMORA</span>
          </p>
        </div>
      </Container>

      <LiveStats />
    </section>
  );
}
