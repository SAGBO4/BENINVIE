# 📘 CAHIER DES CHARGES FONCTIONNEL, TECHNIQUE & RÉGLEMENTAIRE
## Plateforme Nationale de Santé Numérique et de Gestion des Urgences : Gbɛ (BENINVIE)
### *Source Unique de Vérité (SSOT) pour le Développement et la Qualification des Livrables*

---

| Métadonnée | Valeur |
|---|---|
| **Projet** | Gbɛ (BENINVIE) — Système d'Information Sanitaire Intégré du Bénin |
| **Cadre de Référence Politique** | Programme d'Action du Président Romuald Wadagni & Vice-Présidente Mariam Chabi Talata (2026-2031) |
| **Piliers Nationaux Ciblés** | Priorité 1 : Santé (pp. 12-13) & Protection Sociale (pp. 14-15) ; Priorité 3 : Technologie (pp. 64-65) |
| **Tutelles Réglementaires** | Ministère de la Santé, ARS (Autorité de Régulation du secteur de la Santé), APDP (Autorité de Protection des Données Personnelles) |
| **Socle de Code Existant** | `sant-plus` (SIH, FHIR, IASO, IA Triage) + `BMM` (HEMORA, Don de sang, Ancrage OTS, PWA) |
| **Statut du Document** | **RÉFÉRENTIEL CONTRACTUEL ET TECHNIQUE OBLIGATOIRE (SSOT)** |

---

## 1. VISION & OBJECTIFS FONDAMENTAUX DU PROJET

Le présent Cahier des Charges définit les exigences strictes pour l'unification, l'industrialisation et la mise en conformité de la plateforme **Gbɛ (BENINVIE)**.

La plateforme a pour objectif de concrétiser la promesse d'un système de santé béninois moderne, inclusif, souverain et accessible à chaque citoyen, où qu'il réside sur le territoire national :
1. **Éradiquer les décès évitables par défaut de paiement à l'admission** grâce au **Dispositif National de Paiement Différé pour les Urgences Vitales**.
2. **Garantir la continuité des soins et le partage sécurisé des antécédents** via le **Carnet de Santé Digital (HL7 FHIR)** adossé au **Système d'Information Hospitalier (SIH)** interconnectant les 77 communes.
3. **Sécuriser la chaîne transfusionnelle** par le module **HEMORA**, assurant le matching instantané et la gestion prédictive des ruptures de sang.
4. **Intégrer et encadrer la pharmacopée traditionnelle** via le registre des tradipraticiens accrédités et la prescription traçable de remèdes certifiés.
5. **Démocratiser l'expertise médicale par l'Intelligence Artificielle et la Télémédecine**, au bénéfice des soignants et des 16 000 agents de santé communautaire (ASC).
6. **Assurer l'inclusion sociale et financière** par l'interfaçage avec **ARCH**, **GBESSOKE**, les **GUPS** et le paiement mobile en Francs CFA (MTN/Moov).
7. **Consacrer la souveraineté numérique** selon le **Code du Numérique** et les directives de l'**APDP**.

---

## 2. PÉRIMÈTRE & CAPITALISATION DES DOSSIERS EXISTANTS

Le projet fusionne les acquis éprouvés des deux briques logicielles :

```
                        ┌──────────────────────────────────────────────┐
                        │                BENINVIE (Gbɛ)                │
                        │    Plateforme Collaborative de Santé Bénin   │
                        └──────────────────────┬───────────────────────┘
                                               │
               ┌───────────────────────────────┴───────────────────────────────┐
               ▼                                                               ▼
┌─────────────────────────────────────────────┐ ┌─────────────────────────────────────────────┐
│                 sant-plus                   │ │                     BMM                     │
│       (Module SIH & Soins Cliniques)        │ │          (Module Transfusion HEMORA)        │
├─────────────────────────────────────────────┤ ├─────────────────────────────────────────────┤
│ • Dossier Patient Électronique HL7 FHIR     │ │ • Réseau national des donneurs volontaires  │
│ • Cartographie Sanitaire IASO (77 communes) │ │ • Moteur de matching hématologique d'urgence│
│ • Module IA Triage Clinique (Gemini)        │ │ • Gestion des stocks de poches de sang      │
│ • Ordonnances numériques & vérification QR  │ │ • Alertes géociblées par SMS/Email          │
│ • Conformité APDP & Portails professionnels │ │ • Preuves cryptographiques OpenTimestamps   │
│ • Intégration MTN MoMo / Moov Money         │ │ • Défraiements de transport forfaitaires    │
└─────────────────────────────────────────────┘ └─────────────────────────────────────────────┘
```

