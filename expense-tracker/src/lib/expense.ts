import type { Reading } from "@jev/kit";

/* What Jev is asked about a line of text. The labels double as the question's options. */
export const CATEGORIES = {
  groceries: "Supermarkets and food bought to cook at home",
  dining: "Restaurants, cafes, bars and takeout",
  transport: "Taxis, rideshare, transit, fuel and parking",
  travel: "Flights, trains and hotels away from home",
  shopping: "Clothes, household goods and gadgets",
  entertainment: "Films, games, events and streaming",
  health: "Doctors, pharmacy, gym and wellbeing",
  bills: "Rent, utilities, phone and insurance",
  software: "Apps, tools and online services for work",
  other: "Anything that fits none of the others",
} as const;

export type Category = keyof typeof CATEGORIES;
export const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];

export const SPEND_KINDS = ["business", "personal"] as const;
export type SpendKind = (typeof SPEND_KINDS)[number];

export type Necessity = "necessity" | "treat";

export type ExpenseTags = {
  category: Reading<Category> | null;
  kind: Reading<SpendKind> | null;
  recurring: Reading<true> | null;
  reimbursable: Reading<true> | null;
  necessity: Reading<Necessity> | null;
};

export type Expense = {
  id: string;
  text: string;
  /* Cents, so totals never drift. */
  amount: number;
  /* When it was entered, as YYYY-MM-DD. */
  date: string;
  category: Category;
  kind: SpendKind | null;
  recurring: boolean;
  reimbursable: boolean;
  necessity: Necessity | null;
};

export type CategoryTotal = { category: Category; amount: number; count: number };

export type Totals = {
  all: number;
  business: number;
  personal: number;
  recurring: number;
  byCategory: CategoryTotal[];
};

/* Totals are money, so code adds them up. Jev never sees a number it has to work with. */
export function totalsFor(expenses: readonly Expense[]): Totals {
  const byCategory = new Map<Category, CategoryTotal>();
  const totals: Totals = { all: 0, business: 0, personal: 0, recurring: 0, byCategory: [] };

  for (const expense of expenses) {
    totals.all += expense.amount;
    if (expense.kind === "business") totals.business += expense.amount;
    if (expense.kind === "personal") totals.personal += expense.amount;
    if (expense.recurring) totals.recurring += expense.amount;

    const running = byCategory.get(expense.category) ?? { category: expense.category, amount: 0, count: 0 };
    running.amount += expense.amount;
    running.count += 1;
    byCategory.set(expense.category, running);
  }

  totals.byCategory = [...byCategory.values()].sort((a, b) => b.amount - a.amount);
  return totals;
}
