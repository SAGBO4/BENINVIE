import {
  Patient,
  Etablissement,
  Soignant,
  Encounter,
  Ordonnance,
  DossierPaiementDiffere,
  DonneurHemora,
  StockSang,
  UrgenceTransfusion,
  CourseZemidjan,
  AuditLog,
  SignalementCitoyen,
} from "@/lib/types";
import {
  PATIENTS_REF,
  ETABLISSEMENTS_REF,
  SOIGNANTS_REF,
  DONNEURS_HEMORA_REF,
  STOCKS_SANG_REF,
  ORDONNANCES_REF,
} from "@/data/referentiels";
import { SimulatedSmsResult, SimulatedPaymentResult } from "@/lib/simulation";

/**
 * Magasin de données en mémoire persistant au niveau du processus Node.js.
 * Garantit la Règle d'Or n°1 : La démo ne plante jamais, même en environnement sans conteneur Postgres actif.
 */
class BeninVieDataStore {
  public patients: Map<string, Patient> = new Map();
  public etablissements: Map<string, Etablissement> = new Map();
  public soignants: Map<string, Soignant> = new Map();
  public encounters: Map<string, Encounter> = new Map();
  public ordonnances: Map<string, Ordonnance> = new Map();
  public dossiersDiffere: Map<string, DossierPaiementDiffere> = new Map();
  public donneursHemora: Map<string, DonneurHemora> = new Map();
  public stocksSang: Map<string, StockSang> = new Map();
  public urgencesTransfusion: Map<string, UrgenceTransfusion> = new Map();
  public coursesZemidjans: Map<string, CourseZemidjan> = new Map();
  public signalements: Map<string, SignalementCitoyen> = new Map();
  public auditLogs: AuditLog[] = [];
  public smsLogs: SimulatedSmsResult[] = [];
  public paymentLogs: SimulatedPaymentResult[] = [];

  private initialized = false;

  constructor() {
    this.seed();
  }

  public seed() {
    if (this.initialized) return;

    for (const p of PATIENTS_REF) {
      this.patients.set(p.npi, { ...p });
    }

    for (const e of ETABLISSEMENTS_REF) {
      this.etablissements.set(e.id, { ...e });
    }

    for (const s of SOIGNANTS_REF) {
      this.soignants.set(s.npi, { ...s });
    }

    for (const d of DONNEURS_HEMORA_REF) {
      this.donneursHemora.set(d.npi, { ...d });
    }

    for (const st of STOCKS_SANG_REF) {
      this.stocksSang.set(st.id, { ...st });
    }

    for (const o of ORDONNANCES_REF) {
      this.ordonnances.set(o.code, { ...o });
    }

    // Urgence initiale à Nikki pour le scénario de démo
    this.urgencesTransfusion.set("URG-2026-NIK-001", {
      id: "urg-nikki-01",
      codeUrgence: "URG-2026-NIK-001",
      hopitalNom: "Hôpital de Zone de Nikki",
      commune: "Nikki",
      lat: 9.9400,
      lng: 3.2108,
      groupeRequis: "O+",
      pochesRequises: 2,
      statut: "OUVERTE",
      dateDeclaration: new Date().toISOString(),
    });

    // Signalement citoyen initial pour démonstration de l'inspection ministérielle
    this.signalements.set("PLN-2026-MIN-001", {
      id: "sig-001",
      codeDossier: "PLN-2026-MIN-001",
      typeInfraction: "EXIGENCE_CAUTION_ILLEGALE",
      typeInfractionLabel: "Exigence de caution financière préalable en urgence vitale",
      etablissementNom: "Hôpital de Zone de Nikki",
      commune: "Nikki",
      departement: "Borgou",
      dateFaits: "2026-03-24",
      description: "Un agent d'accueil a tenté de réclamer une avance de 25 000 FCFA avant l'installation d'un patient en détresse respiratoire aiguë. Prise en charge débloquée immédiatement après rappel de la règle Zéro Refus d'État.",
      anonyme: false,
      declarantNpi: "NPI-BEN-1998-0412-8871",
      declarantNom: "Bio GOUDA",
      declarantTelephone: "+229 97 45 12 33",
      gravite: "CRITIQUE",
      statut: "INSPECTEUR_DEPECHE",
      reponseMinistere: "Inspection Générale de la Santé saisie. Rappel à l'ordre formel notifié à la direction de l'établissement avec instruction de sanctions conservatoires.",
      dateSignalement: "2026-03-24T14:30:00.000Z",
    });

    this.initialized = true;
  }

  public logAudit(log: Omit<AuditLog, "id" | "timestamp">): AuditLog {
    const entry: AuditLog = {
      ...log,
      id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    return entry;
  }
}

// Instance globale singleton pour Next.js (évite la réinitialisation entre les requêtes API en dev)
const globalForStore = globalThis as unknown as { beninVieStore?: BeninVieDataStore };
export const dbStore = globalForStore.beninVieStore || new BeninVieDataStore();
if (process.env.NODE_ENV !== "production") {
  globalForStore.beninVieStore = dbStore;
}
