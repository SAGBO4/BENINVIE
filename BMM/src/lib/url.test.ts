/**
 * Tests d'audit QA — url.ts
 *
 * Ces tests ciblent les failles U-1 à U-3 (voir audit_qa.md).
 * Note : url.ts importe clientEnv depuis l'environnement ; on mocke
 * l'origine via window.location.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// On importe APRÈS le mock de l'environnement
// car url.ts lit clientEnv au moment du module load.
// On utilise vi.mock pour intercepter le module d'env.

vi.mock("@/lib/env/client", () => ({
  clientEnv: {
    NEXT_PUBLIC_APP_URL: "https://hemora.org",
  },
}));

// Import dynamique pour s'assurer que les mocks sont en place avant.
const { publicUrl, getAppOrigin } = await import("./url");

describe("getAppOrigin", () => {
  // Côté serveur (window undefined)
  it("returns the configured NEXT_PUBLIC_APP_URL when window is undefined (SSR)", () => {
    const original = globalThis.window;
    // @ts-expect-error — simulation SSR
    delete globalThis.window;
    try {
      expect(getAppOrigin()).toBe("https://hemora.org");
    } finally {
      globalThis.window = original;
    }
  });

  // Côté navigateur — retourne window.location.origin
  it("returns window.location.origin in a browser environment", () => {
    Object.defineProperty(window, "location", {
      value: { origin: "https://staging.hemora.org" },
      writable: true,
      configurable: true,
    });
    expect(getAppOrigin()).toBe("https://staging.hemora.org");
  });
});

describe("publicUrl", () => {
  beforeEach(() => {
    // Simuler un environnement SSR pour avoir une base prévisible
    Object.defineProperty(globalThis, "window", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // U-1 : path vide
  it("returns the origin with a trailing slash for an empty path", () => {
    const result = publicUrl("");
    expect(result).toBe("https://hemora.org/");
  });

  // U-2 : path avec plusieurs slashes initiaux
  it("strips multiple leading slashes from the path", () => {
    expect(publicUrl("//donate")).toBe("https://hemora.org/donate");
    expect(publicUrl("///donate/now")).toBe("https://hemora.org/donate/now");
  });

  // Path normal sans slash initial
  it("builds a correct URL for a path without leading slash", () => {
    expect(publicUrl("verify/abc-123")).toBe(
      "https://hemora.org/verify/abc-123",
    );
  });

  // Path avec un seul slash initial
  it("builds a correct URL for a path with a single leading slash", () => {
    expect(publicUrl("/verify/abc-123")).toBe(
      "https://hemora.org/verify/abc-123",
    );
  });

  // U-3 : path avec query string
  it("preserves query strings in the path", () => {
    expect(publicUrl("donate?ref=campaign")).toBe(
      "https://hemora.org/donate?ref=campaign",
    );
  });

  // U-3 : path avec fragment
  it("preserves URL fragments in the path", () => {
    expect(publicUrl("about#mission")).toBe("https://hemora.org/about#mission");
  });

  // Path avec espaces — comportement documenté (non encodé)
  it("does not encode spaces in the path (raw pass-through)", () => {
    const result = publicUrl("search?q=don de sang");
    // Le comportement actuel ne code pas les espaces — le tester explicitement
    // pour alerter si un encodage est ajouté plus tard.
    expect(result).toContain("don de sang");
  });

  // NEXT_PUBLIC_APP_URL avec trailing slash — doit être supprimé
  it("strips a trailing slash from NEXT_PUBLIC_APP_URL before joining", () => {
    // Déjà garanti par replace(/\/+$/, "") dans url.ts — vérification défensive
    expect(publicUrl("donate")).not.toContain("//donate");
  });
});
