"use client";

import { Bell, BellOff, BellRing } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Permission = "default" | "granted" | "denied" | "unsupported";

/**
 * Alertes sur l'appareil du donneur.
 *
 * La permission n'est jamais demandée au chargement: un navigateur qui
 * réclame les notifications avant qu'on ait compris à quoi elles servent se
 * fait refuser, et le refus est définitif. Elle est demandée sur un geste
 * explicite, après avoir expliqué ce qui sera envoyé.
 */
export function NotificationCard() {
  const [permission, setPermission] = useState<Permission>("default");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPermission("unsupported");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPermission(Notification.permission as Permission);
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result as Permission);

      if (result === "granted") {
        // Confirmation immédiate: la personne voit à quoi ressemblera une
        // alerte, sur son appareil, avant d'en recevoir une vraie.
        const registration = await navigator.serviceWorker?.ready.catch(
          () => null,
        );
        registration?.showNotification("Alertes activées", {
          body: "Vous serez prévenu lorsqu'un besoin proche correspond à votre groupe sanguin.",
          icon: "/icons/icon-192.png",
          tag: "bienvenue",
        });
      }
    } finally {
      setBusy(false);
    }
  }

  if (permission === "unsupported") return null;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Alertes sur cet appareil</CardTitle>
        {permission === "granted" ? (
          <BellRing className="text-primary size-5" />
        ) : (
          <Bell className="text-muted-foreground size-5" />
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {permission === "granted" ? (
          <p className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
            <BellRing className="mt-0.5 size-4 shrink-0" />
            <span>
              Les alertes sont activées. Vous ne serez prévenu que
              lorsqu&apos;un besoin proche correspond à votre groupe sanguin.
            </span>
          </p>
        ) : permission === "denied" ? (
          <p className="text-muted-foreground flex items-start gap-2 rounded-md border border-dashed px-3 py-2 text-sm">
            <BellOff className="mt-0.5 size-4 shrink-0" />
            <span>
              Les alertes sont bloquées pour ce site. Pour les réactiver,
              autorisez les notifications dans les réglages de votre navigateur,
              à la ligne HEMORA.
            </span>
          </p>
        ) : (
          <>
            <p className="text-muted-foreground text-sm text-pretty">
              Recevez une alerte quand un hôpital proche cherche votre groupe
              sanguin. Rien d&apos;autre ne vous sera envoyé: ni campagne
              commerciale, ni rappel automatique.
            </p>
            <Button onClick={enable} disabled={busy}>
              <Bell className="size-4" />
              {busy ? "Autorisation…" : "Activer les alertes"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
