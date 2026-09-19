/* One completed Jev reading. Tokens count input and output together. */
export type JevCall = { latencyMs: number; tokens: number; costUsd: number | null };

export type UsageSummary = {
  readings: number;
  tokens: number;
  /* Null once any reading came from a model without a known price. */
  costUsd: number | null;
};

export function summarize(calls: readonly JevCall[]): UsageSummary {
  return {
    readings: calls.length,
    tokens: calls.reduce((sum, call) => sum + call.tokens, 0),
    costUsd: calls.some((call) => call.costUsd === null)
      ? null
      : calls.reduce((sum, call) => sum + (call.costUsd ?? 0), 0),
  };
}
