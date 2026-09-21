import { CHOICE_GUESS, CHOICE_SURE, readChoice, readNoul, reading } from "@jev/kit";
import type { SystemOneResult } from "@typesafe-ai/sdk";
import { CATEGORY_KEYS, SPEND_KINDS, type ExpenseTags, type Necessity } from "./expense";
import type { QUESTIONS } from "./questions";

export type ExpenseAnswers = SystemOneResult<typeof QUESTIONS>["answers"];

// The necessity score runs from 0 (a necessity) to 2 (a treat).
const NECESSITY_BELOW = 0.67;
const TREAT_ABOVE = 1.33;

function readNecessity(answers: ExpenseAnswers): ExpenseTags["necessity"] {
  const { score, confidence } = answers.necessity;
  const value: Necessity | null = score < NECESSITY_BELOW ? "necessity" : score > TREAT_ABOVE ? "treat" : null;
  if (!value || confidence < CHOICE_GUESS) return null;
  return reading(value, confidence, confidence >= CHOICE_SURE);
}

export function readExpense(answers: ExpenseAnswers): ExpenseTags {
  return {
    category: readChoice(answers.category, CATEGORY_KEYS),
    kind: readChoice(answers.kind, SPEND_KINDS),
    recurring: readNoul(answers.recurring.noul),
    reimbursable: readNoul(answers.reimbursable.noul),
    necessity: readNecessity(answers),
  };
}
