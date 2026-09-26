import { vi, describe, it, expect, beforeEach } from "vitest";
import { matchingService } from "./matching.service";
import type { DonorRecord } from "@/modules/donors";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Builds a minimal valid DonorRecord. Override fields as needed. */
function makeDonor(
  overrides: Partial<DonorRecord> & { id: string },
): DonorRecord {
  return {
    firstName: "Test",
    lastName: "Donor",
    email: `${overrides.id}@test.com`,
    phoneNumber: "+221700000000",
    bloodType: "O-",
    city: "Dakar",
    latitude: 14.6928,
    longitude: -17.4467,
    age: 30,
    available: true,
    bitcoinAddress: "bc1q...",
    profileHash: "a".repeat(64),
    otsProof: null,
    validated: true,
    createdAt: new Date("2024-01-01"),
    balanceSats: 0,
    cardType: "virtual",
    physicalCardStatus: "none",
    referredBy: null,
    ...overrides,
  };
}

// Reference point: Dakar city centre
const REF_LAT = 14.6928;
const REF_LON = -17.4467;

// ─────────────────────────────────────────────────────────────────────────────
// findMatchingDonors — pure function (NO mocks needed)
// ─────────────────────────────────────────────────────────────────────────────

describe("matchingService.findMatchingDonors", () => {
  // ── Input edge cases ───────────────────────────────────────────────────────

  describe("requestedType edge cases", () => {
    it("returns [] for an unknown blood type (e.g. 'XX')", () => {
      const donor = makeDonor({ id: "d1", bloodType: "O-", available: true });
      const result = matchingService.findMatchingDonors(
        "XX",
        REF_LAT,
        REF_LON,
        [donor],
      );
      expect(result).toEqual([]);
    });

    it("returns [] for requestedType = null (cast as string)", () => {
      const donor = makeDonor({ id: "d1", bloodType: "O-", available: true });
      // TypeScript won't allow null directly; we cast to simulate a runtime bug
      const result = matchingService.findMatchingDonors(
        null as unknown as string,
        REF_LAT,
        REF_LON,
        [donor],
      );
      expect(result).toEqual([]);
    });

    it("returns [] for requestedType = undefined (cast as string)", () => {
      const donor = makeDonor({ id: "d1", bloodType: "O-", available: true });
      const result = matchingService.findMatchingDonors(
        undefined as unknown as string,
        REF_LAT,
        REF_LON,
        [donor],
      );
      expect(result).toEqual([]);
    });

    it("returns [] for requestedType = '' (empty string)", () => {
      const donor = makeDonor({ id: "d1", bloodType: "O-", available: true });
      const result = matchingService.findMatchingDonors("", REF_LAT, REF_LON, [
        donor,
      ]);
      expect(result).toEqual([]);
    });
  });

  describe("donors array edge cases", () => {
    it("returns [] when donors = []", () => {
      const result = matchingService.findMatchingDonors(
        "O-",
        REF_LAT,
        REF_LON,
        [],
      );
      expect(result).toEqual([]);
    });

    it("excludes donors with available = false", () => {
      const donor = makeDonor({ id: "d1", bloodType: "O-", available: false });
      const result = matchingService.findMatchingDonors(
        "O-",
        REF_LAT,
        REF_LON,
        [donor],
      );
      expect(result).toEqual([]);
    });

    it("excludes donors with incompatible bloodType", () => {
      // O- can only receive from O-. A+ donor is not compatible.
      const donor = makeDonor({ id: "d1", bloodType: "A+", available: true });
      const result = matchingService.findMatchingDonors(
        "O-",
        REF_LAT,
        REF_LON,
        [donor],
      );
      expect(result).toEqual([]);
    });

    it("excludes donors that are both incompatible AND unavailable", () => {
      const donor = makeDonor({ id: "d1", bloodType: "B+", available: false });
      const result = matchingService.findMatchingDonors(
        "O-",
        REF_LAT,
        REF_LON,
        [donor],
      );
      expect(result).toEqual([]);
    });
  });

  // ── NaN coordinates ────────────────────────────────────────────────────────

  describe("NaN coordinates — haversineDistance returns NaN → sort becomes unstable", () => {
    it("handles donors with NaN latitude without crashing", () => {
      const d1 = makeDonor({
        id: "d1",
        bloodType: "O-",
        available: true,
        latitude: NaN,
      });
      const d2 = makeDonor({
        id: "d2",
        bloodType: "O-",
        available: true,
        latitude: 14.7,
      });
      // Should not throw; the sort may be unstable but the call succeeds
      expect(() =>
        matchingService.findMatchingDonors("O-", REF_LAT, REF_LON, [d1, d2]),
      ).not.toThrow();
    });

    it("handles donors with NaN longitude without crashing", () => {
      const d1 = makeDonor({
        id: "d1",
        bloodType: "O-",
        available: true,
        longitude: NaN,
      });
      expect(() =>
        matchingService.findMatchingDonors("O-", REF_LAT, REF_LON, [d1]),
      ).not.toThrow();
    });
  });

  // ── Limit to 10 results ────────────────────────────────────────────────────

  describe("result limit", () => {
    it("returns at most 10 results even when 20 compatible donors exist", () => {
      const donors = Array.from({ length: 20 }, (_, i) =>
        makeDonor({
          id: `d${i}`,
          bloodType: "O-",
          available: true,
          latitude: REF_LAT + i * 0.01,
        }),
      );
      const result = matchingService.findMatchingDonors(
        "O-",
        REF_LAT,
        REF_LON,
        donors,
      );
      expect(result).toHaveLength(10);
    });

    it("returns all results when fewer than 10 compatible donors exist", () => {
      const donors = Array.from({ length: 5 }, (_, i) =>
        makeDonor({
          id: `d${i}`,
          bloodType: "O-",
          available: true,
          latitude: REF_LAT + i * 0.01,
        }),
      );
      const result = matchingService.findMatchingDonors(
        "O-",
        REF_LAT,
        REF_LON,
        donors,
      );
      expect(result).toHaveLength(5);
    });
  });

  // ── Sort by distance ───────────────────────────────────────────────────────

  describe("sorting by distance (ascending)", () => {
    it("places the closest donor first", () => {
      const near = makeDonor({
        id: "near",
        bloodType: "O-",
        available: true,
        latitude: REF_LAT + 0.01,
        longitude: REF_LON,
      });
      const far = makeDonor({
        id: "far",
        bloodType: "O-",
        available: true,
        latitude: REF_LAT + 1.0,
        longitude: REF_LON,
      });
      const result = matchingService.findMatchingDonors(
        "O-",
        REF_LAT,
        REF_LON,
        [far, near],
      );
      expect(result[0].id).toBe("near");
      expect(result[1].id).toBe("far");
    });

    it("places a donor at the exact same coordinates first (distance = 0)", () => {
      const atSamePoint = makeDonor({
        id: "same",
        bloodType: "O-",
        available: true,
        latitude: REF_LAT,
        longitude: REF_LON,
      });
      const nearby = makeDonor({
        id: "near",
        bloodType: "O-",
        available: true,
        latitude: REF_LAT + 0.5,
        longitude: REF_LON,
      });
      const result = matchingService.findMatchingDonors(
        "O-",
        REF_LAT,
        REF_LON,
        [nearby, atSamePoint],
      );
      expect(result[0].id).toBe("same");
      expect(result[0].distanceKm).toBeCloseTo(0, 5);
    });

    it("attaches distanceKm to each result", () => {
      const donor = makeDonor({
        id: "d1",
        bloodType: "O-",
        available: true,
        latitude: REF_LAT,
        longitude: REF_LON,
      });
      const [r] = matchingService.findMatchingDonors("O-", REF_LAT, REF_LON, [
        donor,
      ]);
      expect(typeof r.distanceKm).toBe("number");
    });

    it("sorts multiple donors in strictly ascending distance order", () => {
      const donors = [
        makeDonor({
          id: "c",
          bloodType: "O-",
          available: true,
          latitude: REF_LAT + 0.3,
          longitude: REF_LON,
        }),
        makeDonor({
          id: "a",
          bloodType: "O-",
          available: true,
          latitude: REF_LAT + 0.1,
          longitude: REF_LON,
        }),
        makeDonor({
          id: "b",
          bloodType: "O-",
          available: true,
          latitude: REF_LAT + 0.2,
          longitude: REF_LON,
        }),
      ];
      const result = matchingService.findMatchingDonors(
        "O-",
        REF_LAT,
        REF_LON,
        donors,
      );
      expect(result.map((r) => r.id)).toEqual(["a", "b", "c"]);
      for (let i = 1; i < result.length; i++) {
        expect(result[i].distanceKm).toBeGreaterThanOrEqual(
          result[i - 1].distanceKm,
        );
      }
    });
  });

  // ── Blood-type compatibility table — exhaustive coverage ──────────────────

  describe("compatibility table — all 8 blood groups", () => {
    /** Donor pool: one available donor of each blood type at the same location */
    function allTypeDonors(): DonorRecord[] {
      return (["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] as const).map(
        (bt, i) =>
          makeDonor({
            id: bt,
            bloodType: bt,
            available: true,
            latitude: REF_LAT,
            longitude: REF_LON + i * 0.001,
          }),
      );
    }

    const EXPECTED_DONORS: Record<string, string[]> = {
      "O-": ["O-"],
      "O+": ["O-", "O+"],
      "A-": ["O-", "A-"],
      "A+": ["O-", "O+", "A-", "A+"],
      "B-": ["O-", "B-"],
      "B+": ["O-", "O+", "B-", "B+"],
      "AB-": ["O-", "A-", "B-", "AB-"],
      "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    };

    for (const [recipient, donors] of Object.entries(EXPECTED_DONORS)) {
      it(`${recipient} accepts exactly [${donors.join(", ")}]`, () => {
        const result = matchingService.findMatchingDonors(
          recipient,
          REF_LAT,
          REF_LON,
          allTypeDonors(),
        );
        const returnedTypes = result.map((r) => r.bloodType).sort();
        expect(returnedTypes).toEqual([...donors].sort());
      });
    }
  });

  describe("key compatibility assertions", () => {
    it("AB+ (universal recipient) accepts all 8 blood groups", () => {
      const donors = (
        ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] as const
      ).map((bt) => makeDonor({ id: bt, bloodType: bt, available: true }));
      const result = matchingService.findMatchingDonors(
        "AB+",
        REF_LAT,
        REF_LON,
        donors,
      );
      expect(result).toHaveLength(8);
    });

    it("O- (universal donor) only accepts O- donors", () => {
      const donors = (
        ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] as const
      ).map((bt) => makeDonor({ id: bt, bloodType: bt, available: true }));
      const result = matchingService.findMatchingDonors(
        "O-",
        REF_LAT,
        REF_LON,
        donors,
      );
      expect(result).toHaveLength(1);
      expect(result[0].bloodType).toBe("O-");
    });

    it("requestedType 'O-' does NOT include O+ donors", () => {
      const oPlusDonor = makeDonor({
        id: "d1",
        bloodType: "O+",
        available: true,
      });
      const result = matchingService.findMatchingDonors(
        "O-",
        REF_LAT,
        REF_LON,
        [oPlusDonor],
      );
      expect(result).toEqual([]);
    });

    it("requestedType 'A-' does NOT include A+ donors (Rh incompatibility)", () => {
      const aPlusDonor = makeDonor({
        id: "d1",
        bloodType: "A+",
        available: true,
      });
      const result = matchingService.findMatchingDonors(
        "A-",
        REF_LAT,
        REF_LON,
        [aPlusDonor],
      );
      expect(result).toEqual([]);
    });

    it("includes only available AND compatible donors when mixing both criteria", () => {
      const compatible_available = makeDonor({
        id: "ca",
        bloodType: "O-",
        available: true,
      });
      const compatible_unavailable = makeDonor({
        id: "cu",
        bloodType: "O-",
        available: false,
      });
      const incompatible_available = makeDonor({
        id: "ia",
        bloodType: "A+",
        available: true,
      });
      const result = matchingService.findMatchingDonors(
        "O-",
        REF_LAT,
        REF_LON,
        [compatible_available, compatible_unavailable, incompatible_available],
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("ca");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// findAIEmergencyMatching — requires mocking DB dependencies
// ─────────────────────────────────────────────────────────────────────────────

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/modules/donors", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/donors")>();
  return {
    ...actual,
    donorService: {
      ...actual.donorService,
      getAllAvailableDonors: vi.fn(),
    },
  };
});

describe("matchingService.findAIEmergencyMatching", () => {
  let mockGetAllAvailableDonors: ReturnType<typeof vi.fn>;
  let mockSupabaseFrom: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    const { createSupabaseServerClient } =
      await import("@/lib/supabase/server");
    const { donorService } = await import("@/modules/donors");

    mockGetAllAvailableDonors =
      donorService.getAllAvailableDonors as ReturnType<typeof vi.fn>;

    const mockEq = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    mockSupabaseFrom = vi.fn(() => ({ select: mockSelect }));

    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      from: mockSupabaseFrom,
    });
  });

  it("returns [] when no compatible donors exist", async () => {
    mockGetAllAvailableDonors.mockResolvedValue([]);
    const result = await matchingService.findAIEmergencyMatching(
      "O-",
      REF_LAT,
      REF_LON,
    );
    expect(result).toEqual([]);
  });

  it("returns [] when compatible donors exist but all have incompatible blood type", async () => {
    const incompatible = makeDonor({
      id: "d1",
      bloodType: "A+",
      available: true,
    });
    mockGetAllAvailableDonors.mockResolvedValue([incompatible]);
    const result = await matchingService.findAIEmergencyMatching(
      "O-",
      REF_LAT,
      REF_LON,
    );
    expect(result).toEqual([]);
  });

  it("scores include distanceKm, score (0-100), explanation and historyCount fields", async () => {
    const donor = makeDonor({
      id: "d1",
      bloodType: "O-",
      available: true,
      latitude: REF_LAT,
      longitude: REF_LON,
    });
    mockGetAllAvailableDonors.mockResolvedValue([donor]);
    const [r] = await matchingService.findAIEmergencyMatching(
      "O-",
      REF_LAT,
      REF_LON,
    );
    expect(typeof r.distanceKm).toBe("number");
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(typeof r.explanation).toBe("string");
    expect(r.explanation.length).toBeGreaterThan(0);
    expect(typeof r.historyCount).toBe("number");
  });

  it("gives a higher score to a closer donor (all else equal)", async () => {
    const near = makeDonor({
      id: "near",
      bloodType: "O-",
      available: true,
      latitude: REF_LAT + 0.01,
      longitude: REF_LON,
    });
    const far = makeDonor({
      id: "far",
      bloodType: "O-",
      available: true,
      latitude: REF_LAT + 2.0,
      longitude: REF_LON,
    });
    mockGetAllAvailableDonors.mockResolvedValue([far, near]);
    const results = await matchingService.findAIEmergencyMatching(
      "O-",
      REF_LAT,
      REF_LON,
    );
    const nearResult = results.find((r) => r.id === "near")!;
    const farResult = results.find((r) => r.id === "far")!;
    expect(nearResult.score).toBeGreaterThanOrEqual(farResult.score);
  });

  it("gives +30 blood rarity bonus for exact match over substitute donor", async () => {
    // Both at same non-zero distance (~11km) to isolate blood rarity without saturating the 100 pt cap
    const exactMatch = makeDonor({
      id: "exact",
      bloodType: "A+",
      available: true,
      latitude: REF_LAT + 0.1,
      longitude: REF_LON,
    });
    const substitute = makeDonor({
      id: "subs",
      bloodType: "O-",
      available: true,
      latitude: REF_LAT + 0.1,
      longitude: REF_LON,
    });
    mockGetAllAvailableDonors.mockResolvedValue([substitute, exactMatch]);
    const results = await matchingService.findAIEmergencyMatching(
      "A+",
      REF_LAT,
      REF_LON,
    );
    const exact = results.find((r) => r.id === "exact")!;
    const subs = results.find((r) => r.id === "subs")!;
    // Exact match gets bloodRarityWeight=30; substitute gets 0
    expect(exact.score).toBeGreaterThan(subs.score);
  });

  it("gives history bonus proportional to donation count (max 40 pts at 4+ donations)", async () => {
    const { createSupabaseServerClient } =
      await import("@/lib/supabase/server");
    const donor = makeDonor({
      id: "vet",
      bloodType: "O-",
      available: true,
      latitude: REF_LAT,
      longitude: REF_LON,
    });
    mockGetAllAvailableDonors.mockResolvedValue([donor]);

    // Simulate 4 completed reward_logs for this donor
    const mockEq = vi.fn().mockResolvedValue({
      data: [
        { donor_id: "vet" },
        { donor_id: "vet" },
        { donor_id: "vet" },
        { donor_id: "vet" },
      ],
      error: null,
    });
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      from: vi.fn(() => ({ select: mockSelect })),
    });

    const [r] = await matchingService.findAIEmergencyMatching(
      "O-",
      REF_LAT,
      REF_LON,
    );
    expect(r.historyCount).toBe(4);
    // historyBonus = min(40, 4*10) = 40. Distance=0 → distanceScore=100. Total = 100+0+40 → capped at 100.
    expect(r.score).toBe(100);
  });

  it("results are sorted by score descending", async () => {
    const d1 = makeDonor({
      id: "d1",
      bloodType: "O-",
      available: true,
      latitude: REF_LAT,
      longitude: REF_LON,
    });
    const d2 = makeDonor({
      id: "d2",
      bloodType: "O-",
      available: true,
      latitude: REF_LAT + 5.0,
      longitude: REF_LON,
    });
    mockGetAllAvailableDonors.mockResolvedValue([d2, d1]);
    const results = await matchingService.findAIEmergencyMatching(
      "O-",
      REF_LAT,
      REF_LON,
    );
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
    }
  });

  it("returns at most 10 results even when many candidates exist", async () => {
    const donors = Array.from({ length: 20 }, (_, i) =>
      makeDonor({
        id: `d${i}`,
        bloodType: "O-",
        available: true,
        latitude: REF_LAT + i * 0.01,
        longitude: REF_LON,
      }),
    );
    mockGetAllAvailableDonors.mockResolvedValue(donors);
    const results = await matchingService.findAIEmergencyMatching(
      "O-",
      REF_LAT,
      REF_LON,
    );
    expect(results).toHaveLength(10);
  });

  it("generates 'Compatibilité parfaite' explanation for exact blood type match", async () => {
    const donor = makeDonor({
      id: "d1",
      bloodType: "O-",
      available: true,
      latitude: REF_LAT,
      longitude: REF_LON,
    });
    mockGetAllAvailableDonors.mockResolvedValue([donor]);
    const [r] = await matchingService.findAIEmergencyMatching(
      "O-",
      REF_LAT,
      REF_LON,
    );
    expect(r.explanation).toContain("Compatibilité parfaite");
  });

  it("generates 'substitution' explanation for non-exact (substitute) blood type match", async () => {
    const donor = makeDonor({
      id: "d1",
      bloodType: "O-",
      available: true,
      latitude: REF_LAT,
      longitude: REF_LON,
    });
    mockGetAllAvailableDonors.mockResolvedValue([donor]);
    // O- donating to A+ is a substitute match
    const [r] = await matchingService.findAIEmergencyMatching(
      "A+",
      REF_LAT,
      REF_LON,
    );
    expect(r.explanation).toContain("substitution");
  });

  it("mentions donation history in explanation for a regular donor", async () => {
    const { createSupabaseServerClient } =
      await import("@/lib/supabase/server");
    const donor = makeDonor({
      id: "vet",
      bloodType: "O-",
      available: true,
      latitude: REF_LAT,
      longitude: REF_LON,
    });
    mockGetAllAvailableDonors.mockResolvedValue([donor]);

    const mockEq = vi
      .fn()
      .mockResolvedValue({ data: [{ donor_id: "vet" }], error: null });
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      from: vi.fn(() => ({ select: vi.fn(() => ({ eq: mockEq })) })),
    });

    const [r] = await matchingService.findAIEmergencyMatching(
      "O-",
      REF_LAT,
      REF_LON,
    );
    expect(r.explanation).toContain("Donneur régulier");
  });

  it("mentions 'Nouveau donneur' in explanation for a donor with no history", async () => {
    const donor = makeDonor({
      id: "new",
      bloodType: "O-",
      available: true,
      latitude: REF_LAT,
      longitude: REF_LON,
    });
    mockGetAllAvailableDonors.mockResolvedValue([donor]);
    const [r] = await matchingService.findAIEmergencyMatching(
      "O-",
      REF_LAT,
      REF_LON,
    );
    expect(r.explanation).toContain("Nouveau donneur");
  });
});