Toutes les équipes et agents de développement doivent **réutiliser, refactoriser et consolider** ces actifs dans une architecture unifiée, sans jeter le code validé.

---

## 3. SPÉCIFICATIONS FONCTIONNELLES DÉTAILLÉES (LES 7 PANGS DU PROGRAMME)

### SF-1 : Carnet de Santé Digital & Système d'Information Hospitalier (SIH) Généralisé
* **SF-1.1 Identifiant Unique** : Adossement au Numéro Personnel d'Identification (NPI) délivré par l'ANIP et relié au Registre National des Personnes Physiques (RNPP).
* **SF-1.2 Standard HL7 FHIR** : Modélisation obligatoire des objets :
  - `Patient` (identité, langues parlées, allergies, groupe sanguin, contact tuteur).
  - `Encounter` (admissions, consultations ambulatoires, urgences, téléconsultations).
  - `Observation` (constantes vitales : tension, glycémie, température, poids, périmètre brachial).
  - `MedicationRequest` (prescriptions pharmaceutiques et phytomédicaments).
  - `Immunization` (calendrier vaccinal national du PEV).
* **SF-1.3 Cartographie Sanitaire IASO** : Intégration du maillage des 77 communes :
  - Pôles de référence nationale : CHIC de Calavi, CNHU-HKM, CHU-MEL, futur CHU International de Parakou.
  - Centres Hospitaliers Départementaux (CHD Ouémé, Borgou, Zou, etc.).
  - Hôpitaux de zone (Savè, Allada, Tchaourou, etc.) et les 600 centres de santé d'arrondissement et de commune réhabilités.
* **SF-1.4 Continuité des Soins** : Tout praticien accrédité dans une structure homologuée doit pouvoir consulter le dossier partagé dès accord du patient ou en mode bris de glace.

### SF-2 : Dispositif National de Paiement Différé pour les Urgences Vitales
* **SF-2.1 Règle d'Or « Zéro Refus d'Admission »** : Interdiction absolue de réclamer une caution, un paiement préalable ou un dépôt pour toute urgence vitale (détresse obstétricale, polytraumatisé, paludisme grave, coma).
* **SF-2.2 Mode « Bris de Glace » Tracé** :
  - Déverrouillage immédiat des données vitales (groupe sanguin, allergies, antécédents critiques) par le soignant.
  - Enregistrement immédiat et inaltérable de l'accès dans le journal d'audit (`acces_log`).
* **SF-2.3 Enregistrement du Dossier d'Urgence à Facturation Différée** :
  - Création automatique du dossier de prise en charge d'urgence adossé au NPI.
  - Les actes médicaux, consommables et transfusions sont enregistrés au tarif conventionné de l'État.
* **SF-2.4 Circuit d'Apurement Sécurisé** :
  - Éligibilité immédiate aux fonds d'urgence et à l'assurance **ARCH** (prise en charge publique à 100% pour les indigents).
  - Pour les assurés ou ménages solvables : émission d'un échéancier de paiement différé sans pénalité via Mobile Money, après stabilisation clinique du patient.

