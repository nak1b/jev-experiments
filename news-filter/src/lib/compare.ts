export const MODES = ["batched", "separate"] as const;
export type Mode = (typeof MODES)[number];

// A post is shown when Jev says yes more likely than not.
export const SHOW_AT = 0.5;

export type ModeStats = {
  /* Wall-clock time for the whole mode, measured on the server. Separate calls run in parallel. */
  latencyMs: number;
  tokens: number;
  costUsd: number | null;
  requests: number;
};

export type FilterResult = {
  mode: Mode;
  rule: string;
  /* Jev's probability that each post should be shown, keyed by post id. */
  show: Record<number, number>;
  stats: ModeStats;
};

export function isShown(probability: number | undefined): boolean {
  return probability === undefined || probability >= SHOW_AT;
}

/* How many posts both modes put on the same side of the line, out of the posts both of them judged. */
export function agreement(a: FilterResult, b: FilterResult): { agree: number; total: number } {
  const ids = Object.keys(a.show).filter((id) => id in b.show);
  const agree = ids.filter((id) => isShown(a.show[Number(id)]) === isShown(b.show[Number(id)])).length;
  return { agree, total: ids.length };
}
