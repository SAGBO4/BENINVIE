import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { Container } from "@/components/layout/container";
import { QrBadge } from "@/components/donor/qr-badge";
import { OfflineVerifyTool } from "@/components/verify/offline-verify-tool";
import { VerifyPanel } from "@/components/verify/verify-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { publicUrl } from "@/lib/url";

export const metadata: Metadata = {
  title: "Vérifier une carte de donneur",
  description:
    "Vérifiez qu'une carte de donneur est authentique et n'a pas été modifiée.",
};

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Container className="py-16 sm:py-24">
      <div className="space-y-10">
        <div className="animate-rise-in max-w-2xl space-y-3">
          <Badge variant="primary">
            <ShieldCheck className="size-3.5" />
            Carte vérifiée
          </Badge>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            Carte de donneur
          </h1>
          <p className="text-muted-foreground text-sm">
            Vérifiez en un instant que cette carte est authentique et n'a pas
            été modifiée.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <VerifyPanel id={id} />
            <OfflineVerifyTool defaultMessage={id} />
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-full border">
                  <Image
                    src="/bitcoin-verified.png"
                    alt="Badge Vérifié par Bitcoin"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Carte certifiée</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Cette carte de donneur est authentique et sa validité peut
                    être vérifiée par n'importe qui, à tout moment.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="space-y-6 p-6">
              {/* QR rendu localement: envoyer l'identifiant du donneur à un
                  générateur tiers le ferait fuiter et rendrait la page
                  inutilisable hors connexion. */}
              <QrBadge
                value={publicUrl(`/verify/${id}`)}
                label="Carte de ce donneur"
                caption={id}
                size={192}
                className="bg-muted/30 border-dashed"
              />

              <div className="space-y-4 text-sm">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold">Comment ça marche</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Les centres de don et hôpitaux scannent ce QR code pour
                    confirmer votre groupe sanguin et que votre carte est bien
                    la vôtre, sans jamais voir vos informations privées.
                  </p>
                </div>

                <div className="space-y-1 border-t pt-4">
                  <h3 className="text-base font-semibold">
                    Une carte inviolable
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Chaque don est enregistré de façon permanente. Personne ne
                    peut modifier votre carte ou vos données après coup :
                    l'historique reste fiable et vérifiable dans le temps.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
