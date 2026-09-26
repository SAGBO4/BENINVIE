"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * Événement propre à Chromium, absent des types du DOM.
 * Le navigateur le déclenche quand l'application remplit les critères
 * d'installation; on le retient pour proposer l'installation au bon moment
 * plutôt que de laisser le navigateur choisir le sien.
 */
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "hemora.install-dismissed";

export function InstallPrompt() {
  const [event, setEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Une invitation refusée ne revient pas à la visite suivante.
    if (localStorage.getItem(DISMISSED_KEY) === "1") return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallPromptEvent);
      setVisible(true);
    };

    const onInstalled = () => {
      setVisible(false);
      setEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  }

  async function install() {
    if (!event) return;
    await event.prompt();
    await event.userChoice.catch(() => null);
    setVisible(false);
    setEvent(null);
  }

  if (!visible || !event) return null;

  return (
    <div
      role="dialog"
      aria-label="Installer l'application"
      className="animate-rise-in bg-card fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md flex-col gap-3 rounded-md border p-4 shadow-lg sm:right-4 sm:left-auto"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-display text-sm font-bold">
            Installer HEMORA sur cet appareil
          </p>
          <p className="text-muted-foreground text-xs text-pretty">
            L&apos;application s&apos;ouvre alors comme les autres, et votre
            carte de donneur reste consultable sans réseau.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Ne plus proposer"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring -m-1 shrink-0 cursor-pointer rounded-sm p-1 focus-visible:ring-2 focus-visible:outline-none"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={install}>
          <Download className="size-4" />
          Installer
        </Button>
        <Button size="sm" variant="ghost" onClick={dismiss}>
          Plus tard
        </Button>
      </div>
    </div>
  );
}
