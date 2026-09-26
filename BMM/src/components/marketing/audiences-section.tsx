import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { audiences } from "@/components/marketing/content";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { homeSectionIds } from "@/config/navigation";

/**
 * Trois publics, trois parcours. Cette section remplace les témoignages:
 * elle décrit ce que la plateforme fait réellement pour chacun, au lieu de
 * citations attribuées à des personnes qui n'existent pas.
 */
export function AudiencesSection() {
  return (
    <section id={homeSectionIds.publics} className="border-t py-24">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Pour qui"
          title="Un réseau, trois manières d'y participer"
          description="Donneurs, structures de santé et centres de collecte utilisent la même plateforme, chacun avec son espace."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {audiences.map((audience, index) => (
            <Reveal key={audience.eyebrow} delay={index * 90} direction="up">
              <Card className="hover:border-primary/40 flex h-full flex-col transition-colors duration-300">
                <CardContent className="flex h-full flex-col gap-5 p-6">
                  <span className="from-primary/15 to-primary/5 text-primary ring-primary/10 flex size-12 items-center justify-center rounded-xl bg-linear-to-br ring-1">
                    <audience.icon className="size-5" />
                  </span>

                  <div className="space-y-1.5">
                    <span className="text-primary text-xs font-semibold tracking-wider uppercase">
                      {audience.eyebrow}
                    </span>
                    <h3 className="font-display text-xl font-bold tracking-tight">
                      {audience.title}
                    </h3>
                  </div>

                  <ul className="flex flex-1 flex-col gap-3">
                    {audience.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5">
                        <Check className="text-primary mt-0.5 size-4 shrink-0" />
                        <span className="text-muted-foreground text-sm text-pretty">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button asChild variant="secondary" className="group w-full">
                    <Link href={audience.href}>
                      {audience.cta}
                      <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
