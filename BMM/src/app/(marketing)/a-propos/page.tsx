import { ArrowRight, Heart, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { AboutVideoSection } from "@/components/marketing/about-video-section";
import { SectionHeading } from "@/components/marketing/section-heading";
import { BrandMark } from "@/components/shared/logo";
import { Reveal } from "@/components/shared/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { aboutContent, aboutPillars } from "@/config/about";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "À propos",
  description: `${aboutContent.mission.body} ${siteConfig.name} est construit par l'équipe ${aboutContent.team.name}.`,
};

const { team, mission, vision } = aboutContent;

export default function AboutPage() {
  return (
    <>
      {/* Mission: le texte de la présentation, sans habillage de slide. */}
      <section className="relative overflow-hidden border-b">
        <Container className="flex flex-col items-center gap-6 py-20 text-center sm:py-28">
          <BrandMark className="animate-rise-in size-14" />
          <Badge variant="primary" className="animate-rise-in">
            {mission.eyebrow}
          </Badge>
          <h1
            className="animate-rise-in font-display max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            {mission.title}
          </h1>
          <p
            className="animate-rise-in text-muted-foreground max-w-2xl text-lg text-pretty"
            style={{ animationDelay: "160ms" }}
          >
            {mission.body}
          </p>
        </Container>
      </section>

      {/* Vision */}
      <section className="border-b py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <SectionHeading
              eyebrow={vision.eyebrow}
              title={vision.title}
              description={vision.body}
            />
            <Reveal delay={200}>
              <Button asChild variant="secondary" className="group w-fit">
                <Link href="/donate">
                  Rejoindre le réseau
                  <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </Reveal>
          </div>

          <Reveal direction="scale">
            <Image
              src={vision.image.src}
              alt={vision.image.alt}
              width={vision.image.width}
              height={vision.image.height}
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="h-auto w-full rounded-md border"
            />
          </Reveal>
        </Container>
      </section>

      {/* Ce que la plateforme fait réellement */}
      <section className="bg-secondary/[0.04] border-b py-24 dark:bg-black/20">
        <Container className="flex flex-col gap-12">
          <SectionHeading
            eyebrow="Ce que nous faisons"
            title="Quatre engagements, tenus au quotidien"
            description="Ce que la plateforme apporte concrètement aux donneurs et aux structures de santé."
          />
          {/* Une liste, pas une séquence: ces quatre promesses n'ont pas
              d'ordre, les numéroter aurait suggéré des étapes. */}
          <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {aboutPillars.map((pillar, index) => (
              <Reveal
                as="li"
                key={pillar.title}
                delay={index * 70}
                direction="up"
              >
                <div className="border-border space-y-2 border-t pt-5">
                  <h3 className="font-display text-lg font-bold tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-muted-foreground text-sm text-pretty">
                    {pillar.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* L'équipe */}
      <section id="equipe" className="py-24">
        <Container className="flex flex-col gap-12">
          <SectionHeading
            eyebrow={team.eyebrow}
            title={team.title}
            align="center"
          />

          <Reveal direction="scale">
            <figure className="flex flex-col items-center gap-8">
              <Image
                src={team.photo.src}
                alt={team.photo.alt}
                width={team.photo.width}
                height={team.photo.height}
                sizes="(min-width: 1024px) 60rem, 95vw"
                priority
                className="h-auto w-full max-w-3xl rounded-md border bg-white"
              />

              <figcaption className="flex flex-col items-center gap-3 text-center">
                <p className="font-display text-2xl font-extrabold tracking-[0.12em] uppercase">
                  Team <span className="text-primary">{team.name}</span>
                </p>
                <span className="text-muted-foreground inline-flex items-center gap-2 text-sm">
                  <Trophy className="size-4" />
                  {team.context}
                </span>
              </figcaption>
            </figure>
          </Reveal>
        </Container>
      </section>

      <AboutVideoSection />

      {/* Appel final */}
      <section className="border-t py-24">
        <Container className="flex flex-col items-center gap-6 text-center">
          <Heart className="text-primary size-8" />
          <h2 className="font-display max-w-2xl text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            Le réseau ne vaut que par ceux qui en font partie
          </h2>
          <p className="text-muted-foreground max-w-xl text-pretty">
            Donneur, hôpital ou centre de collecte: chacun a son espace, et
            chaque don enregistré rend le suivant plus rapide.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/donate">Devenir donneur</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">Inscrire ma structure</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
