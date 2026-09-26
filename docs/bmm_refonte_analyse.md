# Analyse Exhaustive de BMM (Blood Money Matrix / HEMORA) & Plan de Refonte Intégrale dans Gbɛ (BENINVIE)

**Date** : 26 Septembre 2026  
**Auteurs** : Équipe Technique Conjointe (Architecte Logiciel, Ingénieur UI/UX shadcn, Ingénieur Sécurité & Cryptographie)  
**Référence Dépôt** : `git@github.com:SAGBO4/BENINVIE.git`  
**Statut** : Document de Référence & Cahier de Fusion Technique

---

## 1. Contexte & Analyse Approfondie de la Base BMM

### 1.1 Qu'est-ce que BMM ?
Le projet **BMM (Blood Money Matrix / HEMORA)** a été conçu comme une plateforme panafricaine de secours transfusionnel en temps réel, couplant :
1. **Un registre décentralisé des donneurs de sang** volontaires.
2. **Un algorithme d'appariement (Blood Emergency AI)** évaluant la compatibilité ABO/Rh et la distance géodésique (formule de Haversine).
3. **Un mécanisme de preuve d'intégrité cryptographique** via **OpenTimestamps (OTS)** ancré sur la blockchain Bitcoin, garantissant l'infalsifiabilité des dons et des attestations médicales sans divulguer les données de santé protégées.
4. **Une passerelle d'incitation & d'indemnisation** via deux canaux :
   - **Mobile Money (Izichange)** : Forfait de transport civique de 2 000 FCFA (MTN MoMo / Moov Money).
   - **Lightning Network (Breez SDK Liquid)** : Micro-récompenses instantanées en Satoshis sans intermédiaire dépositaire.
5. **Une gestion logistique de réseau** :
   - Monitoring en temps réel des stocks hospitaliers par phénotype sanguin.
   - Demandes de transfert inter-hospitalier avec traçabilité de la chaîne du froid (2°C - 6°C).
   - Commandes et émissions de cartes physiques de donneurs plastifiées avec QR Code cryptographique.
   - Gamification civique et grand livre de points d'honneur (**Points Ledger**).

---

### 1.2 Cartographie des Modules Existants de BMM

| Module BMM d'Origine | Rôle Métier | Fichiers Clés | Évaluation & Plan de Fusion dans Gbɛ |
| :--- | :--- | :--- | :--- |
| `src/modules/matching/` | Algorithme de compatibilité ABO/Rh et score Haversine avec bonus d'assiduité | `matching.service.ts` | Intégré dans l'API unifiée `/api/v1/hemora/matching` avec explication clinique native. |
| `src/modules/stock/` | Gestion des stocks de sang par établissement et alertes de seuils critiques | `stock.service.ts` | Modélisé dans Drizzle ORM PostGIS (`stocksSang`), composant shadcn `BloodStockMonitor`. |
| `src/modules/transfers/` | Acheminement de poches entre hôpitaux avec chaîne du froid (2°C-6°C) | `transfer.service.ts` | Table Drizzle `transfertsSang`, API `/api/v1/hemora/transfers`, composant `BloodTransferHub`. |
| `src/modules/emergencies/` | Alertes d'urgence transfusionnelle déclenchées par les hôpitaux | `emergency.service.ts` | API `/api/v1/hemora/emergencies`, composant shadcn `EmergencyDispatchConsole`. |
| `src/modules/donors/` | Profils donneurs, conformité APDP, vérification de validité (60 jours) | `donor.service.ts` | Modélisé avec NPI béninois, table `donneursHemora`, hachage salé SHA-256. |
| `src/modules/donations/` | Système de points de fidélité civique, niveaux d'honneur et bons de santé | `points.service.ts` | API `/api/v1/hemora/points`, grand livre OTS, composant `CivicPointsLedger`. |
| `src/modules/bitcoin/` | Preuves OTS (OpenTimestamps), signatures BIP-322, Breez Lightning & Izichange | `ots.service.ts`, `reward.service.ts`, `izichange.service.ts` | Intégration sovereign : OTS SHA-256 universel, simulateur Mobile Money / Lightning. |
| `src/modules/campaigns/` | Organisation des collectes mobiles dans les 77 communes | `campaign.service.ts` | Table `campagnesDon`, API `/api/v1/hemora/campaigns`, composant `MobileCampaignsTracker`. |
| `src/modules/notifications/`| Notifications multicanales (SMS, IVR, EmailJS, Nostr) | `email.service.ts`, `nostr.service.ts` | Route unifiée `/api/v1/simulation/sms` et `/api/v1/simulation/ivr` (Bariba, Fon, Dendi). |

---

## 2. Architecture Cible & Principes de Refonte dans Gbɛ

1. **Souveraineté des Données & APDP (Loi n° 2017-20)** :
   - Aucun identifiant médical personnel n'est exposé publiquement.
   - Les cartes et attestations contiennent un hash salé SHA-256 vérifiable cryptographiquement via l'endpoint public `/api/v1/hemora/verify`.
2. **Design System shadcn/ui & Expérience Mobile / PWA** :
   - Utilisation stricte des composants `Card`, `Badge`, `Button`, `Tabs`, `Dialog`, `Progress`, `Alert`.
   - Palette tricolore républicaine : Vert Émeraude (`#008751`), Jaune Or (`#fcd116`), Rouge Sang Vital (`#e8112d`).
   - Interface PWA adaptée aux écrans tactiles et tablettes d'urgence avec support hors-ligne.
3. **Robustesse & Règle d'Or #1** :
   - "La démo ne doit jamais planter" : Fallback automatique en mode résilient et simulation déterministe si la connectivité réseau externe ou la passerelle bancaire est temporairement indisponible.

---

## 3. Plan d'Implémentation GitFlow

- **Branche** : `feature/refonte-totale-bmm-modules-shadcn`
- **Jalons Techniques** :
  1. Ajout de la table Drizzle `donorPointsLedger` et `emergenciesHemora` pour la traçabilité complète des points d'honneur et des déclarations d'urgence.
  2. Implémentation des endpoints API manquants :
     - `/api/v1/hemora/points` (Gestion des points civiques et conversion en bons de santé / ARCH).
     - `/api/v1/hemora/emergencies` (Déclaration et monitoring des alertes hospitalières).
  3. Création des composants shadcn/ui spécialisés :
     - `CivicPointsLedger.tsx` (Tableau d'honneur civique, badges Bronze/Argent/Or/Platine, conversion).
     - `BloodTransferHub.tsx` (Console interactive de dispatching et suivi de la chaîne du froid).
  4. Intégration harmonieuse dans le tableau de bord de la page d'accueil (`src/app/page.tsx`).
  5. Validation unitaire avec 100% de succès sur la suite Vitest.
  6. Fusion par Pull Request sur `dev`, puis Release Pull Request sur `main` et déploiement Vercel.
