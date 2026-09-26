/* Service worker HEMORA.
 *
 * Trois règles, dans cet ordre:
 *  - navigations: réseau d'abord, repli sur la page hors-ligne mise en cache;
 *  - ressources statiques du domaine: cache d'abord, réseau en arrière-plan;
 *  - tout le reste, API comprise: réseau seul, jamais servi depuis le cache.
 *
 * L'API n'est jamais mise en cache: afficher un stock ou une urgence périmés
 * serait pire que d'afficher une erreur, sur un produit où la fraîcheur de la
 * donnée conditionne une décision de soin.
 */

const VERSION = "hemora-v2";
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;

const OFFLINE_URL = "/hors-ligne";
const PRECACHE = [OFFLINE_URL, "/manifest.webmanifest", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL && key !== ASSETS)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/** Ressources dont une version légèrement ancienne ne gêne personne. */
function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/team/") ||
    url.pathname === "/manifest.webmanifest" ||
    /\.(png|jpg|jpeg|svg|webp|avif|woff2?)$/i.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // L'API reste toujours en direct: pas de donnée médicale périmée.
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(SHELL);
        return (
          (await cache.match(OFFLINE_URL)) ??
          new Response("Hors ligne", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          })
        );
      }),
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        const cached = await cache.match(request);
        // Cache d'abord, puis rafraîchissement discret en arrière-plan.
        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);

        return cached ?? network;
      }),
    );
  }
});

/* --------------------------- Notifications --------------------------- */

/**
 * Alerte d'urgence poussée par le serveur.
 *
 * Tant qu'aucun serveur de push n'est configuré, ce gestionnaire ne se
 * déclenche jamais: il est en place pour que le branchement ne demande que
 * la clé VAPID et l'envoi côté serveur.
 */
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "" };
  }

  const title = payload.title ?? "Besoin de sang près de chez vous";
  const options = {
    body: payload.body ?? "Une structure recherche votre groupe sanguin.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: payload.tag ?? "urgence",
    // Une seconde alerte remplace la première plutôt que de s'empiler.
    renotify: true,
    requireInteraction: true,
    data: { url: payload.url ?? "/donneur" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url ?? "/donneur";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        // Réutilise un onglet déjà ouvert plutôt que d'en ajouter un.
        for (const client of clients) {
          if (client.url.includes(target) && "focus" in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow(target);
      }),
  );
});
