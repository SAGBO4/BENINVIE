"use client";

import {
  BadgeCheck,
  Bitcoin,
  CalendarClock,
  CheckCircle2,
  Droplet,
  Gift,
  History,
  KeyRound,
  LogIn,
  MapPin,
  ScanLine,
  Users,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { BalanceCard } from "@/components/donor/balance-card";
import { DonorCardSection } from "@/components/donor/donor-card-section";
import { NotificationCard } from "@/components/donor/notification-card";
import { OfflineIdentityCard } from "@/components/donor/offline-identity-card";
import { QrBadge } from "@/components/donor/qr-badge";
import { ReferralCard } from "@/components/donor/referral-card";
import { RewardChannelCard } from "@/components/donor/reward-channel-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneField } from "@/components/ui/phone-field";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import {
  useDonorActivities,
  useDonorProfile,
  useDonorRewardsList,
  useUpdateDonorProfile,
} from "@/lib/api/hooks";
import type { RewardLog } from "@/lib/api/resources";
import {
  MIN_DAYS_BETWEEN_DONATIONS,
  activityLabel,
  summarizeDonations,
} from "@/lib/donor/history";
import { publicUrl } from "@/lib/url";
import { cn } from "@/lib/utils";

/** Tronque une longue chaîne au milieu (adresse, hash) pour l'affichage. */
function truncateMiddle(value: string, head = 10, tail = 6) {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const rewardStatus: Record<
  string,
  { label: string; variant: "success" | "warning" | "danger" }
> = {
  completed: { label: "Envoyée", variant: "success" },
  pending: { label: "En attente", variant: "warning" },
  failed: { label: "Échouée", variant: "danger" },
};

function rewardMeta(log: RewardLog) {
  return (
    rewardStatus[log.status] ?? {
      label: log.status,
      variant: "warning" as const,
    }
  );
}

export function DonorSpace() {
  const profile = useDonorProfile();
  const activities = useDonorActivities();
  const rewards = useDonorRewardsList(profile.data?.id);
  const update = useUpdateDonorProfile();

  const [availableOverride, setAvailableOverride] = useState<boolean | null>(
    null,
  );
  const [saved, setSaved] = useState(false);

  if (profile.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const donor = profile.data;

  if (profile.isError || !donor) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <LogIn className="text-muted-foreground size-10" />
          <div className="space-y-1">
            <h1 className="text-lg font-semibold">Connectez-vous</h1>
            <p className="text-muted-foreground text-sm">
              Accédez à votre espace donneur pour suivre vos dons et vos
              récompenses.
            </p>
          </div>
          <Button asChild>
            <Link href="/connexion-donneur">Se connecter</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const available = availableOverride ?? donor.available;
  const history = summarizeDonations(activities.data ?? []);
  const rewardTotal = (rewards.data ?? [])
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + r.satsAmount, 0);

  async function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!donor) return;
    const form = new FormData(event.currentTarget);
    await update
      .mutateAsync({
        id: donor.id,
        phoneNumber: String(form.get("phone")),
        email: String(form.get("email")),
        city: String(form.get("city")),
        available,
      })
      .catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6">
      {/* En-tête profil */}
      <Card className="overflow-hidden">
        <div className="from-primary/15 flex flex-col gap-4 bg-gradient-to-br to-transparent p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              initials={`${donor.firstName[0]}${donor.lastName[0]}`}
              className="size-14 text-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold tracking-tight">
                  {donor.firstName} {donor.lastName}
                </h1>
                {donor.validated ? (
                  <BadgeCheck
                    className="text-primary size-5"
                    aria-label="Donneur validé par une structure"
                  />
                ) : null}
              </div>
              <p className="text-muted-foreground flex items-center gap-1 text-sm">
                <MapPin className="size-3.5" />
                {donor.city}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-primary font-display text-4xl font-extrabold">
              {donor.bloodType}
            </span>
            <p className="text-muted-foreground text-xs">Groupe sanguin</p>
          </div>
        </div>

        <CardContent className="flex flex-wrap items-center gap-2 p-6 pt-4">
          {activities.isPending ? (
            <Skeleton className="h-7 w-40 rounded-full" />
          ) : history.eligible ? (
            <Badge variant="success">Éligible au don</Badge>
          ) : (
            <Badge variant="warning">
              Prochain don possible le{" "}
              {dateFmt.format(history.nextEligibleAt as Date)}
            </Badge>
          )}
          {donor.validated ? null : (
            <Badge variant="neutral">
              En attente de validation par une structure
            </Badge>
          )}
          <Button asChild variant="outline" size="sm" className="ml-auto">
            <Link href={`/verify/${donor.id}`}>
              <ScanLine className="size-4" />
              Ouvrir ma preuve
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Chiffres réels, aucun n'est estimé */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Droplet}
          label="Dons enregistrés"
          value={activities.isPending ? null : String(history.donationCount)}
        />
        <StatCard
          icon={Zap}
          label="Sats reçus"
          value={rewards.isPending ? null : rewardTotal.toLocaleString("fr-FR")}
        />
        <StatCard
          icon={CalendarClock}
          label="Dernier don"
          value={
            activities.isPending
              ? null
              : history.lastDonationAt
                ? dateFmt.format(history.lastDonationAt)
                : "Aucun"
          }
        />
      </div>

      <div className="gap-6 *:mb-6 *:break-inside-avoid xl:columns-2">
        {/* Preuves à faire scanner */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Ma carte de donneur</CardTitle>
            <ScanLine className="text-primary size-5" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-muted-foreground mb-4 text-sm">
              Faites scanner ces QR codes en centre de don pour prouver votre
              identité. Vos informations sensibles ne sont jamais partagées.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <QrBadge
                value={publicUrl(`/verify/${donor.id}`)}
                label="Ma preuve de donneur"
                caption={truncateMiddle(donor.id, 8, 6)}
              />
              <QrBadge
                value={donor.bitcoinAddress}
                label="Mon identifiant de récompense"
                caption={truncateMiddle(donor.bitcoinAddress)}
                copyable
              />
            </div>
            <p className="text-muted-foreground mt-4 flex items-center gap-1.5 text-xs">
              <KeyRound className="size-3.5" />
              Gardez la clé téléchargée à votre inscription: elle prouve que ce
              profil est le vôtre. Vous vous connectez avec votre email et votre
              mot de passe.
            </p>
          </CardContent>
        </Card>

        {/* Informations modifiables */}
        <Card>
          <CardHeader>
            <CardTitle>Mes informations</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSave} className="space-y-5">
              {saved ? (
                <p
                  role="status"
                  className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400"
                >
                  <CheckCircle2 className="size-4" />
                  Informations mises à jour.
                </p>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <PhoneField
                    id="phone"
                    name="phone"
                    defaultValue={donor.phoneNumber}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={donor.email}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" name="city" defaultValue={donor.city} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Disponible pour un don</p>
                  <p className="text-muted-foreground text-xs">
                    Vous ne serez alerté qu'en cas de besoin compatible proche.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={available}
                  aria-label="Disponible pour un don"
                  onClick={() => setAvailableOverride(!available)}
                  className={cn(
                    "focus-visible:ring-ring focus-visible:ring-offset-background relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                    available ? "bg-primary" : "bg-input",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block size-5 transform rounded-full bg-white transition-transform",
                      available ? "translate-x-5" : "translate-x-0.5",
                    )}
                  />
                </button>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={update.isPending}>
                  {update.isPending ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Historique réel, alimenté par les structures */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Mon historique</CardTitle>
            <History className="text-muted-foreground size-5" />
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {activities.isPending ? (
              <SkeletonText lines={3} />
            ) : activities.isError ? (
              <ErrorState
                error={activities.error}
                onRetry={() => void activities.refetch()}
              />
            ) : (activities.data ?? []).length === 0 ? (
              <EmptyState
                icon={Droplet}
                title="Aucune activité pour l'instant"
                description="Vos dons apparaîtront ici dès qu'un centre de collecte les aura enregistrés."
              />
            ) : (
              (activities.data ?? []).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                      {entry.activityType === "referral" ? (
                        <Users className="size-4" />
                      ) : (
                        <Droplet className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {activityLabel(entry.activityType)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {dateFmt.format(new Date(entry.createdAt))}
                        {entry.description ? ` · ${entry.description}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <p className="text-muted-foreground text-xs">
              Un nouveau don de sang total est possible{" "}
              {MIN_DAYS_BETWEEN_DONATIONS} jours après le précédent. Le centre
              de collecte reste seul juge de votre éligibilité le jour du don.
            </p>
          </CardContent>
        </Card>

        <BalanceCard
          balanceSats={donor.balanceSats ?? 0}
          defaultPhone={donor.phoneNumber}
        />

        <DonorCardSection
          donor={{
            id: donor.id,
            firstName: donor.firstName,
            lastName: donor.lastName,
            bloodType: donor.bloodType,
            city: donor.city,
          }}
        />

        <NotificationCard />

        <ReferralCard donorId={donor.id} />

        <OfflineIdentityCard donorId={donor.id} bloodType={donor.bloodType} />

        <RewardChannelCard
          donorId={donor.id}
          defaultPhone={donor.phoneNumber}
        />

        {/* Récompenses */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Mes récompenses</CardTitle>
            <Gift className="size-5 text-amber-500" />
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              <Bitcoin className="size-8 shrink-0 text-amber-500" />
              <div>
                <p className="font-display text-2xl font-bold tracking-tight">
                  {rewardTotal.toLocaleString("fr-FR")}{" "}
                  <span className="text-base font-medium">sats</span>
                </p>
                <p className="text-muted-foreground text-xs">
                  Reçus grâce à vos dons
                </p>
              </div>
            </div>

            {rewards.isPending ? (
              <SkeletonText lines={2} />
            ) : rewards.isError ? (
              <ErrorState
                error={rewards.error}
                onRetry={() => void rewards.refetch()}
              />
            ) : (rewards.data ?? []).length === 0 ? (
              <EmptyState
                icon={Gift}
                title="Aucune récompense pour l'instant"
                description="Une récompense est versée après chaque don confirmé par une structure."
              />
            ) : (
              (rewards.data ?? []).map((log) => {
                const meta = rewardMeta(log);
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="size-4 shrink-0 text-amber-500" />
                      <div>
                        <p className="text-sm font-medium">Récompense de don</p>
                        <p className="text-muted-foreground text-xs">
                          {dateFmt.format(new Date(log.createdAt))}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        +{log.satsAmount.toLocaleString("fr-FR")} sats
                      </p>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  /** `null` pendant le chargement: on ne montre jamais un zéro provisoire. */
  value: string | null;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{label}</p>
          <Icon className="text-primary size-5" />
        </div>
        {value === null ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className="font-display text-2xl font-bold tracking-tight">
            {value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
