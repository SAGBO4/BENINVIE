# 🗺️ FEUILLE DE ROUTE D'INGÉNIERIE & DE DÉPLOIEMENT (ROADMAP)
## Plateforme BENINVIE — Réponse au Programme d'Action Wadagni-Talata 2026
### *Document de Cadrage et d'Ordonnancement Soumis à Validation Préalable*

---

| Métadonnée | Valeur |
|---|---|
| **Projet** | BENINVIE |
| **Objectif de la Roadmap** | Structurer la réalisation ordonnée et sans rupture de la plateforme nationale |
| **Garantie Fondamentale** | Règle d'or n°1 : La démo ne plante jamais |
| **Statut** | **SOUMIS À L'ACCORD DU CHEF DE PROJET AVANT DÉCLENCHEMENT DES AGENTS** |

---

## 1. VISION D'ENSEMBLE DE LA CONSTRUCTION

La construction unifie les acquis fonctionnels de **`sant-plus`** (Dossier FHIR, Triage IA, Cartographie IASO) et de **`BMM`** (HEMORA, Don de sang, Ancrage Bitcoin OpenTimestamps), tout en matérialisant les engagements du Programme Présidentiel Wadagni-Talata 2026 (Paiement différé des urgences vitales, Pharmacopée traditionnelle certifiée ARS, ARCH/GBESSOKE, PWA pour les 16 000 ASC).

La construction est ordonnée en **5 Jalons Structurants (Milestones)** :

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   JALON 1 : SOCLE DE DONNÉES & ENVIRONNEMENT DÉTERMINISTE              │
│   Next.js 16 + React 19 • Schémas Drizzle unifiés • PostGIS • IASO 77 communes • Seed  │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   JALON 2 : SIH, CARNET FHIR & PAIEMENT DIFFÉRÉ                        │
│   Dossier électronique • Triage IA multilingue • Urgences vitales • Bris de glace       │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   JALON 3 : PHARMACOPÉE TRADITIONNELLE INNOVANTE                       │
│   Registre Tradipraticiens ARS • Catalogue MTA certifié • Ordonnance QR traçable       │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   JALON 4 : MODULE TRANSFUSIONNEL HEMORA                               │
│   Matching ABO/Rh • Stocks régionaux • Alertes géociblées • Indemnités Mobile Money    │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   JALON 5 : SOCIAL, HORS-LIGNE & GATES DE QUALIFICATION                │
│   Couplage ARCH/GUPS • PWA 16 000 ASC • Audit Sécurité APDP • Scénario Démo Bio (Kalalé)│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. DÉTAIL DES PHASES ET ACTIONS D'INGÉNIERIE

