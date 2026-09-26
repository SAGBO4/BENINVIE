import { describe, expect, it } from "vitest";

import { DeadlineExceededError, withDeadline } from "./deadline";

const later = <T>(value: T, ms: number) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

describe("withDeadline", () => {
  it("resolves with the value when the promise settles in time", async () => {
    await expect(withDeadline(later("ok", 5), 100)).resolves.toBe("ok");
  });

  it("rejects with a deadline error when the promise is too slow", async () => {
    await expect(withDeadline(later("ok", 200), 20, "Stats")).rejects.toThrow(
      DeadlineExceededError,
    );
  });

  it("propagates the original rejection rather than a deadline error", async () => {
    const boom = Promise.reject(new Error("boom"));
    await expect(withDeadline(boom, 100)).rejects.toThrow("boom");
  });

  it("names the operation in the deadline message", async () => {
    await expect(
      withDeadline(later("ok", 200), 20, "Statistiques"),
    ).rejects.toThrow(/Statistiques/);
  });

  it("accepts a thenable that is not a real Promise", async () => {
    // Le constructeur de requête Supabase est de cette forme.
    const thenable: PromiseLike<string> = {
      then(onfulfilled) {
        setTimeout(() => onfulfilled?.("ok"), 5);
        return undefined as never;
      },
    };
    await expect(withDeadline(thenable, 100)).resolves.toBe("ok");
  });

  it("bounds a slow thenable", async () => {
    const slow: PromiseLike<string> = {
      then(onfulfilled) {
        setTimeout(() => onfulfilled?.("trop tard"), 200);
        return undefined as never;
      },
    };
    await expect(withDeadline(slow, 20, "Requête")).rejects.toThrow(
      DeadlineExceededError,
    );
  });
});
