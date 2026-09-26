/**
 * Tests exhaustifs pour src/modules/donations/service.ts
 *
 * Le module `@/lib/supabase/server` est mocké intégralement via vi.mock.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

// ── Mock @/lib/supabase/server ───────────────────────────────────────────────
// On déclare le mock AVANT tout import du module testé (hoisting vi.mock).
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient: vi.fn(),
}));

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { donationService } from "@/modules/donations/service";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Crée un faux client Supabase dont on contrôle les résultats. */
function makeFakeAdmin({
  insertResult = { error: null },
  selectResult = { data: [], error: null },
}: {
  insertResult?: { error: { message: string } | null };
  selectResult?: { data: unknown[] | null; error: { message: string } | null };
} = {}) {
  const insertMock = vi.fn().mockResolvedValue(insertResult);
  const limitMock = vi.fn().mockResolvedValue(selectResult);
  const orderMock = vi.fn().mockReturnValue({ limit: limitMock });
  const selectMock = vi.fn().mockReturnValue({ order: orderMock });
  const fromMock = vi.fn().mockReturnValue({
    insert: insertMock,
    select: selectMock,
  });

  return {
    client: { from: fromMock },
    mocks: { fromMock, insertMock, selectMock, orderMock, limitMock },
  };
}

/** Données de donation en format "row" (snake_case DB). */
const makeRow = (
  overrides: Partial<{
    id: string;
    amount_sats: number;
    purpose: string;
    message: string | null;
    bolt11: string | null;
    status: string;
    created_at: string;
  }> = {},
) => ({
  id: "uuid-1",
  amount_sats: 5_000,
  purpose: "campaign",
  message: null,
  bolt11: "lnbc...",
  status: "pending",
  created_at: "2026-01-01T00:00:00Z",
  ...overrides,
});

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── logDonation ─────────────────────────────────────────────────────────────

describe("donationService.logDonation", () => {
  const validData = {
    amountSats: 1_000,
    purpose: "campaign" as const,
    message: "Test message",
    bolt11: "lnbc1000...",
    simulated: false,
  };

  it("no-op sans crash quand admin est null (SUPABASE_SERVICE_ROLE_KEY absent)", async () => {
    (createSupabaseAdminClient as Mock).mockReturnValue(null);

    await expect(
      donationService.logDonation(validData),
    ).resolves.toBeUndefined();
  });

  it("insère dans platform_donations quand admin est disponible", async () => {
    const { client, mocks } = makeFakeAdmin();
    (createSupabaseAdminClient as Mock).mockReturnValue(client);

    await donationService.logDonation(validData);

    expect(mocks.fromMock).toHaveBeenCalledWith("platform_donations");
    expect(mocks.insertMock).toHaveBeenCalledWith([
      {
        amount_sats: 1_000,
        purpose: "campaign",
        message: "Test message",
        bolt11: "lnbc1000...",
        status: "pending",
      },
    ]);
  });

  it('status = "simulated" quand simulated est true', async () => {
    const { client, mocks } = makeFakeAdmin();
    (createSupabaseAdminClient as Mock).mockReturnValue(client);

    await donationService.logDonation({ ...validData, simulated: true });

    const inserted = mocks.insertMock.mock.calls[0][0][0];
    expect(inserted.status).toBe("simulated");
  });

  it("message absent → null dans la DB", async () => {
    const { client, mocks } = makeFakeAdmin();
    (createSupabaseAdminClient as Mock).mockReturnValue(client);

    const dataWithoutMessage = { ...validData, message: undefined };
    await donationService.logDonation(dataWithoutMessage);

    const inserted = mocks.insertMock.mock.calls[0][0][0];
    expect(inserted.message).toBeNull();
  });

  it("erreur DB → console.warn sans crash", async () => {
    const { client } = makeFakeAdmin({
      insertResult: {
        error: { message: 'relation "platform_donations" does not exist' },
      },
    });
    (createSupabaseAdminClient as Mock).mockReturnValue(client);

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(
      donationService.logDonation(validData),
    ).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[Donations]"),
      expect.any(String),
    );
    warnSpy.mockRestore();
  });
});

// ─── listDonations ───────────────────────────────────────────────────────────

