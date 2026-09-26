import { vi, describe, it, expect, beforeEach } from "vitest";
import { rewardService } from "./reward.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

const mockRewardRow = {
  id: "rw-001",
  donor_id: "donor-123",
  hospital_id: "hosp-456",
  sats_amount: 1000,
  status: "pending" as const,
  bolt11_invoice: "lnbc10u1p...",
  payment_hash: null,
  error_message: null,
  created_at: "2026-03-01T12:00:00.000Z",
};

describe("rewardService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createRewardLog", () => {
    it("creates a reward log with status 'pending' and returns mapped record", async () => {
      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: mockRewardRow, error: null });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockInsert = vi.fn(() => ({ select: mockSelect }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ insert: mockInsert })),
      });

      const result = await rewardService.createRewardLog({
        donorId: "donor-123",
        hospitalId: "hosp-456",
        satsAmount: 1000,
        bolt11Invoice: "lnbc10u1p...",
      });

      expect(result.id).toBe("rw-001");
      expect(result.donorId).toBe("donor-123");
      expect(result.hospitalId).toBe("hosp-456");
      expect(result.satsAmount).toBe(1000);
      expect(result.status).toBe("pending");
      expect(result.createdAt).toEqual(new Date("2026-03-01T12:00:00.000Z"));
    });

    it("throws when DB insert fails", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "connection timeout" },
      });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockInsert = vi.fn(() => ({ select: mockSelect }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ insert: mockInsert })),
      });

      await expect(
        rewardService.createRewardLog({
          donorId: "donor-123",
          hospitalId: null,
          satsAmount: 500,
        }),
      ).rejects.toThrow("Erreur lors de la création de la trace de récompense");
    });
  });

  describe("updateRewardStatus", () => {
    it("updates reward status to 'completed' with paymentHash", async () => {
      const completedRow = {
        ...mockRewardRow,
        status: "completed" as const,
        payment_hash: "hash123",
      };

      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: completedRow, error: null });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockEq = vi.fn(() => ({ select: mockSelect }));
      const mockUpdate = vi.fn(() => ({ eq: mockEq }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ update: mockUpdate })),
      });

      const result = await rewardService.updateRewardStatus(
        "rw-001",
        "completed",
        "hash123",
      );

      expect(mockUpdate).toHaveBeenCalledWith({
        status: "completed",
        payment_hash: "hash123",
        error_message: null,
      });
      expect(result.status).toBe("completed");
      expect(result.paymentHash).toBe("hash123");
    });

    it("updates reward status to 'failed' with errorMessage", async () => {
      const failedRow = {
        ...mockRewardRow,
        status: "failed" as const,
        error_message: "Route not found",
      };

      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: failedRow, error: null });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockEq = vi.fn(() => ({ select: mockSelect }));
      const mockUpdate = vi.fn(() => ({ eq: mockEq }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ update: mockUpdate })),
      });

      const result = await rewardService.updateRewardStatus(
        "rw-001",
        "failed",
        undefined,
        "Route not found",
      );

      expect(result.status).toBe("failed");
      expect(result.errorMessage).toBe("Route not found");
    });

    it("throws when update fails", async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockEq = vi.fn(() => ({ select: mockSelect }));
      const mockUpdate = vi.fn(() => ({ eq: mockEq }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ update: mockUpdate })),
      });

      await expect(
        rewardService.updateRewardStatus("rw-001", "completed"),
      ).rejects.toThrow("Erreur lors de la mise à jour de la récompense");
    });
  });

  describe("getHospitalRewardLogs", () => {
    it("returns mapped reward logs for given hospital", async () => {
      const mockOrder = vi
        .fn()
        .mockResolvedValue({ data: [mockRewardRow], error: null });
      const mockEq = vi.fn(() => ({ order: mockOrder }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      const results = await rewardService.getHospitalRewardLogs("hosp-456");
      expect(results).toHaveLength(1);
      expect(results[0].hospitalId).toBe("hosp-456");
      expect(mockEq).toHaveBeenCalledWith("hospital_id", "hosp-456");
    });

    it("throws when DB error occurs", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "query timeout" },
      });
      const mockEq = vi.fn(() => ({ order: mockOrder }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      await expect(
        rewardService.getHospitalRewardLogs("hosp-456"),
      ).rejects.toThrow(
        "Erreur lors de la récupération des traces de récompense",
      );
    });
  });

  describe("getDonorRewardLogs", () => {
    it("returns mapped reward logs for given donor", async () => {
      const mockOrder = vi
        .fn()
        .mockResolvedValue({ data: [mockRewardRow], error: null });
      const mockEq = vi.fn(() => ({ order: mockOrder }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      const results = await rewardService.getDonorRewardLogs("donor-123");
      expect(results).toHaveLength(1);
      expect(results[0].donorId).toBe("donor-123");
      expect(mockEq).toHaveBeenCalledWith("donor_id", "donor-123");
    });

    it("throws when DB error occurs", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "db unavailable" },
      });
      const mockEq = vi.fn(() => ({ order: mockOrder }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      await expect(
        rewardService.getDonorRewardLogs("donor-123"),
      ).rejects.toThrow(
        "Erreur lors de la récupération des récompenses du donneur",
      );
    });
  });

  describe("hasRecentCompletedReward", () => {
    it("returns true when a completed reward exists within the days window", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { id: "rw-001" },
        error: null,
      });
      const mockLimit = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
      const mockGte = vi.fn(() => ({ limit: mockLimit }));
      const mockEqStatus = vi.fn(() => ({ gte: mockGte }));
      const mockEqDonor = vi.fn(() => ({ eq: mockEqStatus }));
      const mockSelect = vi.fn(() => ({ eq: mockEqDonor }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      const hasRecent = await rewardService.hasRecentCompletedReward(
        "donor-123",
        56,
      );
      expect(hasRecent).toBe(true);
      expect(mockEqStatus).toHaveBeenCalledWith("status", "completed");
    });

    it("returns false when no completed reward exists within the days window", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      const mockLimit = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
      const mockGte = vi.fn(() => ({ limit: mockLimit }));
      const mockEqStatus = vi.fn(() => ({ gte: mockGte }));
      const mockEqDonor = vi.fn(() => ({ eq: mockEqStatus }));
      const mockSelect = vi.fn(() => ({ eq: mockEqDonor }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      const hasRecent = await rewardService.hasRecentCompletedReward(
        "donor-123",
        56,
      );
      expect(hasRecent).toBe(false);
    });
  });
});
