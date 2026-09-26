/**
 * Tests d'audit QA — deadline.ts
 *
 * Ces tests ciblent les failles D-1 à D-5 (voir audit_qa.md).
 */
import { describe, expect, it } from "vitest";

import { DeadlineExceededError, withDeadline } from "./deadline";

// ---------------------------------------------------------------------------
// withDeadline — edge cases et failles
// ---------------------------------------------------------------------------

describe("withDeadline — edge cases", () => {
  // D-1 : ms = 0 — le timer expire immédiatement
  it("rejects immediately when ms is 0", async () => {
    const slow = new Promise<string>((resolve) =>
      setTimeout(() => resolve("trop tard"), 50),
    );
    await expect(withDeadline(slow, 0, "Zéro")).rejects.toBeInstanceOf(
      DeadlineExceededError,
    );
  });

  // D-2 : ms négatif — setTimeout(-1) ≈ setTimeout(0)
  it("rejects immediately when ms is negative (treated as 0 by setTimeout)", async () => {
    const slow = new Promise<string>((resolve) =>
      setTimeout(() => resolve("trop tard"), 50),
    );
    await expect(withDeadline(slow, -100, "Négatif")).rejects.toBeInstanceOf(
      DeadlineExceededError,
    );
  });

  // D-3 : ms = Infinity — ne doit pas bloquer indéfiniment sur une promesse qui résout
  it("resolves correctly when ms is Infinity and the promise settles fast", async () => {
    await expect(withDeadline(Promise.resolve("ok"), Infinity)).resolves.toBe(
      "ok",
    );
  });

  // D-4 : thenable dont then() lève une exception synchrone
  it("rejects when the thenable's then() throws synchronously", async () => {
    const explosiveThenable: PromiseLike<string> = {
      then(_onfulfilled, _onrejected) {
        throw new Error("then() a explosé");
        return undefined as never;
      },
    };
    // La promesse externe doit être rejetée avec l'erreur de then()
    await expect(
      withDeadline(explosiveThenable, 100, "Explosif"),
    ).rejects.toThrow("then() a explosé");
  });

  // D-5 : label vide — le message d'erreur ne doit pas crasher
  it("produces a non-crashing error message when label is empty", async () => {
    const slow = new Promise<string>((resolve) =>
      setTimeout(() => resolve("x"), 200),
    );
    const error = await withDeadline(slow, 10, "").catch((e) => e);
    expect(error).toBeInstanceOf(DeadlineExceededError);
    expect(error.message).toContain("10");
  });

  // D-5 : label par défaut quand non fourni
  it("uses 'Opération' as the default label", async () => {
    const slow = new Promise<string>((resolve) =>
      setTimeout(() => resolve("x"), 200),
    );
    const error = await withDeadline(slow, 10).catch((e) => e);
    expect(error).toBeInstanceOf(DeadlineExceededError);
    expect(error.message).toContain("Opération");
  });

  // DeadlineExceededError : propriétés correctes
  it("sets the error name to 'DeadlineExceededError'", async () => {
    const slow = new Promise<string>((resolve) =>
      setTimeout(() => resolve("x"), 200),
    );
    const error = await withDeadline(slow, 10, "Test").catch((e) => e);
    expect(error.name).toBe("DeadlineExceededError");
  });

  it("includes both the label and the ms value in the error message", async () => {
    const slow = new Promise<string>((resolve) =>
      setTimeout(() => resolve("x"), 200),
    );
    const error = await withDeadline(slow, 42, "MonLabel").catch((e) => e);
    expect(error.message).toContain("MonLabel");
    expect(error.message).toContain("42");
  });

  // Promesse qui résout avec une valeur falsy (null, 0, false) — ne doit pas
  // être confondue avec un rejet
  it("resolves with null without treating it as a rejection", async () => {
    await expect(withDeadline(Promise.resolve(null), 100)).resolves.toBeNull();
  });

  it("resolves with 0 without treating it as a rejection", async () => {
    await expect(withDeadline(Promise.resolve(0), 100)).resolves.toBe(0);
  });

  it("resolves with false without treating it as a rejection", async () => {
    await expect(withDeadline(Promise.resolve(false), 100)).resolves.toBe(
      false,
    );
  });

  // Promesse déjà résolue (microtask) — le timer doit être annulé proprement
  it("clears the timer when the promise is already resolved", async () => {
    // Si le timer n'est pas clearé, il génère un rejet non géré après coup.
    // vitest détecte les rejets non gérés — ce test vérifie leur absence.
    await expect(withDeadline(Promise.resolve("déjà là"), 1000)).resolves.toBe(
      "déjà là",
    );
  });

  // Promesse déjà rejetée (microtask) — le timer doit être annulé proprement
  it("clears the timer when the promise is already rejected", async () => {
    await expect(
      withDeadline(Promise.reject(new Error("déjà rejeté")), 1000),
    ).rejects.toThrow("déjà rejeté");
  });
});
