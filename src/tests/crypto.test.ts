import { describe, it, expect } from "vitest";
import { buildProfileHash, verifyProfileHash, computeOrdonnanceHash, simulateOpenTimestampsAnchor } from "../lib/crypto";

describe("Couche Cryptographique & Conformité APDP", () => {
  it("Génère une empreinte salée reproductible avec son sel", () => {
    const profile = {
      npi: "2026-KAL-9821-BIO",
      groupe: "O+",
      rhesus: "+",
      laboratoire: "LABO-PARAKOU-01",
    };

    const res1 = buildProfileHash(profile);
    expect(res1.hash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(res1.salt).toHaveLength(64); // 32 octets en hex = 64 caractères

    // La vérification avec le même sel doit réussir
    const isValid = verifyProfileHash(profile, res1.salt, res1.hash);
    expect(isValid).toBe(true);

    // Une altération des données doit invalider l'empreinte
    const profileAltere = { ...profile, groupe: "AB+" };
    const isAlteredValid = verifyProfileHash(profileAltere, res1.salt, res1.hash);
    expect(isAlteredValid).toBe(false);
  });

  it("Garantit le droit à l'oubli cryptographique (APDP)", () => {
    const profile = { npi: "TEST-NPI", groupe: "B+" };
    const { hash, salt } = buildProfileHash(profile);

    // Si le sel est détruit / remplacé par un autre sel aléatoire
    const fauxSel = "0000000000000000000000000000000000000000000000000000000000000000";
    expect(verifyProfileHash(profile, fauxSel, hash)).toBe(false);
  });

  it("Génère une empreinte d'ordonnance unique infalsifiable", () => {
    const hash1 = computeOrdonnanceHash("ORD-2026-KAL-042", "NPI-01", "MED-01", "2026-09-24");
    const hash2 = computeOrdonnanceHash("ORD-2026-KAL-042", "NPI-01", "MED-01", "2026-09-24");
    const hashDiff = computeOrdonnanceHash("ORD-2026-KAL-043", "NPI-01", "MED-01", "2026-09-24");

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hashDiff);
  });

  it("Simule l'ancrage Merkle OpenTimestamps sur Bitcoin", () => {
    const hashes = ["0x1111", "0x2222", "0x3333"];
    const anchor = simulateOpenTimestampsAnchor(hashes);

    expect(anchor.merkleRoot).toMatch(/^0x[a-f0-9]{64}$/);
    expect(anchor.statut).toBe("CONFIRME");
    expect(anchor.bitcoinBlockEstimation).toBeGreaterThan(800000);
    expect(anchor.otsProof).toContain("OTS-PROOF-BTC-BENIN-2026");
  });
});
