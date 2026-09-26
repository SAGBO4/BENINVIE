import { vi, describe, it, expect, beforeEach } from "vitest";
import { statisticsService, BLOOD_TYPES_ORDER } from "./statistics.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ─────────────────────────────────────────────────────────────────────────────
// Mock Supabase
// ─────────────────────────────────────────────────────────────────────────────

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

type SupabaseResponse<T> = {
  data: T | null;
  error: null | { message: string };
  count?: number | null;
};

interface MockSetup {
  donors?: { count?: number | null; error?: { message: string } | null };
  organizations?: {
    data?: { city: string | null }[];
    count?: number | null;
    error?: { message: string } | null;
  };
  campaigns?: { count?: number | null; error?: { message: string } | null };
  emergencies?: { count?: number | null; error?: { message: string } | null };
  stock?: {
    data?: { blood_type: string; units: number }[];
    error?: { message: string } | null;
  };
  activities?: { count?: number | null; error?: { message: string } | null };
}

/** Build a Supabase client mock that replies to each table's query chain. */
function buildMockClient(overrides: MockSetup = {}) {
  const defaults: Required<MockSetup> = {
    donors: { count: 0, error: null },
    organizations: { data: [], count: 0, error: null },
    campaigns: { count: 0, error: null },
    emergencies: { count: 0, error: null },
    stock: { data: [], error: null },
    activities: { count: 0, error: null },
  };
  const cfg = { ...defaults, ...overrides };

  const resolvers: Record<string, SupabaseResponse<unknown>> = {
    donors: {
      data: null,
      error: cfg.donors.error ?? null,
      count: cfg.donors.count ?? 0,
    },
    organizations: {
      data: cfg.organizations.data ?? [],
      error: cfg.organizations.error ?? null,
      count: cfg.organizations.count ?? 0,
    },
    campaigns: {
      data: null,
      error: cfg.campaigns.error ?? null,
      count: cfg.campaigns.count ?? 0,
    },
    emergencies: {
      data: null,
      error: cfg.emergencies.error ?? null,
      count: cfg.emergencies.count ?? 0,
    },
    stock: { data: cfg.stock.data ?? [], error: cfg.stock.error ?? null },
    donor_activities: {
      data: null,
      error: cfg.activities.error ?? null,
      count: cfg.activities.count ?? 0,
    },
  };

  const from = vi.fn((table: string) => {
    const resp = resolvers[table] ?? { data: null, error: null };
    const makeThenable = () => ({
      eq,
      select,
      then: (
        resolve: (v: unknown) => unknown,
        reject?: (v: unknown) => unknown,
      ) => Promise.resolve(resp).then(resolve, reject),
      catch: (reject: (v: unknown) => unknown) =>
        Promise.resolve(resp).catch(reject),
    });
    const eq = vi.fn(makeThenable);
    const select = vi.fn(makeThenable);
    return makeThenable();
  });

  return { from };
}

// ─────────────────────────────────────────────────────────────────────────────
// toAvailability — tested indirectly through getPublicStatistics
// (the function is private; we drive it via the service with mocked stock data)
// ─────────────────────────────────────────────────────────────────────────────

