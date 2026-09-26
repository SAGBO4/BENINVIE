import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { VerifyEntry } from "@/components/verify/verify-entry";
import { OfflineVerifyTool } from "@/components/verify/offline-verify-tool";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Vérifier une carte de donneur",
  description:
    "Scannez ou saisissez l'identifiant d'une carte HEMORA pour confirmer qu'elle est authentique, en ligne ou hors connexion.",
};

/**
 * Point d'entrée public de la vérification. Sans cette page, le lien
 * « Vérifier une carte » n'avait aucune destination: seule l'URL d'un
 * donneur précis existait, ce qu'un agent de collecte ne connaît pas
 * d'avance.
 */
export default function VerifyIndexPage() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="space-y-10">
        <div className="animate-rise-in max-w-2xl space-y-3">
          <Badge variant="primary">
            <ShieldCheck className="size-3.5" />
            Vérification
          </Badge>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            Vérifier une carte de donneur
          </h1>
          <p className="text-muted-foreground text-pretty">
            Scannez le QR code de la carte, ou saisissez son identifiant. La
            vérification hors connexion, plus bas, fonctionne sans réseau.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-2">
          <VerifyEntry />

          <div className="space-y-6">
            <OfflineVerifyTool />
            <Card>
              <CardContent className="space-y-3 p-6 text-sm">
                <h2 className="text-base font-semibold">
                  Deux façons de vérifier
                </h2>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  <strong className="text-foreground">En ligne:</strong> le scan
                  ouvre la fiche publique du donneur et confirme que son profil
                  n'a pas été modifié depuis son enregistrement.
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  <strong className="text-foreground">Hors connexion:</strong>{" "}
                  l'attestation signée présentée par le donneur est vérifiée
                  entièrement dans ce navigateur, sans aucun appel réseau.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}
