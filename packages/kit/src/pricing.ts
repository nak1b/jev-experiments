/*
 * Jev list prices in USD per million input tokens, keyed by the versioned model ID a response reports.
 * Output tokens are free. Source: https://docs.typesafe.ai/models
 */
const INPUT_USD_PER_MILLION_TOKENS: Readonly<Record<string, number>> = {
  "jev-1.13.0": 0.042,
};

/* Returns null for a model without a known price, so the UI never shows a made-up number. */
export function jevCostUsd(model: string, inputTokens: number): number | null {
  const price = INPUT_USD_PER_MILLION_TOKENS[model];
  return price === undefined ? null : (inputTokens * price) / 1_000_000;
}
