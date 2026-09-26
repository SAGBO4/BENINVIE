"use client";

import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  CreditCard,
  Droplet,
  MapPin,
  Phone,
  ScanLine,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddDonorActivity,
  useDonor,
  useValidateDonor,
  useVerifyDonor,
} from "@/lib/api/hooks";
import type { ActivityType } from "@/lib/api/resources";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const CARD_LABEL: Record<string, string> = {
  none: "Numérique",
  virtual: "Numérique",
  digital: "Numérique",
  merited: "Physique, accordée",
  pending: "Physique, paiement en attente",
  ordered_paid: "Physique, commandée",
  physical: "Physique",
};

const ACTIVITY_LABEL: Record<ActivityType, string> = {
  blood_donation: "Don de sang",
  referral: "Parrainage",
  awareness_session: "Session de sensibilisation",
};

/**
 * Fiche d'un donneur, vue par une structure.
 *
 * L'écran répond à trois questions dans cet ordre: qui est cette personne,
 * sa carte est-elle authentique, et que puis-je faire maintenant. Les actions
 * sont donc au premier écran, pas en bas de page.
 */
export function DonorProfileView({ id }: { id: string }) {
  const donorQuery = useDonor(id);
  const verifyQuery = useVerifyDonor(id);
  const addActivity = useAddDonorActivity();
  const validate = useValidateDonor();

  const [recording, setRecording] = useState(false);

  if (donorQuery.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-40 w-full rounded-md" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28 rounded-md" />
          <Skeleton className="h-28 rounded-md" />
          <Skeleton className="h-28 rounded-md" />
        </div>
      </div>
    );
  }

  if (donorQuery.isError || !donorQuery.data) {
    return (
      <EmptyState
        icon={Droplet}
        title="Donneur introuvable"
        description="Aucun profil ne correspond à cet identifiant. Il a pu être supprimé, ou le lien est incomplet."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/donors">Retour à l&apos;annuaire</Link>
          </Button>
        }
      />
    );
  }

  const donor = donorQuery.data;
  const verification = verifyQuery.data?.verification;
  const fullName = `${donor.firstName} ${donor.lastName}`;
  const cardLabel = donor.cardType ? CARD_LABEL[donor.cardType] : undefined;

  function onRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    addActivity.mutate(
      {
        id,
        activityType: String(form.get("activityType")) as ActivityType,
        description: String(form.get("description")) || undefined,
      },
      { onSuccess: () => setRecording(false) },
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href="/donors">
          <ArrowLeft className="size-4" />
          Annuaire des donneurs
        </Link>
      </Button>

      {/* Identité */}
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              initials={`${donor.firstName[0] ?? ""}${donor.lastName[0] ?? ""}`}
              className="size-14 text-lg"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-xl font-bold tracking-tight">
                  {fullName}
                </h1>
                {donor.validated ? (
                  <BadgeCheck
                    className="text-primary size-5"
                    aria-label="Donneur validé"
                  />
                ) : null}
              </div>
              <p className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {donor.city}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="size-3.5" />
                  Inscrit le {dateFmt.format(new Date(donor.createdAt))}
                </span>
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant={donor.available ? "success" : "neutral"}>
                  {donor.available ? "Disponible" : "Indisponible"}
                </Badge>
                {donor.validated ? null : (
                  <Badge variant="warning">À valider</Badge>
                )}
                {cardLabel ? (
                  <Badge variant="neutral">
                    <CreditCard className="size-3.5" />
                    Carte {cardLabel.toLowerCase()}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-primary font-display text-4xl font-extrabold tracking-tight">
              {donor.bloodType.replace("-", "−")}
            </span>
            <p className="text-muted-foreground text-xs">Groupe sanguin</p>
          </div>
        </CardContent>
      </Card>

      {/* Ce qu'une structure vient faire ici */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setRecording(true)}>
          <Activity className="size-4" />
          Enregistrer une activité
        </Button>
        {donor.validated ? null : (
          <Button
            variant="secondary"
            onClick={() => validate.mutate(id)}
            disabled={validate.isPending}
          >
            <BadgeCheck className="size-4" />
            {validate.isPending ? "Validation…" : "Valider ce donneur"}
          </Button>
        )}
        <Button asChild variant="secondary">
          <a href={`tel:${donor.phoneNumber.replace(/\s/g, "")}`}>
            <Phone className="size-4" />
            Appeler
          </a>
        </Button>
        <Button asChild variant="ghost">
          <Link href={`/verify/${donor.id}`}>
            <ScanLine className="size-4" />
            Carte publique
          </Link>
        </Button>
      </div>

      {/* Chiffres */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          icon={Wallet}
          label="Solde retirable"
          value={`${(donor.balanceSats ?? 0).toLocaleString("fr-FR")} sats`}
        />
        <Stat
          icon={Activity}
          label="Activités enregistrées"
          value={
            verifyQuery.isPending
              ? null
              : String(verifyQuery.data?.donor.activityCount ?? 0)
          }
        />
        <Stat icon={Droplet} label="Âge" value={`${donor.age} ans`} />
      </div>

      {/* Authenticité */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Authenticité de la carte</CardTitle>
          <ShieldCheck className="text-primary size-5" />
        </CardHeader>
        <CardContent className="pt-0 text-sm">
          {verifyQuery.isPending ? (
            <Skeleton className="h-16 w-full" />
          ) : verifyQuery.isError ? (
            <ErrorState
              error={verifyQuery.error}
              title="Vérification indisponible"
              onRetry={() => void verifyQuery.refetch()}
            />
          ) : verification?.isTimestampVerified ? (
            <div className="flex items-start gap-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-500" />
              <div className="space-y-1">
                <p className="font-medium text-emerald-600 dark:text-emerald-400">
                  Carte authentique et confirmée
                </p>
                {verification.details ? (
                  <p className="text-muted-foreground text-xs">
                    Confirmée le{" "}
                    {dateFmt.format(
                      new Date(verification.details.timestamp * 1000),
                    )}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground rounded-md border border-dashed p-4">
              La carte de ce donneur est en cours de confirmation. Elle reste
              utilisable, sa preuve définitive arrive sous quelques heures.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={recording}
        onClose={() => setRecording(false)}
        title="Enregistrer une activité"
        description={`Pour ${fullName}. L'activité apparaîtra dans son espace personnel.`}
      >
        <form onSubmit={onRecord} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activityType">Type d&apos;activité</Label>
            <Select
              id="activityType"
              name="activityType"
              defaultValue="blood_donation"
            >
              {(Object.keys(ACTIVITY_LABEL) as ActivityType[]).map((type) => (
                <SelectItem key={type} value={type}>
                  {ACTIVITY_LABEL[type]}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Précision (facultatif)</Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              maxLength={280}
              placeholder="Don de sang total, 450 ml."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setRecording(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={addActivity.isPending}>
              {addActivity.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  /** `null` pendant le chargement: pas de zéro provisoire. */
  value: string | null;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{label}</p>
          <Icon className="text-muted-foreground size-5" />
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
