/**
 * use-geolocation.test.ts
 *
 * Tests exhaustifs pour le hook useGeolocation.
 * Couvre : état initial, request() succès/erreur/absence API, setCoords(), arrondi.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useGeolocation } from "./use-geolocation";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makePosition(lat: number, lon: number): GeolocationPosition {
  return {
    coords: {
      latitude: lat,
      longitude: lon,
      accuracy: 1,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON: () => ({}),
    },
    timestamp: Date.now(),
    toJSON: () => ({}),
  } as unknown as GeolocationPosition;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// État initial
// ---------------------------------------------------------------------------
describe("état initial", () => {
  it("sans coordonnées initiales → coords=null, status='idle'", () => {
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.coords).toBeNull();
    expect(result.current.status).toBe("idle");
  });

  it("avec coordonnées initiales → coords=initial, status='ready'", () => {
    const initial = { latitude: 6.3654, longitude: 2.4183 };
    const { result } = renderHook(() => useGeolocation(initial));
    expect(result.current.coords).toEqual(initial);
    expect(result.current.status).toBe("ready");
  });
});

// ---------------------------------------------------------------------------
// request() — navigator.geolocation absent
// ---------------------------------------------------------------------------
describe("request() — API absente", () => {
  it("quand navigator.geolocation est undefined → status='error'", () => {
    // On retire l'implémentation de geolocation
    const original = navigator.geolocation;
    Object.defineProperty(navigator, "geolocation", {
      value: undefined,
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.request());

    expect(result.current.status).toBe("error");

    // Restauration
    Object.defineProperty(navigator, "geolocation", {
      value: original,
      configurable: true,
    });
  });
});

// ---------------------------------------------------------------------------
// request() — succès
// ---------------------------------------------------------------------------
describe("request() — succès", () => {
  it("status passe à 'ready' et coords sont définies", () => {
    const mockGetCurrentPosition = vi.fn((success: PositionCallback) => {
      success(makePosition(6.365412345, 2.418312345));
    });
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.request());

    expect(result.current.status).toBe("ready");
    expect(result.current.coords).not.toBeNull();
  });

  it("latitude avec plus de 6 décimales → arrondi à 6 décimales", () => {
    const mockGetCurrentPosition = vi.fn((success: PositionCallback) => {
      // 6.3654123456789 → arrondi à 6.365412
      success(makePosition(6.3654123456789, 2.4183123456789));
    });
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.request());

    expect(result.current.coords?.latitude).toBe(6.365412);
    expect(result.current.coords?.longitude).toBe(2.418312);
  });
});

// ---------------------------------------------------------------------------
// request() — erreur géolocalisation
// ---------------------------------------------------------------------------
describe("request() — erreur de géolocalisation", () => {
  it("erreur de permission → status='error'", () => {
    const mockGetCurrentPosition = vi.fn(
      (_success: PositionCallback, error: PositionErrorCallback) => {
        error({
          code: 1, // GeolocationPositionError.PERMISSION_DENIED = 1 (non disponible en jsdom)
          message: "User denied geolocation",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError);
      },
    );
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.request());

    expect(result.current.status).toBe("error");
    expect(result.current.coords).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// setCoords()
// ---------------------------------------------------------------------------
describe("setCoords()", () => {
  it("met à jour les coords directement", () => {
    const { result } = renderHook(() => useGeolocation());

    const newCoords = { latitude: 12.3651, longitude: -1.5335 };
    act(() => result.current.setCoords(newCoords));

    expect(result.current.coords).toEqual(newCoords);
  });
});
