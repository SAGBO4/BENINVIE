"use client";

import { MapPin } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicStats } from "@/lib/api/hooks";

/**
 * Villes réellement couvertes, déduites des structures partenaires et des
 * donneurs validés. Le bandeau disparaît tant qu'aucune ville n'est couverte:
 * afficher une liste de villes fictives serait une promesse fausse.
 */
export function RegionsStrip() {
  const stats = usePublicStats();

  if (stats.isError) return null;

  if (stats.isPending) {
    return (
      <section className="bg-secondary/[0.04] border-y py-8 dark:bg-black/20">
        <Container className="flex flex-col items-center gap-6">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-5 w-full max-w-3xl" />
        </Container>
      </section>
    );
  }

  const cities = stats.data.cities;
  if (cities.length === 0) return null;

  // Le défilement a besoin de deux copies pour boucler sans saut visible.
  const items = [...cities, ...cities];

  return (
    <section className="bg-secondary/[0.04] border-y py-8 dark:bg-black/20">
      <Container className="flex flex-col items-center gap-6">
        <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          {cities.length > 1
            ? `Présent dans ${cities.length} villes`
            : "Première ville couverte"}
        </span>
        <div className="group relative w-full overflow-hidden mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <ul className="animate-marquee group-hover:paused flex w-max items-center gap-10">
            {items.map((city, index) => (
              <li
                key={`${city}-${index}`}
                aria-hidden={index >= cities.length}
                className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-sm font-medium"
              >
                <MapPin className="text-primary size-3.5" />
                {city}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
