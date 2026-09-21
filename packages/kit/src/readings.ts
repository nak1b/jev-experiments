/*
 * Turning Jev's answers into readings an app can act on.
 * A sure reading applies on its own. A guess waits for the person to confirm it.
 * The bands come from the TypeSafe confidence guide. Tune them against real answers.
 */

export type Certainty = "sure" | "guess";

export type Reading<T> = {
  value: T;
  certainty: Certainty;
  /* A Noul probability or a Choice confidence, from 0 to 1. */
  confidence: number;
};

export const NOUL_SURE = 0.8;
export const NOUL_GUESS = 0.5;
export const CHOICE_SURE = 0.6;
export const CHOICE_GUESS = 0.3;

export type ChoiceAnswer = { choice: string; confidence: number };

export function reading<T>(value: T, confidence: number, sure: boolean): Reading<T> {
  return { value, confidence, certainty: sure ? "sure" : "guess" };
}

export function oneOf<T extends string>(value: string, allowed: readonly T[]): value is T {
  return (allowed as readonly string[]).includes(value);
}

export function readNoul(probability: number): Reading<true> | null {
  if (probability < NOUL_GUESS) return null;
  return reading(true as const, probability, probability >= NOUL_SURE);
}

/* Returns null for an answer outside `allowed`, which is how a question says "not stated". */
export function readChoice<T extends string>(answer: ChoiceAnswer, allowed: readonly T[]): Reading<T> | null {
  if (!oneOf(answer.choice, allowed) || answer.confidence < CHOICE_GUESS) return null;
  return reading(answer.choice, answer.confidence, answer.confidence >= CHOICE_SURE);
}
