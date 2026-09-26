/**
 * use-form-draft.extended.test.ts
 *
 * Tests complémentaires (edge-cases & failles) pour useFormDraft.
 * Ne pas fusionner avec use-form-draft.test.ts.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useFormDraft } from "./use-form-draft";

const PREFIX = "hemora.draft.";
const KEY = "extended-form";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

beforeEach(() => {
  window.localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// save()
// ---------------------------------------------------------------------------
describe("save() — cas limites", () => {
  it("avec key vide → écrit dans localStorage sous la clé 'hemora.draft.' (pollution)", () => {
    const { result } = renderHook(() => useFormDraft<{ x: string }>("", {}));

    act(() => result.current.save({ x: "val" }));

    // La clé produite est exactement PREFIX + "" → pollution du namespace
    expect(window.localStorage.getItem(PREFIX)).not.toBeNull();
  });

  it("avec values = {} → sauvegarde sans crash, localStorage non-null", () => {
    const { result } = renderHook(() =>
      useFormDraft<Record<string, never>>(KEY),
    );

    expect(() => act(() => result.current.save({}))).not.toThrow();

    const raw = window.localStorage.getItem(PREFIX + KEY);
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw!);
    expect(parsed.values).toEqual({});
  });

  it("avec omit contenant une clé inexistante → pas de crash", () => {
    const { result } = renderHook(() =>
      useFormDraft<{ name: string }>(KEY, {
        omit: ["nonexistent" as keyof { name: string }],
      }),
    );

    expect(() =>
      act(() => result.current.save({ name: "Alice" })),
    ).not.toThrow();
  });

  it("quand localStorage.setItem lève une erreur (quota) → pas de crash", () => {
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });

    const { result } = renderHook(() => useFormDraft<{ name: string }>(KEY));

    expect(() => act(() => result.current.save({ name: "Bob" }))).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// clear()
// ---------------------------------------------------------------------------
describe("clear() — cas limites", () => {
  it("quand rien n'a été sauvegardé → pas de crash", () => {
    const { result } = renderHook(() => useFormDraft(KEY));
    expect(() => act(() => result.current.clear())).not.toThrow();
    expect(result.current.draft).toBeNull();
  });

  it("quand localStorage.removeItem lève une erreur → pas de crash", () => {
    vi.spyOn(window.localStorage, "removeItem").mockImplementation(() => {
      throw new DOMException("SecurityError");
    });

    const { result } = renderHook(() => useFormDraft<{ city: string }>(KEY));

    // Remettre setItem fonctionnel pour ce test
    act(() => result.current.save({ city: "Cotonou" }));
    expect(() => act(() => result.current.clear())).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// read() — logique d'expiration
// ---------------------------------------------------------------------------
describe("read() — expiration du brouillon", () => {
  it("savedAt = NaN → draft écarté (brouillon invalide)", () => {
    window.localStorage.setItem(
      PREFIX + KEY,
      JSON.stringify({ savedAt: NaN, values: { city: "Lagos" } }),
    );

    const { result } = renderHook(() => useFormDraft(KEY));
    expect(result.current.draft).toBeNull();
    // L'entrée corrompue doit avoir été supprimée
    expect(window.localStorage.getItem(PREFIX + KEY)).toBeNull();
  });

  it("savedAt = undefined → draft écarté", () => {
    window.localStorage.setItem(
      PREFIX + KEY,
      JSON.stringify({ values: { city: "Abuja" } }), // savedAt absent
    );

    const { result } = renderHook(() => useFormDraft(KEY));
    expect(result.current.draft).toBeNull();
  });

  it("savedAt exactement à la limite (24h) → draft CONSERVÉ (boundary inclusif : faille)", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    window.localStorage.setItem(
      PREFIX + KEY,
      JSON.stringify({ savedAt: now - MAX_AGE_MS, values: { city: "Dakar" } }),
    );

    const { result } = renderHook(() => useFormDraft(KEY));
    // La condition est `> MAX_AGE_MS` (strict), donc à exactement MAX_AGE_MS
    // le draft est CONSERVÉ — c'est un bug de borne : un brouillon de 24h
    // pile n'est pas écarté alors qu'il devrait l'être.
    expect(result.current.draft).toEqual({ city: "Dakar" });
  });

  it("savedAt à 1ms avant la limite → draft conservé", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    window.localStorage.setItem(
      PREFIX + KEY,
      JSON.stringify({
        savedAt: now - MAX_AGE_MS + 1,
        values: { city: "Lomé" },
      }),
    );

    const { result } = renderHook(() => useFormDraft(KEY));
    expect(result.current.draft).toEqual({ city: "Lomé" });
  });
});

// ---------------------------------------------------------------------------
// Isolation entre instances
// ---------------------------------------------------------------------------
describe("isolation entre instances", () => {
  it("deux instances avec des keys différentes sont indépendantes", () => {
    const hookA = renderHook(() => useFormDraft<{ name: string }>("key-A"));
    const hookB = renderHook(() => useFormDraft<{ name: string }>("key-B"));

    act(() => hookA.result.current.save({ name: "Alice" }));

    // B n'a rien reçu
    const hookB2 = renderHook(() => useFormDraft<{ name: string }>("key-B"));
    expect(hookB2.result.current.draft).toBeNull();

    // A a bien sauvegardé
    const hookA2 = renderHook(() => useFormDraft<{ name: string }>("key-A"));
    expect(hookA2.result.current.draft).toEqual({ name: "Alice" });

    hookA.unmount();
    hookB.unmount();
  });

  it("deux instances avec la même key partagent le même localStorage", () => {
    const hook1 = renderHook(() => useFormDraft<{ score: number }>(KEY));
    const hook2 = renderHook(() => useFormDraft<{ score: number }>(KEY));

    act(() => hook1.result.current.save({ score: 42 }));

    // Une troisième instance lit ce qu'a écrit hook1
    const hook3 = renderHook(() => useFormDraft<{ score: number }>(KEY));
    expect(hook3.result.current.draft).toEqual({ score: 42 });

    hook1.unmount();
    hook2.unmount();
    hook3.unmount();
  });
});

// ---------------------------------------------------------------------------
// restored
// ---------------------------------------------------------------------------
describe("restored", () => {
  it("passe de false à true après montage", async () => {
    const { result } = renderHook(() => useFormDraft(KEY));
    // Après l'effet de montage (géré par renderHook + act interne)
    expect(result.current.restored).toBe(true);
  });
});
