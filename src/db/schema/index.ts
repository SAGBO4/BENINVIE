import { pgTable, text, serial, timestamp, integer, boolean, doublePrecision, jsonb } from "drizzle-orm/pg-core";

export const patients = pgTable("gbe_patients", {
  id: serial("id").primaryKey(),
  npi: text("npi").notNull().unique(), // Numéro Personnel d'Identification ANIP Bénin
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  dateNaissance: text("date_naissance").notNull(),
  sexe: text("sexe").notNull(),
  groupeSanguin: text("groupe_sanguin").notNull(),
  rhesus: text("rhesus").notNull(),
  telephone: text("telephone").notNull(),
  commune: text("commune").notNull(),
  departement: text("departement").notNull(),
  village: text("village").notNull(),
  couvertureArch: boolean("couverture_arch").default(false).notNull(),
  statutGrossesse: boolean("statut_grossesse").default(false).notNull(),
  ageGestationnelSemaines: integer("age_gestationnel_semaines"),
  creeLe: timestamp("cree_le").defaultNow().notNull(),
});

export const etablissements = pgTable("gbe_etablissements", {
  id: serial("id").primaryKey(),
  codeIaso: text("code_iaso").notNull().unique(),
  nom: text("nom").notNull(),
  type: text("type").notNull(), // CHIC, CNHU, CHD, HZ, CSA, CSC
  departement: text("departement").notNull(),
  commune: text("commune").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  telephoneUrgence: text("telephone_urgence").notNull(),
  capaciteLits: integer("capacite_lits").default(0).notNull(),
  banqueDeSangDisponible: boolean("banque_de_sang_disponible").default(false).notNull(),
});

export const soignants = pgTable("gbe_soignants", {
  id: serial("id").primaryKey(),
  npi: text("npi").notNull().unique(),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  specialite: text("specialite").notNull(),
  role: text("role").notNull(), // MEDECIN, SAGE_FEMME, INFIRMIER, ASC, TRADIPRATICIEN
  etablissementId: text("etablissement_id").notNull(),
  telephone: text("telephone").notNull(),
  numeroOrdreNational: text("numero_ordre_national"),
});

export const encounters = pgTable("gbe_encounters", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  patientNpi: text("patient_npi").notNull(),
  etablissementId: text("etablissement_id").notNull(),
  soignantId: text("soignant_id").notNull(),
  type: text("type").notNull(), // CPN, ACCOUCHEMENT, URGENCE_VITALE, CONSULTATION_GENERALE
  modeAdmission: text("mode_admission").notNull(), // STANDARD, BRIS_DE_GLACE, SAMU_SOCIAL
  motif: text("motif").notNull(),
  diagnostics: jsonb("diagnostics").notNull(),
  observations: jsonb("observations").notNull(),
  statut: text("statut").default("en_cours").notNull(),
  dateDebut: timestamp("date_debut").defaultNow().notNull(),
  dateFin: timestamp("date_fin"),
});

export const ordonnances = pgTable("gbe_ordonnances", {
  id: serial("id").primaryKey(),
  codeUnique: text("code_unique").notNull().unique(),
  patientNpi: text("patient_npi").notNull(),
  praticienNpi: text("praticien_npi").notNull(),
  typePrescription: text("type_prescription").notNull(), // CONVENTIONNELLE, MTA_CERTIFIEE
  medicaments: jsonb("medicaments").notNull(),
  statut: text("statut").default("active").notNull(), // active, delivree, expiree
  dateDelivrance: text("date_delivrance"),
  pharmacieNom: text("pharmacie_nom"),
  qrPayload: text("qr_payload").notNull(),
  empreinteHash: text("empreinte_hash").notNull(),
  creeLe: timestamp("cree_le").defaultNow().notNull(),
});

export const dossiersPaiementDiffere = pgTable("gbe_dossiers_paiement_differe", {
  id: serial("id").primaryKey(),
  encounterId: text("encounter_id").notNull(),
  patientId: text("patient_id").notNull(),
  patientNpi: text("patient_npi").notNull(),
  patientNom: text("patient_nom").notNull(),
  montantTotalFcfa: integer("montant_total_fcfa").notNull(),
  statutApurement: text("statut_apurement").default("en_attente").notNull(),
  referenceGarantieEtat: text("reference_garantie_etat").notNull(),
  echeanceDate: text("echeance_date").notNull(),
  creeLe: timestamp("cree_le").defaultNow().notNull(),
});

export const donneursHemora = pgTable("gbe_donneurs_hemora", {
  id: serial("id").primaryKey(),
  npi: text("npi").notNull().unique(),
  nomComplet: text("nom_complet").notNull(),
  groupeSanguin: text("groupe_sanguin").notNull(),
  telephone: text("telephone").notNull(),
  commune: text("commune").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  selSecret: text("sel_secret").notNull(),
  profileHash: text("profile_hash").notNull(),
  dateDernierDon: text("date_dernier_don"),
  nombreDonsValides: integer("nombre_dons_valides").default(0).notNull(),
  disponiblePourUrgence: boolean("disponible_pour_urgence").default(true).notNull(),
  soldeDefraiementFcfa: integer("solde_defraiement_fcfa").default(0).notNull(),
  bitcoinAddress: text("bitcoin_address"),
  otsProof: text("ots_proof"),
  creeLe: timestamp("cree_le").defaultNow().notNull(),
});