### 🔹 JALON 1 : Socle Applicatif, Modèle de Données & Environnement Déterministe
* **Objectif** : Initialiser la structure applicative complète du dépôt `BENINVIE`, configurer la base PostgreSQL + PostGIS, déployer le schéma Drizzle et alimenter la base avec le seed déterministe national.
* **Tâches à réaliser** :
  1. **Initialisation de l'application** :
     - Setup Next.js 16 (App Router), React 19, TypeScript (mode strict), Tailwind CSS v4, composants UI (`shadcn/ui`, Lucide Icons).
     - Configuration Docker (`Dockerfile` multi-stage, `docker-compose.yml` avec PostgreSQL 16 + PostGIS).
  2. **Schéma Drizzle unifié (`src/db/schema/`)** :
     - Tables : `patients`, `etablissements`, `soignants`, `encounters`, `ordonnances`, `dossiers_paiement_differe`, `donneurs_sang`, `stocks_sang`, `alertes_transfusionnelles`, `transactions_recompenses`, `audit_logs`.
     - Intégration des extensions géographiques PostGIS (`geometry(Point, 4326)`).
  3. **Cartographie sanitaire IASO & Données Nationales** :
     - Intégration du maillage des 77 communes du Bénin (12 départements, coordonnées GPS réelles, types d'établissements du CHIC Calavi aux centres de santé communaux).
  4. **Script de Seed Déterministe 2026 (`npm run db:seed`)** :
     - Injection de données de référence cohérentes : Bio GOUDA à Kalalé, médecins, sage-femmes, pharmacies partenaires, tradipraticiens accrédités, banques de sang avec stocks initiaux.
* **Livrables attendus** : Dépôt amorcé, schéma relationnel migré sans warning, conteneur de dev opérationnel, base peuplée et vérifiée par un test d'intégrité.
* **Agents mobilisés** : `database-engineer`, `devops-engineer`, `software-architect`.

---

### 🔹 JALON 2 : SIH Fédéré, Carnet HL7 FHIR & Urgences à Paiement Différé
* **Objectif** : Rendre opérationnel le dossier patient électronique HL7 FHIR et implémenter la prise en charge systématique des urgences vitales sans barrière financière.
* **Tâches à réaliser** :
  1. **Espace Patient & Carnet Numérique FHIR** :
     - Modélisation des ressources standard (`Patient`, `Encounter`, `Observation`, `MedicationRequest`, `Immunization`).
     - Vue patient résumée en un coup d'œil (allergies, groupe sanguin, antécédents, calendrier vaccinal).
     - Génération de la carte de santé avec QR code cryptographique.
  2. **Triage IA Médical Multilingue (Moteur Gemini)** :
     - Route API `/api/v1/triage/analyse` analysant la gravité clinique et proposant l'orientation adaptée.
     - Interface de saisie vocale et textuelle (français et langues béninoises : Bariba, Fon, Yoruba, Dendi).
  3. **Module d'Urgence Vitale avec Paiement Différé** :
     - Bouton d'accès « Bris de Glace » en 1 clic pour urgentiste avec journalisation inaltérable dans `audit_logs`.
     - Admission d'urgence vitale sans caution ni avance financière.
     - Génération automatique du dossier de paiement différé garanti par l'État.
     - Interface de gestion d'apurement post-stabilisation (couverture ARCH ou échéancier Mobile Money).
* **Livrables attendus** : Parcours d'admission d'urgence complet, interface FHIR interactive, triage IA fonctionnel avec suggestions médicales réalistes.
* **Agents mobilisés** : `backend-engineer`, `frontend-engineer`.

---

### 🔹 JALON 3 : Filière Pharmacopée Traditionnelle Innovante & Accréditation
* **Objectif** : Matérialiser l'engagement officiel du programme présidentiel sur la valorisation sécurisée de la pharmacopée traditionnelle béninoise.
* **Tâches à réaliser** :
  1. **Registre National des Tradipraticiens Accrédités** :
     - Portail de consultation et de vérification des praticiens accrédités par l'ARS et le Ministère de la Santé.
  2. **Catalogue Officiel des Médicaments Traditionnels Améliorés (MTA)** :
     - Base de données des phytomédicaments homologués par l'Agence Nationale du Médicament (posologies, indications thérapeutiques).
  3. **Ordonnances Numériques Sécurisées à Usage Unique** :
     - Formulaire de prescription réservé aux produits homologués MTA.
     - Génération d'un QR code infalsifiable à usage unique.
     - Contrôle automatique des contre-indications et interactions avec les molécules conventionnelles du dossier patient.
  4. **Interface de Délivrance en Officine / Herboristerie Agréée** :
     - Scan du QR code, validation de l'ordonnance, bascule automatique du statut à `delivree` et verrouillage contre toute réutilisation frauduleuse.
* **Livrables attendus** : Formulaire de prescription MTA certifié, contrôle des interactions médicamenteuses, vérification de validité de l'ordonnance par QR code.
* **Agents mobilisés** : `frontend-engineer`, `backend-engineer`.

---

### 🔹 JALON 4 : Urgences Transfusionnelles HEMORA & Réseau de Confiance
* **Objectif** : Intégrer le module d'urgence transfusionnelle HEMORA (don de sang, matching, stocks, défraiements et preuves cryptographiques).
* **Tâches à réaliser** :
  1. **Moteur de Matching Hématologique & Géodésique** :
     - Calcul instantané de compatibilité ABO/Rhésus.
     - Calcul de distance par formule Haversine via PostGIS.
     - Calcul du score de pertinence (proximité + bonus assiduité jusqu'à 40 pts).
  2. **Gestion Prédictive des Stocks Régionaux** :
     - Tableau de bord en temps réel des poches par établissement et par groupe sanguin.
     - Alerte de seuil critique départemental (< 48h de réserve).
  3. **Campagnes d'Urgence Géociblées** :
     - Diffusion ciblée par SMS, appel vocal simulé et notifications PWA dans un rayon de 5 à 25 km.
  4. **Chaîne de Défraiement Forfaitaire de Transport** :
     - Règle OMS : don bénévole et non rémunéré.
     - Versement automatique d'une indemnité forfaitaire de déplacement (2 000 FCFA via simulateur MTN MoMo / Moov Money) à chaque donneur qui se présente, **y compris en cas d'ajournement médical**.
     - Règle médicale bloquante : interdiction stricte de tout prélèvement à moins de 60 jours d'intervalle.
  5. **Ancrage Cryptographique & Cartes Donneurs** :
     - Hachage salé SHA-256 du profil donneur avec sel cryptographique de 32 octets.
     - Ancrage Merkle sur Bitcoin via OpenTimestamps (`javascript-opentimestamps`).
     - Vérification de clé BIP-322 pour l'option Lightning Network.
* **Livrables attendus** : Déclaration d'urgence sang en temps réel, classement instantané des donneurs compatibles, validation du don et émission de l'indemnité.
* **Agents mobilisés** : `backend-engineer`, `frontend-engineer`.

---

### 🔹 JALON 5 : Protection Sociale (ARCH/GUPS), PWA Hors-Ligne pour les 16 000 ASC & Qualification Démo
* **Objectif** : Assurer l'inclusion complète des populations vulnérables, le fonctionnement terrain hors-ligne et la validation finale avant démonstration.
* **Tâches à réaliser** :
  1. **Interconnexion ARCH & Guichets Uniques de Protection Sociale (GUPS)** :
     - Vérification en temps réel des droits ARCH (tiers-payant 100% sur le panier de soins d'urgence et de maternité).
     - Signalement des cas d'indigence vers les GUPS communaux.
  2. **Transferts Monétaires Numériques Fléchés (GBESSOKE)** :
     - Déclenchement automatique d'un transfert Mobile Money de soutien nutritionnel (5 000 FCFA) lors de la validation d'une CPN ou de la complétion du calendrier vaccinal PEV.
  3. **PWA Hors-Ligne pour les 16 000 ASC** :
     - Service Worker et IndexedDB chiffré pour le travail sans réseau dans les hameaux isolés.
     - Synchronisation bidirectionnelle automatique dès rétablissement de la connexion.
     - Synthèse et rappels audio en langues nationales (Bariba, Fon, Yoruba, Dendi).
  4. **Scénario Officiel Déterministe « Bio à Kalalé »** :
     - Exécution sans accroc du parcours complet en 7 étapes : visite ASC à domicile -> alerte vocale Bariba -> consultation CS Kalalé -> ordonnance délivrée en pharmacie avec tiers-payant ARCH -> transfert fléché GBESSOKE -> urgence hémorragique à l'HZ Nikki avec paiement différé bris de glace -> matching transfusionnel HEMORA.
  5. **Audits et Gates de Qualification Finale** :
     - Audit de conformité APDP (Code du Numérique, contrôle des rôles, anti-IDOR).
     - Exécution des suites de tests unitaires et E2E (Vitest, Playwright).
* **Livrables attendus** : PWA testée réseau coupé, parcours de démo complet sans faille, rapport d'audit sécurité et conformité réglementaire.
* **Agents mobilisés** : `security-engineer`, `qa-engineer`, `final-verifier`, `delivery-orchestrator`.

---

## 3. MATRICE D'ATTRIBUTION DES AGENTS

| Rôle Agent | Responsabilité Précise dans le Projet |
|---|---|
| `delivery-orchestrator` | Pilote l'enchaînement des jalons, s'assure du respect du CDC et délivre le verdict d'étape. |
| `software-architect` | Maintient la cohérence globale de la stack (Next.js, Drizzle, FHIR, PWA). |
| `database-engineer` | Gère les schémas Drizzle, les extensions PostGIS, les migrations et le seed déterministe. |
| `frontend-engineer` / `ui-ux-engineer` | Conçoit les interfaces soignées, accessibles et responsives sous Tailwind CSS v4 & shadcn/ui. |
| `backend-engineer` | Développe les routes API `/api/v1/`, les validations Zod et les intégrations de services. |
| `security-engineer` | Audite l'étanchéité des données, la conformité APDP, les bris de glace et la protection IDOR. |
| `qa-engineer` & `final-verifier` | Exécute les tests unitaires, d'intégration et E2E et valide la conformité avec le Programme Wadagni-Talata. |

---

## 4. CONDITIONS PRÉALABLES & DEMANDE DE VALIDATION

Avant d'initier le Jalon 1 et de solliciter les agents de développement, **la présente feuille de route requiert votre validation formelle** :
- Le découpage en 5 jalons vous convient-il ?
- Y a-t-il une priorité spécifique que vous souhaitez voir traitée en premier (ex: le paiement différé des urgences, ou le don de sang HEMORA, ou la pharmacopée traditionnelle) ?

Dès votre feu vert, nous déclencherons le travail d'ingénierie selon ce plan méthodique.
