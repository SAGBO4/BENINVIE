"use client";

import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";
import { homeSectionIds } from "@/config/navigation";
import { usePublicStats } from "@/lib/api/hooks";
import type { StockStatus } from "@/lib/api/resources";
import { cn } from "@/lib/utils";

const STATUS: Record<
  StockStatus,
  { label: string; bar: string; text: string }
> = {
  critique: {
    label: "Critique",
    bar: "bg-primary",
    text: "text-primary",
  },
  faible: {
    label: "Faible",
    bar: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
  },
  stable: {
    label: "Stable",
    bar: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
  },
};

/**
 * Le niveau des réserves, présenté comme la fiche de stock qu'il est.
 *
 * Huit cartes arrondies identiques donnaient à ces chiffres l'allure d'une
 * grille de fonctionnalités. Un registre se lit en colonnes: le groupe, la
 * jauge, les poches, l'état. C'est la forme dans laquelle un responsable de
 * collecte lit déjà ses stocks.
 */
export function AvailabilitySection() {
  const stats = usePublicStats();

  return (
    <section id={homeSectionIds.reserves} className="border-t py-20 sm:py-28">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl space-y-3">
            <p className="text-primary flex items-center gap-3 text-xs font-semibold tracking-[0.18em] uppercase">
              <span className="bg-primary h-px w-8" aria-hidden="true" />
              État des réserves
            </p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
              Ce qui manque, en ce moment
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm text-sm text-pretty">
            Niveaux déclarés par les structures du réseau, rapportés au groupe
            le mieux pourvu. Un groupe en rouge a besoin de donneurs maintenant.
          </p>
        </div>

        {stats.isPending ? (
          <div className="space-y-px">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-none" />
            ))}
          </div>
        ) : stats.isError ? (
          <p className="text-muted-foreground border-t py-10 text-sm">
            Les niveaux de réserve ne sont pas consultables pour le moment.
          </p>
        ) : stats.data.availability.length === 0 ? (
          <p className="text-muted-foreground border-t py-10 text-sm">
            Aucune structure du réseau n&apos;a encore publié son stock. Les
            niveaux apparaîtront ici dès la première déclaration.
          </p>
        ) : (
          <table className="w-full max-w-3xl border-collapse text-left">
            <colgroup>
              <col className="w-20" />
              <col />
              <col className="w-24" />
              <col className="w-28" />
            </colgroup>
            <caption className="sr-only">
              Niveau des réserves par groupe sanguin
            </caption>
            <thead>
              <tr className="text-muted-foreground border-b text-[0.7rem] tracking-[0.12em] uppercase">
                <th scope="col" className="py-2 font-semibold">
                  Groupe
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Niveau
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Poches
                </th>
                <th scope="col" className="py-2 pl-6 text-right font-semibold">
                  État
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.data.availability.map((item) => {
                const theme = STATUS[item.status];
                return (
                  <tr
                    key={item.bloodType}
                    className="border-border/70 group border-b"
                  >
                    <th
                      scope="row"
                      className="font-display w-20 py-4 text-2xl font-extrabold tracking-tight"
                    >
                      {/* Le signe moins typographique, pas le trait d'union. */}
                      {item.bloodType.replace("-", "−")}
                    </th>
                    <td className="py-4 pr-8">
                      <div
                        role="meter"
                        aria-valuenow={item.level}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Réserve ${item.bloodType}: ${theme.label.toLowerCase()}`}
                        className="bg-muted h-1.5 w-full overflow-hidden"
                      >
                        <div
                          className={cn(
                            "h-full transition-[width] duration-700 ease-out motion-reduce:transition-none",
                            theme.bar,
                          )}
                          style={{ width: `${Math.max(item.level, 2)}%` }}
                        />
                      </div>
                    </td>
                    <td className="text-muted-foreground py-4 text-right text-sm tabular-nums">
                      {item.units}
                    </td>
                    <td
                      className={cn(
                        "py-4 pl-6 text-right text-xs font-semibold tracking-wider uppercase",
                        theme.text,
                      )}
                    >
                      {theme.label}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Container>
    </section>
  );
}
