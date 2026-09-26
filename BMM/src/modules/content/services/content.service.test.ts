import { vi, describe, it, expect, beforeEach } from "vitest";
import { contentService } from "./content.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

const mockContentRow = {
  key: "terms",
  title: "Conditions Générales",
  body: "# CGU\nTexte légal",
  updated_at: "2026-02-01T10:00:00.000Z",
};

describe("contentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("get", () => {
    it("returns mapped content when found within deadline", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: mockContentRow,
        error: null,
      });
      const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      const result = await contentService.get("terms");

      expect(result).toEqual({
        key: "terms",
        title: "Conditions Générales",
        body: "# CGU\nTexte légal",
        updatedAt: "2026-02-01T10:00:00.000Z",
      });
    });

    it("returns null when row is not found or error occurs without throwing", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "not found" },
      });
      const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      const result = await contentService.get("unknown-key");
      expect(result).toBeNull();
    });

    it("returns null when database promise rejects or times out", async () => {
      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error("Connection refused"));

      const result = await contentService.get("any-key");
      expect(result).toBeNull();
    });
  });

  describe("list", () => {
    it("returns all content rows mapped and sorted", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [mockContentRow],
        error: null,
      });
      const mockSelect = vi.fn(() => ({ order: mockOrder }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      const list = await contentService.list();
      expect(list).toHaveLength(1);
      expect(list[0].key).toBe("terms");
      expect(mockOrder).toHaveBeenCalledWith("key");
    });

    it("throws an error if query fails", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "table does not exist" },
      });
      const mockSelect = vi.fn(() => ({ order: mockOrder }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      await expect(contentService.list()).rejects.toThrow(
        "Contenus indisponibles: table does not exist",
      );
    });
  });

  describe("save", () => {
    it("upserts content with onConflict key and returns mapped record", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockContentRow,
        error: null,
      });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockUpsert = vi.fn(() => ({ select: mockSelect }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ upsert: mockUpsert })),
      });

      const saved = await contentService.save({
        key: "terms",
        title: "Conditions Générales",
        body: "# CGU\nTexte légal",
        updatedBy: "user-admin-1",
      });

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          key: "terms",
          title: "Conditions Générales",
          body: "# CGU\nTexte légal",
          updated_by: "user-admin-1",
        }),
        { onConflict: "key" },
      );
      expect(saved.key).toBe("terms");
    });

    it("throws when upsert fails with error", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "permission denied for table site_content" },
      });
      const mockSelect = vi.fn(() => ({ single: mockSingle }));
      const mockUpsert = vi.fn(() => ({ select: mockSelect }));

      (
        createSupabaseServerClient as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        from: vi.fn(() => ({ upsert: mockUpsert })),
      });

      await expect(
        contentService.save({
          key: "terms",
          title: "Conditions Générales",
          body: "...",
          updatedBy: "user-2",
        }),
      ).rejects.toThrow("permission denied for table site_content");
    });
  });
});
