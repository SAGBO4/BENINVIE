"use client";

import {
  Check,
  CreditCard,
  IdCard,
  Printer,
  Smartphone,
  X,
} from "lucide-react";
import { useState } from "react";

import { DonorCard } from "@/components/donor/donor-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { QueryBoundary } from "@/components/ui/query-boundary";
import { SkeletonText } from "@/components/ui/skeleton";
import { useCardRequestsList, useDecideCardRequest } from "@/lib/api/hooks";
import type { CardRequestRecord } from "@/lib/api/resources";
import { publicUrl } from "@/lib/url";

const statusBadge: Record<
  CardRequestRecord["status"],
  { variant: "warning" | "success" | "danger"; label: string }
> = {
  requested: { variant: "warning", label: "À valider" },
  approved: { variant: "success", label: "Validée" },
  rejected: { variant: "danger", label: "Refusée" },
};

export function CardRequestsPanel() {
  const requestsQuery = useCardRequestsList();
  const decide = useDecideCardRequest();
  const [printing, setPrinting] = useState<CardRequestRecord | null>(null);

  const pending = (requestsQuery.data ?? []).filter(
    (r) => r.status === "requested",
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Demandes de cartes</CardTitle>
        <div className="flex items-center gap-2">
          {pending.length > 0 ? (
            <Badge variant="warning">{pending.length} à valider</Badge>
          ) : null}
          <IdCard className="text-primary size-5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <QueryBoundary
          query={requestsQuery}
          loading={<SkeletonText lines={4} />}
          isEmpty={(rows) => rows.length === 0}
          empty={{
            icon: IdCard,
            title: "Aucune demande de carte",
            description:
              "Les demandes envoyées par les donneurs depuis leur espace apparaîtront ici.",
          }}
        >
          {(requests) =>
            requests.map((req) => {
              const badge = statusBadge[req.status];
              return (
                <div
                  key={req.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary size-11 shrink-0 overflow-hidden rounded-lg">
                      {req.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={req.photo}
                          alt={req.donorName}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="text-muted-foreground flex size-full items-center justify-center">
                          <IdCard className="size-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {req.donorName || "Donneur"}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        {req.format === "physical" ? (
                          <CreditCard className="size-3.5" />
                        ) : (
                          <Smartphone className="size-3.5" />
                        )}
                        Carte{" "}
                        {req.format === "physical" ? "physique" : "numérique"}
                        {req.bloodType ? ` · ${req.bloodType}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    {req.status === "requested" ? (
                      <>
                        <Button
                          size="sm"
                          disabled={decide.isPending}
                          onClick={() =>
                            decide.mutate({ id: req.id, status: "approved" })
                          }
                        >
                          <Check className="size-4" />
                          Valider
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={decide.isPending}
                          onClick={() =>
                            decide.mutate({ id: req.id, status: "rejected" })
                          }
                        >
                          <X className="size-4" />
                          Refuser
                        </Button>
                      </>
                    ) : null}
                    {req.status === "approved" && req.format === "physical" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPrinting(req)}
                      >
                        <Printer className="size-4" />
                        Imprimer
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })
          }
        </QueryBoundary>
      </CardContent>

      <Dialog
        open={!!printing}
        onClose={() => setPrinting(null)}
        title="Imprimer la carte"
        description="Vérifiez la carte puis lancez l'impression."
      >
        {printing ? (
          <div className="space-y-4">
            <div className="print-area flex justify-center">
              <DonorCard
                name={printing.donorName || "Donneur"}
                bloodType={printing.bloodType ?? undefined}
                donorId={printing.donorId}
                photo={printing.photo ?? undefined}
                verifyUrl={publicUrl(`/verify/${printing.donorId}`)}
              />
            </div>
            <Button className="no-print w-full" onClick={() => window.print()}>
              <Printer className="size-4" />
              Lancer l'impression
            </Button>
          </div>
        ) : null}
      </Dialog>
    </Card>
  );
}
