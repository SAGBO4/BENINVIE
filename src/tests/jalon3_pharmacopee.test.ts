import { describe, it, expect, beforeEach } from "vitest";
import { dbStore } from "../db/client";
import { SOIGNANTS_REF, MEDICAMENTS_MTA_CERTIFIES } from "../data/referentiels";

describe("Jalon 3 : Pharmacopée Traditionnelle Innovante & Accréditation ARS", () => {
  beforeEach(() => {
    dbStore.seed();
  });

  it("Vérifie la présence des tradipraticiens accrédités ARS", () => {
    const tradis = SOIGNANTS_REF.filter((s) => s.type === "tradipraticien_accredite");
    expect(tradis.length).toBeGreaterThan(0);
    expect(tradis[0].numeroOrdre).toContain("ARS-TRADI");
  });

  it("Vérifie le catalogue des Médicaments Traditionnels Améliorés (MTA)", () => {
    expect(MEDICAMENTS_MTA_CERTIFIES.length).toBeGreaterThanOrEqual(3);
    const faca = MEDICAMENTS_MTA_CERTIFIES.find((m) => m.nom.includes("FACA"));
    expect(faca).toBeDefined();
    expect(faca?.certificationArs).toContain("ARS-MTA-HOMOLOGUE");
  });

  it("Valide l'émission d'une ordonnance MTA certifiée avec QR et empreinte", () => {
    const code = "ORD-TEST-MTA-999";
    dbStore.ordonnances.set(code, {
      id: "ord-test-999",
      code,
      patientNpi: "2026-KAL-9821-BIO",
      prescripteurNpi: "NPI-TRAD-2026-0091",
      prescripteurNom: "Dah Sèssinou Dako",
      etablissement: "Centre de Médecine Traditionnelle Intégrée",
      typeOrdonnance: "pharmacopee_certifiee",
      medicaments: [
        {
          nom: "Paludi-Tisane ARS",
          posologie: "1 sachet par jour en infusion",
          dureeJours: 7,
          certificationArsMta: "ARS-MTA-HOMOLOGUE-0045",
        },
      ],
      statut: "ACTIVE",
      dateEmission: "2026-09-25",
      qrPayload: `https://gbe.sante.gouv.bj/v/${code}`,
      empreinteHash: "0x1234abcd5678ef90",
    });

    const ord = dbStore.ordonnances.get(code);
    expect(ord).toBeDefined();
    expect(ord?.typeOrdonnance).toBe("pharmacopee_certifiee");
    expect(ord?.medicaments[0].certificationArsMta).toBeDefined();
  });
});
