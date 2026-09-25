# 🗺️ FEUILLE DE ROUTE D'INGÉNIERIE & DE DÉPLOIEMENT (ROADMAP)
## Plateforme Gbɛ (BENINVIE) — Réponse au Programme d'Action Wadagni-Talata 2026
### *Document de Cadrage et de Validation Préalable à l'Exécution des Agents*

---

| Métadonnée | Valeur |
|---|---|
| **Projet** | Gbɛ (BENINVIE) |
| **Objectif de la Roadmap** | Structurer la réalisation ordonnée et sans rupture de la plateforme nationale |
| **Garantie Fondamentale** | Règle d'or n°1 : La démo ne plante jamais |
| **Statut** | **SOUMIS À L'ACCORD DU CHEF DE PROJET AVANT DÉCLENCHEMENT DES AGENTS** |

---

## 1. VISION D'ENSEMBLE DE LA CONSTRUCTION

L'objectif de cette feuille de route est de réaliser la fusion harmonieuse des acquis de **`sant-plus`** (Dossier FHIR, Triage IA, Cartographie IASO) et de **`BMM`** (HEMORA, Don de sang, Ancrage Bitcoin OpenTimestamps), tout en comblant les exigences spécifiques du Programme Présidentiel Wadagni-Talata (Paiement différé des urgences, Pharmacopée traditionnelle certifiée, ARCH/GBESSOKE, PWA pour les 16 000 ASC).

La construction est ordonnée en **5 Jalons Structurants (Milestones)** :

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   JALON 1 : SOCLE DE DONNÉES & INTEROPÉRABILITÉ                        │
│   Schéma Drizzle unifié • PostGIS • IASO 77 communes • Seed 2026 déterministe          │
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

### 🔹 JALON 1 : Socle Unifié de Données & Environnement Déterministe
* **Objectif** : Avoir une base de données PostgreSQL + PostGIS commune, consolidée et prête pour la production et la démo.
* **Tâches à réaliser** :
  1. Fusionner les schémas Drizzle ORM de `BMM` et `sant-plus` dans un répertoire centralisé de schémas.
  2. Intégrer les données réelles de la carte sanitaire **IASO Bénin** (les 77 communes, CHIC Calavi, CNHU, hôpitaux de zone).
  3. Mettre en place un script de **Seed Déterministe 2026** reproductible (`pnpm db:seed`) injectant patients fictifs complets (avec Bio à Kalalé), soignants, officines, tradipraticiens et banques de sang.
  4. Configurer Docker et Docker Compose avec initialisation automatique PostGIS.
* **Livrables attendus** : Schéma relationnel complet validé, script de seed opérationnel, conteneurs démarrant sans erreur.
* **Agents mobilisés** : `database-engineer`, `devops-engineer`.

### 🔹 JALON 2 : SIH Fédéré, Carnet HL7 FHIR & Urgences à Paiement Différé
* **Objectif** : Rendre opérationnel le cœur clinique et implémenter la prise en charge systématique des urgences vitales sans barrière financière.
* **Tâches à réaliser** :
  1. Unifier l'espace patient et praticien avec le dossier **HL7 FHIR** (`Patient`, `Encounter`, `Observation`, `MedicationRequest`).
  2. Implémenter l'écran et l'API du **Triage IA Clinique** (intégration Gemini multilingue avec gestion des symptômes en français et langues locales).
  3. Créer le **Module d'Urgence Vitale avec Paiement Différé** :
     - Accès « Bris de Glace » en 1 clic pour soignant accrédité avec journalisation inaltérable.
     - Admission immédiate sans avance de frais.
     - Génération automatique du dossier de paiement différé garanti par l'État.
     - Interface de gestion des apurements et prise en charge.
* **Livrables attendus** : Parcours d'admission d'urgence complet, interface FHIR interactive, triage IA fonctionnel avec suggestions médicales réalistes.
* **Agents mobilisés** : `backend-engineer`, `frontend-engineer`.

### 🔹 JALON 3 : Filière Pharmacopée Traditionnelle & Accréditation Tradipraticiens
* **Objectif** : Matérialiser l'engagement inédit du programme Wadagni-Talata sur la valorisation sécurisée de la médecine traditionnelle.
* **Tâches à réaliser** :
  1. Créer le **Registre Numérique des Tradipraticiens Accrédités** (validation ARS, numéro d'accréditation officiel).
  2. Déployer le catalogue de **Médicaments Traditionnels Améliorés (MTA)** certifiés par l'Agence Nationale du Médicament.
  3. Développer l'interface de prescription d'ordonnances traditionnelles avec contrôle d'interactions et génération de QR code sécurisé à usage unique.
  4. Intégrer la vue de délivrance en officine / herboristerie agréée.
* **Livrables attendus** : Formulaire de prescription MTA certifié, contrôle des interactions médicamenteuses, vérification de validité de l'ordonnance par QR code.
* **Agents mobilisés** : `frontend-engineer`, `backend-engineer`.

### 🔹 JALON 4 : Urgences Transfusionnelles HEMORA & Réseau de Confiance
* **Objectif** : Intégrer le module d'urgence sang issu du hackathon international Bitcoin Mastermind 2026 dans la plateforme globale.
* **Tâches à réaliser** :
  1. Raccorder le moteur de **matching hématologique d'urgence** ABO/Rhésus avec calcul géodésique PostGIS.
  2. Raccorder le tableau de bord de **gestion des stocks de sang** pour les banques de sang et hôpitaux départementaux.
  3. Connecter la génération des cartes donneurs avec signature Ed25519 et ancrage d'intégrité **Bitcoin OpenTimestamps**.
  4. Intégrer la chaîne de **défraiement forfaitaire de transport** : versement direct en Mobile Money (MTN MoMo/Moov) par défaut, avec option Lightning Network.
* **Livrables attendus** : Déclaration d'urgence sang en temps réel, classement instantané des donneurs compatibles, validation du don et émission de l'indemnité.
* **Agents mobilisés** : `backend-engineer`, `frontend-engineer`.

### 🔹 JALON 5 : Protection Sociale (ARCH/GUPS), PWA Hors-Ligne 16 000 ASC & Qualification
* **Objectif** : Assurer l'inclusion totale des populations vulnérables, le fonctionnement terrain hors-ligne et la validation finale avant démonstration.
* **Tâches à réaliser** :
  1. Implémenter la vérification automatique des droits **ARCH** (Assurance Maladie Universelle) et le couplage avec les Guichets Uniques de Protection Sociale (**GUPS**).
  2. Mettre en place le déclencheur de **transferts monétaires numériques fléchés** (programme GBESSOKE) après validation des CPN et vaccins.
  3. Optimiser l'application **PWA Hors-Ligne** pour les agents de santé communautaire (Service Worker, IndexedDB, synchro réseau automatique).
  4. Réaliser la suite de tests automatisés (Vitest + Playwright) sur l'ensemble du parcours officiel de « Bio à Kalalé ».
  5. Audit complet de conformité **APDP** (protection des données) et de sécurité par les agents dédiés.
* **Livrables attendus** : PWA testée réseau coupé, parcours de démo complet sans faille, rapport d'audit sécurité et conformité réglementaire.
* **Agents mobilisés** : `security-engineer`, `qa-engineer`, `final-verifier`, `delivery-orchestrator`.

---

## 3. MATRICE DES RESPONSABILITÉS DES AGENTS

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
