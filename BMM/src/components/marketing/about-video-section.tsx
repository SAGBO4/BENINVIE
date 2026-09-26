import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { aboutVideos } from "@/config/about";

/**
 * Vidéos de présentation.
 *
 * La section disparaît entièrement tant qu'aucune vidéo n'est déclarée: un
 * lecteur vide ou une vignette « bientôt disponible » donnerait l'impression
 * d'une page inachevée plutôt que d'une page qui n'a pas encore ce contenu.
 */
export function AboutVideoSection() {
  if (aboutVideos.length === 0) return null;

  return (
    <section className="border-t py-24">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow="En images"
          title="La plateforme en mouvement"
          description="Le parcours d'un donneur et celui d'une structure, filmés de bout en bout."
        />

        <div className="grid gap-8 lg:grid-cols-2">
          {aboutVideos.map((video, index) => (
            <Reveal key={video.src} delay={index * 90} direction="up">
              <figure className="flex h-full flex-col gap-3">
                <div className="bg-muted overflow-hidden rounded-md border shadow-lg">
                  <video
                    controls
                    preload="metadata"
                    poster={video.poster}
                    className="aspect-video w-full"
                  >
                    <source src={video.src} />
                    <track
                      kind="captions"
                      src={video.captions}
                      srcLang={video.captionsLang ?? "fr"}
                      label="Français"
                      default
                    />
                    Votre navigateur ne sait pas lire cette vidéo. Le fichier
                    reste téléchargeable depuis <a href={video.src}>ce lien</a>.
                  </video>
                </div>
                <figcaption className="space-y-1">
                  <p className="font-display font-bold tracking-tight">
                    {video.title}
                  </p>
                  {video.description ? (
                    <p className="text-muted-foreground text-sm text-pretty">
                      {video.description}
                    </p>
                  ) : null}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
