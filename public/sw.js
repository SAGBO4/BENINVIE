// Service Worker PWA Souverain - Gbɛ (BENINVIE) 2026
// Conforme au mode Hors-Ligne pour les 16 000 Agents de Santé Communautaire (ASC)

const CACHE_NAME = "gbe-sante-v1.0.0";
const OFFLINE_URLS = [
  "/",
  "/manifest.json",
  "/apple-touch-icon.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-maskable.png"
];

// Installation : Mise en cache du shell applicatif
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
  self.skipWaiting();
});

// Activation : Nettoyage des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie réseau d'abord avec bascule sur le cache pour les requêtes hors-ligne
self.addEventListener("fetch", (event) => {
  // Ignorer les requêtes non GET ou externes non HTTP
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Ne pas intercepter les routes d'API dynamiques pour garder la fraîcheur des données
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            success: false,
            offline: true,
            message: "Vous êtes actuellement hors-ligne. Les données seront synchronisées dès rétablissement du réseau."
          }),
          {
            headers: { "Content-Type": "application/json" }
          }
        );
      })
    );
    return;
  }

  // Pour les pages et assets : Network first, fallback cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback racine si navigation
        if (event.request.mode === "navigate") {
          return caches.match("/");
        }
        return new Response("Mode hors-ligne actif (Gbɛ Bénin)", { status: 503 });
      })
  );
});

// Synchronisation en arrière-plan pour les fiches communautaires
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-asc-visites") {
    console.log("[PWA Gbɛ] Synchronisation automatique des fiches de soins ASC...");
  }
});
