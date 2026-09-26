"use client";

import { Container } from "@/components/layout/container";
import { StatCounter } from "@/components/marketing/stat-counter";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicStats } from "@/lib/api/hooks";

/**
 * Chiffres réels de la plateforme, lus depuis `/api/v1/public/stats`.
 *
 * Aucune valeur de repli: si l'API ne répond pas, la bande disparaît. Un
 * chiffre inventé sur une page d'accueil est pire que pas de chiffre du tout,
 * surtout sur un produit qui promet la vérifiabilité.
 */
export function LiveStats() {
  const stats = usePublicStats();

  if (stats.isError) return null;

  if (stats.isPending) {
    return (
      <Container className="grid grid-cols-2 gap-8 border-t py-10 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </Container>
    );
  }

  const data = stats.data;
  const entries = [
    { value: data.donorsRegistered, label: "Donneurs validés" },
    { value: data.organizations, label: "Structures partenaires" },
    { value: data.citiesCovered, label: "Villes couvertes" },
    { value: data.donationsRecorded, label: "Dons enregistrés" },
  ];

  return (
    <Container className="grid grid-cols-2 gap-8 border-t py-10 lg:grid-cols-4">
      {entries.map((entry) => (
        <StatCounter
          key={entry.label}
          value={entry.value}
          label={entry.label}
        />
      ))}
    </Container>
  );
}
