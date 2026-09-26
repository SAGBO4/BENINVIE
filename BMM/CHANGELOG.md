# Changelog

Toutes les modifications notables de ce projet sont consignées dans ce fichier.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/)
et le projet suit le [versionnage sémantique](https://semver.org/lang/fr/).

## [Non publié]

### Modifié

- Refonte de l'interface: identité HEMORA unifiée, logo redessiné en SVG,
  trois familles typographiques, navigation publique reliée à des pages
  existantes et menu mobile permettant enfin de se connecter sous 640 px.
- Toutes les vues alimentées par une requête partagent les mêmes états de
  chargement, d'erreur avec reprise et de vide.

### Supprimé

- Toutes les données simulées côté client: `src/lib/mock`, `src/lib/dev`,
  le magasin `localStorage` des demandes de carte, le solde de démonstration
  et le drapeau `NEXT_PUBLIC_AUTH_BYPASS`. Les écrans appellent l'API.
- Les drapeaux `DEMO_CARDS`, `DEMO_NETWORK` et `DEMO_PAYMENTS`, codés à
  `true`, qui empêchaient les cartes, le réseau et les paiements d'atteindre
  les endpoints existants.
- Les témoignages attribués à des personnes qui n'existent pas, les chiffres
  écrits en dur de la page d'accueil et du volet d'authentification, et les
  trois campagnes fictives de la page publique.

### Corrigé

- Les retraits Mobile Money annonçaient un virement et débitaient le solde
  du donneur alors qu'aucun argent ne bougeait.
- Le tableau du réseau filtrait les transferts sur un identifiant
  d'organisation écrit en dur, montrant les demandes d'une autre structure.
- Erreur d'hydratation à chaque affichage de la page des campagnes.
- Les images distantes bloquaient le chargement de la page d'accueil sur
  mobile; tous les visuels sont servis par l'application.
- Ordre des titres, libellés de formulaire et taille des cibles tactiles.

### Ajouté

- Initialisation du projet Next.js (App Router) avec React 19 et TypeScript.
- Architecture modulaire par domaine métier.
- Cœur technique: validation des variables d'environnement, enveloppe API
  normalisée, gestion d'erreurs typées et client HTTP centralisé.
- Intégration de Drizzle ORM et des clients Supabase (navigateur et serveur).
- Système de design Tailwind CSS v4 et premières primitives d'interface.
- Outillage qualité: ESLint, Prettier, Husky, lint-staged et Vitest.
- Documentation de référence: README, architecture, structure, conventions,
  base de données, API et sécurité.
- Endpoints publics `GET /api/v1/public/stats` et
  `GET /api/v1/public/campaigns`, historique du donneur
  `GET /api/v1/donors/me/activities`, et ajustement de stock `PUT /api/v1/stock`.
- Page `/verify` permettant d'ouvrir une carte par scan ou par identifiant.
- Délais bornés (`src/lib/deadline.ts`) sur la vérification de session et les
  routes publiques: une base injoignable ne fait plus attendre les pages.
