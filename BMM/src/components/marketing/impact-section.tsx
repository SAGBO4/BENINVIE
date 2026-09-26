"use client";

import { Bell, CalendarHeart, Droplet, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { homeSectionIds } from "@/config/navigation";
import { usePublicStats } from "@/lib/api/hooks";

const impactPoints = [
  "Une mobilisation déclenchée en quelques minutes, pas en quelques heures.",
  "Des donneurs compatibles localisés à proximité immédiate du besoin.",
  "Un suivi lisible, du don enregistré jusqu'à la récompense versée.",
] as const;

/**
 * L'activité réelle du réseau, plutôt qu'un collage d'images d'illustration.
 * Un visiteur qui envisage de donner veut savoir s'il se passe quelque chose
 * ici, maintenant: ces quatre chiffres viennent de la base.
 */
export function ImpactSection() {
  const stats = usePublicStats();

  const figures: { icon: LucideIcon; label: string; value?: number }[] = [
    {
      icon: Bell,
      label: "Urgences en cours",
      value: stats.data?.activeEmergencies,
    },
    {
      icon: CalendarHeart,
      label: "Campagnes actives",
      value: stats.data?.activeCampaigns,
    },
    {
      icon: Droplet,
      label: "Dons enregistrés",
      value: stats.data?.donationsRecorded,
    },
    {
      icon: MapPin,
      label: "Villes couvertes",
      value: stats.data?.citiesCovered,
    },
  ];

  return (
    <section
      id={homeSectionIds.impact}
      className="bg-secondary/[0.04] border-y py-24 dark:bg-black/20"
    >
      <Container className="grid items-center gap-14 lg:grid-cols-2">
        <div className="flex flex-col gap-8">
          <SectionHeading
            eyebrow="Sur le terrain"
            title="Un geste simple, un impact mesurable"
            description="Derrière chaque alerte, il y a des soignants, des donneurs et des familles. HEMORA réduit le temps entre le besoin et le don."
          />
          <ul className="flex flex-col gap-4">
            {impactPoints.map((point, index) => (
              <Reveal as="li" key={point} delay={index * 90} direction="left">
                <span className="flex items-start gap-3">
                  <span className="bg-primary mt-2 size-2 shrink-0 rounded-full" />
                  <span className="text-pretty">{point}</span>
                </span>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {figures.map((figure, index) => (
            <Reveal key={figure.label} delay={index * 80} direction="scale">
              <div className="bg-card flex h-full flex-col gap-3 rounded-md border p-6">
                <figure.icon className="text-primary size-5" />
                {stats.isPending || stats.isError ? (
                  <Skeleton className="h-9 w-16" />
                ) : (
                  <span className="font-display text-3xl font-extrabold tracking-tight tabular-nums">
                    {(figure.value ?? 0).toLocaleString("fr-FR")}
                  </span>
                )}
                <span className="text-muted-foreground text-sm">
                  {figure.label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