describe("toAvailability (via getPublicStatistics)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns [] (empty availability) when unitsByType map is empty (no stock rows)", async () => {
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({ stock: { data: [] } }),
    );
    const stats = await statisticsService.getPublicStatistics();
    expect(stats.availability).toEqual([]);
  });

  it("maps empty stock to availability=[] (not an array of zeros — avoids false 'all critical')", async () => {
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({ stock: { data: [] } }),
    );
    const stats = await statisticsService.getPublicStatistics();
    // The service intentionally returns [] rather than a grid of zeros
    expect(stats.availability).toHaveLength(0);
  });

  it("when only one group is provided, the others are returned with units=0 and level=0", async () => {
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({ stock: { data: [{ blood_type: "O-", units: 100 }] } }),
    );
    const stats = await statisticsService.getPublicStatistics();
    // 8 entries because unitsByType.size > 0
    expect(stats.availability).toHaveLength(8);
    const oMinus = stats.availability.find((a) => a.bloodType === "O-")!;
    expect(oMinus.level).toBe(100);
    expect(oMinus.status).toBe("stable");

    // All other types should have units=0 and level=0 → status='critique'
    const others = stats.availability.filter((a) => a.bloodType !== "O-");
    for (const entry of others) {
      expect(entry.units).toBe(0);
      expect(entry.level).toBe(0);
      expect(entry.status).toBe("critique");
    }
  });

  it("when all groups have the same stock, every level=100 and status=stable", async () => {
    const equalStock = BLOOD_TYPES_ORDER.map((bt) => ({
      blood_type: bt,
      units: 50,
    }));
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({ stock: { data: equalStock } }),
    );
    const stats = await statisticsService.getPublicStatistics();
    expect(stats.availability).toHaveLength(8);
    for (const entry of stats.availability) {
      expect(entry.level).toBe(100);
      expect(entry.status).toBe("stable");
    }
  });

  it("status thresholds: < 25 → critique, 25–54 → faible, ≥ 55 → stable", async () => {
    // max = 100; set values to hit each threshold zone
    const stock = [
      { blood_type: "O-", units: 100 }, // level=100 → stable
      { blood_type: "O+", units: 50 }, // level=50  → faible (50 < 55)
      { blood_type: "A-", units: 20 }, // level=20  → critique
    ];
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({ stock: { data: stock } }),
    );
    const stats = await statisticsService.getPublicStatistics();
    const get = (bt: string) =>
      stats.availability.find((a) => a.bloodType === bt)!;
    expect(get("O-").status).toBe("stable");
    expect(get("O+").status).toBe("faible");
    expect(get("A-").status).toBe("critique");
  });

  it("handles negative units from DB (bug) — level should be ≤ 0 (capped at 0 by Math.round)", async () => {
    // max = Math.max(1, -5) = 1; units=-5 → level = round((-5/1)*100) = -500
    // This is a known flaw: the code does NOT clamp level to [0,100]
    const stock = [{ blood_type: "O-", units: -5 }];
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({ stock: { data: stock } }),
    );
    const stats = await statisticsService.getPublicStatistics();
    // FAILLE CONFIRMÉE: level can go negative when DB returns negative units
    const oMinus = stats.availability.find((a) => a.bloodType === "O-")!;
    expect(oMinus.level).toBeLessThanOrEqual(0);
    // Consequence: status will be 'critique' (level < 25)
    expect(oMinus.status).toBe("critique");
  });

  it("preserves BLOOD_TYPES_ORDER ordering in the returned array", async () => {
    const stock = BLOOD_TYPES_ORDER.map((bt, i) => ({
      blood_type: bt,
      units: (i + 1) * 10,
    }));
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({ stock: { data: stock } }),
    );
    const stats = await statisticsService.getPublicStatistics();
    const returnedOrder = stats.availability.map((a) => a.bloodType);
    expect(returnedOrder).toEqual([...BLOOD_TYPES_ORDER]);
  });

  it("aggregates multiple stock rows for the same blood type (sums units)", async () => {
    const stock = [
      { blood_type: "O-", units: 30 },
      { blood_type: "O-", units: 70 }, // total: 100
    ];
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({ stock: { data: stock } }),
    );
    const stats = await statisticsService.getPublicStatistics();
    const oMinus = stats.availability.find((a) => a.bloodType === "O-")!;
    expect(oMinus.units).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getPublicStatistics — error handling
// ─────────────────────────────────────────────────────────────────────────────

describe("statisticsService.getPublicStatistics — error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when the donors query returns an error", async () => {
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({
        donors: { error: { message: "DB down" }, count: null },
      }),
    );
    await expect(statisticsService.getPublicStatistics()).rejects.toThrow(
      "Statistiques indisponibles",
    );
  });

  it("throws when the organizations query returns an error", async () => {
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({
        organizations: { error: { message: "network error" }, count: null },
      }),
    );
    await expect(statisticsService.getPublicStatistics()).rejects.toThrow(
      "Statistiques indisponibles",
    );
  });

  it("throws when the campaigns query returns an error", async () => {
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({
        campaigns: { error: { message: "timeout" }, count: null },
      }),
    );
    await expect(statisticsService.getPublicStatistics()).rejects.toThrow(
      "Statistiques indisponibles",
    );
  });

  it("throws when the emergencies query returns an error", async () => {
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({
        emergencies: { error: { message: "emergency error" }, count: null },
      }),
    );
    await expect(statisticsService.getPublicStatistics()).rejects.toThrow(
      "Statistiques indisponibles",
    );
  });

  it("throws when the stock query returns an error", async () => {
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({ stock: { error: { message: "stock error" } } }),
    );
    await expect(statisticsService.getPublicStatistics()).rejects.toThrow(
      "Statistiques indisponibles",
    );
  });

  it("throws when the activities query returns an error", async () => {
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({
        activities: { error: { message: "activity error" }, count: null },
      }),
    );
    await expect(statisticsService.getPublicStatistics()).rejects.toThrow(
      "Statistiques indisponibles",
    );
  });

  it("error message includes the DB error message", async () => {
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({
        donors: { error: { message: "connection refused" }, count: null },
      }),
    );
    await expect(statisticsService.getPublicStatistics()).rejects.toThrow(
      "connection refused",
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getPublicStatistics — cities logic
// ─────────────────────────────────────────────────────────────────────────────

describe("statisticsService.getPublicStatistics — cities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filters out organizations with city = null", async () => {
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({
        organizations: {
          data: [{ city: "Dakar" }, { city: null }, { city: "Thiès" }],
          count: 3,
        },
      }),
    );
    const stats = await statisticsService.getPublicStatistics();
    expect(stats.cities).not.toContain(null);
    expect(stats.cities).toContain("Dakar");
    expect(stats.cities).toContain("Thiès");
    expect(stats.cities).toHaveLength(2);
  });

  it("deduplicates cities — same city from multiple organizations appears once", async () => {
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({
        organizations: {
          data: [{ city: "Dakar" }, { city: "Dakar" }, { city: "Saint-Louis" }],
          count: 3,
        },
      }),
    );
    const stats = await statisticsService.getPublicStatistics();
    const dakarCount = stats.cities.filter((c) => c === "Dakar").length;
    expect(dakarCount).toBe(1);
    expect(stats.cities).toHaveLength(2);
  });

  it("sorts cities alphabetically (locale fr)", async () => {
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({
        organizations: {
          data: [
            { city: "Thiès" },
            { city: "Dakar" },
            { city: "Ziguinchor" },
            { city: "Kaolack" },
          ],
          count: 4,
        },
      }),
    );
    const stats = await statisticsService.getPublicStatistics();
    const sorted = [...stats.cities].sort((a, b) => a.localeCompare(b, "fr"));
    expect(stats.cities).toEqual(sorted);
  });

  it("returns [] for cities when all organization rows have city = null", async () => {
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({
        organizations: { data: [{ city: null }, { city: null }], count: 2 },
      }),
    );
    const stats = await statisticsService.getPublicStatistics();
    expect(stats.cities).toEqual([]);
  });

  it("citiesCovered count matches the number of unique non-null cities", async () => {
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({
        organizations: {
          data: [
            { city: "Dakar" },
            { city: "Dakar" },
            { city: "Thiès" },
            { city: null },
          ],
          count: 4,
        },
      }),
    );
    const stats = await statisticsService.getPublicStatistics();
    // citiesCovered = cities.size (deduplicated, null excluded) = 2
    expect(stats.citiesCovered).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getPublicStatistics — scalar counters
// ─────────────────────────────────────────────────────────────────────────────

describe("statisticsService.getPublicStatistics — scalar counters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns correct scalar values from DB counts", async () => {
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({
        donors: { count: 42 },
        organizations: { count: 7, data: [] },
        campaigns: { count: 3 },
        emergencies: { count: 1 },
        activities: { count: 200 },
      }),
    );
    const stats = await statisticsService.getPublicStatistics();
    expect(stats.donorsRegistered).toBe(42);
    expect(stats.organizations).toBe(7);
    expect(stats.activeCampaigns).toBe(3);
    expect(stats.activeEmergencies).toBe(1);
    expect(stats.donationsRecorded).toBe(200);
  });

  it("falls back to 0 when count is null", async () => {
    (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildMockClient({
        donors: { count: null },
        campaigns: { count: null },
        activities: { count: null },
      }),
    );
    const stats = await statisticsService.getPublicStatistics();
    expect(stats.donorsRegistered).toBe(0);
    expect(stats.activeCampaigns).toBe(0);
    expect(stats.donationsRecorded).toBe(0);
  });
});
