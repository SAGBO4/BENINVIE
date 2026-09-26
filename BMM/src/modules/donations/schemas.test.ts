/**
 * Tests exhaustifs pour src/modules/donations/schemas.ts
 *
 * Valide createDonationSchema (Zod) et DONATION_PURPOSES.
 */

import { describe, it, expect } from "vitest";

import {
  createDonationSchema,
  DONATION_PURPOSES,
} from "@/modules/donations/schemas";

// ─── DONATION_PURPOSES ───────────────────────────────────────────────────────

describe("DONATION_PURPOSES", () => {
  it("contient les quatre valeurs attendues", () => {
    expect(DONATION_PURPOSES).toContain("campaign");
    expect(DONATION_PURPOSES).toContain("development");
    expect(DONATION_PURPOSES).toContain("operations");
    expect(DONATION_PURPOSES).toContain("emergency");
    expect(DONATION_PURPOSES).toHaveLength(4);
  });
});

// ─── createDonationSchema ────────────────────────────────────────────────────

const validBase = { amountSats: 1000, purpose: "campaign" as const };

describe("createDonationSchema — amountSats", () => {
  it("amountSats = 100 → OK (minimum inclus)", () => {
    const result = createDonationSchema.safeParse({
      ...validBase,
      amountSats: 100,
    });
    expect(result.success).toBe(true);
  });

  it("amountSats = 100_000_000 → OK (maximum inclus)", () => {
    const result = createDonationSchema.safeParse({
      ...validBase,
      amountSats: 100_000_000,
    });
    expect(result.success).toBe(true);
  });

  it("amountSats < 100 (ex: 99) → erreur", () => {
    const result = createDonationSchema.safeParse({
      ...validBase,
      amountSats: 99,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/100 sats/i);
    }
  });

  it("amountSats > 100_000_000 (ex: 100_000_001) → erreur", () => {
    const result = createDonationSchema.safeParse({
      ...validBase,
      amountSats: 100_000_001,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/trop eleve/i);
    }
  });

  it("amountSats = 0 → erreur (en dessous du minimum)", () => {
    const result = createDonationSchema.safeParse({
      ...validBase,
      amountSats: 0,
    });
    expect(result.success).toBe(false);
  });

  it("amountSats négatif (ex: -100) → erreur", () => {
    const result = createDonationSchema.safeParse({
      ...validBase,
      amountSats: -100,
    });
    expect(result.success).toBe(false);
  });

  it("amountSats float (ex: 100.5) → erreur (doit être entier)", () => {
    const result = createDonationSchema.safeParse({
      ...validBase,
      amountSats: 100.5,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/entier/i);
    }
  });

  it("amountSats manquant → erreur", () => {
    const result = createDonationSchema.safeParse({ purpose: "campaign" });
    expect(result.success).toBe(false);
  });

  it("amountSats string → erreur", () => {
    const result = createDonationSchema.safeParse({
      ...validBase,
      amountSats: "1000",
    });
    expect(result.success).toBe(false);
  });
});

describe("createDonationSchema — purpose", () => {
  it.each(DONATION_PURPOSES)('purpose "%s" → OK', (purpose) => {
    const result = createDonationSchema.safeParse({ ...validBase, purpose });
    expect(result.success).toBe(true);
  });

  it("purpose hors enum → erreur", () => {
    const result = createDonationSchema.safeParse({
      ...validBase,
      purpose: "invalid_purpose",
    });
    expect(result.success).toBe(false);
  });

  it("purpose manquant → erreur", () => {
    const result = createDonationSchema.safeParse({ amountSats: 1000 });
    expect(result.success).toBe(false);
  });

  it("purpose vide → erreur", () => {
    const result = createDonationSchema.safeParse({
      ...validBase,
      purpose: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("createDonationSchema — message", () => {
  it("message absent → OK (optionnel)", () => {
    const result = createDonationSchema.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toBeUndefined();
    }
  });

  it("message = 280 chars → OK (maximum inclus)", () => {
    const msg280 = "a".repeat(280);
    const result = createDonationSchema.safeParse({
      ...validBase,
      message: msg280,
    });
    expect(result.success).toBe(true);
  });

  it("message = 281 chars → erreur (dépasse 280)", () => {
    const msg281 = "a".repeat(281);
    const result = createDonationSchema.safeParse({
      ...validBase,
      message: msg281,
    });
    expect(result.success).toBe(false);
  });

  it('message vide "" → OK (optionnel, chaîne vide autorisée)', () => {
    const result = createDonationSchema.safeParse({
      ...validBase,
      message: "",
    });
    expect(result.success).toBe(true);
  });

  it("message = 1 char → OK", () => {
    const result = createDonationSchema.safeParse({
      ...validBase,
      message: "x",
    });
    expect(result.success).toBe(true);
  });
});

describe("createDonationSchema — données complètes valides", () => {
  it("parsing complet avec toutes les propriétés → retourne les données typées", () => {
    const input = {
      amountSats: 50_000,
      purpose: "emergency" as const,
      message: "Don pour urgence pédiatrique",
    };
    const result = createDonationSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amountSats).toBe(50_000);
      expect(result.data.purpose).toBe("emergency");
      expect(result.data.message).toBe("Don pour urgence pédiatrique");
    }
  });
});
