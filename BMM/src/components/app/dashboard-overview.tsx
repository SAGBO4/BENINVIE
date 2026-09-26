"use client";

import {
  Bell,
  CalendarHeart,
  Droplet,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { FundingAccountCard } from "@/components/app/funding-account-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { useCampaigns, useEmergencies } from "@/lib/api/hooks";
import { useAuth } from "@/providers/auth-provider";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function DashboardOverview() {
  const { user } = useAuth();
  const hospitalId = user?.organizationId ?? undefined;

  const emergencies = useEmergencies(hospitalId);
  const campaigns = useCampaigns(hospitalId);

  const activeEmergencies =
    emergencies.data?.filter((e) => e.status === "active") ?? [];
  const bagsNeeded = activeEmergencies.reduce(
    (sum, e) => sum + e.quantityNeeded,
    0,
  );
  const totalResponses =
    campaigns.data?.reduce((sum, c) => sum + c.responsesCount, 0) ?? 0;

  const metrics = [
    {
      key: "active",
      label: "Urgences actives",
      value: activeEmergencies.length,
      pending: emergencies.isPending,
      icon: Bell,
      /** Une urgence active est le seul chiffre qui appelle une action. */
      highlight: activeEmergencies.length > 0,
    },
    {
      key: "bags",
      label: "Poches recherchées",
      value: bagsNeeded,
      pending: emergencies.isPending,
      icon: Droplet,
      highlight: false,
    },
    {
      key: "campaigns",
      label: "Campagnes",
      value: campaigns.data?.length ?? 0,
      pending: campaigns.isPending,
      icon: CalendarHeart,
      highlight: false,
    },
    {
      key: "responses",
      label: "Réponses reçues",
      value: totalResponses,
      pending: campaigns.isPending,
      icon: Users,
      highlight: false,
    },
  ];

  return (
    <div className="space-y-8">
      <section
        aria-label="Chiffres clés"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map(({ key, ...metric }) => (
          <MetricCard key={key} {...metric} />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Mes urgences</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/alerts">Gérer</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {emergencies.isPending ? (
              <SkeletonText lines={3} />
            ) : emergencies.isError ? (
              <ErrorState
                error={emergencies.error}
                onRetry={() => void emergencies.refetch()}
              />
            ) : (emergencies.data ?? []).length === 0 ? (
              <EmptyState
                icon={Bell}
                title="Aucune urgence en cours"
                description="Déclenchez une alerte pour mobiliser les donneurs compatibles proches."
                action={
                  <Button asChild size="sm">
                    <Link href="/alerts">
                      <Plus className="size-4" />
                      Déclencher une alerte
                    </Link>
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-3">
                {(emergencies.data ?? []).slice(0, 5).map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <Link
                      href={`/alerts/${e.id}`}
                      className="focus-visible:ring-ring flex flex-1 items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <span className="bg-primary/10 text-primary font-display flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                        {e.bloodType}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">
                          {e.quantityNeeded} poche
                          {e.quantityNeeded > 1 ? "s" : ""}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1 text-xs">
                          <MapPin className="size-3" />
                          {e.city} · {dateFmt.format(new Date(e.createdAt))}
                        </span>
                      </span>
                    </Link>
                    <Badge
                      variant={e.status === "active" ? "danger" : "success"}
                    >
                      {e.status === "active" ? "Active" : "Résolue"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Mes campagnes</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/campaigns">Gérer</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {campaigns.isPending ? (
              <SkeletonText lines={3} />
            ) : campaigns.isError ? (
              <ErrorState
                error={campaigns.error}
                onRetry={() => void campaigns.refetch()}
              />
            ) : (campaigns.data ?? []).length === 0 ? (
              <EmptyState
                icon={CalendarHeart}
                title="Aucune campagne"
                description="Une campagne prévient par email les donneurs d'une zone, sur une période donnée."
                action={
                  <Button asChild size="sm">
                    <Link href="/campaigns">
                      <Plus className="size-4" />
                      Créer une campagne
                    </Link>
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-3">
                {(campaigns.data ?? []).slice(0, 5).map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{c.title}</p>
                      <p className="text-muted-foreground flex items-center gap-1 text-xs">
                        <MapPin className="size-3" />
                        {c.city} · {c.responsesCount} réponse
                        {c.responsesCount > 1 ? "s" : ""}
                      </p>
                    </div>
                    <Badge
                      variant={c.type === "targeted" ? "primary" : "neutral"}
                    >
                      {c.type === "targeted" ? "Ciblée" : "Générale"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <FundingAccountCard />
    </div>
  );
}

function MetricCard({
  label,
  value,
  pending,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: number;
  pending: boolean;
  icon: LucideIcon;
  highlight: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary/40" : undefined}>
      <CardContent className="space-y-2 p-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{label}</p>
          <Icon
            className={
              highlight ? "text-primary size-5" : "text-muted-foreground size-5"
            }
          />
        </div>
        {pending ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <span className="font-display block text-3xl font-bold tracking-tight tabular-nums">
            {value.toLocaleString("fr-FR")}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
