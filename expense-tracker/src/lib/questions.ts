import { choice, noul, score } from "@typesafe-ai/sdk";
import { CATEGORIES } from "./expense";

/*
 * Five questions, sent in one call for every line the person types.
 * They ask only for judgments. The amount and the totals are code's job.
 * Each yes-or-no question spells out what counts as no, so a tag the text never
 * mentions stays off instead of drifting up toward a coin flip.
 */
export const QUESTIONS = {
  category: choice("Which category does this spending belong to?", CATEGORIES),
  kind: choice("Is this spending for work or for the person themselves?", {
    business: "For work, a client, or a business trip.",
    personal: "For the person or their household.",
    unclear: "The text does not say which.",
  }),
  recurring: noul("This is a repeating charge rather than a one-off.", {
    true: "A subscription, membership, rent, or a bill that arrives every month.",
    false: "A one-off purchase.",
  }),
  reimbursable: noul("The person could claim this back from an employer or a client.", {
    true: "Work spending someone else would pay back, such as a client dinner or a work trip.",
    false: "Personal spending, or work spending nobody pays back.",
  }),
  necessity: score("Is this a necessity or a treat?", [
    "A necessity, such as rent, a bill, groceries, medicine or commuting.",
    "In between, or the text does not say enough to tell.",
    "A treat, such as eating out, entertainment, or something bought for pleasure.",
  ]),
};
