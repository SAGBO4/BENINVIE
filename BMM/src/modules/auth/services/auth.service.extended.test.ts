/**
 * Tests d'audit QA — auth.service.ts (extended)
 *
 * Le fichier de base couvre login, logout, getCurrentUser (happy path + no session).
 * Ce fichier cible les failles non couvertes :
 * - signUpOrganization : rollback correct, admin null, user orphelin
 * - getCurrentUser : user est donor (pas org_admin)
 * - getCurrentUser : profil introuvable après auth
 * - getCurrentUser : erreur profileError loggée mais retourne null
 */
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";
import { authService } from "./auth.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Mock Supabase — réplique fidèle de auth.service.test.ts
// ---------------------------------------------------------------------------
vi.mock("@/lib/supabase/server", () => {
  const mockAuth = {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
    getUser: vi.fn(),
    admin: { deleteUser: vi.fn() },
  };

  const client = {
    auth: mockAuth,
    from: vi.fn(),
  };

  return {
    createSupabaseServerClient: vi.fn(() => Promise.resolve(client)),
    createSupabaseAdminClient: vi.fn(() => client),
  };
});

describe("authService — extended", () => {
  let mockClient: {
    auth: Record<string, Mock>;
    from: Mock;
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockClient = (await createSupabaseServerClient()) as unknown as {
      auth: Record<string, Mock>;
      from: Mock;
    };
  });

  // -------------------------------------------------------------------------
  // signUpOrganization
  // -------------------------------------------------------------------------
  describe("signUpOrganization", () => {
    const signUpData = {
      email: "admin@hospital.bj",
      password: "SuperPass123!",
      name: "CHU Cotonou",
      type: "hospital" as const,
      latitude: 6.37,
      longitude: 2.42,
      city: "Cotonou",
      contactEmail: "contact@chu.bj",
    };

    it("creates user, org and profile and returns both on success", async () => {
      const mockUser = { id: "uid-1" };
      const mockOrg = { id: "org-1", name: "CHU Cotonou" };

      mockClient.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockClient.from.mockImplementation((table: string) => {
        if (table === "organizations") {
          return {
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi
                  .fn()
                  .mockResolvedValue({ data: mockOrg, error: null }),
              })),
            })),
          };
        }
        if (table === "user_profiles") {
          return {
            upsert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      const result = await authService.signUpOrganization(signUpData);
      expect(result.user).toEqual(mockUser);
      expect(result.organization).toEqual(mockOrg);
    });

    it("throws if signUp auth fails (email already used)", async () => {
      mockClient.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: "User already registered" },
      });

      await expect(authService.signUpOrganization(signUpData)).rejects.toThrow(
        "User already registered",
      );
    });

    it("throws and deletes the auth user if org insertion fails", async () => {
      const mockUser = { id: "uid-orphan" };
      mockClient.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockDeleteUser = vi.fn().mockResolvedValue({ error: null });
      (mockClient.auth as unknown as { admin: unknown }).admin = {
        deleteUser: mockDeleteUser,
      };

      mockClient.from.mockImplementation((table: string) => {
        if (table === "organizations") {
          return {
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi
                  .fn()
                  .mockResolvedValue({
                    data: null,
                    error: { message: "DB error" },
                  }),
              })),
            })),
          };
        }
        return {};
      });

      await expect(
        authService.signUpOrganization(signUpData),
      ).rejects.toThrow();

      // L'utilisateur auth orphelin doit être supprimé
      expect(mockDeleteUser).toHaveBeenCalledWith("uid-orphan");
    });

    it("throws and rolls back org + user if profile upsert fails", async () => {
      const mockUser = { id: "uid-rollback" };
      const mockOrg = { id: "org-rollback" };
      mockClient.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockDeleteUser = vi.fn().mockResolvedValue({ error: null });
      (mockClient.auth as unknown as { admin: unknown }).admin = {
        deleteUser: mockDeleteUser,
      };
      const mockDeleteOrg = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      mockClient.from.mockImplementation((table: string) => {
        if (table === "organizations") {
          return {
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi
                  .fn()
                  .mockResolvedValue({ data: mockOrg, error: null }),
              })),
            })),
            delete: mockDeleteOrg,
          };
        }
        if (table === "user_profiles") {
          return {
            upsert: vi
              .fn()
              .mockResolvedValue({ error: { message: "Profile error" } }),
          };
        }
        return {};
      });

      await expect(
        authService.signUpOrganization(signUpData),
      ).rejects.toThrow();

      // Rollback : org supprimée puis user auth supprimé
      expect(mockDeleteOrg).toHaveBeenCalled();
      expect(mockDeleteUser).toHaveBeenCalledWith("uid-rollback");
    });

    it("throws immediately if admin client is null (no SERVICE_ROLE_KEY)", async () => {
      const { createSupabaseAdminClient: mockAdmin } =
        await import("@/lib/supabase/server");
      (mockAdmin as Mock).mockReturnValueOnce(null);

      await expect(authService.signUpOrganization(signUpData)).rejects.toThrow(
        "SUPABASE_SERVICE_ROLE_KEY",
      );
    });
  });

  // -------------------------------------------------------------------------
  // getCurrentUser — cas donor
  // -------------------------------------------------------------------------
  describe("getCurrentUser — donor path", () => {
    it("returns a donor profile when the user exists in the donors table", async () => {
      const mockUser = { id: "donor-uid", email: "don@blood.bj" };
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockDonor = {
        id: "donor-uid",
        first_name: "Kofi",
        last_name: "Mensah",
        blood_type: "O+",
        city: "Lomé",
        latitude: 6.13,
        longitude: 1.22,
        age: 28,
        available: true,
        bitcoin_address: "bc1qtest",
        profile_hash: "abc123",
        ots_proof: null,
        validated: true,
        created_at: "2026-01-01T00:00:00.000Z",
        balance_sats: 500,
        card_type: null,
        physical_card_status: null,
        referred_by: null,
      };

      mockClient.from.mockImplementation((table: string) => {
        if (table === "donors") {
          return makeMaybySingleChain({ data: mockDonor, error: null });
        }
        return makeMaybySingleChain({ data: null, error: null });
      });

      const result = await authService.getCurrentUser();

      expect(result?.role).toBe("donor");
      expect(result?.donor?.firstName).toBe("Kofi");
      expect(result?.donor?.bloodType).toBe("O+");
      expect(result?.organizationId).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // getCurrentUser — cas erreur auth
  // -------------------------------------------------------------------------
  describe("getCurrentUser — error paths", () => {
    it("returns null when getUser returns an auth error", async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "JWT expired" },
      });

      const result = await authService.getCurrentUser();
      expect(result).toBeNull();
    });

    it("returns null when user_profiles returns no data (unfinished registration)", async () => {
      const mockUser = { id: "uid-incomplete", email: "x@x.bj" };
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockClient.from.mockImplementation(() =>
        makeMaybySingleChain({ data: null, error: null }),
      );

      const result = await authService.getCurrentUser();
      expect(result).toBeNull();
    });

    it("returns null when profile read fails with an error (logs but does not throw)", async () => {
      const mockUser = { id: "uid-err", email: "e@x.bj" };
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockClient.from.mockImplementation(() =>
        makeMaybySingleChain({
          data: null,
          error: { message: "RLS violation" },
        }),
      );

      // Doit retourner null sans throw
      await expect(authService.getCurrentUser()).resolves.toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// Helper corrigé (maybeSingle)
// ---------------------------------------------------------------------------
function makeMaybySingleChain(result: { data: unknown; error: unknown }) {
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn().mockResolvedValue(result),
      })),
    })),
  };
}
