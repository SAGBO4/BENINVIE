"use client";

import {
  ArrowRight,
  Bell,
  Building2,
  CalendarHeart,
  Droplet,
  Heart,
  IdCard,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/states";
import {
  useCampaigns,
  useCardRequestsList,
  useDonationsHistory,
  useDonors,
  useEmergencies,
  useOrganizations,
} from "@/lib/api/hooks";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

type Tab = "overview" | "organisations" | "cartes" | "dons" | "contenu";

/**
 * Ce qui demande une décision, d'abord; les volumes ensuite.
 *
 * Le tableau précédent alignait cinq compteurs de même poids. Un
 * administrateur ouvre cet écran pour savoir ce qui l'attend: les files
 * d'attente passent donc devant, avec le lien qui y mène.
 */
export function AdminOverview({
  onNavigate,
}: {
  onNavigate: (tab: Tab) => void;
}) {
  const orgs = useOrganizations();
  const donors = useDonors();
  const emergencies = useEmergencies();
  const campaigns = useCampaigns();
  const donations = useDonationsHistory();
  const cardRequests = useCardRequestsList();

  const pendingOrgs = orgs.data?.filter((o) => !o.verified) ?? [];
  const pendingCards =
    cardRequests.data?.filter((r) => r.status === "requested") ?? [];
  const activeEmergencies =
    emergencies.data?.filter((e) => e.status === "active") ?? [];

  const queues = [
    {
      key: "orgs" as const,
      label: "Structures à vérifier",
      count: pendingOrgs.length,
      pending: orgs.isPending,
      icon: Building2,
      hint: "Une structure non vérifiée ne peut pas lancer d'alerte.",
      tab: "organisations" as Tab,
    },
    {
      key: "cards" as const,
      label: "Cartes à valider",
      count: pendingCards.length,
      pending: cardRequests.isPending,
      icon: IdCard,
      hint: "Le donneur attend sa carte pour la présenter en centre.",
      tab: "cartes" as Tab,
    },
  ];

  const volumes = [
    {
      label: "Urgences actives",
      value: activeEmergencies.length,
      pending: emergencies.isPending,
      icon: Bell,
    },
    {
      label: "Donneurs validés",
      value: donors.data?.length ?? 0,
      pending: donors.isPending,
      icon: Droplet,
    },
    {
      label: "Campagnes",
      value: campaigns.data?.length ?? 0,
      pending: campaigns.isPending,
      icon: CalendarHeart,
    },
    {
      label: "Structures",
      value: orgs.data?.length ?? 0,
      pending: orgs.isPending,
      icon: Building2,
    },
    {
      label: "Dons reçus",
      value: donations.data?.count ?? 0,
      pending: donations.isPending,
      icon: Heart,
    },
  ];

  return (
    <div className="space-y-10">
      {/* Files d'attente */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold tracking-tight">
          Ce qui attend une décision
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {queues.map(({ key, ...queue }) => (
            <QueueCard key={key} {...queue} onOpen={onNavigate} />
          ))}
        </div>
      </section>

      {/* Volumes */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold tracking-tight">
          Le réseau en chiffres
        </h2>
        <dl className="border-border bg-card grid grid-cols-2 gap-px overflow-hidden rounded-xl border md:grid-cols-5">
          {volumes.map((v) => (
            <div key={v.label} className="bg-card p-5">
              <dt className="text-muted-foreground flex items-center gap-2 text-sm">
                <v.icon className="size-4" />
                {v.label}
              </dt>
              <dd className="mt-2">
                {v.pending ? (
                  <Skeleton className="h-8 w-14" />
                ) : (
                  <span className="font-display text-2xl font-bold tabular-nums">
                    {v.value.toLocaleString("fr-FR")}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Urgences en cours sur tout le réseau */}
      <section>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Urgences en cours sur le réseau</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/alerts">Tout voir</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {emergencies.isPending ? (
              <SkeletonText lines={3} />
            ) : activeEmergencies.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="Aucune urgence en cours"
                description="Les alertes déclenchées par les structures du réseau apparaissent ici."
              />
            ) : (
              <ul className="space-y-3">
                {activeEmergencies.slice(0, 6).map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-primary/10 text-primary font-display flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                        {e.bloodType}
                      </span>
                      <div>
                        <p className="text-sm font-medium">
                          {e.quantityNeeded} poche
                          {e.quantityNeeded > 1 ? "s" : ""} · {e.city}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {dateFmt.format(new Date(e.createdAt))}
                        </p>
                      </div>
                    </div>
                    <Badge variant="danger">Active</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function QueueCard({
  label,
  count,
  pending,
  icon: Icon,
  hint,
  tab,
  onOpen,
}: {
  label: string;
  count: number;
  pending: boolean;
  icon: LucideIcon;
  hint: string;
  tab: Tab;
  onOpen: (tab: Tab) => void;
}) {
  const waiting = count > 0;

  return (
    <Card className={waiting ? "border-primary/40" : undefined}>
      <CardContent className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Icon className="size-4" />
              {label}
            </p>
            {pending ? (
              <Skeleton className="mt-2 h-9 w-12" />
            ) : (
              <p
                className={
                  waiting
                    ? "text-primary font-display mt-1 text-3xl font-bold tabular-nums"
                    : "font-display text-muted-foreground mt-1 text-3xl font-bold tabular-nums"
                }
              >
                {count}
              </p>
            )}
          </div>
          {waiting ? <Badge variant="warning">À traiter</Badge> : null}
        </div>

        <p className="text-muted-foreground text-sm text-pretty">
          {waiting ? hint : "Rien en attente."}
        </p>

        <Button
          variant={waiting ? "primary" : "secondary"}
          size="sm"
          className="group mt-auto w-fit"
          onClick={() => onOpen(tab)}
        >
          Ouvrir
          <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
