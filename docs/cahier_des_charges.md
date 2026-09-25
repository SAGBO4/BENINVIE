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
| **Socle de Code & Références** | `sant-plus` (SIH, FHIR, IASO, IA Triage) + `BMM` (HEMORA, Don de sang, Ancrage OTS, PWA) + Spécification Nationale 4 Plateformes |
| **Statut du Document** | **RÉFÉRENTIEL CONTRACTUEL ET TECHNIQUE OBLIGATOIRE (SSOT)** |

---

## 1. VISION & OBJECTIFS FONDAMENTAUX DU PROJET

Le présent Cahier des Charges définit les exigences strictes pour l'unification, l'industrialisation et la mise en conformité de la plateforme **Gbɛ (BENINVIE)**.

La plateforme a pour objectif d'éradiquer les fractures sanitaires et de concrétiser la promesse d'un système de santé béninois moderne, inclusif, souverain et accessible à chaque citoyen, où qu'il réside sur le territoire national :
1. **Éradiquer les décès évitables par défaut de paiement à l'admission** grâce au **Dispositif National de Paiement Différé pour les Urgences Vitales** (Règle d'or : « Zéro refus d'admission pour motif financier »).
2. **Garantir la continuité des soins et le partage sécurisé des antécédents** via le **Carnet de Santé Digital (HL7 FHIR)** adossé au **Système d'Information Hospitalier (SIH)** interconnectant les 77 communes.
3. **Sécuriser la chaîne transfusionnelle** par le module **HEMORA**, assurant le matching instantané et la gestion prédictive des ruptures de sang.
4. **Intégrer et encadrer la pharmacopée traditionnelle** via le registre des tradipraticiens accrédités et la prescription traçable de remèdes certifiés (MTA).
5. **Démocratiser l'expertise médicale par l'Intelligence Artificielle et la Télémédecine**, au bénéfice des soignants et des 16 000 agents de santé communautaire (ASC).
6. **Assurer l'inclusion sociale et financière** par l'interfaçage avec **ARCH**, **GBESSOKE**, les **GUPS** et le paiement mobile en Francs CFA (MTN/Moov).
7. **Consacrer la souveraineté numérique** selon le **Code du Numérique** et les directives de l'**APDP**.

---

## 2. RÈGLE D'OR N°1 (NON NÉGOCIABLE) : LA DÉMO NE DOIT JAMAIS PLANTER

Phase actuelle = **Démonstration, Homologation & Validation Institutionnelle**.
* L'application tourne sur **Vercel** ou **Docker**, connectée à **PostgreSQL (Neon / Supabase)** avec extension **PostGIS**.
* Les données injectées sont des **données déterministes hautement réalistes** contextualisées sur les 77 communes du Bénin (Kalalé, Parakou, Allada, Cotonou, Djougou, Tanguiéta...).
* Les connecteurs tiers (SMS, appels vocaux USSD/IVR, MTN MoMo, Moov Money, Bitcoin Lightning, OpenTimestamps) fonctionnent en **mode simulation transparent et déterministe par défaut**, tout en **enregistrant fidèlement l'état en base de données**.
* **Aucun bouton mort, aucun formulaire factice sans persistance, aucune route sans validation Zod.**

---

## 3. ARCHITECTURE SYNERGIQUE DU DÉPÔT

Le projet unifie les briques fonctionnelles éprouvées :

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

---

## 4. SPÉCIFICATIONS FONCTIONNELLES DÉTAILLÉES (LES 7 PILIERS)

### SF-1 : Carnet de Santé Digital & Système d'Information Hospitalier (SIH) Généralisé
* **SF-1.1 Adossement au NPI** : Identifiant unique national délivré par l'ANIP et relié au Registre National des Personnes Physiques (RNPP).
* **SF-1.2 Modélisation Standard HL7 FHIR** :
  - `Patient` : Identité, langues locales (Bariba, Fon, Yoruba, Dendi...), allergies, groupe sanguin, contact d'urgence/tuteur.
  - `Encounter` : Admissions, urgences, consultations ambulatoires, télé-expertises, visites communautaires ASC.
  - `Observation` : Constantes vitales (Tension, Température, Pouls, Fréquence respiratoire, Glycémie, Périmètre brachial PB).
  - `MedicationRequest` : Prescriptions conventionnelles et phytothérapeutiques.
  - `Immunization` : Calendrier vaccinal national du PEV (Programme Élargi de Vaccination).
