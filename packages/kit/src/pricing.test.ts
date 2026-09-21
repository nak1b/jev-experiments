import { describe, expect, it } from "vitest";
import { jevCostUsd } from "./pricing";

describe("jevCostUsd", () => {
  it("charges the list price per million input tokens", () => {
    expect(jevCostUsd("jev-1.13.0", 1_000_000)).toBeCloseTo(0.042);
    expect(jevCostUsd("jev-1.13.0", 3_000)).toBeCloseTo(0.000126);
  });

  it("returns null for a model without a known price", () => {
    expect(jevCostUsd("jev-9.0.0", 3_000)).toBeNull();
  });
});
