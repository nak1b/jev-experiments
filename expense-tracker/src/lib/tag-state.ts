/*
 * Combines what Jev read with what the person clicked into the tags an entry is saved with.
 * Sure readings apply on their own. Guesses wait for a click, the same as in flight-search.
 */
import type { Reading } from "@jev/kit";
import { CATEGORIES, type Category, type ExpenseTags, type Necessity, type SpendKind } from "./expense";

export type TagField = "category" | "kind" | "recurring" | "reimbursable" | "necessity";

export type Chip = {
  key: string;
  field: TagField;
  label: string;
  kind: "sure" | "guess";
  confidence: number;
};

export type AppliedTags = {
  chips: Chip[];
  category: Category | null;
  kind: SpendKind | null;
  recurring: boolean;
  reimbursable: boolean;
  necessity: Necessity | null;
};

export type TagChoices = { confirmed: ReadonlySet<string>; dismissed: ReadonlySet<string> };

const KIND_LABELS: Record<SpendKind, string> = { business: "Work", personal: "Personal" };
const NECESSITY_LABELS: Record<Necessity, string> = { necessity: "Necessity", treat: "Treat" };

export function chipKey(field: TagField, value: string): string {
  return `${field}:${value}`;
}

export function categoryLabel(category: Category): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function categoryDescription(category: Category): string {
  return CATEGORIES[category];
}

export function applyTags(tags: ExpenseTags | null, choices: TagChoices): AppliedTags {
  const chips: Chip[] = [];

  /* Adds the chip for one reading and returns its value when it applies to the entry. */
  function take<T extends string | true>(
    field: TagField,
    reading: Reading<T> | null | undefined,
    label: (value: T) => string,
  ): T | null {
    if (!reading) return null;
    const key = chipKey(field, reading.value === true ? "yes" : reading.value);
    if (choices.dismissed.has(key)) return null;
    const applied = reading.certainty === "sure" || choices.confirmed.has(key);
    chips.push({ key, field, label: label(reading.value), kind: applied ? "sure" : "guess", confidence: reading.confidence });
    return applied ? reading.value : null;
  }

  const category = take("category", tags?.category, categoryLabel);
  const kind = take("kind", tags?.kind, (value) => KIND_LABELS[value]);
  const recurring = take("recurring", tags?.recurring, () => "Repeats");
  const reimbursable = take("reimbursable", tags?.reimbursable, () => "Claim back");
  const necessity = take("necessity", tags?.necessity, (value) => NECESSITY_LABELS[value]);

  return {
    chips,
    category,
    kind,
    recurring: recurring === true,
    reimbursable: reimbursable === true,
    necessity,
  };
}
