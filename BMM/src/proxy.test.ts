/**
 * Tests d'audit QA — proxy.ts
 *
 * Le proxy est le middleware Next.js qui vérifie la session Supabase et
 * protège les routes d'API privées.
 *
 * Failles ciblées :
 * - Routes publiques exemptées (auth, register, verify, search, public)
 * - Route privée sans session → 401
 * - Route privée avec session → passe
 * - Session timeout (DeadlineExceededError) → échoue fermé (401)
 * - Variables d'env manquantes → passe sans vérification (fail-open)
 * - Méthode POST /api/v1/donors → exempté
 * - Méthode GET /api/v1/donors → protégé
 * - POST /api/v1/donations → exempté
 * - prefix /api/v1/verify/ → exempté
 * - prefix /api/v1/search/ → exempté
 * - prefix /api/v1/public/ → exempté
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "./proxy";

// ---------------------------------------------------------------------------
// Mock next/server pour tourner hors Edge Runtime
// ---------------------------------------------------------------------------
vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return {
    ...actual,
    NextResponse: {
      next: vi.fn(({ request: _request }: { request?: unknown } = {}) => ({
        cookies: {
          set: vi.fn(),
          get: vi.fn(),
          getAll: vi.fn(() => []),
        },
        headers: new Headers(),
        status: 200,
        _isNext: true,
      })),
      json: vi.fn((body: unknown, init?: ResponseInit) => ({
        body,
        status: init?.status ?? 200,
        _isJson: true,
      })),
    },
  };
});

// Mock @supabase/ssr
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
  })),
}));

// Mock withDeadline de @/lib/deadline
vi.mock("@/lib/deadline", () => ({
  withDeadline: vi.fn(async (promise: PromiseLike<unknown>) => promise),
  DeadlineExceededError: class DeadlineExceededError extends Error {
    constructor(label: string, ms: number) {
      super(`${label}: délai de ${ms} ms dépassé.`);
      this.name = "DeadlineExceededError";
    }
  },
}));

// ---------------------------------------------------------------------------
// Helper : construire une NextRequest minimale
// ---------------------------------------------------------------------------
function makeRequest(path: string, method = "GET"): NextRequest {
  const url = `https://hemora.org${path}`;
  return new NextRequest(url, {
    method,
    headers: new Headers(),
  });
}

describe("proxy middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Variables d'env présentes par défaut
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key-test";
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  });

  // -------------------------------------------------------------------------
  // Variables d'env manquantes → fail-open (laisse passer sans vérification)
  // -------------------------------------------------------------------------
  it("passes all requests through when SUPABASE_URL is missing (fail-open)", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const req = makeRequest("/api/v1/donors/me");
    const res = await proxy(req);
    // Doit retourner NextResponse.next() sans json 401
    expect((res as { _isNext?: boolean })._isNext).toBe(true);
  });

  it("passes all requests through when SUPABASE_ANON_KEY is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const req = makeRequest("/api/v1/donors/me");
    const res = await proxy(req);
    expect((res as { _isNext?: boolean })._isNext).toBe(true);
  });

  it("falls back to NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY when ANON_KEY is absent", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pub-key-test";
    // Ne doit pas planter
    await expect(proxy(makeRequest("/api/v1/health"))).resolves.toBeDefined();
  });

  // -------------------------------------------------------------------------
  // Routes d'API publiques exemptées
  // -------------------------------------------------------------------------
  const publicRoutes: [string, string][] = [
    ["/api/v1/health", "GET"],
    ["/api/v1/docs", "GET"],
    ["/api/v1/openapi.json", "GET"],
    ["/api/v1/auth/login", "POST"],
    ["/api/v1/auth/register", "POST"],
    ["/api/v1/auth/logout", "POST"],
    ["/api/v1/auth/me", "GET"],
    ["/api/v1/donors", "POST"],
    ["/api/v1/donations", "POST"],
    ["/api/v1/verify/abc-123", "GET"],
    ["/api/v1/search?q=test", "GET"],
    ["/api/v1/public/stats", "GET"],
  ];

  it.each(publicRoutes)(
    "allows unauthenticated access to %s %s",
    async (path, method) => {
      const { createServerClient } = await import("@supabase/ssr");
      const supabase = (
        createServerClient as unknown as () => {
          auth: { getUser: ReturnType<typeof vi.fn> };
        }
      )();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const req = makeRequest(path, method);
      const res = await proxy(req);
      // Route publique → jamais de 401
      expect((res as { status?: number }).status).not.toBe(401);
    },
  );

  // -------------------------------------------------------------------------
  // Routes privées sans session → 401
  // -------------------------------------------------------------------------
  const privateRoutes: [string, string][] = [
    ["/api/v1/donors", "GET"],
    ["/api/v1/donors/me", "GET"],
    ["/api/v1/donors/me/withdraw", "POST"],
    ["/api/v1/organizations", "GET"],
    ["/api/v1/campaigns", "POST"],
    ["/api/v1/emergencies", "GET"],
  ];

  it.each(privateRoutes)(
    "returns 401 for unauthenticated access to %s %s",
    async (path, method) => {
      const { createServerClient } = await import("@supabase/ssr");
      const supabase = (
        createServerClient as unknown as () => {
          auth: { getUser: ReturnType<typeof vi.fn> };
        }
      )();
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const req = makeRequest(path, method);
      const res = await proxy(req);
      expect((res as { status?: number }).status).toBe(401);
      expect((res as { body?: unknown }).body).toMatchObject({
        error: { code: "unauthorized" },
      });
    },
  );

  // -------------------------------------------------------------------------
  // Route privée avec session valide → passe (pas de 401)
  // -------------------------------------------------------------------------
  it("allows authenticated access to a private route", async () => {
    const { createServerClient } = await import("@supabase/ssr");
    // Chaque appel à createServerClient() dans proxy() crée un nouvel objet.
    // On configure la factory pour retourner un client avec getUser résolu.
    (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "uid-ok" } },
          error: null,
        }),
      },
    });

    const req = makeRequest("/api/v1/donors/me", "GET");
    const res = await proxy(req);
    // Avec session valide → jamais de 401.
    expect((res as { status?: number }).status).not.toBe(401);
    expect((res as { body?: { error?: unknown } }).body?.error).toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // Timeout session → échoue fermé (401)
  // -------------------------------------------------------------------------
  it("returns 401 when session verification times out (fail-closed)", async () => {
    const { withDeadline } = await import("@/lib/deadline");
    (withDeadline as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Vérification de session: délai de 8000 ms dépassé."),
    );

    const req = makeRequest("/api/v1/donors/me", "GET");
    const res = await proxy(req);
    // Le catch log l'erreur et user reste null → 401 pour route privée
    expect((res as { status?: number }).status).toBe(401);
  });

  // -------------------------------------------------------------------------
  // Chemins non-API → passe toujours (pages Next.js)
  // -------------------------------------------------------------------------
  it("does not apply API protection to non-/api/v1 paths", async () => {
    const req = makeRequest("/dashboard", "GET");
    const res = await proxy(req);
    // Pas de 401, juste NextResponse.next()
    expect((res as { _isNext?: boolean })._isNext).toBe(true);
  });
});
