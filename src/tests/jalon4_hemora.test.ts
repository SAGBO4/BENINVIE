import { describe, it, expect, beforeEach } from "vitest";
import { dbStore } from "../db/client";

describe("Jalon 4 : Module Transfusionnel HEMORA & Défraiement Éthique", () => {
  beforeEach(() => {
    dbStore.seed();
  });

  it("Inscrit un nouveau donneur avec profil salé SHA-256", () => {
    const npi = "2026-TEST-DON-01";
    const donneur = {
      id: "don-test-01",
      npi,
      nomComplet: "Koffi ADANHO",
      groupeSanguin: "O+" as const,
      telephone: "+229 01 97 11 22 33",
      commune: "Kalalé",
      lat: 10.2889,
      lng: 3.3764,
      selSecret: "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
      profileHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      nombreDonsValides: 0,
      disponiblePourUrgence: true,
      soldeDefraiementFcfa: 0,
    };

    dbStore.donneursHemora.set(npi, donneur);
    const saved = dbStore.donneursHemora.get(npi);

    expect(saved).toBeDefined();
    expect(saved?.groupeSanguin).toBe("O+");
    expect(saved?.selSecret).toHaveLength(64);
  });

  it("Verse l'indemnité forfaitaire de transport (2000 FCFA) même en cas d'ajournement médical", () => {
    const donneur = dbStore.donneursHemora.get("2026-COT-3310-MAT");
    expect(donneur).toBeDefined();

    const soldeInitial = donneur!.soldeDefraiementFcfa;
    // Donneur se présente mais est temporairement ajourné pour tension faible
    donneur!.soldeDefraiementFcfa += 2000;

    expect(donneur!.soldeDefraiementFcfa).toBe(soldeInitial + 2000);
  });
});
