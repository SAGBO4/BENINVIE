"use client";

import { Building2 } from "lucide-react";

import { OrgReviewRow } from "@/components/admin/org-review-row";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryBoundary } from "@/components/ui/query-boundary";
import { SkeletonText } from "@/components/ui/skeleton";
import { useOrganizations } from "@/lib/api/hooks";

/** Liste des organisations à valider et gérer (super-administrateur). */
export function OrganizationsReview() {
  const orgs = useOrganizations();
  const pending = orgs.data?.filter((o) => !o.verified) ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Organisations</CardTitle>
        <div className="flex items-center gap-2">
          {pending.length > 0 ? (
            <Badge variant="warning">{pending.length} à vérifier</Badge>
          ) : null}
          <Building2 className="text-primary size-5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <QueryBoundary
          query={orgs}
          loading={<SkeletonText lines={4} />}
          errorTitle="Organisations indisponibles"
          isEmpty={(rows) => rows.length === 0}
          empty={{
            icon: Building2,
            title: "Aucune organisation",
            description:
              "Les structures qui créent un compte apparaissent ici en attente de vérification.",
          }}
        >
          {(rows) => rows.map((org) => <OrgReviewRow key={org.id} org={org} />)}
        </QueryBoundary>
      </CardContent>
    </Card>
  );
}
