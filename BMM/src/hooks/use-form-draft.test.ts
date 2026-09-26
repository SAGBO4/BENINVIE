import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useFormDraft } from "./use-form-draft";

const KEY = "test-form";

beforeEach(() => {
  window.localStorage.clear();
  vi.useRealTimers();
});

describe("useFormDraft", () => {
  it("returns nothing when no draft was ever saved", () => {
    const { result } = renderHook(() => useFormDraft(KEY));
    expect(result.current.draft).toBeNull();
  });

  it("restores what was saved on a previous visit", () => {
    const first = renderHook(() => useFormDraft<{ city: string }>(KEY));
    act(() => first.result.current.save({ city: "Cotonou" }));

    const second = renderHook(() => useFormDraft<{ city: string }>(KEY));
    expect(second.result.current.draft).toEqual({ city: "Cotonou" });
  });

  it("never writes the fields listed in omit", () => {
    const { result } = renderHook(() =>
      useFormDraft<{ email: string; password: string }>(KEY, {
        omit: ["password"],
      }),
    );

    act(() =>
      result.current.save({ email: "a@b.bj", password: "secret-du-donneur" }),
    );

    const raw = window.localStorage.getItem("hemora.draft." + KEY) ?? "";
    expect(raw).toContain("a@b.bj");
    expect(raw).not.toContain("secret-du-donneur");
  });

  it("drops a draft older than a day", () => {
    window.localStorage.setItem(
      "hemora.draft." + KEY,
      JSON.stringify({
        savedAt: Date.now() - 25 * 60 * 60 * 1000,
        values: { city: "Parakou" },
      }),
    );

    const { result } = renderHook(() => useFormDraft(KEY));
    expect(result.current.draft).toBeNull();
    expect(window.localStorage.getItem("hemora.draft." + KEY)).toBeNull();
  });

  it("clears the draft once the form has been sent", () => {
    const { result } = renderHook(() => useFormDraft<{ city: string }>(KEY));
    act(() => result.current.save({ city: "Ouidah" }));
    act(() => result.current.clear());

    expect(window.localStorage.getItem("hemora.draft." + KEY)).toBeNull();
    expect(result.current.draft).toBeNull();
  });

  it("ignores a corrupted entry instead of throwing", () => {
    window.localStorage.setItem("hemora.draft." + KEY, "{pas du json");
    const { result } = renderHook(() => useFormDraft(KEY));
    expect(result.current.draft).toBeNull();
  });
});
