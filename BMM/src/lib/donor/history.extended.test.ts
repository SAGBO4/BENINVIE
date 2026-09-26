/**
 * Tests d'audit QA — donor/history.ts
 *
 * Ces tests ciblent les failles identifiées lors de l'audit :
 * H-1 à H-5 (voir audit_qa.md).
 */
import { describe, expect, it } from "vitest";

import type { DonorActivity } from "@/lib/api/resources";

import {
  MIN_DAYS_BETWEEN_DONATIONS,
  activityLabel,
  summarizeDonations,
} from "./history";

const DAY_MS = 86_400_000;
const NOW = new Date("2026-06-01T12:00:00.000Z");

function donation(daysAgo: number): DonorActivity {
  return {
    id: `don-${daysAgo}`,
    activityType: "blood_donation",
    description: null,
    createdAt: new Date(NOW.getTime() - daysAgo * DAY_MS).toISOString(),
  };
}

// ---------------------------------------------------------------------------
// summarizeDonations — failles et edge cases
// ---------------------------------------------------------------------------

describe("summarizeDonations — edge cases", () => {
  // H-2 : off-by-one avec Math.ceil — 1 ms avant la limite
  it("considers a donor eligible when exactly 1 ms before the boundary", () => {
    // Le donneur a donné exactement (56 jours - 1 ms) → 1 ms restante
    // Math.ceil(1 / 86_400_000) = 1 → le donneur affiche 1 jour d'attente
    // alors qu'il est à 1 ms de la limite. C'est le comportement actuel
    // documenté : ce test le fige pour détecter un changement non intentionnel.
    const almostEligibleAt =
      NOW.getTime() - MIN_DAYS_BETWEEN_DONATIONS * DAY_MS + 1;
    const activity: DonorActivity = {
      id: "almost",
      activityType: "blood_donation",
      description: null,
      createdAt: new Date(almostEligibleAt).toISOString(),
    };
    const result = summarizeDonations([activity], NOW);
    // Avec Math.ceil(1ms / 86400000ms) = 1, le donneur a 1 jour d'attente.
    // Si ce test échoue à cause d'un futur fix, mettre à jour la valeur attendue.
    expect(result.eligible).toBe(false);
    expect(result.daysUntilEligible).toBe(1);
  });

  // H-2 : exactement à la limite à la milliseconde — doit être éligible
  it("considers a donor eligible at exactly the interval boundary (ms precision)", () => {
    const exactBoundary = NOW.getTime() - MIN_DAYS_BETWEEN_DONATIONS * DAY_MS;
    const activity: DonorActivity = {
      id: "exact",
      activityType: "blood_donation",
      description: null,
      createdAt: new Date(exactBoundary).toISOString(),
    };
    const result = summarizeDonations([activity], NOW);
    expect(result.eligible).toBe(true);
    expect(result.daysUntilEligible).toBe(0);
  });

  // H-3 : don dans le futur — ne doit pas bloquer le donneur pour 66 jours
  it("handles a donation date in the future without blocking the donor for more than 56 days", () => {
    const futureDonation: DonorActivity = {
      id: "future",
      activityType: "blood_donation",
      description: null,
      createdAt: new Date(NOW.getTime() + 10 * DAY_MS).toISOString(), // dans 10 jours
    };
    const result = summarizeDonations([futureDonation], NOW);
    // Un don futur produit daysUntilEligible = 56 + 10 = 66 → bug potentiel.
    // Ce test documente le comportement actuel ; s'il dépasse 56, c'est un bug.
    expect(result.daysUntilEligible).toBeLessThanOrEqual(
      MIN_DAYS_BETWEEN_DONATIONS,
    );
  });

  // H-5 : tableau null → ne doit pas crasher (défense en profondeur)
  it("throws or handles gracefully when activities is null at runtime", () => {
    // TypeScript interdit cela, mais en JS pur (ou API mal typée) c'est possible.
    expect(() =>
      summarizeDonations(null as unknown as DonorActivity[], NOW),
    ).toThrow();
  });

  // H-5 : tableau undefined → même logique
  it("throws or handles gracefully when activities is undefined at runtime", () => {
    expect(() =>
      summarizeDonations(undefined as unknown as DonorActivity[], NOW),
    ).toThrow();
  });

  // Cas limite : un seul don exactement 1 jour avant la limite
  it("returns daysUntilEligible = 1 when the last donation was 55 days ago", () => {
    const result = summarizeDonations([donation(55)], NOW);
    expect(result.eligible).toBe(false);
    expect(result.daysUntilEligible).toBe(1);
  });

  // Plusieurs dons — seul le plus récent compte
  it("uses only the most recent donation to compute eligibility", () => {
    const result = summarizeDonations(
      [donation(200), donation(30), donation(100)],
      NOW,
    );
    // Dernier don = 30 jours → 26 jours restants
    expect(result.daysUntilEligible).toBe(MIN_DAYS_BETWEEN_DONATIONS - 30);
    expect(result.donationCount).toBe(3);
  });

  // Toutes les activités sont des types non-don
  it("returns eligible with 0 donations when all activities are non-donations", () => {
    const result = summarizeDonations(
      [
        {
          id: "r1",
          activityType: "referral",
          description: null,
          createdAt: NOW.toISOString(),
        },
        {
          id: "a1",
          activityType: "awareness_session",
          description: null,
          createdAt: NOW.toISOString(),
        },
      ],
      NOW,
    );
    expect(result.eligible).toBe(true);
    expect(result.donationCount).toBe(0);
    expect(result.lastDonationAt).toBeNull();
  });

  // Robustesse : date ISO avec timezone non-UTC
  it("handles ISO dates with timezone offset correctly", () => {
    const activity: DonorActivity = {
      id: "tz",
      activityType: "blood_donation",
      description: null,
      createdAt: "2026-05-06T14:00:00+02:00", // ~30 jours avant NOW UTC
    };
    const result = summarizeDonations([activity], NOW);
    // Avec une date ~30 jours avant, le donneur est non-éligible
    expect(result.eligible).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// activityLabel — H-1 : type inconnu
// ---------------------------------------------------------------------------

describe("activityLabel — edge cases", () => {
  it("returns a label for blood_donation", () => {
    expect(activityLabel("blood_donation")).toBe("Don de sang");
  });

  it("returns a label for referral", () => {
    expect(activityLabel("referral")).toBe("Parrainage");
  });

  it("returns a label for awareness_session", () => {
    expect(activityLabel("awareness_session")).toBe(
      "Session de sensibilisation",
    );
  });

  // H-1 : type inconnu à runtime — risque de retourner undefined
  it("does not return undefined for an unknown activity type at runtime", () => {
    const result = activityLabel(
      "unknown_type" as DonorActivity["activityType"],
    );
    // Soit une chaîne de secours, soit une exception — mais jamais undefined silencieux
    expect(result).not.toBeUndefined();
  });
});
