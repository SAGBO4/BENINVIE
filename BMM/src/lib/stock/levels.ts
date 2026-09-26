import type { StockStatus } from "@/lib/api/resources";

/**
 * Seuils d'alerte sur le stock d'une structure, exprimés en poches.
 *
 * Ils qualifient un poste isolé (un composant pour un groupe), pas la réserve
 * globale: c'est ce niveau-là qui déclenche une demande au réseau.
 */
export const STOCK_THRESHOLDS = {
  /** En dessous, la structure ne peut plus couvrir une urgence. */
  critical: 5,
  /** En dessous, le réapprovisionnement doit être engagé. */
  low: 12,
} as const;

export function stockStatusOf(units: number): StockStatus {
  // NaN et ±Infinity ne sont pas des quantités valides: un stock dont la
  // valeur ne peut pas être comparée ne doit jamais sembler sain.
  if (!Number.isFinite(units) || Number.isNaN(units)) return "critique";
  if (units < STOCK_THRESHOLDS.critical) return "critique";
  if (units < STOCK_THRESHOLDS.low) return "faible";
  return "stable";
}

export const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  critique: "Critique",
  faible: "Faible",
  stable: "Stable",
};

export const STOCK_STATUS_DOT: Record<StockStatus, string> = {
  critique: "bg-destructive",
  faible: "bg-amber-500",
  stable: "bg-emerald-500",
};