export const stocksSang = pgTable("gbe_stocks_sang", {
  id: serial("id").primaryKey(),
  etablissementId: text("etablissement_id").notNull(),
  hopitalNom: text("hopital_nom").notNull(),
  departement: text("departement").notNull(),
  commune: text("commune").notNull(),
  groupe: text("groupe").notNull(),
  quantitePoches: integer("quantite_poches").default(0).notNull(),
  seuilAlerte: integer("seuil_alerte").default(5).notNull(),
  derniereMiseAJour: timestamp("derniere_mise_a_jour").defaultNow().notNull(),
});

export const urgencesTransfusion = pgTable("gbe_urgences_transfusion", {
  id: serial("id").primaryKey(),
  codeUrgence: text("code_urgence").notNull().unique(),
  hopitalNom: text("hopital_nom").notNull(),
  commune: text("commune").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  groupeRequis: text("groupe_requis").notNull(),
  pochesRequises: integer("poches_requises").notNull(),
  statut: text("statut").default("OUVERTE").notNull(), // OUVERTE, EN_COURS, RESOLUE
  dateDeclaration: timestamp("date_declaration").defaultNow().notNull(),
});

// Modèles issus de la refonte intégrale de BMM (HEMORA)
export const campagnesDon = pgTable("gbe_campagnes_don", {
  id: serial("id").primaryKey(),
  codeCampagne: text("code_campagne").notNull().unique(),
  titre: text("titre").notNull(),
  description: text("description").notNull(),
  etablissementOrganisateur: text("etablissement_organisateur").notNull(),
  commune: text("commune").notNull(),
  departement: text("departement").notNull(),
  lieuCollecte: text("lieu_collecte").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  dateDebut: text("date_debut").notNull(),
  dateFin: text("date_fin").notNull(),
  objectifPoches: integer("objectif_poches").notNull(),
  pochesCollectees: integer("poches_collectees").default(0).notNull(),
  statut: text("statut").default("PLANIFIEE").notNull(), // PLANIFIEE, EN_COURS, TERMINEE
  creeLe: timestamp("cree_le").defaultNow().notNull(),
});

export const transfertsSang = pgTable("gbe_transferts_sang", {
  id: serial("id").primaryKey(),
  codeTransfert: text("code_transfert").notNull().unique(),
  sourceHopital: text("source_hopital").notNull(),
  destinationHopital: text("destination_hopital").notNull(),
  groupeSanguin: text("groupe_sanguin").notNull(),
  quantitePoches: integer("quantite_poches").notNull(),
  urgenceLevel: text("urgence_level").default("STANDARD").notNull(), // STANDARD, VITALE
  statut: text("statut").default("EN_TRANSIT").notNull(), // EN_TRANSIT, RECEPTIONNE, ANNULE
  dateEnvoi: timestamp("date_envoi").defaultNow().notNull(),
  dateReception: timestamp("date_reception"),
});

export const demandesCartes = pgTable("gbe_demandes_cartes", {
  id: serial("id").primaryKey(),
  donneurNpi: text("donneur_npi").notNull(),
  donneurNom: text("donneur_nom").notNull(),
  groupeSanguin: text("groupe_sanguin").notNull(),
  communeLivraison: text("commune_livraison").notNull(),
  statut: text("statut").default("EN_ATTENTE").notNull(), // EN_ATTENTE, IMPRIMEE, EXPEDIEE, REMISE
  qrCodeData: text("qr_code_data").notNull(),
  hashVerification: text("hash_verification").notNull(),
  otsProof: text("ots_proof"),
  creeLe: timestamp("cree_le").defaultNow().notNull(),
});

export const donsHistorique = pgTable("gbe_dons_historique", {
  id: serial("id").primaryKey(),
  codeDon: text("code_don").notNull().unique(),
  donneurNpi: text("donneur_npi").notNull(),
  etablissementNom: text("etablissement_nom").notNull(),
  groupeSanguin: text("groupe_sanguin").notNull(),
  dateDon: text("date_don").notNull(),
  pointsFidelite: integer("points_fidelite").default(100).notNull(),
  statutMedical: text("statut_medical").notNull(), // VALIDE, AJOURNE_TEMPORAIRE
  defraiementMontantFcfa: integer("defraiement_montant_fcfa").default(2000).notNull(),
  defraiementCanal: text("defraiement_canal").default("MOBILE_MONEY").notNull(), // MOBILE_MONEY, LIGHTNING
  defraiementRef: text("defraiement_ref").notNull(),
  otsTimestampHash: text("ots_timestamp_hash").notNull(),
  creeLe: timestamp("cree_le").defaultNow().notNull(),
});

export const pointsLedger = pgTable("gbe_points_ledger", {
  id: serial("id").primaryKey(),
  donneurNpi: text("donneur_npi").notNull(),
  donneurNom: text("donneur_nom").notNull(),
  action: text("action").notNull(), // AWARD, REDEEM
  points: integer("points").notNull(),
  motif: text("motif").notNull(), // DON_SANG, PARRAINAGE, BON_SANTE_ARCH, DEFRAIEMENT_MOMO
  transactionHash: text("transaction_hash").notNull(),
  otsProof: text("ots_proof"),
  creeLe: timestamp("cree_le").defaultNow().notNull(),
});

export const auditLogs = pgTable("gbe_audit_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  acteurNpi: text("acteur_npi").notNull(),
  acteurNom: text("acteur_nom").notNull(),
  role: text("role").notNull(),
  cibleId: text("cible_id").notNull(),
  details: jsonb("details").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

