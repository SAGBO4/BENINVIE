import {
  ArrowLeftRight,
  BellRing,
  Building2,
  Droplet,
  HeartPulse,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

export const features = [
  {
    icon: BellRing,
    title: "Alerté près de chez vous",
    description:
      "Vous n'êtes prévenu que lorsque votre groupe sanguin est vraiment nécessaire, à proximité.",
  },
  {
    icon: ShieldCheck,
    title: "Vos données restent à vous",
    description:
      "Vos informations médicales sont protégées et ne sont partagées qu'avec votre accord.",
  },
  {
    icon: HeartPulse,
    title: "Une carte de confiance",
    description:
      "Votre carte de donneur et l'historique de vos dons ne peuvent pas être falsifiés.",
  },
  {
    icon: Smartphone,
    title: "Récompensé simplement",
    description:
      "Recevez votre récompense directement sur votre Mobile Money, par un simple dépôt, sans rien à installer.",
  },
] as const;

export const steps = [
  {
    title: "Créez votre profil",
    description:
      "Indiquez votre groupe sanguin et votre ville pour rejoindre le réseau de votre région.",
  },
  {
    title: "Recevez votre carte de donneur",
    description:
      "Une carte de confiance est créée pour vous : elle prouve votre identité de donneur en toute sécurité.",
  },
  {
    title: "Répondez aux urgences",
    description:
      "Quand un besoin proche correspond à votre groupe, rendez-vous au centre de don le plus proche.",
  },
  {
    title: "Recevez votre récompense",
    description:
      "Dès votre don confirmé, vous recevez une récompense, sur votre Mobile Money ou en Bitcoin.",
  },
] as const;

/**
 * Ce que chaque public trouve sur la plateforme. Ces promesses décrivent des
 * fonctionnalités réellement livrées: chaque point correspond à un écran ou à
 * un endpoint existant.
 */
export const audiences = [
  {
    icon: Droplet,
    eyebrow: "Donneurs",
    title: "Donner, prouver, être reconnu",
    points: [
      "Une carte de donneur vérifiable, avec un QR code scannable en centre de collecte.",
      "Une alerte seulement quand votre groupe est utile près de chez vous.",
      "Une récompense versée sur Mobile Money ou en Bitcoin après validation du don.",
    ],
    href: "/donate",
    cta: "Devenir donneur",
  },
  {
    icon: Building2,
    eyebrow: "Hôpitaux et centres de collecte",
    title: "Trouver le bon donneur, tout de suite",
    points: [
      "Recherche de donneurs compatibles par groupe et par distance.",
      "Alertes d'urgence et campagnes de collecte ciblées, en quelques clics.",
      "Suivi du stock par composant et par groupe sanguin.",
    ],
    href: "/register",
    cta: "Inscrire ma structure",
  },
  {
    icon: ArrowLeftRight,
    eyebrow: "Réseau",
    title: "S'entraider entre structures",
    points: [
      "Demandes de transfert publiées auprès des centres voisins.",
      "Réponse en un geste quand une structure peut fournir.",
      "Historique des échanges, du besoin à la réception.",
    ],
    href: "/login",
    cta: "Accéder au réseau",
  },
] as const;
