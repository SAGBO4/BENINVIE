import { AudiencesSection } from "@/components/marketing/audiences-section";
import { AvailabilitySection } from "@/components/marketing/availability-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { ImpactSection } from "@/components/marketing/impact-section";
import { RegionsStrip } from "@/components/marketing/regions-strip";
import {
  ScrollStory,
  type StoryPanel,
} from "@/components/marketing/scroll-story";
import { SecuritySection } from "@/components/marketing/security-section";

/**
 * Récit en deux temps: le besoin, puis la réponse. Les visuels sont servis
 * depuis le domaine: passer par un hébergeur d'images tiers ajoutait une
 * dépendance réseau qui bloquait l'affichage de la page quand il ne
 * répondait pas, et exposait l'adresse IP des visiteurs.
 */
const storyPanels: StoryPanel[] = [
  {
    image: "/emergency-banner.png",
    alt: "Carte d'Afrique connectée, veille sanitaire d'un praticien",
    eyebrow: "Le besoin",
    title: "Quand chaque minute compte",
    description:
      "Une demande de sang rare peut surgir à tout instant, n'importe où sur le continent. La vitesse de mobilisation change l'issue.",
  },
  {
    image: "/how-it-works.png",
    alt: "Une donneuse fait scanner sa carte à l'accueil d'un centre de collecte",
    eyebrow: "La réponse",
    title: "Un donneur identifié, une vie sauvée",
    description:
      "HEMORA retrouve les donneurs compatibles et disponibles au plus près du besoin, et leur carte se vérifie en un scan à l'accueil.",
  },
];

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <RegionsStrip />
      <ScrollStory panels={storyPanels} />
      <FeaturesSection />
      <HowItWorksSection />
      <AvailabilitySection />
      <AudiencesSection />
      <ImpactSection />
      <SecuritySection />
      <CtaSection />
    </>
  );
}
