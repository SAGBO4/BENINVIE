"use client";

import React, { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    // 1. Enregistrement du Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => setSwRegistered(true))
        .catch((err) => console.warn("[PWA] Enregistrement SW ignoré ou échoué:", err));
    }

    // 2. Détection du mode Standalone (déjà installé)
    const isRunningStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    setIsStandalone(isRunningStandalone);
    if (isRunningStandalone) return;

    // 3. Détection iOS (Safari mobile)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Vérifier si l'utilisateur a fermé la bannière durant cette session
    const dismissed = sessionStorage.getItem("gbe_pwa_dismissed");
    if (dismissed) return;

    // 4. Écoute de l'événement Android / Chromium
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Pour iOS, afficher après un léger délai de 2 secondes
    if (isIosDevice) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("gbe_pwa_dismissed", "true");
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <aside
      role="region"
      aria-label="Installation de l'application"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 text-white p-4 rounded-2xl shadow-2xl shadow-emerald-950/40 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 border border-emerald-400/40 shadow-inner">
          <span className="text-xl">🩺</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
              <span>Installer l&apos;application Gbɛ</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PWA
              </span>
            </h4>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white text-lg p-1 -mr-1"
              title="Fermer"
            >
              ×
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Consultez le carnet de santé, les urgences vitales et le réseau HEMORA même{" "}
            <strong className="text-emerald-300 font-semibold">sans connexion Internet</strong>.
          </p>

          {/* Guide spécifique iOS */}
          {isIos ? (
            <div className="mt-3 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200 space-y-1.5">
              <p className="font-semibold text-amber-300 flex items-center gap-1">
                <span>📱</span> Installation sur iPhone / iPad :
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                <li>
                  Touchez le bouton Partager <span className="px-1.5 py-0.5 bg-slate-700 rounded text-sky-400 font-mono text-[10px]">⎋ Partager</span> en bas de Safari
                </li>
                <li>
                  Faites défiler et choisissez <span className="font-medium text-white">« Sur l&apos;écran d&apos;accueil » ➕</span>
                </li>
                <li>
                  Touchez <span className="font-semibold text-emerald-400">Ajouter</span> en haut à droite
                </li>
              </ol>
              <button
                onClick={handleDismiss}
                className="w-full mt-2 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs text-center transition"
              >
                J&apos;ai compris
              </button>
            </div>
          ) : (
            /* Bouton Android / Chromium */
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs transition shadow-md shadow-emerald-700/30 flex items-center justify-center gap-1.5"
              >
                <span>⬇️</span>
                <span>Installer sur mon appareil</span>
              </button>
              <button
                onClick={handleDismiss}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                Plus tard
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
