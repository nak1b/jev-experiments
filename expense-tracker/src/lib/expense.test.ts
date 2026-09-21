import { describe, expect, it } from "vitest";
import { totalsFor, type Expense } from "./expense";

function expense(overrides: Partial<Expense>): Expense {
  return {
    id: "1",
    text: "Coffee $5",
    amount: 500,
    date: "2026-09-20",
    category: "dining",
    kind: "personal",
    recurring: false,
    reimbursable: false,
    necessity: "treat",
    ...overrides,
  };
}

describe("totalsFor", () => {
  it("starts at zero", () => {
    expect(totalsFor([])).toEqual({ all: 0, business: 0, personal: 0, recurring: 0, byCategory: [] });
  });

  it("splits work from personal and counts repeating charges", () => {
    const totals = totalsFor([
      expense({ id: "1", amount: 500 }),
      expense({ id: "2", amount: 3400, category: "transport", kind: "business", reimbursable: true }),
      expense({ id: "3", amount: 1500, category: "software", kind: "business", recurring: true }),
    ]);
    expect(totals.all).toBe(5400);
    expect(totals.business).toBe(4900);
    expect(totals.personal).toBe(500);
    expect(totals.recurring).toBe(1500);
  });

  it("groups by category, largest first", () => {
    const totals = totalsFor([
      expense({ id: "1", amount: 500, category: "dining" }),
      expense({ id: "2", amount: 12000, category: "groceries" }),
      expense({ id: "3", amount: 800, category: "dining" }),
    ]);
    expect(totals.byCategory).toEqual([
      { category: "groceries", amount: 12000, count: 1 },
      { category: "dining", amount: 1300, count: 2 },
    ]);
  });
});
