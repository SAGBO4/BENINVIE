/**
 * Navigation publique. Chaque entrée pointe vers une page réelle: les ancres
 * de la page d'accueil sont déclarées ici avec l'identifiant de section
 * correspondant, pour qu'un lien ne puisse pas viser une section absente.
 */

/** Identifiants d'ancre posés sur les sections de la page d'accueil. */
export const homeSectionIds = {
  fonctionnement: "fonctionnement",
  reserves: "reserves",
  impact: "impact",
  publics: "publics",
} as const;

export const primaryNav = [
  { label: "Fonctionnement", href: `/#${homeSectionIds.fonctionnement}` },
  { label: "Réserves", href: `/#${homeSectionIds.reserves}` },
  { label: "Campagnes", href: "/campagnes" },
  { label: "Vérifier une carte", href: "/verify" },
  { label: "À propos", href: "/a-propos" },
] as const;

export const footerNav = [
  {
    title: "Donneurs",
    links: [
      { label: "Devenir donneur", href: "/donate" },
      { label: "Espace donneur", href: "/connexion-donneur" },
      { label: "Campagnes de collecte", href: "/campagnes" },
      { label: "Vérifier une carte", href: "/verify" },
    ],
  },
  {
    title: "Structures de santé",
    links: [
      { label: "Créer un compte", href: "/register" },
      { label: "Se connecter", href: "/login" },
      {
        label: "Comment ça marche",
        href: `/#${homeSectionIds.fonctionnement}`,
      },
    ],
  },
  {
    title: "La plateforme",
    links: [
      { label: "À propos", href: "/a-propos" },
      { label: "L'équipe", href: "/a-propos#equipe" },
      { label: "Notre impact", href: `/#${homeSectionIds.impact}` },
      { label: "Soutenir HEMORA", href: "/soutenir" },
    ],
  },
] as const;

export const legalNav = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Conditions d'utilisation", href: "/conditions" },
] as const;
