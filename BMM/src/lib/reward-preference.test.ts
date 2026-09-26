/**
 * Tests d'audit QA — reward-preference.ts
 *
 * Ces tests ciblent les failles R-1 à R-5 (voir audit_qa.md).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RewardPreference } from "./reward-preference";
import {
  loadRewardPreference,
  operatorLabel,
  saveRewardPreference,
} from "./reward-preference";

// ---------------------------------------------------------------------------
// Helpers : mock de localStorage
// ---------------------------------------------------------------------------

function mockLocalStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      for (const k of Object.keys(store)) delete store[k];
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
    _store: store,
  };
}

let storage: ReturnType<typeof mockLocalStorage>;

beforeEach(() => {
  storage = mockLocalStorage();
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    writable: true,
    configurable: true,
  });
  // Simuler un environnement navigateur
  Object.defineProperty(globalThis, "window", {
    value: { localStorage: storage },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// operatorLabel — R-3, R-4
// ---------------------------------------------------------------------------

describe("operatorLabel", () => {
  it("returns the label for a known operator", () => {
    expect(operatorLabel("mtn")).toBe("MTN MoMo");
    expect(operatorLabel("wave")).toBe("Wave");
    expect(operatorLabel("celtiis")).toBe("Celtiis Cash");
  });

  // R-3 : undefined → fallback
  it("returns 'Mobile Money' for undefined", () => {
    expect(operatorLabel(undefined)).toBe("Mobile Money");
  });

  // R-3 : null → fallback
  it("returns 'Mobile Money' for null", () => {
    expect(operatorLabel(null)).toBe("Mobile Money");
  });

  // R-4 : valeur invalide castée
  it("returns 'Mobile Money' for an unknown operator value at runtime", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(operatorLabel("hack" as any)).toBe("Mobile Money");
  });
});

// ---------------------------------------------------------------------------
// saveRewardPreference — R-2, R-5
// ---------------------------------------------------------------------------

describe("saveRewardPreference", () => {
  const pref: RewardPreference = { mode: "lightning" };

  it("saves a valid lightning preference", () => {
    saveRewardPreference("donor-42", pref);
    expect(storage.setItem).toHaveBeenCalledWith(
      "bmm.reward-preference.donor-42",
      JSON.stringify(pref),
    );
  });

  it("saves a mobile-money preference with operator and phone", () => {
    const mobilePref: RewardPreference = {
      mode: "mobile-money",
      operator: "mtn",
      phone: "+22997000000",
    };
    saveRewardPreference("donor-99", mobilePref);
    expect(storage.setItem).toHaveBeenCalledWith(
      "bmm.reward-preference.donor-99",
      JSON.stringify(mobilePref),
    );
  });

  // R-5 : donorId vide — pollue le localStorage avec une clé générique
  it("does not write to localStorage when donorId is empty", () => {
    // Ce test ÉCHOUERA avec le code actuel (aucune validation de donorId).
    // Il est conçu pour documenter le comportement indésirable.
    saveRewardPreference("", pref);
    const pollutingKey = "bmm.reward-preference.";
    const writtenKeys = storage.setItem.mock.calls.map((c) => c[0]);
    expect(writtenKeys).not.toContain(pollutingKey);
  });

  // R-2 : donorId avec caractères spéciaux
  it("uses the donorId as-is in the storage key (special characters)", () => {
    saveRewardPreference("donor/with/slash", pref);
    // Vérifie que la clé générée inclut la chaîne problématique —
    // ce test documente le comportement actuel pour déclencher une révision.
    expect(storage.setItem).toHaveBeenCalledWith(
      "bmm.reward-preference.donor/with/slash",
      expect.any(String),
    );
  });

  // R-5 via effet de bord : save + load avec donorId vide ne doit pas retourner
  // la préférence d'un autre donneur
  it("round-trip with empty donorId does not leak other donors' preferences", () => {
    saveRewardPreference("donor-A", pref);
    const loaded = loadRewardPreference("");
    expect(loaded).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// loadRewardPreference — R-1, R-2
// ---------------------------------------------------------------------------

describe("loadRewardPreference", () => {
  it("returns null when nothing is stored for that donor", () => {
    expect(loadRewardPreference("unknown-donor")).toBeNull();
  });

  it("returns a valid lightning preference after saving it", () => {
    const pref: RewardPreference = { mode: "lightning" };
    saveRewardPreference("d1", pref);
    const loaded = loadRewardPreference("d1");
    expect(loaded).toEqual(pref);
  });

  it("returns a valid mobile-money preference after saving it", () => {
    const pref: RewardPreference = {
      mode: "mobile-money",
      operator: "orange",
      phone: "+22966000000",
    };
    saveRewardPreference("d2", pref);
    const loaded = loadRewardPreference("d2");
    expect(loaded).toEqual(pref);
  });

  // R-1 : mode invalide — ne doit pas retourner un objet à mode invalide
  it("returns null when the stored mode is not a valid RewardMode value", () => {
    storage._store["bmm.reward-preference.d3"] = JSON.stringify({
      mode: "bitcoin-on-chain", // valeur invalide
    });
    const loaded = loadRewardPreference("d3");
    // Avec le code actuel, "bitcoin-on-chain" est truthy → retourne l'objet invalide.
    // Ce test ÉCHOUERA pour révéler le bug de validation.
    expect(loaded).toBeNull();
  });

  // R-1 : mode vide — doit retourner null
  it("returns null when the stored mode is an empty string", () => {
    storage._store["bmm.reward-preference.d4"] = JSON.stringify({ mode: "" });
    expect(loadRewardPreference("d4")).toBeNull();
  });

  // JSON corrompu — doit retourner null, pas crasher
  it("returns null for corrupted JSON in localStorage", () => {
    storage._store["bmm.reward-preference.d5"] = "{ not valid json {{";
    expect(loadRewardPreference("d5")).toBeNull();
  });

  // Objet sans champ mode — doit retourner null
  it("returns null when the stored JSON has no 'mode' field", () => {
    storage._store["bmm.reward-preference.d6"] = JSON.stringify({
      operator: "mtn",
    });
    expect(loadRewardPreference("d6")).toBeNull();
  });

  // Valeur stockée est un tableau — doit retourner null, pas crasher
  it("returns null when the stored JSON is an array", () => {
    storage._store["bmm.reward-preference.d7"] = JSON.stringify(["lightning"]);
    expect(loadRewardPreference("d7")).toBeNull();
  });

  // Valeur stockée est null JSON — doit retourner null
  it("returns null when the stored JSON is the string 'null'", () => {
    storage._store["bmm.reward-preference.d8"] = "null";
    expect(loadRewardPreference("d8")).toBeNull();
  });

  // localStorage lève une exception — doit retourner null
  it("returns null when localStorage.getItem throws", () => {
    storage.getItem.mockImplementation(() => {
      throw new Error("SecurityError: quota exceeded");
    });
    expect(loadRewardPreference("d9")).toBeNull();
  });
});
