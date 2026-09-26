// Types et modèles centraux pour la Plateforme Gbɛ (BENINVIE)

export type GroupeSanguin = "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Patient {
  id: string;
  npi: string;
  nom: string;
  prenom: string;
  sexe: "M" | "F";
  dateNaissance: string;
  commune: string;
  telephone: string;
  groupeSanguin: GroupeSanguin;
  allergies: string[];
  estEnceinte: boolean;
  semaineAmenorrhee?: number;
  statutArch: "actif" | "eligible" | "non_assure";
  numeroArch?: string;
  creeLe: string;
}

export interface Etablissement {
  id: string;
  codeIaso: string;
  nom: string;
  type: "chic" | "cnhu" | "chd" | "hz" | "csc" | "csa" | "pharmacie" | "banque_sang" | "cabinet_tradipraticien";
  departement: string;
  commune: string;
  lat: number;
  lng: number;
  capaciteLits: number;
  accrediteArs: boolean;
}

export interface Soignant {
  id: string;
  npi: string;
  nom: string;
  type: "medecin" | "sage_femme" | "infirmier" | "asc" | "tradipraticien_accredite";
  specialite?: string;
  etablissementId: string;
  numeroOrdre?: string;
  valide: boolean;
}

export interface Encounter {
  id: string;
  patientId: string;
  soignantId: string;
  etablissementId: string;
  type: "ambulatoire" | "urgence_vitale" | "teleconsultation" | "visite_asc";
  motif: string;
  diagnostic?: string;
  observations: {
    tension?: string;
    temperature?: number;
    pouls?: number;
    frequenceRespiratoire?: number;
    perimetreBrachialMm?: number;
    glycemieGParL?: number;
    notes?: string;
  };
  modePaiement: "immediat" | "paiement_differe_urgence" | "arch_tiers_payant";
  creeLe: string;
}

export interface Ordonnance {
  id: string;
  code: string;
  patientNpi: string;
  prescripteurNpi: string;
  prescripteurNom: string;
  etablissement: string;
  typeOrdonnance: "conventionnelle" | "pharmacopee_certifiee";
  medicaments: Array<{
    nom: string;
    dosage?: string;
    posologie: string;
    dureeJours: number;
    certificationArsMta?: string;
  }>;
  statut: "ACTIVE" | "DELIVREE" | "ANNULEE";
  dateEmission: string;
  dateDelivrance?: string;
  pharmacieNom?: string;
  qrPayload: string;
  empreinteHash: string;
}

export interface DossierPaiementDiffere {
  id: string;
  encounterId: string;
  patientId: string;
  patientNpi: string;
  patientNom: string;
  montantTotalFcfa: number;
  statutApurement: "en_attente" | "couvert_arch" | "echelonne" | "solde";
  referenceGarantieEtat: string;
  echeanceDate: string;
  creeLe: string;
}

export interface DonneurHemora {
  id: string;
  npi: string;
  nomComplet: string;
  groupeSanguin: GroupeSanguin;
  telephone: string;
  commune: string;
  lat: number;
  lng: number;
  selSecret: string;
  profileHash: string;
  dateDernierDon?: string;
  nombreDonsValides: number;
  disponiblePourUrgence: boolean;
  soldeDefraiementFcfa: number;
}

export interface StockSang {
  id: string;
  etablissementId: string;
  hopitalNom: string;
  departement: string;
  commune: string;
  groupe: GroupeSanguin;
  quantitePoches: number;
  seuilAlerte: number;
  derniereMiseAJour: string;
}

export interface UrgenceTransfusion {
  id: string;
  codeUrgence: string;
  hopitalNom: string;
  commune: string;
  lat: number;
  lng: number;
  groupeRequis: GroupeSanguin;
  pochesRequises: number;
  statut: "OUVERTE" | "TRAITEE" | "RESOLUE";
  dateDeclaration: string;
}

export interface CourseZemidjan {
  id: string;
  codeCourse: string;
  patienteNpi: string;
  patienteNom: string;
  conducteurNom: string;
  conducteurTelephone: string;
  commune: string;
  centreSanteDestination: string;
  statut: "ALERTE_RECUE" | "EN_ROUTE" | "ARRIVEE";
  forfaitFcfa: number;
  dateAlerte: string;
  dateArrivee?: string;
  paiementMobileMoneyRef?: string;
}

export interface AuditLog {
  id: string;
  action: "BRIS_DE_GLACE" | "DELIVRANCE_ORDONNANCE" | "CREATION_DOSSIER_DIFFERE" | "APUREMENT_URGENCE" | "DON_SANG_VALIDE" | "TRANSFERT_FLECHE";
  acteurNpi: string;
  acteurNom: string;
  role: string;
  cibleId: string;
  details: Record<string, any>;
  timestamp: string;
}

// ==========================================
// Types issus de la refonte intégrale de BMM
// ==========================================

export interface CampagneDon {
  id: string;
  codeCampagne: string;
  titre: string;
  description: string;
  etablissementOrganisateur: string;
  commune: string;
  departement: string;
  lieuCollecte: string;
  lat: number;
  lng: number;
  dateDebut: string;
  dateFin: string;
  objectifPoches: number;
  pochesCollectees: number;
  statut: "PLANIFIEE" | "EN_COURS" | "TERMINEE";
}

export interface TransfertSang {
  id: string;
  codeTransfert: string;
  sourceHopital: string;
  destinationHopital: string;
  groupeSanguin: string;
  quantitePoches: number;
  urgenceLevel: "STANDARD" | "VITALE";
  statut: "EN_TRANSIT" | "RECEPTIONNE" | "ANNULE";
  dateEnvoi: string;
  dateReception?: string;
}

export interface DemandeCarte {
  id: string;
  donneurNpi: string;
  donneurNom: string;
  groupeSanguin: string;
  communeLivraison: string;
  statut: "EN_ATTENTE" | "IMPRIMEE" | "EXPEDIEE" | "REMISE";
  qrCodeData: string;
  hashVerification: string;
  otsProof?: string;
  dateDemande: string;
}

export interface DonHistorique {
  id: string;
  codeDon: string;
  donneurNpi: string;
  etablissementNom: string;
  groupeSanguin: string;
  dateDon: string;
  pointsFidelite: number;
  statutMedical: "VALIDE" | "AJOURNE_TEMPORAIRE";
  defraiementMontantFcfa: number;
  defraiementCanal: "MOBILE_MONEY" | "LIGHTNING";
  defraiementRef: string;
  otsTimestampHash: string;
}
