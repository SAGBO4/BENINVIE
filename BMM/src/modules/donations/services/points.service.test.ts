/**
 * points.service.test.ts
 *
 * Tests exhaustifs pour pointsService (awardPoints, redeemPoints, getDonorPointsBalance).
 *
 * Mocks :
 *  - @/modules/bitcoin  → otsService.stampHash
 *  - js-sha256          → sha256
 *  - @/lib/supabase/server → createSupabaseServerClient
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks de module (doivent être déclarés avant l'import du module testé)
// ---------------------------------------------------------------------------
vi.mock("@/modules/bitcoin", () => ({
  otsService: {
    stampHash: vi.fn().mockResolvedValue("mock-ots-proof-base64"),
  },
  // re-exporte les autres membres vides pour éviter les erreurs d'import
  walletService: {},
  breezService: {},
  rewardService: {},
}));

vi.mock("js-sha256", () => ({
  sha256: vi.fn().mockReturnValue("mock-sha256-hash"),
}));

// Fabrique un faux client Supabase
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (après les mocks)
// ---------------------------------------------------------------------------
import { otsService } from "@/modules/bitcoin";
import { sha256 } from "js-sha256";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pointsService } from "@/modules/donations/services/points.service";

// ---------------------------------------------------------------------------
// Helper : configure le mock supabase pour un test donné
// ---------------------------------------------------------------------------
function setupSupabaseMock({
  insertError = null as Error | null,
  selectData = [] as { amount: number }[],
  selectError = null as Error | null,
} = {}) {
  mockEq.mockResolvedValue({ data: selectData, error: selectError });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockInsert.mockResolvedValue({ error: insertError });
  mockFrom.mockReturnValue({
    insert: mockInsert,
    select: mockSelect,
  });

  (createSupabaseServerClient as ReturnType<typeof vi.fn>).mockResolvedValue({
    from: mockFrom,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  // Rétablit le mock OTS par défaut
  (otsService.stampHash as ReturnType<typeof vi.fn>).mockResolvedValue(
    "mock-ots-proof-base64",
  );
  (sha256 as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
    "mock-sha256-hash",
  );
});

// ---------------------------------------------------------------------------
// awardPoints
// ---------------------------------------------------------------------------
describe("awardPoints", () => {
  it("points = 0 → succès, amount=0 inséré dans la DB", async () => {
    setupSupabaseMock();

    const result = await pointsService.awardPoints("donor-1", 0);

    expect(result.success).toBe(true);
    expect(mockInsert).toHaveBeenCalledOnce();
    const insertedRow = mockInsert.mock.calls[0][0][0];
    expect(insertedRow.amount).toBe(0);
  });

  it("points négatifs → la DB reçoit un montant négatif (bug documenté)", async () => {
    setupSupabaseMock();

    const result = await pointsService.awardPoints("donor-1", -50);

    // Le service ne valide pas la valeur négative : il l'insère telle quelle
    expect(result.success).toBe(true);
    const insertedRow = mockInsert.mock.calls[0][0][0];
    expect(insertedRow.amount).toBe(-50); // ← faille : pas de validation
  });

  it("donorId vide → hash généré, insertion tentée (risque orphelin)", async () => {
    setupSupabaseMock();

    const result = await pointsService.awardPoints("", 10);

    expect(result.success).toBe(true);
    const insertedRow = mockInsert.mock.calls[0][0][0];
    expect(insertedRow.donor_id).toBe(""); // ← faille : pas de validation de l'id
  });

  it("erreur DB lors de l'insertion → retourne { success: false }", async () => {
    setupSupabaseMock({ insertError: new Error("DB write failed") });

    const result = await pointsService.awardPoints("donor-1", 100);

    expect(result.success).toBe(false);
    expect(result.proofBase64).toBeUndefined();
  });

  it("succès nominal → retourne proofBase64 et success=true", async () => {
    setupSupabaseMock();

    const result = await pointsService.awardPoints("donor-abc", 200, "hosp-1");

    expect(result.success).toBe(true);
    expect(result.proofBase64).toBe("mock-ots-proof-base64");
    expect(otsService.stampHash).toHaveBeenCalledWith("mock-sha256-hash");
  });
});

// ---------------------------------------------------------------------------
// getDonorPointsBalance
// ---------------------------------------------------------------------------
describe("getDonorPointsBalance", () => {
  it("data = [] → retourne 0", async () => {
    setupSupabaseMock({ selectData: [] });

    const balance = await pointsService.getDonorPointsBalance("donor-1");

    expect(balance).toBe(0);
  });

  it("entrées positives uniquement → retourne la somme correcte", async () => {
    setupSupabaseMock({
      selectData: [{ amount: 100 }, { amount: 50 }, { amount: 25 }],
    });

    const balance = await pointsService.getDonorPointsBalance("donor-1");

    expect(balance).toBe(175);
  });

  it("entrées négatives (REDEEM) → le solde peut être négatif (faille détection dépassement)", async () => {
    setupSupabaseMock({
      selectData: [{ amount: 100 }, { amount: -200 }],
    });

    const balance = await pointsService.getDonorPointsBalance("donor-1");

    // Le service ne protège pas contre un solde négatif
    expect(balance).toBe(-100); // ← comportement actuel documenté
  });

  it("erreur DB → retourne 0 sans throw", async () => {
    setupSupabaseMock({ selectError: new Error("DB read failed") });

    await expect(pointsService.getDonorPointsBalance("donor-1")).resolves.toBe(
      0,
    );
  });
});

// ---------------------------------------------------------------------------
// redeemPoints
// ---------------------------------------------------------------------------
describe("redeemPoints", () => {
  it("insère un montant négatif (-pointsToRedeem) dans la DB", async () => {
    setupSupabaseMock();

    const result = await pointsService.redeemPoints("donor-1", 100, "voucher");

    expect(result.success).toBe(true);
    const insertedRow = mockInsert.mock.calls[0][0][0];
    expect(insertedRow.amount).toBe(-100); // montant négatif intentionnel
    expect(insertedRow.action).toBe("REDEEM");
  });

  it("pointsToRedeem = 0 → insère 0 dans la DB", async () => {
    setupSupabaseMock();

    const result = await pointsService.redeemPoints("donor-1", 0, "satoshis");

    expect(result.success).toBe(true);
    const insertedRow = mockInsert.mock.calls[0][0][0];
    // -pointsToRedeem avec pointsToRedeem=0 produit -0 en JS (faille : valeur
    // sémantiquement neutre mais potentiellement problématique selon la DB)
    expect(Object.is(insertedRow.amount, -0)).toBe(true);
  });

  it("erreur DB lors du REDEEM → retourne { success: false }", async () => {
    setupSupabaseMock({ insertError: new Error("Write failed") });

    const result = await pointsService.redeemPoints("donor-1", 50, "voucher");

    expect(result.success).toBe(false);
  });

  it("succès nominal → retourne proofBase64", async () => {
    setupSupabaseMock();

    const result = await pointsService.redeemPoints("donor-1", 75, "satoshis");

    expect(result.success).toBe(true);
    expect(result.proofBase64).toBe("mock-ots-proof-base64");
  });
});
