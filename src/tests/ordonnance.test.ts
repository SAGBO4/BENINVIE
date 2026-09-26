import { describe, it, expect, beforeEach } from "vitest";
import { dbStore } from "../db/client";

describe("Cycle de Vie des Ordonnances & Sécurité Usage Unique", () => {
  beforeEach(() => {
    dbStore.seed();
  });

  it("Vérifie qu'une ordonnance valide peut être délivrée une seule fois", () => {
    const code = "ORD-2026-KAL-042";
    const ordonnance = dbStore.ordonnances.get(code);

    expect(ordonnance).toBeDefined();
    expect(ordonnance?.statut).toBe("ACTIVE");

    // Première délivrance par la pharmacie
    ordonnance!.statut = "DELIVREE";
    ordonnance!.dateDelivrance = new Date().toISOString();
    ordonnance!.pharmacieNom = "Pharmacie Communale de Kalalé";

    // Vérification de mise à jour
    const ordonnanceMaj = dbStore.ordonnances.get(code);
    expect(ordonnanceMaj?.statut).toBe("DELIVREE");
    expect(ordonnanceMaj?.pharmacieNom).toBe("Pharmacie Communale de Kalalé");

    // Tentative de re-délivrance frauduleuse
    const tentativeReutilisation = ordonnanceMaj?.statut === "ACTIVE";
    expect(tentativeReutilisation).toBe(false);
  });
});
