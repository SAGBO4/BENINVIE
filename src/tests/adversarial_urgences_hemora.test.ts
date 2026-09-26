import { describe, it, expect, beforeAll } from "vitest";
import { eq, and } from "drizzle-orm";
import { db, schema } from "../db/drizzle";
import {
  admettreUrgenceVitale,
  executerBrisDeGlace,
  UrgenceValidationError,
  UrgenceNotFoundError,
} from "../services/urgences.service";
import {
  enregistrerDonSang,
  rechercherDonneursCompatibles,
  HemoraValidationError,
  HemoraNotFoundError,
} from "../services/hemora.service";

describe("Banc de Torture & Pentest Adversarial - Urgences Vitales & HÉMORA (Zéro Mock)", () => {
  const PATIENT_NPI_TEST = "2026-KAL-9821-BIO"; // Patient existant dans le seed
  const DONNEUR_NPI_TEST = "2026-PAR-1192-ROS"; // Rosine AGBO - O+ existant dans le seed Neon

  beforeAll(async () => {
    // S'assurer que le stock témoin Nikki O+ existe et noter son niveau
    const [existingStock] = await db
      .select()
      .from(schema.stocksSang)
      .where(
        and(
          eq(schema.stocksSang.etablissementId, "etab-hz-nikki-01"),
          eq(schema.stocksSang.groupe, "O+")
        )
      );

    if (!existingStock) {
      await db.insert(schema.stocksSang).values({
        etablissementId: "etab-hz-nikki-01",
        hopitalNom: "Hôpital de Zone de Nikki",
        departement: "Borgou",
        commune: "Nikki",
        groupe: "O+",
        quantitePoches: 12,
        seuilAlerte: 5,
      });
    }
  });

  describe("1. Urgences Vitales - Admission Sans Caution & Garantie d'État", () => {
    it("Rejette les requêtes avec types corrompus ou paramètres manquants", async () => {
      // @ts-expect-error test coercition
      await expect(admettreUrgenceVitale(null)).rejects.toThrow(UrgenceValidationError);
      await expect(admettreUrgenceVitale({ patientNpi: "", motifUrgence: "Choc septique" })).rejects.toThrow(
        UrgenceValidationError
      );
      await expect(admettreUrgenceVitale({ patientNpi: PATIENT_NPI_TEST, motifUrgence: "" })).rejects.toThrow(
        UrgenceValidationError
      );
    });

    it("Rejette un NPI patient inexistant avec UrgenceNotFoundError (404)", async () => {
      await expect(
        admettreUrgenceVitale({
          patientNpi: "NPI-INEXISTANT-9999",
          motifUrgence: "Polytraumatisme AVP",
        })
      ).rejects.toThrow(UrgenceNotFoundError);
    });

    it("Crée de façon atomique l'encounter et le dossier garanti par l'État en base Neon", async () => {
      const result = await admettreUrgenceVitale({
        patientNpi: PATIENT_NPI_TEST,
        motifUrgence: "Détresse respiratoire aiguë - Défaillance vitale",
        montantTotalFcfa: 120000,
        soignantNpi: "NPI-MED-2026-0042",
        etablissementId: "etab-hz-nikki-01",
      });

      expect(result.encounter).toBeDefined();
      expect(result.dossierDiffere).toBeDefined();
      expect(result.dossierDiffere.montantTotalFcfa).toBe(120000);
      expect(result.dossierDiffere.referenceGarantieEtat).toContain("GARANTIE-ETAT-2026-");

      // Vérification réelle dans la table Neon gbe_encounters
      const [encounterDb] = await db
        .select()
        .from(schema.encounters)
        .where(eq(schema.encounters.id, Number(result.encounter.id)));

      expect(encounterDb).toBeDefined();
      expect(encounterDb.patientNpi).toBe(PATIENT_NPI_TEST);
      expect(encounterDb.type).toBe("URGENCE_VITALE");
    });
  });

  describe("2. Bris de Glace Médical & Traçabilité APDP Bénin", () => {
    it("Rejette la demande de bris de glace sans motif légitime", async () => {
      await expect(
        executerBrisDeGlace({
          patientNpi: PATIENT_NPI_TEST,
          soignantNpi: "NPI-MED-2026-0042",
          soignantNom: "Dr. Tossou",
          etablissementNom: "HZ Nikki",
          motif: "",
        })
      ).rejects.toThrow(UrgenceValidationError);
    });

    it("Accorde l'accès d'urgence et persiste la notification APDP inaltérable", async () => {
      const result = await executerBrisDeGlace({
        patientNpi: PATIENT_NPI_TEST,
        soignantNpi: "NPI-MED-2026-0042",
        soignantNom: "Dr. Emmanuel Tossou",
        etablissementNom: "Hôpital de Zone de Nikki",
        motif: "Coma inexpliqué, patient inconscient non identifié",
      });

      expect(result.autorise).toBe(true);
      expect(result.patient.npi).toBe(PATIENT_NPI_TEST);
      expect(result.traceAudit).toBeDefined();

      // Vérification de la trace d'audit immuable en base Neon
      const logs = await db
        .select()
        .from(schema.auditLogs)
        .where(eq(schema.auditLogs.action, "BRIS_DE_GLACE_DECLENCHE"));

      expect(logs.length).toBeGreaterThanOrEqual(1);
      const dernierLog = logs[logs.length - 1];
      expect(dernierLog.cibleId).toBe(PATIENT_NPI_TEST);
      expect(dernierLog.role).toBe("MEDECIN_URGENTISTE");
    });
  });

  describe("3. HÉMORA - Concurrence Brute & Intégrité des Stocks de Sang (SELECT ... FOR UPDATE)", () => {
    it("Rejette un donneur non répertorié dans la base nationale", async () => {
      await expect(
        enregistrerDonSang({ donneurNpi: "NPI-DONNEUR-FANTOME" })
      ).rejects.toThrow(HemoraNotFoundError);
    });

    it(
      "Garantit l'absence de Lost Update sur le stock lors de 4 dons simultanés",
      async () => {
        // Lecture du stock initial en base Neon
        const [stockAvant] = await db
          .select()
          .from(schema.stocksSang)
          .where(
            and(
              eq(schema.stocksSang.etablissementId, "etab-hz-nikki-01"),
              eq(schema.stocksSang.groupe, "O+")
            )
          );

        const quantiteInitiale = stockAvant ? stockAvant.quantitePoches : 0;

        // Déclenchement de 4 dons simultanés en concurrence
        const donsSimultanes = Array.from({ length: 4 }, () =>
          enregistrerDonSang({
            donneurNpi: DONNEUR_NPI_TEST,
            etablissementId: "etab-hz-nikki-01",
            typeDon: "PRELEVEMENT_REUSSI",
          })
        );

        const results = await Promise.allSettled(donsSimultanes);
        const reussis = results.filter((r) => r.status === "fulfilled").length;
        expect(reussis).toBe(4);

        // Lecture du stock final en base Neon
        const [stockApres] = await db
          .select()
          .from(schema.stocksSang)
          .where(
            and(
              eq(schema.stocksSang.etablissementId, "etab-hz-nikki-01"),
              eq(schema.stocksSang.groupe, "O+")
            )
          );

        // Preuve mathématique d'intégrité ACID : aucune mise à jour perdue !
        expect(stockApres.quantitePoches).toBe(quantiteInitiale + 4);
      },
      30000
    );

    it("Calcule la proximité géodésique Haversine des donneurs en cas d'urgence transfusionnelle", async () => {
      // Coordonnées de Nikki : lat 9.9400, lng 3.2108
      const donneursProches = await rechercherDonneursCompatibles({
        groupeRequis: "O+",
        lat: 9.9400,
        lng: 3.2108,
        rayonKm: 150,
      });

      expect(Array.isArray(donneursProches)).toBe(true);
      expect(donneursProches.length).toBeGreaterThan(0);
      expect(donneursProches[0].distanceKm).toBeLessThanOrEqual(150);
    });
  });
});
