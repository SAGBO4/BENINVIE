import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

/**
 * Ouverture de section: étiquette réglée, titre, chapeau.
 *
 * L'étiquette était une pastille arrondie, identique sur six sections
 * d'affilée. Un filet et des capitales espacées situent la section sans
 * répéter la même forme d'un bout à l'autre de la page.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
      )}
    >
      {eyebrow && (
        <Reveal>
          <p
            className={cn(
              "text-primary flex items-center gap-3 text-xs font-semibold tracking-[0.18em] uppercase",
              align === "center" && "justify-center",
            )}
          >
            <span className="bg-primary h-px w-8" aria-hidden="true" />
            {eyebrow}
          </p>
        </Reveal>
      )}
      <Reveal delay={60}>
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={120}>
          <p className="text-muted-foreground text-lg text-pretty">
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
