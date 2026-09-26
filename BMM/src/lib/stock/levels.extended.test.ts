/**
 * Tests d'audit QA — stock/levels.ts
 *
 * Ces tests ciblent les failles S-1 à S-4 (voir audit_qa.md).
 */
import { describe, expect, it } from "vitest";

import { STOCK_THRESHOLDS, stockStatusOf } from "./levels";

describe("stockStatusOf — edge cases", () => {
  // S-1 : valeur négative — métier : un stock négatif n'a pas de sens
  it("returns 'critique' for a negative stock value (no negative inventory exists)", () => {
    expect(stockStatusOf(-1)).toBe("critique");
    expect(stockStatusOf(-100)).toBe("critique");
  });

  // S-2 : NaN — BUG : retourne "stable" alors que la valeur est invalide
  it("does NOT return 'stable' for NaN — an invalid stock should not appear healthy", () => {
    // Ce test ÉCHOUERA avec le code actuel (NaN < 5 === false → "stable").
    // Il est conçu pour forcer la correction de la fonction.
    const result = stockStatusOf(NaN);
    expect(result).not.toBe("stable");
  });

  // S-3 : Infinity — après le fix S-2, `!Number.isFinite(Infinity)` est true
  // → stockStatusOf(Infinity) retourne "critique". Un stock dont la valeur
  // n'est pas un entier fini n'a pas de sens métier.
  it("returns 'critique' for Infinity (not a valid finite stock count)", () => {
    expect(stockStatusOf(Infinity)).toBe("critique");
  });

  // S-4 : valeur non-entière entre les seuils
  it("returns 'critique' for 4.9 (non-integer below critical threshold)", () => {
    expect(stockStatusOf(4.9)).toBe("critique");
  });

  it("returns 'faible' for 5.5 (non-integer between critical and low)", () => {
    expect(stockStatusOf(5.5)).toBe("faible");
  });

  it("returns 'stable' for 12.1 (non-integer above low threshold)", () => {
    expect(stockStatusOf(12.1)).toBe("stable");
  });

  // Frontières exactes — déjà testés partiellement mais on complète
  it("returns 'critique' for 0 (empty shelf)", () => {
    expect(stockStatusOf(0)).toBe("critique");
  });

  it("returns 'critique' for critical threshold - 1", () => {
    expect(stockStatusOf(STOCK_THRESHOLDS.critical - 1)).toBe("critique");
  });

  it("returns 'faible' at exactly the critical threshold (not 'critique')", () => {
    expect(stockStatusOf(STOCK_THRESHOLDS.critical)).toBe("faible");
  });

  it("returns 'faible' for low threshold - 1", () => {
    expect(stockStatusOf(STOCK_THRESHOLDS.low - 1)).toBe("faible");
  });

  it("returns 'stable' at exactly the low threshold", () => {
    expect(stockStatusOf(STOCK_THRESHOLDS.low)).toBe("stable");
  });

  // S-2 : -Infinity
  it("returns 'critique' for -Infinity", () => {
    // -Infinity < 5 === true → "critique"
    expect(stockStatusOf(-Infinity)).toBe("critique");
  });
});
