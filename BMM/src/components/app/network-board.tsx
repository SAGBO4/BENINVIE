"use client";

import {
  ArrowLeftRight,
  Check,
  Clock,
  MapPin,
  Pencil,
  Plus,
  Send,
  Warehouse,
  X,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import {
  useCreateTransfer,
  useRespondTransfer,
  useSetStock,
  useStock,
  useTransfers,
} from "@/lib/api/hooks";
import {
  BLOOD_TYPES,
  type BloodComponent,
  type BloodType,
  type TransferStatus,
  type TransferUrgency,
} from "@/lib/api/resources";
import {
  STOCK_STATUS_DOT,
  STOCK_STATUS_LABEL,
  stockStatusOf,
} from "@/lib/stock/levels";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const components: BloodComponent[] = ["CGR", "Plasma", "Plaquettes"];

const urgencyBadge: Record<TransferUrgency, "danger" | "warning" | "neutral"> =
  {
    vitale: "danger",
    haute: "warning",
    moderee: "neutral",
  };

const urgencyLabel: Record<TransferUrgency, string> = {
  vitale: "Vitale",
  haute: "Haute",
  moderee: "Modérée",
};

const statusMeta: Record<
  TransferStatus,
  {
    label: string;
    variant: "danger" | "warning" | "primary" | "success" | "neutral";
  }
> = {
  ouverte: { label: "Ouverte", variant: "danger" },
  acceptée: { label: "Acceptée", variant: "primary" },
  en_transit: { label: "En transit", variant: "warning" },
  reçue: { label: "Reçue", variant: "success" },
  annulée: { label: "Annulée", variant: "neutral" },
};

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

type EditedCell = {
  component: BloodComponent;
  bloodType: BloodType;
  units: number;
  expiringSoon: number;
};

export function NetworkBoard() {
  const { user } = useAuth();
  const stock = useStock();
  const transfers = useTransfers();
  const createTransfer = useCreateTransfer();
  const respond = useRespondTransfer();
  const setStock = useSetStock();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"reseau" | "miennes">("reseau");
  const [editing, setEditing] = useState<EditedCell | null>(null);

  /** Identité réelle de la structure connectée: rien n'est présumé ici. */
  const myOrgId = user?.organizationId ?? null;

  function onCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createTransfer.mutate(
      {
        component: String(form.get("component")) as BloodComponent,
        bloodType: String(form.get("bloodType")),
        quantity: Number(form.get("quantity")) || 1,
        urgency: String(form.get("urgency")) as TransferUrgency,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTab("miennes");
        },
      },
    );
  }

  async function onSaveStock() {
    if (!editing) return;
    await setStock
      .mutateAsync({
        component: editing.component,
        bloodType: editing.bloodType,
        units: editing.units,
        expiringSoon: editing.expiringSoon,
      })
      .catch(() => {});
    setEditing(null);
  }

  // Pivot du stock: [groupe][composant] = poste
  const stockMap = new Map<
    string,
    Map<BloodComponent, { units: number; expiringSoon: number }>
  >();
  for (const item of stock.data ?? []) {
    if (!stockMap.has(item.bloodType)) stockMap.set(item.bloodType, new Map());
    stockMap.get(item.bloodType)!.set(item.component, {
      units: item.units,
      expiringSoon: item.expiringSoon,
    });
  }

  const allTransfers = transfers.data ?? [];
  const visible = allTransfers.filter((t) =>
    tab === "miennes" ? t.requesterId === myOrgId : t.requesterId !== myOrgId,
  );

  return (
    <div className="space-y-8">
      {/* Stock par composant */}
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div className="space-y-1">
            <CardTitle>Mon stock de sang</CardTitle>
            <p className="text-muted-foreground text-sm">
              Poches disponibles par groupe sanguin et par composant, avec
              celles qui arrivent bientôt à expiration. Cliquez sur une valeur
              pour la corriger.
            </p>
          </div>
          <Warehouse className="text-muted-foreground size-5 shrink-0" />
        </CardHeader>
        <CardContent className="overflow-x-auto pt-0">
          {stock.isPending ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full" />
              ))}
            </div>
          ) : stock.isError ? (
            <ErrorState
              error={stock.error}
              title="Stock indisponible"
              onRetry={() => void stock.refetch()}
            />
          ) : (
            <>
              <table className="w-full min-w-120 border-separate border-spacing-y-1 text-sm">
                <caption className="sr-only">
                  Poches en stock par groupe sanguin et par composant
                </caption>
                <thead>
                  <tr className="text-muted-foreground text-left text-xs">
                    <th scope="col" className="px-3 py-1 font-medium">
                      Groupe
                    </th>
                    {components.map((c) => (
                      <th key={c} scope="col" className="px-3 py-1 font-medium">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BLOOD_TYPES.map((bt) => (
                    <tr key={bt}>
                      <th scope="row" className="px-3 py-2 text-left">
                        <span className="bg-primary/10 text-primary font-display inline-flex size-9 items-center justify-center rounded-full text-xs font-bold">
                          {bt}
                        </span>
                      </th>
                      {components.map((c) => {
                        const cell = stockMap.get(bt)?.get(c);
                        const units = cell?.units ?? 0;
                        const status = stockStatusOf(units);
                        return (
                          <td key={c} className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() =>
                                setEditing({
                                  component: c,
                                  bloodType: bt,
                                  units,
                                  expiringSoon: cell?.expiringSoon ?? 0,
                                })
                              }
                              aria-label={`Modifier le stock ${c} ${bt}: ${units} poches, ${STOCK_STATUS_LABEL[status].toLowerCase()}`}
                              className="hover:bg-muted focus-visible:ring-ring group flex items-center gap-2 rounded-md px-2 py-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                            >
                              <span
                                className={cn(
                                  "size-2 rounded-full",
                                  STOCK_STATUS_DOT[status],
                                )}
                              />
                              <span className="font-medium">{units}</span>
                              {cell && cell.expiringSoon > 0 ? (
                                <span className="text-muted-foreground flex items-center gap-0.5 text-xs">
                                  <Clock className="size-3" />
                                  {cell.expiringSoon}
                                </span>
                              ) : null}
                              <Pencil className="text-muted-foreground size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-muted-foreground mt-3 flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="bg-destructive size-2 rounded-full" />
                  critique
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-amber-500" /> faible
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-emerald-500" /> stable
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" /> poches expirant sous 7 jours
                </span>
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Transferts inter-centres */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-lg font-bold tracking-tight">
            Réseau d'entraide entre centres
          </h2>
          <p className="text-muted-foreground text-sm">
            Demandez du sang à d'autres centres quand vous en manquez, ou
            répondez aux demandes des centres proches. « Réseau » liste les
            demandes des autres, « Mes demandes » suit les vôtres.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Filtrer les demandes de transfert"
            className="bg-muted/60 flex gap-1 rounded-lg p-1"
          >
            {(
              [
                { key: "reseau", label: "Réseau" },
                { key: "miennes", label: "Mes demandes" },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "focus-visible:ring-ring cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  tab === t.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Button onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            {open ? <X className="size-4" /> : <Plus className="size-4" />}
            {open ? "Fermer" : "Demander un transfert"}
          </Button>
        </div>

        {open ? (
          <Card>
            <CardContent className="p-6">
              <form
                onSubmit={onCreate}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
              >
                <div className="space-y-2">
                  <Label htmlFor="component">Composant</Label>
                  <Select id="component" name="component" defaultValue="CGR">
                    {components.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Groupe</Label>
                  <Select id="bloodType" name="bloodType" defaultValue="O-">
                    {BLOOD_TYPES.map((g: BloodType) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Poches</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min={1}
                    defaultValue={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgence</Label>
                  <Select id="urgency" name="urgency" defaultValue="haute">
                    <SelectItem value="vitale">Vitale</SelectItem>
                    <SelectItem value="haute">Haute</SelectItem>
                    <SelectItem value="moderee">Modérée</SelectItem>
                  </Select>
                </div>
                <Button type="submit" disabled={createTransfer.isPending}>
                  <Send className="size-4" />
                  {createTransfer.isPending ? "Publication…" : "Publier"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {transfers.isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : transfers.isError ? (
          <ErrorState
            error={transfers.error}
            title="Réseau indisponible"
            onRetry={() => void transfers.refetch()}
          />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title={
              tab === "reseau"
                ? "Aucune demande dans le réseau"
                : "Vous n'avez aucune demande"
            }
            description={
              tab === "reseau"
                ? "Les besoins des autres centres apparaîtront ici dès qu'une demande sera publiée."
                : "Publiez une demande pour solliciter les centres du réseau."
            }
            action={
              tab === "miennes" ? (
                <Button size="sm" onClick={() => setOpen(true)}>
                  <Plus className="size-4" />
                  Demander un transfert
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="space-y-3">
            {visible.map((t) => {
              const mine = t.requesterId === myOrgId;
              const status = statusMeta[t.status];
              return (
                <li key={t.id}>
                  <Card>
                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="bg-primary/10 text-primary font-display flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                          {t.bloodType}
                        </span>
                        <div>
                          <p className="font-medium">
                            {t.quantity} {t.component}
                            {t.quantity > 1 ? "s" : ""}
                          </p>
                          <p className="text-muted-foreground flex flex-wrap items-center gap-1 text-sm">
                            <MapPin className="size-3.5" />
                            {mine ? "Vous" : t.requesterName} ·{" "}
                            {t.requesterCity} ·{" "}
                            {dateFmt.format(new Date(t.createdAt))}
                          </p>
                          {t.responderName ? (
                            <p className="text-muted-foreground text-xs">
                              Pris en charge par {t.responderName}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={urgencyBadge[t.urgency]}>
                          {urgencyLabel[t.urgency]}
                        </Badge>
                        <Badge variant={status.variant}>{status.label}</Badge>
                        {!mine && t.status === "ouverte" ? (
                          <Button
                            size="sm"
                            onClick={() => respond.mutate(t.id)}
                            disabled={respond.isPending}
                          >
                            <Check className="size-4" />
                            Proposer
                          </Button>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Corriger le stock"
        description={
          editing
            ? `${editing.component} · groupe ${editing.bloodType}`
            : undefined
        }
      >
        {editing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="units">Poches disponibles</Label>
              <Input
                id="units"
                type="number"
                min={0}
                value={editing.units}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    units: Math.max(0, Number(e.target.value) || 0),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiring">Dont expirant sous 7 jours</Label>
              <Input
                id="expiring"
                type="number"
                min={0}
                max={editing.units}
                value={editing.expiringSoon}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    expiringSoon: Math.max(0, Number(e.target.value) || 0),
                  })
                }
              />
            </div>
            <Button
              className="w-full"
              onClick={onSaveStock}
              disabled={
                setStock.isPending || editing.expiringSoon > editing.units
              }
            >
              {setStock.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
            {editing.expiringSoon > editing.units ? (
              <p className="text-destructive text-xs">
                Le nombre de poches expirant ne peut pas dépasser le stock.
              </p>
            ) : null}
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
