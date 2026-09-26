"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { EmptyState, ErrorState } from "@/components/ui/states";

type QueryBoundaryProps<T> = {
  query: UseQueryResult<T>;
  /** Affiché tant que la première réponse n'est pas arrivée. */
  loading: ReactNode;
  /** Rendu quand des données sont disponibles. */
  children: (data: T) => ReactNode;
  /** Considère la réponse comme vide (tableau vide, objet nul...). */
  isEmpty?: (data: T) => boolean;
  empty?: {
    title: string;
    description?: ReactNode;
    icon?: LucideIcon;
    action?: ReactNode;
  };
  errorTitle?: string;
};

/**
 * Applique les mêmes états à toutes les vues alimentées par une requête:
 * chargement, erreur avec reprise, vide, puis contenu. Sans cela, chaque
 * écran réinvente ses propres états et certains n'en ont aucun.
 */
export function QueryBoundary<T>({
  query,
  loading,
  children,
  isEmpty,
  empty,
  errorTitle,
}: QueryBoundaryProps<T>) {
  if (query.isPending) return <>{loading}</>;

  if (query.isError) {
    return (
      <ErrorState
        error={query.error}
        title={errorTitle}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const data = query.data as T;

  if (empty && isEmpty?.(data)) {
    return (
      <EmptyState
        icon={empty.icon}
        title={empty.title}
        description={empty.description}
        action={empty.action}
      />
    );
  }

  return <>{children(data)}</>;
}