* **SF-1.3 Cartographie Sanitaire IASO des 77 Communes** :
  - Répertoire complet des formations sanitaires : CHIC de Calavi, CNHU-HKM Cotonou, CHU-MEL, futur CHU International de Parakou, CHD (Borgou, Ouémé, Zou, etc.), Hôpitaux de Zone (HZ Kalalé-Nikki, Savè, Allada, etc.) et les 600 Centres de Santé d'Arrondissement et de Commune.
* **SF-1.4 Portabilité & Continuité des Soins** : Dossier consultable de manière fluide quel que soit le point d'entrée sanitaire, sous réserve de consentement ou de bris de glace.

### SF-2 : Dispositif National de Paiement Différé pour les Urgences Vitales
* **SF-2.1 Règle « Zéro Refus pour Défaut de Paiement »** : Interdiction absolue d'exiger une caution ou un paiement préalable avant la prise en charge médicale d'une détresse vitale (accident grave, hémorragie de la délivrance, détresse respiratoire, paludisme grave convulsivant).
* **SF-2.2 Mode « Bris de Glace » Tracé** :
  - Accès urgentiste immédiat aux constantes critiques (groupe sanguin, allergies, antécédents cardiovasculaires) en 1 clic via saisie du NPI ou scan du QR code.
  - Journalisation inaltérable obligatoire dans `audit_logs` (identité de l'urgentiste, établissement, horodatage, motif).
* **SF-2.3 Dossier d'Urgence à Facturation Différée** :
  - Enregistrement immédiat de l'admission avec prise en charge sous garantie de l'État.
  - Facturation au tarif conventionné national.
* **SF-2.4 Circuit d'Apurement Sécurisé** :
  - Éligibilité immédiate ARCH pour les ménages vulnérables (tiers-payant à 100%).
  - Échéancier de paiement différé sans pénalité via Mobile Money (MTN MoMo / Moov Money) après stabilisation du patient.

### SF-3 : Urgences Transfusionnelles & Don de Sang (Module HEMORA)
* **SF-3.1 Algorithme de Matching Hématologique & Géodésique** :
  - Compatibilité stricte ABO / Rhésus (O− donneur universel ; incompatibilités strictement exclues).
  - Score de pertinence sur 100 :
    $$\text{Score} = \max(0, 100 - (\text{Distance en km} \times 5)) + \text{Bonus Assiduité}$$
    Bonus assiduité : +10 points par don validé, plafonné à 40 points.
* **SF-3.2 Gestion Prédictive des Stocks Régionaux** :
  - Suivi en temps réel des poches disponibles par groupe sanguin et par structure.
  - Alerte automatique quand le stock départemental passe sous le seuil critique (moins de 48 heures de couverture).
* **SF-3.3 Campagnes d'Urgence Géociblées** :
  - Déclenchement d'alertes SMS, appels vocaux IVR en langue locale et notifications PWA aux donneurs compatibles dans un rayon paramétrable (5 à 25 km).
* **SF-3.4 Éthique du Don & Défraiement Forfaitaire de Transport** :
  - Respect strict des directives OMS : don bénévole et non rémunéré.
  - Versement d'un défraiement forfaitaire de déplacement (ex: 2 000 FCFA via MTN MoMo ou Moov Money) à chaque donneur qui se présente, **y compris en cas d'ajournement médical** (pour éviter toute dissimulation de pathologie au questionnaire pré-don).
  - Règle médicale bloquante : interdiction stricte de tout prélèvement si le dernier don date de moins de 60 jours.

### SF-4 : Filière Pharmacopée Traditionnelle Innovante & Tradipraticiens Accrédités
* **SF-4.1 Registre National des Tradipraticiens Accrédités** :
  - Module d'enregistrement et d'authentification des tradithérapeutes sous l'égide de l'ARS et du Ministère de la Santé.
* **SF-4.2 Référentiel des Médicaments Traditionnels Améliorés (MTA) Homologués** :
  - Catalogue officiel des remèdes traditionnels certifiés par l'Agence Nationale du Médicament (posologies, indications, contre-indications).
* **SF-4.3 Ordonnance Numérique Traditionnelle Sécurisée** :
  - Prescription numérique restreinte exclusivement aux remèdes certifiés MTA.
  - Génération de QR code sécurisé infalsifiable à usage unique.
  - Contrôle automatique des contre-indications et interactions avec les traitements conventionnels du dossier patient.

### SF-5 : Intelligence Artificielle Clinique & Triage Médical
* **SF-5.1 Moteur de Triage Multilingue** :
  - Saisie vocale et textuelle des symptômes en français et en langues locales (Fon, Bariba, Yoruba, Dendi...).
  - Évaluation de gravité probabiliste alignée sur les protocoles nationaux (tri de Manchester / PCIME OMS).
* **SF-5.2 Aide à la Décision Clinique pour Praticiens et ASC** :
  - Suggestions d'orientation et détection précoce des signaux d'alarme (anémie aiguë fébrile, pré-éclampsie, déshydratation sévère).
  - Rôle strictement d'assistance clinique : validation finale obligatoire par un professionnel de santé habilité.
* **SF-5.3 Télé-expertise à Basse Bande Passante** :
  - Échange structuré de données et clichés cliniques entre centres de santé isolés et centres experts (CHIC Calavi, CHU Parakou).

### SF-6 : Articulation Protection Sociale (ARCH, GBESSOKE & GUPS)
* **SF-6.1 Contrôle Instantané des Droits ARCH** :
  - Vérification automatique par NPI auprès du registre ARCH / Registre Social Unique (RSU) et activation du tiers-payant intégral.
* **SF-6.2 Transferts Monétaires Numériques Fléchés (GBESSOKE)** :
  - Déclenchement automatique de transferts d'incitation nutritionnelle lors de la validation d'une Consultation Prénatale (CPN) ou d'un cycle de vaccination pédiatrique complet.
* **SF-6.3 Interconnexion GUPS** :
  - Signalement automatisé des cas d'indigence constatés à l'hôpital vers le Guichet Unique de Protection Sociale communal.

### SF-7 : Application PWA Terrain Hors-Ligne pour les 16 000 ASC
* **SF-7.1 Résilience Réseau Totale (Offline-First)** :
  - Fonctionnement intégral sans réseau via Service Worker et IndexedDB chiffré.
* **SF-7.2 Synchronisation Bidirectionnelle Automatique** :
  - Rapprochement automatique des fiches terrain dès récupération du signal mobile.
* **SF-7.3 Inclusivité & Accessibilité** :
  - Synthèse vocale et messages audio enregistrés en Bariba, Fon, Yoruba et Dendi.
  - Support de cartes de santé papier imprimées avec QR code cryptographique pour les patients sans équipement connecté.

---

## 5. SPÉCIFICATIONS TECHNIQUES & ARCHITECTURE

### 5.1 Stack Technique
* **Frontend** : Next.js 16 (App Router), React 19, TypeScript (mode strict), Tailwind CSS v4, shadcn/ui, Lucide Icons, Framer Motion.
* **Backend** : Next.js Route Handlers `/api/v1/`, Validation Zod stricte à l'entrée et à la sortie, architecture en couches (*Controller / Route -> Service / Domain -> Repository -> Database*).
* **Base de Données** : PostgreSQL 16 avec extension spatiale **PostGIS**, hébergé sur Neon / Supabase, Drizzle ORM avec migrations versionnées (`drizzle-kit`).
* **Cryptographie & Intégrité** :
  - Hachage salé SHA-256 pour les profils donneurs : $\text{profileHash} = \text{SHA256}(\text{sel (32 octets)} \parallel \text{données canonisées})$.
  - Ancrage Merkle sur Bitcoin via OpenTimestamps (`javascript-opentimestamps`).
  - Preuve de possession de clé **BIP-322** (`bip322-js`).
  - Signatures numériques Ed25519 pour ordonnances et cartes hors-ligne.
* **Simulateurs Déterministes Intégrés** :
  - Simulateur MTN Mobile Money & Moov Money (FCFA).
  - Simulateur SMS & Appels vocaux IVR (audio multilingue).
  - Simulateur USSD (`*155#`).

### 5.2 Cartographie des Routes API `/api/v1/`

| Méthode | Route | Description | Accès / Rôle |
|---|---|---|---|
| `GET` | `/api/v1/health` | Vérification de santé de l'API et de la base de données | Public |
| `GET` | `/api/v1/patients` | Recherche de patient par NPI ou téléphone | Soignant, ASC, Accueil |
| `POST` | `/api/v1/patients` | Création / Enrôlement d'un patient avec NPI | ASC, Accueil |
| `GET` | `/api/v1/patients/:id` | Consultation du carnet de santé FHIR | Patient, Soignant accrédité |
| `POST` | `/api/v1/encounters` | Création d'une consultation ou visite ASC | Soignant, ASC |
| `POST` | `/api/v1/encounters/bris-de-glace` | Déverrouillage d'urgence des données vitales (tracé) | Urgentiste accrédité |
| `POST` | `/api/v1/urgences/admission` | Admission en urgence vitale sans paiement préalable | Service des Urgences |
| `GET` | `/api/v1/urgences/paiement-differe/:id` | Consultation d'un dossier de paiement différé | Hôpital, Patient, ARCH |
| `POST` | `/api/v1/urgences/apurement` | Enregistrement de l'apurement (ARCH ou Mobile Money) | Régie financière, Patient |
| `POST` | `/api/v1/ordonnances` | Émission d'ordonnance (conventionnelle ou MTA certifié) | Médecin, Tradipraticien ARS |
| `GET` | `/api/v1/ordonnances/:id/verifier` | Vérification de l'authenticité et validité du QR code | Pharmacie, Patient |
| `POST` | `/api/v1/ordonnances/:id/delivrer` | Délivrance et invalidation à usage unique | Pharmacie conventionnée |
| `GET` | `/api/v1/tradipraticiens` | Annuaire officiel des tradipraticiens accrédités ARS | Public, Professionnels |
| `GET` | `/api/v1/medicaments/mta` | Référentiel des Médicaments Traditionnels Améliorés certifiés | Public, Prescripteurs |
| `POST` | `/api/v1/triage/analyse` | Triage IA multilingue (Gemini) des symptômes | Soignant, ASC |
| `GET` | `/api/v1/hemora/donors` | Profil donneur, historique et statut de la carte | Donneur, Banque de sang |
| `POST` | `/api/v1/hemora/donors` | Inscription donneur avec profil salé SHA-256 | Donneur, Banque de sang |
| `POST` | `/api/v1/hemora/emergencies` | Déclaration d'un besoin critique en sang | Urgentiste, Banque de sang |
| `POST` | `/api/v1/hemora/matching` | Moteur de matching hématologique et Haversine | Banque de sang, Système |
| `GET` | `/api/v1/hemora/stocks` | Stocks de sang départementaux et nationaux | Banques de sang, Ministère |
| `POST` | `/api/v1/hemora/donations` | Enregistrement du don ou ajournement + versement défraiement | Banque de sang |
| `POST` | `/api/v1/arch/verifier` | Vérification instantanée des droits ARCH par NPI | Soignant, Pharmacie, Régie |
| `POST` | `/api/v1/transfers/fleches` | Déclenchement de transfert fléché post-CPN/vaccin | Système, ASC |
| `GET` | `/api/v1/carte-sanitaire` | Cartographie IASO des 77 communes | Public, Professionnels |

---

## 6. SCÉNARIO OFFICIEL DE DÉMONSTRATION (PARCOURS « BIO À KALALÉ »)

Le jeu de données de test et la qualification doivent impérativement supporter de bout en bout le scénario officiel :

* **Persona** : Bio GOUDA, 28 ans, enceinte de 7 mois, résidant dans le village de Basso (commune de **Kalalé**, Borgou), locutrice **Bariba**, sans smartphone connecté.
* **Étapes du parcours** :
  1. **Visite communautaire à domicile** : L'ASC de Kalalé saisit la visite prénatale sur sa PWA hors-ligne. Une carte de santé QR imprimée est remise à Bio.
  2. **Rappel automatisé en langue locale** : Le simulateur déclenche un rappel SMS / appel vocal en langue Bariba pour la Consultation Prénatale (CPN3) au Centre de Santé de Kalalé.
  3. **Consultation au Centre de Santé** : La sage-femme scanne le QR code de Bio, visualise ses antécédents, enregistre les constantes (tension, périmètre brachial) et émet une ordonnance pour fer et traitement préventif intermittent du paludisme.
  4. **Retrait gratuit en pharmacie** : La pharmacie communale scanne le QR code de l'ordonnance, vérifie la couverture automatique **ARCH** (reste à charge 0 FCFA) et délivre le traitement en invalidant immédiatement le QR code à usage unique.
  5. **Déclenchement du transfert fléché** : La validation de la CPN déclenche un transfert monétaire de soutien nutritionnel (programme GBESSOKE) de 5 000 FCFA sur le compte MoMo de la famille.
  6. **Survenue d'une urgence obstétricale vitale** : Le jour du travail, survenue d'une hémorragie de la délivrance. Transport d'urgence vers l'Hôpital de Zone de Nikki. Admission immédiate en mode **Bris de Glace** et ouverture d'un **Dossier de Paiement Différé** (zéro caution exigée).
  7. **Activation du module HEMORA** : Déclaration d'un besoin urgent de 2 poches de sang O+. Le moteur de matching identifie instantanément les donneurs volontaires compatibles à Nikki et Kalalé. Les donneurs sont notifiés, se présentent, et reçoivent leur défraiement de 2 000 FCFA en Mobile Money.

---

## 7. EXIGENCES DE SÉCURITÉ, LÉGISLATION APDP & ARS

1. **Conformité au Code du Numérique (Loi n° 2017-20)** :
   - Principe de licéité, de loyauté et de transparence.
   - Protection rigoureuse contre les vulnérabilités de type IDOR (*Insecure Direct Object References*) : aucune ressource de santé ne peut être consultée sans contrôle d'accréditation et de mandat.
2. **Cloisonnement Strict des Métiers** :
   - Les officines ne peuvent consulter que les données de la prescription en cours.
   - Les tradipraticiens n'accèdent qu'aux données nécessaires à la prise en charge phytothérapeutique.
   - Tout accès bris de glace génère une alerte et une entrée immuable dans `audit_logs`.
3. **Droit à l'Oubli Cryptographique** :
   - En conformité avec les directives de l'APDP, la suppression du sel stocké localement rend l'empreinte Bitcoin irréversiblement orpheline et anonyme.

---

## 8. CRITÈRES D'ACCEPTATION POUR LES AGENTS ET LIVRABLES

1. **Fiabilité d'Exécution** :
   - `npm run build` et `npm run typecheck` réussis avec 0 erreur TypeScript.
   - `npm run lint` validé.
   - Suites de tests Vitest exécutées et passantes (matching hématologique, détection réutilisation ordonnance, bris de glace, simulateurs).
2. **Authenticité des Données** :
   - Script de seed déterministe reproductible (`pnpm db:seed` ou `npm run seed`) peuplant les 77 communes, les structures sanitaires réelles et les acteurs de la démo (Bio à Kalalé, tradipraticiens homologués, banques de sang).
3. **Intégrité UI/UX** :
   - Navigation fluide, interfaces accessibles et soignées en Tailwind CSS v4.
   - Composants réactifs affichant les rétroactions visuelles instantanées (dialogue bris de glace, simulation SMS/MoMo/Appel vocal, alertes de rupture de stock).

---
*Ce document fait foi comme Source Unique de Vérité (SSOT) pour toutes les phases de développement de la plateforme Gbɛ (BENINVIE).*
