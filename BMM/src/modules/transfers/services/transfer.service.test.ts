import { vi, describe, it, expect, beforeEach } from "vitest";
import { transferService } from "./transfer.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

const mockRow = {
  id: "trans-1",
  component: "CGR" as const,
  blood_type: "O-",
  quantity: 5,
  urgency: "vitale" as const,
  requester_id: "org-alpha",
  requester_name: "Centre National",
  requester_city: "Cotonou",
  responder_id: null,
  responder_name: null,
  status: "ouverte" as const,
  created_at: "2026-03-15T10:00:00.000Z",
};

describe("transferService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getNetworkTransfers", () => {
    it("returns mapped transfer records when rows are returned", async () => {
      const mockOrder = vi
        .fn()
        .mockResolvedValue({ data: [mockRow], error: null });
      const mockOr = vi.fn(() => ({ order: mockOrder }));
      const mockSelect = vi.fn(() => ({ or: mockOr }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: mockFrom,
      });

      const results = await transferService.getNetworkTransfers("org-alpha");

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        id: "trans-1",
        component: "CGR",
        bloodType: "O-",
        quantity: 5,
        urgency: "vitale",
        requesterId: "org-alpha",
        requesterName: "Centre National",
        requesterCity: "Cotonou",
        responderId: null,
        responderName: null,
        status: "ouverte",
        createdAt: new Date("2026-03-15T10:00:00.000Z"),
      });

      expect(mockFrom).toHaveBeenCalledWith("transfer_requests");
      expect(mockOr).toHaveBeenCalledWith(
        "requester_id.eq.org-alpha,responder_id.eq.org-alpha,status.eq.ouverte",
      );
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
    });

    it("returns an empty array when data is null", async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockOr = vi.fn(() => ({ order: mockOrder }));
      const mockSelect = vi.fn(() => ({ or: mockOr }));
      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      const results = await transferService.getNetworkTransfers("org-beta");
      expect(results).toEqual([]);
    });

    it("returns an empty array when database returns an error", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "database connection error" },
      });
      const mockOr = vi.fn(() => ({ order: mockOrder }));
      const mockSelect = vi.fn(() => ({ or: mockOr }));
      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      const results = await transferService.getNetworkTransfers("org-gamma");
      expect(results).toEqual([]);
    });

    it("handles multiple records with different statuses", async () => {
      const secondRow = {
        ...mockRow,
        id: "trans-2",
        responder_id: "org-beta",
        responder_name: "Clinique St Jean",
        status: "acceptée" as const,
      };

      const mockOrder = vi
        .fn()
        .mockResolvedValue({ data: [mockRow, secondRow], error: null });
      const mockOr = vi.fn(() => ({ order: mockOrder }));
      const mockSelect = vi.fn(() => ({ or: mockOr }));
      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      const results = await transferService.getNetworkTransfers("org-alpha");
      expect(results).toHaveLength(2);
      expect(results[1].responderId).toBe("org-beta");
      expect(results[1].status).toBe("acceptée");
    });
  });

  describe("createTransfer", () => {
    it("inserts row with status 'ouverte' and returns mapped transfer", async () => {
      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: mockRow, error: null });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockInsert = vi.fn(() => ({ select: mockSelect }));
      const mockFrom = vi.fn(() => ({ insert: mockInsert }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: mockFrom,
      });

      const input = {
        component: "CGR" as const,
        bloodType: "O-" as const,
        quantity: 5,
        urgency: "vitale" as const,
        requesterId: "org-alpha",
        requesterName: "Centre National",
        requesterCity: "Cotonou",
      };

      const created = await transferService.createTransfer(input);

      expect(mockInsert).toHaveBeenCalledWith([
        {
          component: "CGR",
          blood_type: "O-",
          quantity: 5,
          urgency: "vitale",
          requester_id: "org-alpha",
          requester_name: "Centre National",
          requester_city: "Cotonou",
          status: "ouverte",
        },
      ]);
      expect(created?.id).toBe("trans-1");
      expect(created?.status).toBe("ouverte");
    });

    it("allows creating a transfer with null requesterId", async () => {
      const nullReqRow = { ...mockRow, requester_id: null };
      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: nullReqRow, error: null });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockInsert = vi.fn(() => ({ select: mockSelect }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ insert: mockInsert })),
      });

      const created = await transferService.createTransfer({
        component: "Plasma",
        bloodType: "A+",
        quantity: 2,
        urgency: "haute",
        requesterId: null,
        requesterName: "Urgence Anonyme",
        requesterCity: "Parakou",
      });

      expect(created?.requesterId).toBeNull();
    });

    it("throws an error when database returns an error", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "violates foreign key" },
      });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockInsert = vi.fn(() => ({ select: mockSelect }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ insert: mockInsert })),
      });

      await expect(
        transferService.createTransfer({
          component: "Plaquettes",
          bloodType: "B+",
          quantity: 1,
          urgency: "moderee",
          requesterId: "org-xyz",
          requesterName: "Hopital",
          requesterCity: "Porto-Novo",
        }),
      ).rejects.toThrow(
        "Erreur lors de la création de la demande de transfert",
      );
    });

    it("throws an error when data returned is null", async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockInsert = vi.fn(() => ({ select: mockSelect }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ insert: mockInsert })),
      });

      await expect(
        transferService.createTransfer({
          component: "CGR",
          bloodType: "AB-",
          quantity: 3,
          urgency: "vitale",
          requesterId: "org-1",
          requesterName: "Centre",
          requesterCity: "Natitingou",
        }),
      ).rejects.toThrow(
        "Erreur lors de la création de la demande de transfert",
      );
    });
  });

  describe("getTransferById", () => {
    it("returns mapped transfer record when ID exists", async () => {
      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: mockRow, error: null });
      const mockEq = vi.fn(() => ({ single: mockSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      const result = await transferService.getTransferById("trans-1");
      expect(result).not.toBeNull();
      expect(result?.id).toBe("trans-1");
      expect(result?.bloodType).toBe("O-");
    });

    it("returns null when record is not found", async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockEq = vi.fn(() => ({ single: mockSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      const result = await transferService.getTransferById("non-existent");
      expect(result).toBeNull();
    });

    it("returns null when database returns an error", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "PGRST116 row not found" },
      });
      const mockEq = vi.fn(() => ({ single: mockSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      const result = await transferService.getTransferById("trans-error");
      expect(result).toBeNull();
    });
  });

  describe("respondTransfer", () => {
    it("updates transfer with responder info and status 'acceptée' only if status is 'ouverte'", async () => {
      const acceptedRow = {
        ...mockRow,
        responder_id: "resp-99",
        responder_name: "Hopital Central",
        status: "acceptée" as const,
      };

      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: acceptedRow, error: null });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockEqStatus = vi.fn(() => ({ select: mockSelect }));
      const mockEqId = vi.fn(() => ({ eq: mockEqStatus, select: mockSelect }));
      const mockUpdate = vi.fn(() => ({ eq: mockEqId }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ update: mockUpdate })),
      });

      const updated = await transferService.respondTransfer(
        "trans-1",
        "resp-99",
        "Hopital Central",
      );

      expect(mockUpdate).toHaveBeenCalledWith({
        responder_id: "resp-99",
        responder_name: "Hopital Central",
        status: "acceptée",
      });
      expect(mockEqId).toHaveBeenCalledWith("id", "trans-1");
      expect(mockEqStatus).toHaveBeenCalledWith("status", "ouverte");
      expect(updated?.responderId).toBe("resp-99");
      expect(updated?.status).toBe("acceptée");
    });

    it("allows null responderId when responding", async () => {
      const acceptedRow = {
        ...mockRow,
        responder_id: null,
        responder_name: "Anonyme",
        status: "acceptée" as const,
      };

      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: acceptedRow, error: null });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockEqStatus = vi.fn(() => ({ select: mockSelect }));
      const mockEqId = vi.fn(() => ({ eq: mockEqStatus, select: mockSelect }));
      const mockUpdate = vi.fn(() => ({ eq: mockEqId }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ update: mockUpdate })),
      });

      const updated = await transferService.respondTransfer(
        "trans-1",
        null,
        "Anonyme",
      );
      expect(updated?.responderId).toBeNull();
    });

    it("throws error if database returns an error or transfer is already closed", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "update failed" },
      });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockEqStatus = vi.fn(() => ({ select: mockSelect }));
      const mockEqId = vi.fn(() => ({ eq: mockEqStatus, select: mockSelect }));
      const mockUpdate = vi.fn(() => ({ eq: mockEqId }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ update: mockUpdate })),
      });

      await expect(
        transferService.respondTransfer("trans-1", "resp-99", "Hopital"),
      ).rejects.toThrow("Cette demande de transfert n'est plus disponible");
    });

    it("throws error if returned record is null", async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockEqStatus = vi.fn(() => ({ select: mockSelect }));
      const mockEqId = vi.fn(() => ({ eq: mockEqStatus, select: mockSelect }));
      const mockUpdate = vi.fn(() => ({ eq: mockEqId }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ update: mockUpdate })),
      });

      await expect(
        transferService.respondTransfer("trans-1", "resp-99", "Hopital"),
      ).rejects.toThrow("Cette demande de transfert n'est plus disponible");
    });
  });
});
