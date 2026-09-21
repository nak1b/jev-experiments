import { describe, expect, it } from "vitest";
import { formatAmount, parseAmount } from "./amount";

describe("parseAmount", () => {
  it.each([
    ["Uber to airport $34", 3400],
    ["Costco groceries $120.50", 12050],
    ["Flight to Lisbon $1,240", 124000],
    ["Coffee 4.75", 475],
    ["Lunch 18 dollars", 1800],
    ["Parking 12 USD", 1200],
    ["USD 9.99 for Figma", 999],
  ])("reads the amount in %s", (text, cents) => {
    expect(parseAmount(text)).toBe(cents);
  });

  it("prefers the marked amount over other numbers", () => {
    expect(parseAmount("2 coffees and a croissant $14.20")).toBe(1420);
    expect(parseAmount("Table for 4 at Nopa $180")).toBe(18000);
  });

  it("takes the last number when nothing is marked", () => {
    expect(parseAmount("3 shirts 60")).toBe(6000);
  });

  it("returns null when there is no number", () => {
    expect(parseAmount("lunch with the team")).toBeNull();
  });
});

describe("formatAmount", () => {
  it("drops the cents on whole amounts", () => {
    expect(formatAmount(3400)).toBe("$34");
    expect(formatAmount(12050)).toBe("$120.50");
  });
});
