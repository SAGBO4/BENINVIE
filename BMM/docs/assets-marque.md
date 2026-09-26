# Marque, équipe et sources de présentation

Ce document dit où vivent les visuels du projet, lesquels sont publiés, et
lesquels restent hors du dépôt.

## Sources, non versionnées

`docs/team/` est ignoré par git: le dossier contient des fichiers lourds et des
photographies de personnes identifiables, qui n'ont pas à circuler dans
l'historique. Il reste présent sur les postes de l'équipe.

| Fichier                        | Contenu                                                       |
| ------------------------------ | ------------------------------------------------------------- |
| `presentation-hemora.pdf`      | Présentation en trois pages (mission, vision, logo)           |
| `photo-equipe-times-care.jpeg` | Photographie de l'équipe, fond blanc, sans habillage de slide |
| `slide-mission.jpeg`           | Page 1 exportée: « Un geste simple. Une vie sauvée. »         |
| `slide-equipe.jpeg`            | Page équipe exportée: « L'équipe HEMORA »                     |
| `slide-logo-coming-soon.jpeg`  | Logo sur fond sombre, visuel d'annonce                        |

Si vous ajoutez une source, nommez-la par son contenu. Les noms d'export
automatiques du type `WhatsApp Image 2026-08-29 at 3.24.25 PM (2).jpeg` ne
disent rien de ce qu'ils contiennent et se ressemblent tous.

## Visuels publiés

Ce que le site sert réellement, versionné, optimisé pour le web.

| Fichier                             | Origine                            | Employé par               |
| ----------------------------------- | ---------------------------------- | ------------------------- |
| `public/team/equipe-times-care.jpg` | Photographie d'équipe recompressée | Page « À propos »         |
| `public/team/vision-afrique.jpg`    | Page 2 du PDF, extraite en 1400 px | Page « À propos »         |
| `public/logo-horizontal.png`        | Charte                             | Documents, favicon        |
| `public/logo-vertical.png`          | Charte                             | Documents                 |
| `public/hero-background.png`        | Charte                             | Accueil, authentification |
| `public/emergency-banner.png`       | Charte                             | Récit de l'accueil        |
| `public/how-it-works.png`           | Charte                             | Récit de l'accueil        |
| `public/trust-shield.png`           | Charte                             | Section sécurité          |

Le logo affiché dans l'interface n'est pas une image: il est redessiné en SVG
dans `src/components/shared/logo.tsx`, pour rester net à toutes les tailles et
suivre le thème clair ou sombre. Les PNG servent aux supports hors application.

Aucun visuel n'est chargé depuis un domaine tiers. `next.config.ts` déclare une
liste `remotePatterns` vide, ce qui interdit l'introduction d'un hébergeur
externe sans décision explicite.

## Contenu repris de la présentation

La page « À propos » (`/a-propos`) reprend mot pour mot la mission et la vision
de la présentation, pour que le discours du site et celui des slides ne
divergent pas. Le texte est centralisé dans
`src/config/about.ts`: modifiez-le là, pas dans les composants.

## Vidéos

La page prévoit une section vidéo qui ne s'affiche que si au moins une vidéo
est déclarée dans `src/config/about.ts`. Tant que la liste est vide, aucune
zone vide n'apparaît. Pour en ajouter une, déposez le fichier dans
`public/team/` et déclarez-le dans `aboutVideos`.