### SF-3 : Réseau National de Don de Sang et Urgences Transfusionnelles (HEMORA)
* **SF-3.1 Algorithme de Matching Transfusionnel** :
  - Compatibilité stricte ABO / Rhésus (O− universel ; donneur incompatible strictement exclu).
  - Calcul de distance géodésique via PostGIS (formule de Haversine) avec score dégressif.
  - Pondération de fiabilité (bonus d'assiduité pour les donneurs réguliers).
* **SF-3.2 Gestion Prédictive des Stocks** :
  - Suivi en temps réel des poches disponibles par établissement et par groupe sanguin.
  - Déclenchement automatique du seuil d'alerte lorsque le stock départemental passe sous 48h de couverture.
* **SF-3.3 Campagnes d'Urgence Géociblées** :
  - Diffusion ciblée par SMS, appel vocal et notification PWA aux donneurs compatibles résidant dans un rayon de 5 à 25 km de l'hôpital en rupture.
* **SF-3.4 Éthique et Défraiement de Transport Forfaitaire** :
  - Conformité stricte avec les règles de l'OMS : le sang est bénévole et non rémunéré.
  - Versement systématique d'un **défraiement forfaitaire de déplacement** (ex: 2 000 FCFA via MTN MoMo ou Moov Money) à chaque donneur qui se présente au centre, **y compris en cas d'ajournement médical** (afin d'éviter toute dissimulation de pathologie au questionnaire pré-don).

### SF-4 : Filière Pharmacopée Traditionnelle Innovante & Tradipraticiens Accrédités
* **SF-4.1 Registre National des Tradipraticiens Accrédités** :
  - Module d'enregistrement et de vérification des praticiens traditionnels validés par l'Autorité de Régulation du secteur de la Santé (ARS) et le Ministère de la Santé.
* **SF-4.2 Référentiel des Médicaments Traditionnels Améliorés (MTA) Certifiés** :
  - Base de données officielle des phytomédicaments homologués par l'Agence Nationale du Médicament (indications, posologies, contre-indications).
* **SF-4.3 Ordonnance Numérique Traditionnelle Sécurisée** :
  - Prescription limitée exclusivement aux produits certifiés du catalogue national.
  - Génération d'un QR code infalsifiable à usage unique pour délivrance en herboristerie ou pharmacie conventionnée.
  - Détection automatique d'interactions néfastes avec les médicaments conventionnels enregistrés dans le carnet FHIR.

### SF-5 : Intelligence Artificielle Clinique & Triage Médical (IA Santé Bénin)
* **SF-5.1 Moteur de Triage Multilingue** :
  - Saisie vocale et textuelle des symptômes en français et en langues locales (Fon, Bariba, Yoruba, Dendi...).
  - Évaluation de gravité probabiliste alignée sur les protocoles sanitaires nationaux béninois (tri de Manchester / protocoles PCIME de l'OMS).
* **SF-5.2 Aide à la Décision Clinique pour les Praticiens et ASC** :
  - Suggestions d'orientations cliniques et détection précoce des signes de gravité (détresse respiratoire pédiatrique, éclampsie, anémie aiguë fébrile).
  - L'IA n'émet aucun diagnostic souverain : elle agit strictement comme un assistant d'orientation soumis à la décision finale du soignant diplômé.
* **SF-5.3 Télémédecine Basse Bande Passante** :
  - Module de télé-expertise entre infirmiers de centres de santé ruraux et médecins spécialistes du CHIC Calavi ou du CHU Parakou.

### SF-6 : Articulation Protection Sociale (ARCH, GBESSOKE, GUPS, SAMU Social)
* **SF-6.1 Contrôle Temps Réel des Droits ARCH** :
  - Interrogation instantanée du registre ARCH via NPI : application immédiate du tiers-payant intégral sur le panier de soins gratuit défini par l'État.
* **SF-6.2 Passerelle Guichets Uniques de Protection Sociale (GUPS)** :
  - Signalement automatisé des familles en situation d'extrême vulnérabilité financière ou sociale constatée lors d'une hospitalisation vers le GUPS communal.
* **SF-6.3 Transferts Monétaires Numériques Fléchés** :
  - Déclenchement automatique de transferts d'incitation nutritionnelle (programme GBESSOKE) lors de la validation d'une Consultation Prénatale (CPN) ou de l'achèvement d'un cycle vaccinal pédiatrique.
* **SF-6.4 Interfaçage SAMU Social National** :
  - Dispatch d'urgence pour la prise en charge médicale et sociale des personnes vulnérables, enfants de la rue et personnes âgées isolées.

### SF-7 : Application PWA Hors-Ligne pour les 16 000 ASC & Relais Digitaux
* **SF-7.1 Résilience Réseau Totale (Offline-First)** :
  - Fonctionnement autonome sans connexion Internet pour les 16 000 agents de santé communautaire en milieu rural.
  - Stockage local sécurisé chiffré (IndexedDB / PWA Service Worker).
* **SF-7.2 Synchronisation Bidirectionnelle Automatique** :
  - Dès détection d'une connexion réseau (3G/4G/Wi-Fi), téléversement des fiches terrain et récupération des alertes nationales.
* **SF-7.3 Accessibilité Vocale & Inclusivité** :
  - Synthèse vocale et messages audio natifs enregistrés en Bariba, Fon, Yoruba, Dendi, Goun et Adja.
  - Impression de cartes de santé physiques avec QR code cryptographique pour les citoyens ne possédant pas de téléphone connecté.

---

## 4. SPÉCIFICATIONS TECHNIQUES & ARCHITECTURE DU SYSTÈME

### 4.1 Stack Technique Cible Unifiée
* **Framework Principal** : Next.js 16 (App Router) + React 19 + TypeScript (mode strict).
* **Styling & UI Design System** : Tailwind CSS v4 + components `shadcn/ui` + Lucide Icons + animations discrètes Framer Motion.
* **Base de Données Principale** : PostgreSQL 16 hébergé sur Neon / Supabase, avec extension spatiale **PostGIS** (calculs Haversine, géolocalisation des centres et donneurs).
* **ORM & Migrations** : Drizzle ORM avec `drizzle-kit` pour une traçabilité rigoureuse des migrations de schéma.
* **Couche IA** : Google Gemini SDK (`@google/genai`) et modèles légers pour l'inférence clinique contextualisée au Bénin.
* **Couche Cryptographique & Intégrité** :
  - Bibliothèque `javascript-opentimestamps` pour l'ancrage Merkle immuable sur la blockchain Bitcoin (preuve publique sans donnée médicale).
  - Signatures numériques Ed25519 pour l'authentification des ordonnances et cartes hors-ligne.
  - Signatures **BIP-322** pour la validation des identités cryptographiques.
* **Passerelles Télécoms & Paiements** :
  - Simulateurs réalistes par défaut (`DEMO_MODE=true`) pour SMS, appels vocaux (IVR/Twilio) et requêtes USSD.
  - Connecteurs Mobile Money (MTN MoMo API, Moov Money API) en FCFA.
  - Connecteur Lightning Network non-dépositaire (Breez Liquid SDK) pour les micro-défraiements alternatifs.
* **Conteneurs & Environnements** : Docker multi-stage build, `docker-compose.yml` complet pour exécution locale instantanée.

### 4.2 Schéma Relationnel Central (Table des Entités)

```sql
-- Identités et Patients
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    npi VARCHAR(32) UNIQUE NOT NULL, -- Numéro Personnel d'Identification ANIP
    nom VARCHAR(100) NOT NULL,
    prenoms VARCHAR(100) NOT NULL,
    date_naissance DATE NOT NULL,
    sexe VARCHAR(1) NOT NULL,
    groupe_sanguin VARCHAR(5), -- O+, O-, A+, etc.
    langue_preferee VARCHAR(20) DEFAULT 'fr',
    telephone VARCHAR(30),
    allergies JSONB DEFAULT '[]',
    statut_arch VARCHAR(20) DEFAULT 'non_assure', -- eligible, actif, non_assure
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Établissements et Carte Sanitaire IASO
CREATE TABLE etablissements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_iaso VARCHAR(50) UNIQUE,
    nom VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL, -- chic, chd, hz, csa, csc, pharmacie, banque_sang, cabinet_tradipraticien
    departement VARCHAR(50) NOT NULL,
    commune VARCHAR(50) NOT NULL,
    geom GEOMETRY(Point, 4326),
    capacite_lits INT DEFAULT 0,
    accredite_ars BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Praticiens (Conventionnels et Tradipraticiens Accrédités)
CREATE TABLE soignants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    npi VARCHAR(32) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    type_soignant VARCHAR(50) NOT NULL, -- medecin, sage_femme, infirmier, asc, tradipraticien_accredite
    specialite VARCHAR(100),
    etablissement_id UUID REFERENCES etablissements(id),
    numero_ordre VARCHAR(50), -- Ordre des Médecins ou Numéro d'Accréditation ARS Tradithérapie
    valide BOOLEAN DEFAULT TRUE
);

-- Dossier Médical Partagé FHIR
CREATE TABLE encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) NOT NULL,
    soignant_id UUID REFERENCES soignants(id) NOT NULL,
    etablissement_id UUID REFERENCES etablissements(id) NOT NULL,
    type VARCHAR(50) NOT NULL, -- ambulatoire, urgence_vitale, teleconsultation, visite_asc
    motif TEXT NOT NULL,
    diagnostic TEXT,
    observations JSONB, -- Constantes vitales, périmètre brachial, glycémie
    mode_paiement VARCHAR(50) DEFAULT 'immediat', -- immediat, paiement_differe_urgence, arch_tiers_payant
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ordonnances Sécurisées et Pharmacopée
CREATE TABLE ordonnances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID REFERENCES encounters(id) NOT NULL,
    prescripteur_id UUID REFERENCES soignants(id) NOT NULL,
    type_ordonnance VARCHAR(30) DEFAULT 'conventionnelle', -- conventionnelle, pharmacopee_certifiee
    medicaments JSONB NOT NULL, -- Nom, dosage, posologie, certification_ars
    qr_signature TEXT NOT NULL,
    statut VARCHAR(30) DEFAULT 'emise', -- emise, delivree, annulee
    pharmacie_id UUID REFERENCES etablissements(id),
    delivree_le TIMESTAMP WITH TIME ZONE
);

-- Urgences Vitales et Paiement Différé
CREATE TABLE dossiers_paiement_differe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID REFERENCES encounters(id) NOT NULL,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    montant_total_fcfa INT NOT NULL,
    statut_apurement VARCHAR(30) DEFAULT 'en_attente', -- en_attente, couvert_arch, echelone, solde
    reference_garantie_etat VARCHAR(100),
    echeance DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module Transfusionnel HEMORA
CREATE TABLE donneurs_sang (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) UNIQUE NOT NULL,
    groupe VARCHAR(5) NOT NULL,
    rhesus VARCHAR(1) NOT NULL,
    dernier_don_date DATE,
    assiduite_score INT DEFAULT 0,
    disponible BOOLEAN DEFAULT TRUE,
    geom GEOMETRY(Point, 4326),
    profile_hash VARCHAR(64) NOT NULL,
    salt VARCHAR(64) NOT NULL
);

CREATE TABLE stocks_sang (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etablissement_id UUID REFERENCES etablissements(id) NOT NULL,
    groupe VARCHAR(5) NOT NULL,
    rhesus VARCHAR(1) NOT NULL,
    quantite_poches INT DEFAULT 0,
    seuil_alerte INT DEFAULT 5,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE alertes_transfusionnelles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etablissement_id UUID REFERENCES etablissements(id) NOT NULL,
    groupe_requis VARCHAR(5) NOT NULL,
    rhesus_requis VARCHAR(1) NOT NULL,
    poches_demandees INT NOT NULL,
    urgence_niveau VARCHAR(20) DEFAULT 'critique',
    statut VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 5. EXIGENCES DE SÉCURITÉ, LÉGISLATION & CONFORMITÉ BÉNIN

### 5.1 Protection des Données Personnelles de Santé (APDP)
* **Code du Numérique du Bénin (Loi n° 2017-20)** : Le système doit respecter strictement les principes de finalité, de proportionnalité et de consentement.
* **Cloisonnement RBAC & Protection Anti-IDOR** : Chaque requête `/api/v1/` doit vérifier l'organisation et l'accréditation du demandeur. Une officine pharmaceutique ne peut en aucun cas lire les observations psychiatriques ou gynécologiques d'un patient.
* **Aucune Donnée Médicale sur la Blockchain** : Seule l'empreinte cryptographique salée :
  $$\text{Hash} = \text{SHA256}(\text{sel} \parallel \text{poivre} \parallel \text{données canonisées})$$
  est horodatée publiquement.
* **Droit à l'Oubli Cryptographique** : En cas de demande de radiation conforme aux textes de l'APDP, la purge du sel en base de données rend l'empreinte irréversiblement anonyme et indéchiffrable.

### 5.2 Hébergement et Souveraineté
* Le système doit être nativement conteneurisé pour être déployable sur les infrastructures de data centers souverains du Bénin (PCDN / infrastructures nationales d'hébergement public).

---

## 6. CRITÈRES D'ACCEPTATION & RÈGLES DE VALIDATION POUR LES AGENTS

Chaque livrable produit par les agents spécialisés doit impérativement satisfaire les critères d'acceptation suivants avant d'être validé :

1. **Intégrité Totale (Zéro Fausse Fonction)** :
   - Aucun bouton ne doit mener à un gestionnaire vide (`onClick={() => {}}`) ou à des fausses promesses non persistées.
   - Toute ordonnance délivrée doit effectivement passer son statut à `delivree` en base et bloquer toute tentative ultérieure de scan.
2. **Démonstration Déterministe et Indestructible (Règle n°1)** :
   - Le scénario officiel de Bio à Kalalé doit pouvoir être exécuté sans aucune interruption ni erreur 500, avec des retours visuels clairs à chaque étape.
   - Les modes de simulation (`SMS_MODE=simulate`, `PAYMENT_MODE=simulate`, etc.) doivent enregistrer leurs résultats réels en base de données.
3. **Qualité de Code et Couverture de Tests** :
   - `npm run typecheck` et `npm run lint` sans aucune erreur ni avertissement bloquant.
   - Suites de tests unitaires et d'intégration validées sous Vitest (matching transfusionnel, détection de réutilisation d'ordonnance, calcul de paiement différé).
4. **Validation Indépendante par les Rôles de Contrôle** :
   - Le `security-engineer` doit auditer les routes sensibles (bris de glace, délivrance d'ordonnances, API Mobile Money).
   - Le `final-verifier` doit rejouer les tests de bout en bout et prouver l'adéquation exacte avec les termes du Programme Wadagni-Talata 2026.

---

*Le présent document constitue la base d'évaluation contractuelle des réalisations de l'équipe de développement et des agents autonomes sur le projet Gbɛ (BENINVIE).*
