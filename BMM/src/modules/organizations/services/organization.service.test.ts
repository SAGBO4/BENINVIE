import { vi, describe, it, expect, beforeEach } from "vitest";
import { organizationService } from "./organization.service";
import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
} from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
  createSupabaseAdminClient: vi.fn(),
}));

const mockOrgRow = {
  id: "org-123",
  name: "Centre Hospitalier Hubert Maga",
  type: "hospital" as const,
  latitude: 6.36,
  longitude: 2.42,
  city: "Cotonou",
  contact_email: "contact@cnhu.bj",
  verified: true,
  rejection_reason: null,
  created_at: "2026-01-10T08:00:00.000Z",
};

describe("organizationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllOrganizations", () => {
    it("uses createSupabaseAdminClient if available", async () => {
      const mockOrder = vi
        .fn()
        .mockResolvedValue({ data: [mockOrgRow], error: null });
      const mockSelect = vi.fn(() => ({ order: mockOrder }));
      const mockAdminFrom = vi.fn(() => ({ select: mockSelect }));

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: mockAdminFrom,
      });

      const results = await organizationService.getAllOrganizations();
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        id: "org-123",
        name: "Centre Hospitalier Hubert Maga",
        type: "hospital",
        latitude: 6.36,
        longitude: 2.42,
        city: "Cotonou",
        contactEmail: "contact@cnhu.bj",
        verified: true,
        rejectionReason: null,
        createdAt: new Date("2026-01-10T08:00:00.000Z"),
      });
      expect(mockAdminFrom).toHaveBeenCalledWith("organizations");
      expect(createSupabaseServerClient).not.toHaveBeenCalled();
    });

    it("falls back to createSupabaseServerClient if admin client is null", async () => {
      const mockOrder = vi
        .fn()
        .mockResolvedValue({ data: [mockOrgRow], error: null });
      const mockSelect = vi.fn(() => ({ order: mockOrder }));
      const mockServerFrom = vi.fn(() => ({ select: mockSelect }));

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(
        null,
      );
      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: mockServerFrom,
      });

      const results = await organizationService.getAllOrganizations();
      expect(results).toHaveLength(1);
      expect(createSupabaseServerClient).toHaveBeenCalled();
    });

    it("returns empty array if DB returns error", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "permission denied" },
      });
      const mockSelect = vi.fn(() => ({ order: mockOrder }));

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      const results = await organizationService.getAllOrganizations();
      expect(results).toEqual([]);
    });

    it("returns empty array if data is null", async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockSelect = vi.fn(() => ({ order: mockOrder }));

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      const results = await organizationService.getAllOrganizations();
      expect(results).toEqual([]);
    });
  });

  describe("verifyOrganization", () => {
    it("updates verified to true and clears rejection reason", async () => {
      const updatedRow = {
        ...mockOrgRow,
        verified: true,
        rejection_reason: null,
      };
      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: updatedRow, error: null });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockEq = vi.fn(() => ({ select: mockSelect }));
      const mockUpdate = vi.fn(() => ({ eq: mockEq }));

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn(() => ({ update: mockUpdate })),
      });

      const result = await organizationService.verifyOrganization("org-123");

      expect(mockUpdate).toHaveBeenCalledWith({
        verified: true,
        rejection_reason: null,
      });
      expect(mockEq).toHaveBeenCalledWith("id", "org-123");
      expect(result?.verified).toBe(true);
      expect(result?.rejectionReason).toBeNull();
    });

    it("throws an error when DB update fails", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "row not found" },
      });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockEq = vi.fn(() => ({ select: mockSelect }));
      const mockUpdate = vi.fn(() => ({ eq: mockEq }));

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn(() => ({ update: mockUpdate })),
      });

      await expect(
        organizationService.verifyOrganization("non-existent"),
      ).rejects.toThrow("Erreur lors de la vérification de l'organisation");
    });
  });

  describe("rejectOrganization", () => {
    it("sets verified to false and stores rejection reason", async () => {
      const rejectedRow = {
        ...mockOrgRow,
        verified: false,
        rejection_reason: "Documents flous et illisibles",
      };
      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: rejectedRow, error: null });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockEq = vi.fn(() => ({ select: mockSelect }));
      const mockUpdate = vi.fn(() => ({ eq: mockEq }));

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn(() => ({ update: mockUpdate })),
      });

      const result = await organizationService.rejectOrganization(
        "org-123",
        "Documents flous et illisibles",
      );

      expect(mockUpdate).toHaveBeenCalledWith({
        verified: false,
        rejection_reason: "Documents flous et illisibles",
      });
      expect(result?.verified).toBe(false);
      expect(result?.rejectionReason).toBe("Documents flous et illisibles");
    });

    it("throws an error when reject fails", async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockEq = vi.fn(() => ({ select: mockSelect }));
      const mockUpdate = vi.fn(() => ({ eq: mockEq }));

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn(() => ({ update: mockUpdate })),
      });

      await expect(
        organizationService.rejectOrganization("org-123", "Raison"),
      ).rejects.toThrow("Erreur lors du rejet de l'organisation");
    });
  });

  describe("getBalance", () => {
    it("returns balance_sats when organization has a balance", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { balance_sats: 50000 },
      });
      const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      const balance = await organizationService.getBalance("org-123");
      expect(balance).toBe(50000);
      expect(mockSelect).toHaveBeenCalledWith("balance_sats");
      expect(mockEq).toHaveBeenCalledWith("id", "org-123");
    });

    it("returns 0 if organization is not found or data is null", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null });
      const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      const balance = await organizationService.getBalance("org-ghost");
      expect(balance).toBe(0);
    });

    it("returns 0 if balance_sats is null in DB", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { balance_sats: null },
      });
      const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      const balance = await organizationService.getBalance("org-null-balance");
      expect(balance).toBe(0);
    });
  });

  describe("adjustBalance", () => {
    it("credits positive amount to organization balance", async () => {
      // 1. First query: select balance
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { balance_sats: 1000 },
      });
      const mockSelectQuery = vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })),
      }));

      // 2. Second query: update with optimistic lock .eq("id", id).eq("balance_sats", current)
      const mockUpdateSingle = vi.fn().mockResolvedValue({
        data: { balance_sats: 1500 },
        error: null,
      });
      const mockUpdateSelect = vi.fn(() => ({ single: mockUpdateSingle }));
      const mockUpdateEqBalance = vi.fn(() => ({ select: mockUpdateSelect }));
      const mockUpdateEqId = vi.fn(() => ({ eq: mockUpdateEqBalance }));
      const mockUpdateQuery = vi.fn(() => ({ eq: mockUpdateEqId }));

      const mockFrom = vi.fn((_table: string) => ({
        select: mockSelectQuery,
        update: mockUpdateQuery,
      }));

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: mockFrom,
      });

      const newBalance = await organizationService.adjustBalance(
        "org-123",
        500,
      );

      expect(newBalance).toBe(1500);
      expect(mockUpdateQuery).toHaveBeenCalledWith({ balance_sats: 1500 });
      expect(mockUpdateEqId).toHaveBeenCalledWith("id", "org-123");
      expect(mockUpdateEqBalance).toHaveBeenCalledWith("balance_sats", 1000);
    });

    it("debits negative amount when balance is sufficient", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { balance_sats: 200 },
      });
      const mockSelectQuery = vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })),
      }));

      const mockUpdateSingle = vi.fn().mockResolvedValue({
        data: { balance_sats: 150 },
        error: null,
      });
      const mockUpdateSelect = vi.fn(() => ({ single: mockUpdateSingle }));
      const mockUpdateEqBalance = vi.fn(() => ({ select: mockUpdateSelect }));
      const mockUpdateEqId = vi.fn(() => ({ eq: mockUpdateEqBalance }));
      const mockUpdateQuery = vi.fn(() => ({ eq: mockUpdateEqId }));

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn(() => ({
          select: mockSelectQuery,
          update: mockUpdateQuery,
        })),
      });

      // Debit 50 when balance is 200 -> new balance 150
      const newBalance = await organizationService.adjustBalance(
        "org-123",
        -50,
      );

      expect(newBalance).toBe(150);
      expect(mockUpdateQuery).toHaveBeenCalledWith({ balance_sats: 150 });
      expect(mockUpdateEqBalance).toHaveBeenCalledWith("balance_sats", 200);
    });

    it("throws an error if attempting to debit more than the current balance", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { balance_sats: 200 },
      });
      const mockSelectQuery = vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })),
      }));

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn(() => ({ select: mockSelectQuery })),
      });

      // Debit 500 when balance is only 200 -> rejects
      await expect(
        organizationService.adjustBalance("org-123", -500),
      ).rejects.toThrow("Solde insuffisant pour effectuer ce débit");
    });

    it("throws an error if amount is NaN or infinite", async () => {
      await expect(
        organizationService.adjustBalance("org-123", NaN),
      ).rejects.toThrow("Montant invalide pour l'ajustement du solde");

      await expect(
        organizationService.adjustBalance("org-123", Infinity),
      ).rejects.toThrow("Montant invalide pour l'ajustement du solde");
    });

    it("returns null if organization does not exist", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null });
      const mockSelectQuery = vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })),
      }));

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn(() => ({ select: mockSelectQuery })),
      });

      const result = await organizationService.adjustBalance(
        "unknown-org",
        100,
      );
      expect(result).toBeNull();
    });

    it("throws if the update operation fails (conflict or DB error), instead of returning null", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { balance_sats: 100 },
      });
      const mockSelectQuery = vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })),
      }));

      const mockUpdateSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "update failed" },
      });
      const mockUpdateSelect = vi.fn(() => ({ single: mockUpdateSingle }));
      const mockUpdateEqBalance = vi.fn(() => ({ select: mockUpdateSelect }));
      const mockUpdateEqId = vi.fn(() => ({ eq: mockUpdateEqBalance }));
      const mockUpdateQuery = vi.fn(() => ({ eq: mockUpdateEqId }));

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn(() => ({
          select: mockSelectQuery,
          update: mockUpdateQuery,
        })),
      });

      await expect(
        organizationService.adjustBalance("org-123", 50),
      ).rejects.toThrow(
        "Impossible de mettre à jour le solde (conflit de concurrence ou erreur base de données), veuillez réessayer",
      );
    });
  });
});
