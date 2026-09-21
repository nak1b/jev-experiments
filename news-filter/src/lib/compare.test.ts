import { describe, expect, it } from "vitest";
import { agreement, isShown, type FilterResult } from "./compare";

const STATS = { latencyMs: 100, tokens: 1000, costUsd: 0.00004, requests: 1 };

function result(show: Record<number, number>, mode: FilterResult["mode"] = "batched"): FilterResult {
  return { mode, rule: "Only AI", show, stats: STATS };
}

describe("isShown", () => {
  it("shows a post Jev has not judged", () => {
    expect(isShown(undefined)).toBe(true);
  });

  it("shows a post at or above the line", () => {
    expect(isShown(0.5)).toBe(true);
    expect(isShown(0.49)).toBe(false);
  });
});

describe("agreement", () => {
  it("counts posts both modes put on the same side of the line", () => {
    const batched = result({ 1: 0.9, 2: 0.1, 3: 0.6 });
    const separate = result({ 1: 0.8, 2: 0.2, 3: 0.4 }, "separate");
    expect(agreement(batched, separate)).toEqual({ agree: 2, total: 3 });
  });

  it("only compares posts both modes judged", () => {
    expect(agreement(result({ 1: 0.9, 2: 0.9 }), result({ 1: 0.9 }, "separate"))).toEqual({ agree: 1, total: 1 });
  });
});
