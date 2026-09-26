"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { usePublicStats } from "@/lib/api/hooks";

/**
 * Relevés du volet d'authentification. Ils viennent de la base: le panneau
 * affichait auparavant « 12 480 donneurs, 54 pays, 47 s pour alerter », trois
 * nombres écrits en dur qui n'ont jamais correspondu à quoi que ce soit.
 */
export function AuthReadouts() {
  const stats = usePublicStats();

  if (stats.isError) return null;

  const readouts = [
    { label: "donneurs", value: stats.data?.donorsRegistered },
    { label: "structures", value: stats.data?.organizations },
    { label: "villes", value: stats.data?.citiesCovered },
  ];

  return (
    <dl className="relative grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
      {readouts.map((item) => (
        <div key={item.label} className="space-y-1">
          <dt className="text-xs text-white/50">{item.label}</dt>
          <dd className="font-display text-2xl font-bold tracking-tight tabular-nums">
            {stats.isPending ? (
              <Skeleton className="h-7 w-14 bg-white/10" />
            ) : (
              (item.value ?? 0).toLocaleString("fr-FR")
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
