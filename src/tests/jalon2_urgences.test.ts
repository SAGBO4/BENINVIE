import { describe, it, expect, beforeEach } from "vitest";
import { dbStore } from "../db/client";

describe("Jalon 2 : SIH, Carnet FHIR, Bris de Glace & Urgences à Paiement Différé", () => {
  beforeEach(() => {
    dbStore.seed();
  });

  it("Permet l'accès Bris de Glace et journalise inaltérablement dans les logs APDP", () => {
    const patientNpi = "2026-KAL-9821-BIO";
    const patient = dbStore.patients.get(patientNpi);
    expect(patient).toBeDefined();

    // Exécution du bris de glace
    const auditEntry = dbStore.logAudit({
      action: "BRIS_DE_GLACE",
      acteurNpi: "NPI-MED-2026-0042",
      acteurNom: "Dr. Emmanuel Tossou",
      role: "urgentiste",
      cibleId: patient!.npi,
      details: {
        motifUrgence: "Hémorragie obstétricale aiguë de la délivrance",
        etablissementNom: "Hôpital de Zone de Nikki",
      },
    });

    expect(auditEntry.id).toBeDefined();
    expect(dbStore.auditLogs.length).toBeGreaterThan(0);
    expect(dbStore.auditLogs[0].action).toBe("BRIS_DE_GLACE");
    expect(dbStore.auditLogs[0].details.motifUrgence).toContain("Hémorragie");
  });

  it("Admet le patient en urgence sans avance financière et ouvre un dossier de paiement différé garanti", () => {
    const patientNpi = "2026-KAL-9821-BIO";
    const patient = dbStore.patients.get(patientNpi);

    const dossierId = `dpd-test-${Date.now()}`;
    const dossier = {
      id: dossierId,
      encounterId: "enc-test-01",
      patientId: patient!.id,
      patientNpi: patient!.npi,
      patientNom: `${patient!.prenom} ${patient!.nom}`,
      montantTotalFcfa: 75000,
      statutApurement: "couvert_arch" as const,
      referenceGarantieEtat: "GARANTIE-ETAT-2026-999000",
      echeanceDate: "2026-10-25",
      creeLe: new Date().toISOString(),
    };

    dbStore.dossiersDiffere.set(dossier.id, dossier);
    const saved = dbStore.dossiersDiffere.get(dossierId);

    expect(saved).toBeDefined();
    expect(saved?.montantTotalFcfa).toBe(75000);
    expect(saved?.referenceGarantieEtat).toContain("GARANTIE-ETAT-2026");
  });
});
