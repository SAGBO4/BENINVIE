"use client";

import {
  BadgeCheck,
  Building2,
  Check,
  ExternalLink,
  FileText,
  MapPin,
  X,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useOrgDocuments,
  useRejectOrganization,
  useVerifyOrganization,
} from "@/lib/api/hooks";
import {
  ORG_DOCUMENT_LABELS,
  type Organization,
  type OrganizationType,
} from "@/lib/api/resources";

const orgTypeLabel: Record<OrganizationType, string> = {
  hospital: "Hôpital",
  ngo: "ONG",
  blood_center: "Centre de collecte",
};

/**
 * Ligne d'organisation dans la file de vérification: justificatifs déposés,
 * validation ou refus motivé.
 */
export function OrgReviewRow({ org }: { org: Organization }) {
  const [showDocs, setShowDocs] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const verifyOrg = useVerifyOrganization();
  const rejectOrg = useRejectOrganization();
  const documents = useOrgDocuments(showDocs ? org.id : undefined);

  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-secondary flex size-10 shrink-0 items-center justify-center rounded-full">
            <Building2 className="size-5" />
          </span>
          <div>
            <p className="font-medium">{org.name}</p>
            <p className="text-muted-foreground flex items-center gap-1 text-sm">
              <MapPin className="size-3.5" />
              {org.city} · {orgTypeLabel[org.type]}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDocs((v) => !v)}
          >
            <FileText className="size-4" />
            {showDocs ? "Masquer" : "Documents"}
          </Button>
          {org.verified ? (
            <Badge variant="success">
              <BadgeCheck className="size-3.5" />
              Vérifiée
            </Badge>
          ) : (
            <>
              <Badge variant="warning">En attente</Badge>
              <Button
                size="sm"
                onClick={() => verifyOrg.mutate(org.id)}
                disabled={verifyOrg.isPending}
              >
                <Check className="size-4" />
                Vérifier
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRejecting((v) => !v)}
              >
                <X className="size-4" />
                Rejeter
              </Button>
            </>
          )}
        </div>
      </div>

      {org.rejectionReason ? (
        <p className="text-destructive mt-3 text-xs">
          Rejetée - motif : {org.rejectionReason}
        </p>
      ) : null}

      {rejecting ? (
        <div className="mt-3 space-y-2 rounded-md border p-3">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motif du rejet (documents illisibles, non conformes…)"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setRejecting(false);
                setReason("");
              }}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              disabled={!reason.trim() || rejectOrg.isPending}
              onClick={() =>
                rejectOrg
                  .mutateAsync({ id: org.id, reason: reason.trim() })
                  .then(() => {
                    setRejecting(false);
                    setReason("");
                  })
              }
            >
              Confirmer le rejet
            </Button>
          </div>
        </div>
      ) : null}

      {showDocs ? (
        <div className="mt-3 space-y-2 border-t pt-3">
          {documents.isLoading ? (
            <p className="text-muted-foreground text-sm">Chargement…</p>
          ) : (documents.data?.length ?? 0) === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aucun justificatif déposé pour l'instant.
            </p>
          ) : (
            documents.data?.map((doc) => (
              <a
                key={doc.docType}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:bg-secondary flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="text-primary size-4" />
                  {ORG_DOCUMENT_LABELS[doc.docType]}
                </span>
                <ExternalLink className="text-muted-foreground size-4" />
              </a>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
