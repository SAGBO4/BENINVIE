import { describe, it, expect } from "vitest";
import { generateSecureQrToken, verifyQrToken, resolveQrToken, hasRequiredAccessRole } from "../lib/qr-verify";

describe("BENINVIE - Système Cryptographique de QR Codes & Cartes Sécurisées", () => {
  it("génère un jeton QR sécurisé avec signature HMAC-SHA256 et empreinte scellée", () => {
    const qrData = generateSecureQrToken({
      type: "ORDONNANCE",
      id: "ORD-2026-TEST-001",
      patientNpi: "NPI-CIT-1995-1029",
      patientNom: "SAGBOHAN Chantal",
      rolesAutorises: ["PHARMACIEN", "ADMIN"],
      details: {
        medicaments: [
          {
            nom: "Fer Folate 60mg",
            dosage: "1 cp/jour",
            posologie: "30 jours",
            quantite: 30,
            remboursement: "100% ARCH",
          },
        ],
      },
    });

    expect(qrData.token).toBeDefined();
    expect(qrData.token.split(".")).toHaveLength(2);
    expect(qrData.sha256Seal).toMatch(/^0x[a-f0-9]{64}$/);
    expect(qrData.payload.otsProof).toContain("OTS-BTC-BJ-2026-");
  });

  it("valide avec succès un jeton authentique", () => {
    const qrData = generateSecureQrToken({
      type: "DONNEUR_HEMORA",
      id: "HEM-DON-TEST-8871",
      patientNpi: "109876543210",
      patientNom: "Sabi KORA",
      rolesAutorises: ["CNTS_AGENT", "MEDECIN", "ADMIN"],
      details: {
        groupeSanguin: "O+",
        rhesus: "RH+ (Positif)",
        nbDons: 8,
        statutDon: "APTE",
        pointsMoMo: 400,
      },
    });

    const result = verifyQrToken(qrData.token);
    expect(result.isValid).toBe(true);
    expect(result.isExpired).toBe(false);
    expect(result.payload?.id).toBe("HEM-DON-TEST-8871");
    expect(result.payload?.patientNom).toBe("Sabi KORA");
    expect(result.payload?.details.groupeSanguin).toBe("O+");
  });

  it("rejette tout jeton falsifié ou altéré (détection de fraude APDP)", () => {
    const qrData = generateSecureQrToken({
      type: "ORDONNANCE",
      id: "ORD-ORIGINAL",
      patientNpi: "NPI-ORIGINAL",
      patientNom: "Patient Test",
      rolesAutorises: ["PHARMACIEN"],
      details: {},
    });

    const [payloadBase64] = qrData.token.split(".");
    // Falsification de la signature
    const forgedToken = `${payloadBase64}.deadbeefcafebabedeadbeefcafebabe00000000000000000000000000000000`;

    const result = verifyQrToken(forgedToken);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Signature cryptographique invalide");
  });

  it("contrôle strictement les droits d'accès des acteurs de santé (RBAC)", () => {
    const ordonnancePayload = generateSecureQrToken({
      type: "ORDONNANCE",
      id: "ORD-SECRET",
      patientNpi: "NPI-001",
      patientNom: "Patient Secret",
      rolesAutorises: ["PHARMACIEN", "ADMIN"],
      details: {},
    }).payload;

    // Pharmacien agréé -> AUTORISÉ
    expect(hasRequiredAccessRole("PHARMACIEN", ordonnancePayload)).toBe(true);
    // Superviseur ARS ou ADMIN -> AUTORISÉ
    expect(hasRequiredAccessRole("ADMIN", ordonnancePayload)).toBe(true);
    expect(hasRequiredAccessRole("ARS", ordonnancePayload)).toBe(true);

    // Citoyen ou tiers non habilité -> STRICTEMENT REFUSÉ
    expect(hasRequiredAccessRole("CITOYEN", ordonnancePayload)).toBe(false);
    expect(hasRequiredAccessRole("VISITEUR", ordonnancePayload)).toBe(false);
    expect(hasRequiredAccessRole(undefined, ordonnancePayload)).toBe(false);
  });

  it("résout automatiquement les jetons scannés par douchette ou caméra (raccourcis scellés)", () => {
    // Scan d'une ordonnance
    const resOrd = resolveQrToken("ORD-2026-001-SCELLÉ");
    expect(resOrd.isValid).toBe(true);
    expect(resOrd.payload?.type).toBe("ORDONNANCE");
    expect(resOrd.payload?.id).toBe("ORD-2026-001");
    expect(resOrd.payload?.details.medicaments?.length).toBeGreaterThan(0);

    // Scan d'un passeport donneur HEMORA
    const resHemora = resolveQrToken("DONNEUR-109876543210-HEMORA");
    expect(resHemora.isValid).toBe(true);
    expect(resHemora.payload?.type).toBe("DONNEUR_HEMORA");
    expect(resHemora.payload?.details.groupeSanguin).toBe("O+");
    expect(resHemora.payload?.sha256Seal).toBeDefined();
  });
});
