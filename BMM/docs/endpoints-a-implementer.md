# Endpoints backend — état d'implémentation

Le frontend appelle l'API et rien d'autre: les branches de démonstration et le
drapeau `NEXT_PUBLIC_AUTH_BYPASS` ont été supprimés. Ce document suit ce qui
est fait et ce qui reste.

Conventions : préfixe `/api/v1`, enveloppe `{ data, meta }` / `{ error }`,
validation Zod, authentification par session Supabase.

## ✅ Déjà en place (existant)

`auth` (login, register, logout, me), `donors` (POST + GET liste,
`:id/validate`), `emergencies` (CRUD + `:id`), `campaigns` (GET/POST),
`search`, `verify/:id` (GET + POST récompense), `health`.

## ✅ Ajoutés dans ce lot

| Méthode | Route                              | Rôle          | Statut                         |
| ------- | ---------------------------------- | ------------- | ------------------------------ |
| GET     | `/api/v1/organizations`            | super_admin   | ✅ route + service             |
| PATCH   | `/api/v1/organizations/:id/verify` | super_admin   | ✅                             |
| GET     | `/api/v1/stock`                    | org_admin     | ✅ route + service             |
| GET     | `/api/v1/transfers`                | org_admin     | ✅                             |
| POST    | `/api/v1/transfers`                | org_admin     | ✅                             |
| POST    | `/api/v1/transfers/:id/respond`    | org_admin     | ✅                             |
| GET     | `/api/v1/donors/me`                | donneur       | ✅ (donors.id = auth.users.id) |
| PATCH   | `/api/v1/donors/:id`               | donneur (soi) | ✅                             |
| GET     | `/api/v1/donors/:id/rewards`       | donneur/org   | ✅                             |

## ✅ Ajoutés lors de la refonte du front

| Méthode | Route                          | Rôle      | Remplace                              |
| ------- | ------------------------------ | --------- | ------------------------------------- |
| GET     | `/api/v1/public/stats`         | public    | chiffres de la page d'accueil en dur  |
| GET     | `/api/v1/public/campaigns`     | public    | trois campagnes fictives en dur       |
| GET     | `/api/v1/donors/me/activities` | donneur   | historique de dons simulé             |
| PUT     | `/api/v1/stock`                | org_admin | `stockService.updateUnits` sans route |

## 🚧 Intégrations non branchées

Ces services ne déplacent aucun argent. Ils signalent `simulated: true`
jusqu'à l'interface, qui le dit à l'utilisateur, et refusent de simuler quand
leurs identifiants sont configurés.

| Service                  | Fichier                                             | Effet réel     |
| ------------------------ | --------------------------------------------------- | -------------- |
| Izichange (Mobile Money) | `src/modules/bitcoin/services/izichange.service.ts` | aucun          |
| Breez (Lightning)        | `src/modules/bitcoin/services/breez.service.ts`     | aucun sans SDK |

## ⚙️ À faire côté Supabase (obligatoire pour le runtime)

1. **Exécuter `supabase_scripts/network.sql`** dans le SQL Editor : crée les
   tables `stock` et `transfer_requests`, et ajoute les politiques RLS
   (stock par org, réseau visible, donneur modifie/ lit son profil et ses
   récompenses).
2. (Déjà fait si `init.sql` exécuté) `organizations`, `donors`, `reward_logs`
   existent.

## 🔌 Reste à câbler côté frontend

- **Espace donneur** (`/donneur`) : encore alimenté par les données de démo.
  Le brancher via `donorsApi.me()` / `donorsApi.update()` /
  `donorsApi.rewards()` — nécessite un **flux de connexion donneur** (page de
  login donneur + garde), à ajouter.

## Champs `donors` optionnels (confort produit)

L'espace donneur affichait un phénotype, une rareté, un statut CMV, un type
de don préféré et une date d'éligibilité que la base n'a jamais contenus. Ces
champs ont été retirés de l'interface: l'éligibilité est désormais déduite
des activités réelles (`src/lib/donor/history.ts`).

Pour les réintroduire, il faut d'abord les colonnes: `phenotype`, `rarity`,
`cmv_negative`, `preferred_donation`, `eligible_at`, `deferred_reason`. Tant
qu'elles n'existent pas, ne pas les afficher.

## Préférence de récompense

`src/lib/reward-preference.ts` vit dans le `localStorage` du navigateur du
donneur. Elle n'est donc lisible que dans son espace personnel: une structure
ne peut pas la lire depuis sa propre machine. Une colonne en base la rendrait
partagée.
