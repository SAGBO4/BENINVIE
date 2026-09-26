import { httpClient } from "@/lib/api/http-client";

export type DonationPurpose =
  "campaign" | "development" | "operations" | "emergency";

export const DONATION_PURPOSE_LABELS: Record<DonationPurpose, string> = {
  campaign: "Campagne de don",
  development: "Développement de la plateforme",
  operations: "Fonctionnement",
  emergency: "Fonds d'urgence",
};

export const DONATION_PURPOSE_HINTS: Record<DonationPurpose, string> = {
  campaign: "Financer les campagnes et alertes de don de sang.",
  development: "Soutenir le développement et les évolutions du produit.",
  operations: "Couvrir les coûts d'hébergement et de fonctionnement.",
  emergency: "Alimenter le fonds réservé aux urgences vitales.",
};

export type CreateDonationPayload = {
  amountSats: number;
  purpose: DonationPurpose;
  message?: string;
};

export type DonationInvoice = {
  bolt11: string;
  amountSats: number;
  purpose: DonationPurpose;
  feesSat: number;
  simulated: boolean;
};

export type DonationRecord = {
  id: string;
  amountSats: number;
  purpose: DonationPurpose;
  message: string | null;
  bolt11: string | null;
  status: string;
  createdAt: string;
};

export type DonationsHistory = {
  donations: DonationRecord[];
  totalSats: number;
  count: number;
};

export const donationsApi = {
  /** Génère une facture Lightning pour un don à la plateforme. */
  create: (payload: CreateDonationPayload) =>
    httpClient.post<DonationInvoice>("/donations", payload),

  /** Historique des dons et total collecté (super-admin). */
  history: () => httpClient.get<DonationsHistory>("/donations"),

  /** Retire les fonds vers une facture Lightning externe (super-admin). */
  withdraw: (bolt11: string) =>
    httpClient.post<{ paymentHash: string }>("/donations/withdraw", { bolt11 }),
};
