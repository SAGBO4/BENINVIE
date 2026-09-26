import { describe, expect, it } from "vitest";

import type { DonorActivity } from "@/lib/api/resources";

import { MIN_DAYS_BETWEEN_DONATIONS, summarizeDonations } from "./history";

const DAY_MS = 86_400_000;
const NOW = new Date("2026-06-01T12:00:00.000Z");

function activity(
  activityType: DonorActivity["activityType"],
  daysAgo: number,
): DonorActivity {
  return {
    id: `${activityType}-${daysAgo}`,
    activityType,
    description: null,
    createdAt: new Date(NOW.getTime() - daysAgo * DAY_MS).toISOString(),
  };
}

describe("summarizeDonations", () => {
  it("treats a donor with no activity as eligible and without history", () => {
    const result = summarizeDonations([], NOW);

    expect(result.donationCount).toBe(0);
    expect(result.lastDonationAt).toBeNull();
    expect(result.nextEligibleAt).toBeNull();
    expect(result.eligible).toBe(true);
  });

  it("counts only blood donations, not referrals or awareness sessions", () => {
    const result = summarizeDonations(
      [
        activity("blood_donation", 200),
        activity("referral", 10),
        activity("awareness_session", 5),
        activity("blood_donation", 100),
      ],
      NOW,
    );

    expect(result.donationCount).toBe(2);
  });

  it("takes the most recent donation as the reference date", () => {
    const result = summarizeDonations(
      [activity("blood_donation", 200), activity("blood_donation", 30)],
      NOW,
    );

    expect(result.lastDonationAt?.toISOString()).toBe(
      new Date(NOW.getTime() - 30 * DAY_MS).toISOString(),
    );
  });

  it("defers a donor who gave less than the minimum interval ago", () => {
    const result = summarizeDonations([activity("blood_donation", 30)], NOW);

    expect(result.eligible).toBe(false);
    expect(result.daysUntilEligible).toBe(MIN_DAYS_BETWEEN_DONATIONS - 30);
  });

  it("makes a donor eligible again exactly on the interval boundary", () => {
    const result = summarizeDonations(
      [activity("blood_donation", MIN_DAYS_BETWEEN_DONATIONS)],
      NOW,
    );

    expect(result.eligible).toBe(true);
    expect(result.daysUntilEligible).toBe(0);
  });

  it("ignores activities carrying an unparsable date", () => {
    const broken: DonorActivity = {
      id: "broken",
      activityType: "blood_donation",
      description: null,
      createdAt: "pas une date",
    };

    const result = summarizeDonations(
      [broken, activity("blood_donation", 10)],
      NOW,
    );

    expect(result.donationCount).toBe(1);
  });
});
