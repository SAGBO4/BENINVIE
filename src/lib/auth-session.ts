export type UserRole =
  | "MINISTERE"
  | "ARS"
  | "APDP"
  | "MEDECIN"
  | "ASC"
  | "PATIENT"
  | "CITOYEN"
  | "PHARMACIE";

export interface UserSession {
  npi: string;
  nom: string;
  prenom: string;
  role: UserRole;
  roleLabel: string;
  titre: string;
  etablissementNom: string;
  commune: string;
  departement: string;
  avatarUrl?: string;
  badge?: string;
  token?: string;
  password?: string;
}

export const DEMO_USERS: Record<UserRole, UserSession> = {
  MINISTERE: {
    npi: "NPI-MIN-2026-001",
    nom: "GNANHO",
    prenom: "Dr. Aristide",
    role: "MINISTERE",
    roleLabel: "Super-Admin / Ministère",
    titre: "Directeur National des Établissements Hospitaliers",
    etablissementNom: "Ministère de la Santé du Bénin",
    commune: "Cotonou",
    departement: "Littoral",
    badge: "Super-Admin National",
    password: "admin2026",
  },
  ARS: {
    npi: "NPI-ARS-2026-002",
    nom: "KPOTIN",
    prenom: "Mme Carole",
    role: "ARS",
    roleLabel: "Régulateur ARS",
    titre: "Inspectrice en Chef - Régulation Sanitaire & MTA",
    etablissementNom: "Autorité de Régulation du Secteur de la Santé",
    commune: "Cotonou",
    departement: "Littoral",
    badge: "Régulateur Officiel",
    password: "ars2026",
  },
  APDP: {
    npi: "NPI-APDP-2026-003",
    nom: "TOSSOU",
    prenom: "M. Séraphin",
    role: "APDP",
    roleLabel: "Auditeur Sécurité APDP",
    titre: "Auditeur Indépendant - Protection des Données de Santé",
    etablissementNom: "Autorité de Protection des Données Personnelles",
    commune: "Cotonou",
    departement: "Littoral",
    badge: "Conformité Loi 2017-20",
    password: "apdp2026",
  },
  MEDECIN: {
    npi: "NPI-MED-2026-004",
    nom: "MENSAH",
    prenom: "Dr. Bienvenu",
    role: "MEDECIN",
    roleLabel: "Médecin Urgentiste",
    titre: "Chef du Service des Urgences & Réanimation",
    etablissementNom: "Hôpital de Zone de Nikki-Kalalé-Pèrèrè",
    commune: "Nikki",
    departement: "Borgou",
    badge: "Accrédité Bris de Glace",
    password: "med2026",
  },
  ASC: {
    npi: "NPI-ASC-2026-005",
    nom: "BIAOU",
    prenom: "Salimata",
    role: "ASC",
    roleLabel: "Agent de Santé Communautaire (ASC)",
    titre: "ASC Référente - Zone Sanitaire Nikki-Kalalé",
    etablissementNom: "Centre de Santé Communal de Kalalé",
    commune: "Kalalé",
    departement: "Borgou",
    badge: "Terrain PWA Offline",
    password: "asc2026",
  },
  PATIENT: {
    npi: "2026-KAL-9821-BIO",
    nom: "GOUDA",
    prenom: "Bio",
    role: "PATIENT",
    roleLabel: "Patient (Dossier FHIR)",
    titre: "Patiente Enceinte (34 SA) • Régime ARCH 100%",
    etablissementNom: "Centre de Santé Communal de Kalalé",
    commune: "Kalalé",
    departement: "Borgou",
    badge: "Couvert ARCH & FHIR",
    password: "bio2026",
  },
  CITOYEN: {
    npi: "NPI-CIT-1995-1029",
    nom: "KORA",
    prenom: "Sabi",
    role: "CITOYEN",
    roleLabel: "Citoyen & Donneur HEMORA",
    titre: "Donneur Universel O+ • Porteur Carte HEMORA",
    etablissementNom: "Banque de Sang - HZ de Nikki",
    commune: "Nikki",
    departement: "Borgou",
    badge: "Donneur Émérite O+",
    password: "kora2026",
  },
  PHARMACIE: {
    npi: "NPI-PHA-2026-007",
    nom: "ADANDE",
    prenom: "Dr. Koffi",
    role: "PHARMACIE",
    roleLabel: "Pharmacien Conventionné",
    titre: "Pharmacien Titulaire & Contrôle Tiers-Payant",
    etablissementNom: "Pharmacie Communale de Nikki",
    commune: "Nikki",
    departement: "Borgou",
    badge: "Officine Agréée ARCH",
    password: "pha2026",
  },
};

export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  MINISTERE: "/dashboard/ministere",
  ARS: "/dashboard/ars",
  APDP: "/dashboard/apdp",
  MEDECIN: "/dashboard/medecin",
  ASC: "/dashboard/asc",
  PATIENT: "/dashboard/patient",
  CITOYEN: "/dashboard/patient",
  PHARMACIE: "/dashboard/pharmacie",
};
