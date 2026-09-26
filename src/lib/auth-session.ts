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
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
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
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
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
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
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
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150",
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
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150",
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
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
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
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
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
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150",
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
