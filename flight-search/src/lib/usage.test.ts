import { describe, expect, it } from "vitest";
import { summarize } from "./usage";

describe("summarize", () => {
  it("starts at zero", () => {
    expect(summarize([])).toEqual({ readings: 0, tokens: 0, costUsd: 0 });
  });

  it("adds up tokens and cost", () => {
    const summary = summarize([
      { latencyMs: 100, tokens: 3060, costUsd: 0.000126 },
      { latencyMs: 200, tokens: 4060, costUsd: 0.000168 },
    ]);
    expect(summary.readings).toBe(2);
    expect(summary.tokens).toBe(7120);
    expect(summary.costUsd).toBeCloseTo(0.000294);
  });

  it("reports an unknown cost once any reading has no price", () => {
    const summary = summarize([
      { latencyMs: 100, tokens: 3060, costUsd: 0.000126 },
      { latencyMs: 100, tokens: 3060, costUsd: null },
    ]);
    expect(summary.costUsd).toBeNull();
  });
});
