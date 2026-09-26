import { describe, it, expect } from "vitest";
import SoftAurora from "@/components/ui/SoftAurora";

describe("SoftAurora Component", () => {
  it("exports SoftAurora component correctly", () => {
    expect(SoftAurora).toBeDefined();
    expect(typeof SoftAurora).toBe("function");
  });
});
