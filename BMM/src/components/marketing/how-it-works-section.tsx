import { Container } from "@/components/layout/container";
import { steps } from "@/components/marketing/content";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { homeSectionIds } from "@/config/navigation";

/**
 * Les quatre étapes du parcours donneur, sur toute la largeur. La disposition
 * en colonnes rend la progression lisible d'un coup d'œil, ce que la liste
 * verticale coincée à côté d'une image ne permettait pas.
 */
export function HowItWorksSection() {
  return (
    <section
      id={homeSectionIds.fonctionnement}
      className="bg-secondary/[0.04] border-y py-24 dark:bg-black/20"
    >
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Comment ça marche"
          title="Quatre étapes, de l'inscription à la récompense"
          description="Le parcours complet d'un donneur, sans jargon et sans étape cachée."
        />

        <ol className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal as="li" key={step.title} delay={index * 90} direction="up">
              <div className="relative flex h-full flex-col gap-3">
                {/* Trait de liaison entre les étapes, masqué en fin de ligne
                    et sur les dispositions étroites où il n'a plus de sens. */}
                {index < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="from-primary/40 absolute top-5 left-12 hidden h-px w-[calc(100%-2rem)] bg-linear-to-r to-transparent lg:block"
                  />
                )}
                <span className="bg-primary text-primary-foreground shadow-primary/25 font-display relative flex size-10 items-center justify-center rounded-full text-sm font-bold shadow-md">
                  {index + 1}
                </span>
                <h3 className="font-display text-lg font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm text-pretty">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
