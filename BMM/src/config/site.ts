import { clientEnv } from "@/lib/env/client";

export const siteConfig = {
  name: "HEMORA",
  tagline: "Connecter les sauveurs, protéger les vies",
  description:
    "Plateforme panafricaine de don de sang: inscription des donneurs, recherche de profils compatibles, alertes d'urgence, campagnes de collecte et récompenses versées en Mobile Money ou en Bitcoin.",
  url: clientEnv.NEXT_PUBLIC_APP_URL,
  locale: "fr",
} as const;

export type SiteConfig = typeof siteConfig;
