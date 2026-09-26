import type { DonorActivity } from "@/lib/api/resources";

/**
 * Délai minimal entre deux dons de sang total, en jours.
 *
 * Valeur de référence retenue par la plateforme: huit semaines. C'est le
 * plancher commun aux protocoles de collecte francophones. Le sexe et le type
 * de prélèvement, qui allongent ce délai dans certains protocoles, ne sont pas
 * enregistrés: on ne les suppose donc pas, et l'écran indique explicitement
 * que le centre de collecte reste seul juge de l'éligibilité.
 */
export const MIN_DAYS_BETWEEN_DONATIONS = 56;

const DAY_MS = 86_400_000;

export type DonationHistory = {
  /** Dons de sang effectivement enregistrés par une structure. */
  donationCount: number;
  /** Date du dernier don enregistré, ou null si aucun. */
  lastDonationAt: Date | null;
  /** Date à partir de laquelle un nouveau don est possible, ou null. */
  nextEligibleAt: Date | null;
  /** Jours restants avant le prochain don possible; 0 si éligible. */
  daysUntilEligible: number;
  eligible: boolean;
};

/**
 * Résume l'historique d'un donneur à partir de ses activités réelles.
 * Ne renvoie jamais de valeur inventée: sans don enregistré, l'historique
 * est vide et le donneur est éligible.
 */
export function summarizeDonations(
  activities: DonorActivity[],
  now: Date = new Date(),
): DonationHistory {
  const donations = activities
    .filter((a) => a.activityType === "blood_donation")
    .map((a) => new Date(a.createdAt))
    .filter((d) => !Number.isNaN(d.getTime()))
    // H-3: un don enregistré dans le futur ne peut pas servir de référence
    // pour calculer la prochaine éligibilité: on l'écarte.
    .filter((d) => d.getTime() <= now.getTime())
    .sort((a, b) => b.getTime() - a.getTime());

  const lastDonationAt = donations[0] ?? null;

  if (!lastDonationAt) {
    return {
      donationCount: 0,
      lastDonationAt: null,
      nextEligibleAt: null,
      daysUntilEligible: 0,
      eligible: true,
    };
  }

  const nextEligibleAt = new Date(
    lastDonationAt.getTime() + MIN_DAYS_BETWEEN_DONATIONS * DAY_MS,
  );
  const remainingMs = nextEligibleAt.getTime() - now.getTime();
  const daysUntilEligible = Math.max(0, Math.ceil(remainingMs / DAY_MS));

  return {
    donationCount: donations.length,
    lastDonationAt,
    nextEligibleAt,
    daysUntilEligible,
    eligible: daysUntilEligible === 0,
  };
}

const ACTIVITY_LABEL: Record<DonorActivity["activityType"], string> = {
  blood_donation: "Don de sang",
  referral: "Parrainage",
  awareness_session: "Session de sensibilisation",
};

export function activityLabel(type: DonorActivity["activityType"]): string {
  // H-1: si l'API introduit un nouveau type non encore listé ici, renvoyer
  // la valeur brute plutôt que undefined (qui crasherait en template).
  return ACTIVITY_LABEL[type] ?? type;
}
