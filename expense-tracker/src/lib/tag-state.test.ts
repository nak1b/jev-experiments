import type { Reading } from "@jev/kit";
import { describe, expect, it } from "vitest";
import type { ExpenseTags } from "./expense";
import { applyTags, chipKey } from "./tag-state";

const NO_CHOICES = { confirmed: new Set<string>(), dismissed: new Set<string>() };

const sure = <T,>(value: T, confidence = 0.9): Reading<T> => ({ value, certainty: "sure", confidence });
const guess = <T,>(value: T, confidence = 0.4): Reading<T> => ({ value, certainty: "guess", confidence });

const NO_TAGS: ExpenseTags = { category: null, kind: null, recurring: null, reimbursable: null, necessity: null };

describe("applyTags", () => {
  it("reads nothing before Jev answers", () => {
    expect(applyTags(null, NO_CHOICES)).toEqual({
      chips: [],
      category: null,
      kind: null,
      recurring: false,
      reimbursable: false,
      necessity: null,
    });
  });

  it("applies sure tags right away", () => {
    const applied = applyTags({ ...NO_TAGS, category: sure("groceries"), recurring: sure(true) }, NO_CHOICES);
    expect(applied.category).toBe("groceries");
    expect(applied.recurring).toBe(true);
    expect(applied.chips.map((chip) => chip.kind)).toEqual(["sure", "sure"]);
  });

  it("holds a guess back until it is confirmed", () => {
    const tags: ExpenseTags = { ...NO_TAGS, kind: guess("business") };
    expect(applyTags(tags, NO_CHOICES).kind).toBeNull();

    const confirmed = { ...NO_CHOICES, confirmed: new Set([chipKey("kind", "business")]) };
    expect(applyTags(tags, confirmed).kind).toBe("business");
  });

  it("drops a dismissed tag and its chip", () => {
    const tags: ExpenseTags = { ...NO_TAGS, necessity: sure("treat") };
    const applied = applyTags(tags, { ...NO_CHOICES, dismissed: new Set([chipKey("necessity", "treat")]) });
    expect(applied.necessity).toBeNull();
    expect(applied.chips).toEqual([]);
  });
});
