import { HandHeart, Siren, Wrench } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { DonationForm } from "@/components/donate/donation-form";

export const metadata: Metadata = {
  title: "Soutenir la plateforme",
  description:
    "Soutenez le fonctionnement de HEMORA. Pour aider une collecte précise, rendez-vous sur la page des campagnes.",
};

/** Où va l'argent. Trois postes, pas une liste de bonnes intentions. */
const ALLOCATION = [
  {
    icon: Siren,
    title: "Fonds d'urgence",
    text: "Les récompenses versées aux donneurs qui répondent à une alerte vitale, sans attendre le budget de la structure.",
  },
  {
    icon: Wrench,
    title: "Fonctionnement",
    text: "Hébergement, envoi des alertes et maintien du service en état de marche.",
  },
  {
    icon: HandHeart,
    title: "Animation du réseau",
    text: "Accompagnement des structures, cartes de donneurs et présence sur les collectes.",
  },
];

export default function SupportPage() {
  return (
    <>
      {/* Ouverture pleine largeur: le formulaire arrive ensuite, quand on sait
          à quoi sert l'argent. Le sujet est court, il n'appelle pas deux
          colonnes qui se disputent l'attention dès le premier écran. */}
      <section className="border-b">
        <Container className="max-w-3xl py-16 text-center sm:py-20">
          <p className="text-primary animate-rise-in flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.18em] uppercase">
            <span className="bg-primary h-px w-8" aria-hidden="true" />
            Soutien
          </p>
          <h1
            className="animate-rise-in font-display mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl"
            style={{ animationDelay: "60ms" }}
          >
            Financer le réseau, pas une entreprise
          </h1>
          <p
            className="animate-rise-in text-muted-foreground mx-auto mt-5 max-w-xl text-lg text-pretty"
            style={{ animationDelay: "120ms" }}
          >
            HEMORA ne prélève rien sur les dons de sang. Votre soutien couvre le
            fonctionnement du service et alimente les récompenses versées aux
            donneurs qui répondent aux urgences.
          </p>
        </Container>
      </section>

      <Container className="py-14 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-20">
          <div className="stagger space-y-8">
            <h2 className="font-display text-xl font-bold tracking-tight">
              Où va votre don
            </h2>

            <ul className="space-y-7">
              {ALLOCATION.map((item) => (
                <li key={item.title} className="border-border border-t pt-5">
                  <p className="flex items-center gap-2.5 font-semibold">
                    <item.icon className="text-primary size-4 shrink-0" />
                    {item.title}
                  </p>
                  <p className="text-muted-foreground mt-1.5 text-sm text-pretty">
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>

            <p className="text-muted-foreground border-border border-t pt-5 text-sm text-pretty">
              Pour aider une collecte précise plutôt que la plateforme,{" "}
              <Link
                href="/campagnes"
                className="text-primary font-medium underline underline-offset-2"
              >
                choisissez une campagne à venir
              </Link>
              .
            </p>
          </div>

          <div className="animate-rise-in lg:sticky lg:top-24">
            <DonationForm />
          </div>
        </div>
      </Container>
    </>
  );
}
