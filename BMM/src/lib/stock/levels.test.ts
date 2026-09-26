import { describe, expect, it } from "vitest";

import { STOCK_THRESHOLDS, stockStatusOf } from "./levels";

describe("stockStatusOf", () => {
  it("marks an empty shelf as critical", () => {
    expect(stockStatusOf(0)).toBe("critique");
  });

  it("marks the unit below the critical threshold as critical", () => {
    expect(stockStatusOf(STOCK_THRESHOLDS.critical - 1)).toBe("critique");
  });

  it("marks the critical threshold itself as low, not critical", () => {
    expect(stockStatusOf(STOCK_THRESHOLDS.critical)).toBe("faible");
  });

  it("marks the low threshold itself as stable", () => {
    expect(stockStatusOf(STOCK_THRESHOLDS.low)).toBe("stable");
  });

  it("marks a well stocked shelf as stable", () => {
    expect(stockStatusOf(120)).toBe("stable");
  });
});
