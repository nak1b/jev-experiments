/*
 * Pulls the amount out of a line like "Uber to airport $34".
 * Code does this rather than Jev, because reading a number back is arithmetic, not judgment.
 * The result is in cents.
 */

const WITH_SYMBOL = /(?:\$|usd\s*)(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i;
const WITH_WORD = /(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)\s*(?:dollars|bucks|usd)\b/i;
const BARE = /(?<![\w.])(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)(?![\w.])/g;

function toCents(value: string): number {
  return Math.round(Number(value.replace(/,/g, "")) * 100);
}

export function parseAmount(text: string): number | null {
  const marked = text.match(WITH_SYMBOL) ?? text.match(WITH_WORD);
  if (marked) return toCents(marked[1]);

  // No currency marker, so take the last plain number and hope it is the price.
  const bare = [...text.matchAll(BARE)];
  const last = bare.at(-1);
  return last ? toCents(last[1]) : null;
}

export function formatAmount(cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
