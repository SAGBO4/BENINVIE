"use client";

import { useEffect } from "react";

export function PWARegister(): null {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const isHttps = window.location.protocol === "https:";
    const isLocalhost = Boolean(
      window.location.hostname === "localhost" ||
      window.location.hostname === "[::1]" ||
      window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
    );

    if (isHttps || isLocalhost) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker == null) return;
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    console.log("New PWA content is available; please refresh.");
                  } else {
                    console.log("PWA content is cached for offline use.");
                  }
                }
              };
            };
          })
          .catch((error) => {
            console.warn("ServiceWorker registration failed:", error);
          });
      });
    }
  }, []);

  return null;
}