describe("donationService.listDonations", () => {
  it("retourne [] quand admin est null", async () => {
    (createSupabaseAdminClient as Mock).mockReturnValue(null);
    const result = await donationService.listDonations();
    expect(result).toEqual([]);
  });

  it("retourne [] en cas d'erreur DB", async () => {
    const { client } = makeFakeAdmin({
      selectResult: { data: null, error: { message: "DB error" } },
    });
    (createSupabaseAdminClient as Mock).mockReturnValue(client);

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await donationService.listDonations();
    expect(result).toEqual([]);
    warnSpy.mockRestore();
  });

  it("retourne [] quand data est null sans erreur", async () => {
    const { client } = makeFakeAdmin({
      selectResult: { data: null, error: null },
    });
    (createSupabaseAdminClient as Mock).mockReturnValue(client);

    const result = await donationService.listDonations();
    expect(result).toEqual([]);
  });

  it("mappe les rows snake_case en DonationRecord camelCase", async () => {
    const row = makeRow({ id: "abc", amount_sats: 2_500, status: "paid" });
    const { client } = makeFakeAdmin({
      selectResult: { data: [row], error: null },
    });
    (createSupabaseAdminClient as Mock).mockReturnValue(client);

    const result = await donationService.listDonations();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "abc",
      amountSats: 2_500,
      purpose: "campaign",
      message: null,
      bolt11: "lnbc...",
      status: "paid",
      createdAt: "2026-01-01T00:00:00Z",
    });
  });

  it("retourne plusieurs donations dans l'ordre reçu de la DB", async () => {
    const rows = [
      makeRow({ id: "1", amount_sats: 1_000 }),
      makeRow({ id: "2", amount_sats: 2_000 }),
    ];
    const { client } = makeFakeAdmin({
      selectResult: { data: rows, error: null },
    });
    (createSupabaseAdminClient as Mock).mockReturnValue(client);

    const result = await donationService.listDonations();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("1");
    expect(result[1].id).toBe("2");
  });

  it("query chaînée : select(*) → order(created_at desc) → limit(200)", async () => {
    const { client, mocks } = makeFakeAdmin({
      selectResult: { data: [], error: null },
    });
    (createSupabaseAdminClient as Mock).mockReturnValue(client);

    await donationService.listDonations();

    expect(mocks.selectMock).toHaveBeenCalledWith("*");
    expect(mocks.orderMock).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
    expect(mocks.limitMock).toHaveBeenCalledWith(200);
  });
});

// ─── getSummary ──────────────────────────────────────────────────────────────

describe("donationService.getSummary", () => {
  it("liste vide → { totalSats: 0, count: 0 }", async () => {
    (createSupabaseAdminClient as Mock).mockReturnValue(null);

    const summary = await donationService.getSummary();
    expect(summary).toEqual({ totalSats: 0, count: 0 });
  });

  it("une donation → totalSats = amountSats, count = 1", async () => {
    const { client } = makeFakeAdmin({
      selectResult: { data: [makeRow({ amount_sats: 10_000 })], error: null },
    });
    (createSupabaseAdminClient as Mock).mockReturnValue(client);

    const summary = await donationService.getSummary();
    expect(summary).toEqual({ totalSats: 10_000, count: 1 });
  });

  it("plusieurs donations → sum correct", async () => {
    const rows = [
      makeRow({ id: "1", amount_sats: 5_000 }),
      makeRow({ id: "2", amount_sats: 3_000 }),
      makeRow({ id: "3", amount_sats: 2_000 }),
    ];
    const { client } = makeFakeAdmin({
      selectResult: { data: rows, error: null },
    });
    (createSupabaseAdminClient as Mock).mockReturnValue(client);

    const summary = await donationService.getSummary();
    expect(summary).toEqual({ totalSats: 10_000, count: 3 });
  });

  it("amountSats négatif (bug DB) → totalSats peut être négatif (FAILLE : pas de guard)", async () => {
    // FAILLE : getSummary n'a pas de garde contre les valeurs négatives issues de la DB.
    const rows = [
      makeRow({ id: "1", amount_sats: 5_000 }),
      makeRow({ id: "2", amount_sats: -1_000 }), // bug DB
    ];
    const { client } = makeFakeAdmin({
      selectResult: { data: rows, error: null },
    });
    (createSupabaseAdminClient as Mock).mockReturnValue(client);

    const summary = await donationService.getSummary();
    // Comportement actuel : la somme est 4_000 (pas de protection)
    expect(summary.totalSats).toBe(4_000);
    expect(summary.count).toBe(2);
  });

  it("uniquement des donations négatives → totalSats négatif (comportement bugué)", async () => {
    const rows = [makeRow({ amount_sats: -500 })];
    const { client } = makeFakeAdmin({
      selectResult: { data: rows, error: null },
    });
    (createSupabaseAdminClient as Mock).mockReturnValue(client);

    const summary = await donationService.getSummary();
    expect(summary.totalSats).toBe(-500); // Documenter le bug
    expect(summary.count).toBe(1);
  });

  it("erreur DB → { totalSats: 0, count: 0 } (via listDonations qui retourne [])", async () => {
    const { client } = makeFakeAdmin({
      selectResult: { data: null, error: { message: "DB down" } },
    });
    (createSupabaseAdminClient as Mock).mockReturnValue(client);

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const summary = await donationService.getSummary();
    expect(summary).toEqual({ totalSats: 0, count: 0 });
    warnSpy.mockRestore();
  });
});
