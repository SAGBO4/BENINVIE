import { RefreshCw, WifiOff } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Hors connexion",
  description: "Cette page s'affiche lorsque l'appareil n'a plus de réseau.",
};

/**
 * Page servie par le service worker quand une navigation échoue faute de
 * réseau. Elle rappelle ce qui reste possible sans connexion, plutôt que de
 * se contenter d'annoncer la panne.
 */
export default function OfflinePage() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <span className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-full">
        <WifiOff className="size-6" />
      </span>

      <div className="max-w-md space-y-3">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">
          Vous êtes hors connexion
        </h1>
        <p className="text-muted-foreground text-pretty">
          Cette page n&apos;a pas pu être chargée. Dès que le réseau revient,
          rechargez pour retrouver l&apos;application.
        </p>
      </div>

      <div className="border-border w-full max-w-md rounded-md border border-dashed p-5 text-left">
        <p className="mb-2 text-sm font-semibold">Sans réseau, vous pouvez</p>
        <ul className="text-muted-foreground space-y-1.5 text-sm">
          <li>
            présenter votre carte de donneur, elle reste lisible sur
            l&apos;appareil;
          </li>
          <li>
            faire vérifier votre attestation par un centre de collecte, la
            vérification ne demande aucune connexion.
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">
            <RefreshCw className="size-4" />
            Réessayer
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/verify">Vérifier une carte hors connexion</Link>
        </Button>
      </div>
    </Container>
  );
}
