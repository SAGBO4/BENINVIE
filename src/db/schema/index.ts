import { pgTable, text, serial, integer, doublePrecision, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const patients = pgTable("gbe_patients", {
  id: serial("id").primaryKey(),
  npi: text("npi").notNull().unique(),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  sexe: text("sexe").notNull(),
  dateNaissance: text("date_naissance").notNull(),
  commune: text("commune").notNull(),
  telephone: text("telephone").notNull(),
  groupeSanguin: text("groupe_sanguin").notNull(),
  allergies: jsonb("allergies").$type<string[]>().notNull(),
  estEnceinte: boolean("est_enceinte").default(false).notNull(),
  semaineAmenorrhee: integer("semaine_amenorrhee"),
  statutArch: text("statut_arch").default("actif").notNull(),
  numeroArch: text("numero_arch"),
  creeLe: timestamp("cree_le").defaultNow().notNull(),
});

export const etablissements = pgTable("gbe_etablissements", {
  id: serial("id").primaryKey(),
  codeIaso: text("code_iaso").notNull().unique(),
  nom: text("nom").notNull(),
  type: text("type").notNull(),
  departement: text("departement").notNull(),
  commune: text("commune").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  capaciteLits: integer("capacite_lits").default(0).notNull(),
  accrediteArs: boolean("accredite_ars").default(true).notNull(),
  creeLe: timestamp("cree_le").defaultNow().notNull(),
});

export const soignants = pgTable("gbe_soignants", {
  id: serial("id").primaryKey(),
  npi: text("npi").notNull().unique(),
  nom: text("nom").notNull(),
  type: text("type").notNull(),
  specialite: text("specialite"),
  etablissementId: text("etablissement_id").notNull(),
  numeroOrdre: text("numero_ordre"),
  valide: boolean("valide").default(true).notNull(),
});

export const encounters = pgTable("gbe_encounters", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  soignantId: text("soignant_id").notNull(),
  etablissementId: text("etablissement_id").notNull(),
  type: text("type").notNull(),
  motif: text("motif").notNull(),
  diagnostic: text("diagnostic"),
  observations: jsonb("observations").notNull(),
  modePaiement: text("mode_paiement").default("immediat").notNull(),
  creeLe: timestamp("cree_le").defaultNow().notNull(),
});

export const ordonnances = pgTable("gbe_ordonnances", {
  id: serial("id").primaryKey(),
  codeOrdonnance: text("code_ordonnance").notNull().unique(),
  patientNpi: text("patient_npi").notNull(),
  prescripteurNpi: text("prescripteur_npi").notNull(),
  prescripteurNom: text("prescripteur_nom").notNull(),
  etablissement: text("etablissement").notNull(),
  typeOrdonnance: text("type_ordonnance").default("conventionnelle").notNull(),
  lignesMedicaments: jsonb("lignes_medicaments").notNull(),
  statut: text("statut").default("ACTIVE").notNull(),
  dateEmission: text("date_emission").notNull(),
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
  statut: text("statut").default("OUVERTE").notNull(),
  dateDeclaration: timestamp("date_declaration").defaultNow().notNull(),
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
