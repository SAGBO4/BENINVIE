import { vi, describe, it, expect, beforeEach } from "vitest";
import { documentService } from "./document.service";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient: vi.fn(),
}));

describe("documentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws configuration error when SUPABASE_SERVICE_ROLE_KEY is not configured", async () => {
    (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(
      null,
    );

    const dummyFile = new File(["test"], "license.pdf", {
      type: "application/pdf",
    });
    await expect(
      documentService.uploadDocument("org-1", "license", dummyFile),
    ).rejects.toThrow(
      "Stockage indisponible: SUPABASE_SERVICE_ROLE_KEY n'est pas configurée.",
    );
  });

  describe("uploadDocument", () => {
    it("throws badRequest if file is empty (size 0)", async () => {
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(
        {},
      );

      const emptyFile = new File([], "empty.pdf", { type: "application/pdf" });
      await expect(
        documentService.uploadDocument("org-1", "license", emptyFile),
      ).rejects.toThrow("Fichier manquant ou vide.");
    });

    it("throws badRequest if file exceeds 25 MB limit", async () => {
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue(
        {},
      );

      // Mock large file > 25MB
      const hugeFile = {
        name: "huge.pdf",
        size: 26 * 1024 * 1024,
        type: "application/pdf",
      } as unknown as File;

      await expect(
        documentService.uploadDocument("org-1", "license", hugeFile),
      ).rejects.toThrow("Le fichier ne doit pas dépasser 25 Mo.");
    });

    it("uploads document to storage and upserts row successfully", async () => {
      const mockUpload = vi
        .fn()
        .mockResolvedValue({ data: { path: "org-1/license" }, error: null });
      const mockStorageFrom = vi.fn(() => ({ upload: mockUpload }));

      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      const mockUpdateIs = vi.fn().mockResolvedValue({ error: null });
      const mockUpdateEq = vi.fn(() => ({ is: mockUpdateIs }));
      const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }));

      const mockFrom = vi.fn((table: string) => {
        if (table === "organization_documents") {
          return { upsert: mockUpsert };
        }
        if (table === "organizations") {
          return { update: mockUpdate };
        }
        return {};
      });

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        storage: { from: mockStorageFrom },
        from: mockFrom,
      });

      const validFile = new File(["content"], "license.pdf", {
        type: "application/pdf",
      });
      const result = await documentService.uploadDocument(
        "org-1",
        "license",
        validFile,
      );

      expect(mockStorageFrom).toHaveBeenCalledWith("org-documents");
      expect(mockUpload).toHaveBeenCalledWith("org-1/license", validFile, {
        upsert: true,
        contentType: "application/pdf",
      });
      expect(mockUpsert).toHaveBeenCalledWith(
        [
          {
            organization_id: "org-1",
            doc_type: "license",
            storage_path: "org-1/license",
            file_name: "license.pdf",
          },
        ],
        { onConflict: "organization_id,doc_type" },
      );
      expect(result.docType).toBe("license");
      expect(result.fileName).toBe("license.pdf");
      expect(result.uploadedAt).toBeInstanceOf(Date);
    });

    it("throws when storage upload fails", async () => {
      const mockUpload = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "storage full" },
      });
      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        storage: { from: vi.fn(() => ({ upload: mockUpload })) },
      });

      const validFile = new File(["content"], "license.pdf", {
        type: "application/pdf",
      });
      await expect(
        documentService.uploadDocument("org-1", "license", validFile),
      ).rejects.toThrow("Échec du téléversement du justificatif.");
    });

    it("throws when DB upsert fails", async () => {
      const mockUpload = vi.fn().mockResolvedValue({ data: {}, error: null });
      const mockUpsert = vi.fn().mockResolvedValue({
        error: { message: "constraint error" },
      });

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        storage: { from: vi.fn(() => ({ upload: mockUpload })) },
        from: vi.fn(() => ({ upsert: mockUpsert })),
      });

      const validFile = new File(["content"], "license.pdf", {
        type: "application/pdf",
      });
      await expect(
        documentService.uploadDocument("org-1", "license", validFile),
      ).rejects.toThrow("Échec de l'enregistrement du justificatif.");
    });
  });

  describe("listDocuments", () => {
    it("returns mapped document rows without URLs", async () => {
      const rows = [
        {
          doc_type: "license",
          file_name: "doc.pdf",
          storage_path: "org-1/license",
          uploaded_at: "2026-03-01T12:00:00.000Z",
        },
      ];
      const mockEq = vi.fn().mockResolvedValue({ data: rows, error: null });
      const mockSelect = vi.fn(() => ({ eq: mockEq }));

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      const docs = await documentService.listDocuments("org-1");
      expect(docs).toHaveLength(1);
      expect(docs[0].docType).toBe("license");
      expect(docs[0].url).toBeUndefined();
      expect(docs[0].uploadedAt).toEqual(new Date("2026-03-01T12:00:00.000Z"));
    });

    it("returns empty array on error", async () => {
      const mockEq = vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: "err" } });
      const mockSelect = vi.fn(() => ({ eq: mockEq }));

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn(() => ({ select: mockSelect })),
      });

      const docs = await documentService.listDocuments("org-1");
      expect(docs).toEqual([]);
    });
  });

  describe("listSignedDocuments", () => {
    it("returns documents with signed URLs for admin", async () => {
      const rows = [
        {
          doc_type: "license",
          file_name: "lic.pdf",
          storage_path: "org-1/license",
          uploaded_at: "2026-03-01T12:00:00.000Z",
        },
      ];
      const mockEq = vi.fn().mockResolvedValue({ data: rows, error: null });
      const mockSelect = vi.fn(() => ({ eq: mockEq }));

      const mockCreateSignedUrl = vi.fn().mockResolvedValue({
        data: { signedUrl: "https://storage.supabase.co/signed-url-lic" },
        error: null,
      });

      (createSupabaseAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn(() => ({ select: mockSelect })),
        storage: {
          from: vi.fn(() => ({ createSignedUrl: mockCreateSignedUrl })),
        },
      });

      const docs = await documentService.listSignedDocuments("org-1");
      expect(docs).toHaveLength(1);
      expect(docs[0].url).toBe("https://storage.supabase.co/signed-url-lic");
      expect(mockCreateSignedUrl).toHaveBeenCalledWith("org-1/license", 600);
    });
  });
});
