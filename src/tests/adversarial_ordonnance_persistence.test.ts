import { describe, it, expect, beforeAll } from "vitest";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/drizzle";
import {
  delivrerOrdonnanceSecurisee,
  DeliveryConcurrencyError,
  ValidationError,
  NotFoundError,
} from "../services/ordonnance.service";

describe("Banc de Torture & Pentest Adversarial - Ordonnances Sécurisées (Zéro Mock)", () => {
  const TEST_ORD_CODE_NOMINAL = "ORD-TORTURE-NOMINAL-2026";
  const TEST_ORD_CODE_RACE = "ORD-TORTURE-RACE-2026";

  beforeAll(async () => {
    // Nettoyer les ordonnances de test si elles existent déjà
    await db.delete(schema.ordonnances).where(eq(schema.ordonnances.codeUnique, TEST_ORD_CODE_NOMINAL));
    await db.delete(schema.ordonnances).where(eq(schema.ordonnances.codeUnique, TEST_ORD_CODE_RACE));

    // Insérer les deux ordonnances réelles en base Neon PostgreSQL
    await db.insert(schema.ordonnances).values([
      {
        codeUnique: TEST_ORD_CODE_NOMINAL,
        patientNpi: "2026-NPI-TEST-001",
        praticienNpi: "NPI-MED-2026-0042",
        typePrescription: "CONVENTIONNELLE",
        medicaments: [{ nom: "Amoxicilline 500mg", dosage: "500mg", posologie: "1 matin et soir", dureeJours: 7 }],
        statut: "active",
        qrPayload: `https://gbe.sante.gouv.bj/v/${TEST_ORD_CODE_NOMINAL}`,
        empreinteHash: "0xdeadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
      },
      {
        codeUnique: TEST_ORD_CODE_RACE,
        patientNpi: "2026-NPI-TEST-002",
        praticienNpi: "NPI-MED-2026-0042",
        typePrescription: "CONVENTIONNELLE",
        medicaments: [{ nom: "Morphine Injectable 10mg", dosage: "10mg", posologie: "1 ampoule IV", dureeJours: 1 }],
        statut: "active",
        qrPayload: `https://gbe.sante.gouv.bj/v/${TEST_ORD_CODE_RACE}`,
        empreinteHash: "0xbadc0de1234567890abcdef1234567890abcdef1234567890abcdef12345678",
      },
    ]);
  });

  describe("1. Autopsie des failles d'entrée & Negative Testing destructif", () => {
    it("Rejette les payloads nuls, undefined ou de types pervertis", async () => {
      // @ts-expect-error test de coercition
      await expect(delivrerOrdonnanceSecurisee(null)).rejects.toThrow(ValidationError);
      // @ts-expect-error test de coercition
      await expect(delivrerOrdonnanceSecurisee(undefined)).rejects.toThrow(ValidationError);
      // @ts-expect-error test de coercition
      await expect(delivrerOrdonnanceSecurisee({ code: 12345 })).rejects.toThrow(ValidationError);
      await expect(delivrerOrdonnanceSecurisee({ code: "" })).rejects.toThrow(ValidationError);
      await expect(delivrerOrdonnanceSecurisee({ code: " " })).rejects.toThrow(ValidationError);
    });

    it("Rejette les codes d'ordonnance inexistants avec NotFoundError (404)", async () => {
      await expect(
        delivrerOrdonnanceSecurisee({ code: "ORD-INEXISTANTE-9999" })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("2. Cas nominal strict & Persistance ACID Neon PostgreSQL", () => {
    it("Délivre l'ordonnance valide pour la première fois avec horodatage et audit log réel", async () => {
      const result = await delivrerOrdonnanceSecurisee({
        code: `  ${TEST_ORD_CODE_NOMINAL}  `, // Test de tolérance aux espaces
        pharmacieNom: "Grande Pharmacie du Bénin (Cotonou)",
        pharmacieNpi: "NPI-PHARM-COT-001",
      });

      expect(result.codeUnique).toBe(TEST_ORD_CODE_NOMINAL);
      expect(result.statut).toBe("delivree");
      expect(result.pharmacieNom).toBe("Grande Pharmacie du Bénin (Cotonou)");
      expect(result.dateDelivrance).toBeDefined();

      // Vérification directe en base Neon PostgreSQL (zéro mock)
      const [inDb] = await db
        .select()
        .from(schema.ordonnances)
        .where(eq(schema.ordonnances.codeUnique, TEST_ORD_CODE_NOMINAL));

      expect(inDb).toBeDefined();
      expect(inDb.statut).toBe("delivree");
      expect(inDb.pharmacieNom).toBe("Grande Pharmacie du Bénin (Cotonou)");

      // Vérification de la présence de l'audit log immuable
      const logs = await db
        .select()
        .from(schema.auditLogs)
        .where(eq(schema.auditLogs.cibleId, TEST_ORD_CODE_NOMINAL));

      expect(logs.length).toBeGreaterThanOrEqual(1);
      expect(logs[0].action).toBe("DELIVRANCE_ORDONNANCE");
    });

    it("Bloque impérativement toute tentative ultérieure de re-délivrance (Anti-fraude)", async () => {
      // Tentative frauduleuse de réutilisation de l'ordonnance déjà délivrée
      await expect(
        delivrerOrdonnanceSecurisee({
          code: TEST_ORD_CODE_NOMINAL,
          pharmacieNom: "Pharmacie Pirate ou Duplicata",
        })
      ).rejects.toThrow(DeliveryConcurrencyError);
    });
  });

  describe("3. Attaque par Concurrence Massif (Race Condition Torture Test)", () => {
    it(
      "Empêche la double-délivrance face à 5 requêtes simultanées (SELECT ... FOR UPDATE)",
      async () => {
        // Simulation d'une attaque de rejeu : 5 officines distinctes tentent d'honorer la même ordonnance
        // au même instant T dans des connexions parallèles
        const concurrences = Array.from({ length: 5 }, (_, i) =>
          delivrerOrdonnanceSecurisee({
            code: TEST_ORD_CODE_RACE,
            pharmacieNom: `Officine Concurrente n°${i + 1}`,
            pharmacieNpi: `NPI-PHARM-ATTACK-${i + 1}`,
          })
        );

        const results = await Promise.allSettled(concurrences);

        const successCount = results.filter((r) => r.status === "fulfilled").length;
        const rejectedCount = results.filter((r) => r.status === "rejected").length;

        // Invariant de sécurité mathématique : EXACTEMENT 1 succès, EXACTEMENT 4 échecs
        expect(successCount).toBe(1);
        expect(rejectedCount).toBe(4);

        // Vérifier que tous les rejets sont des DeliveryConcurrencyError
        const rejectionErrors = results
          .filter((r): r is PromiseRejectedResult => r.status === "rejected")
          .map((r) => r.reason);

        for (const err of rejectionErrors) {
          expect(err).toBeInstanceOf(DeliveryConcurrencyError);
        }

        // Vérification finale en base de données réelle
        const [finalOrd] = await db
          .select()
          .from(schema.ordonnances)
          .where(eq(schema.ordonnances.codeUnique, TEST_ORD_CODE_RACE));

        expect(finalOrd.statut).toBe("delivree");
      },
      30000
    );
  });
});
