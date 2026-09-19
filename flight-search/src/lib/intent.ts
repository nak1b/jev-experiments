import type { DateRange } from "./dates";

/*
 * "sure" readings apply to the search right away.
 * "guess" readings are shown as proposals and only apply once the traveler confirms them.
 */
export type Certainty = "sure" | "guess";

export type Reading<T> = {
  value: T;
  certainty: Certainty;
  /* A Noul probability or a Choice confidence, from 0 to 1. */
  confidence: number;
};

export const TIMES_OF_DAY = ["early_morning", "morning", "afternoon", "evening", "overnight"] as const;
export const CABINS = ["economy", "premium_economy", "business", "first"] as const;

export type TimeOfDay = (typeof TIMES_OF_DAY)[number];
export type Cabin = (typeof CABINS)[number];
export type Priority = "cheapest" | "balanced" | "best";

export type DestinationSuggestion = { code: string; probability: number };

export type SearchIntent = {
  origin: Reading<string> | null;
  destination: Reading<string> | null;
  /* Filled when the traveler describes a kind of place instead of naming one. */
  suggestions: DestinationSuggestion[];
  dates: Reading<DateRange> | null;
  nonstop: Reading<true> | null;
  departureTime: Reading<TimeOfDay> | null;
  avoidOvernight: Reading<true> | null;
  cabin: Reading<Cabin> | null;
  priority: Reading<Exclude<Priority, "balanced">> | null;
  avoidAirlines: Reading<string>[];
};

export type JevUsage = { inputTokens: number; outputTokens: number };

export type InterpretResponse = {
  intent: SearchIntent;
  model: string;
  /* Time spent waiting on Jev, measured on the server. */
  latencyMs: number;
  usage: JevUsage;
  /* Estimated from list prices. Null when the model's price is unknown. */
  costUsd: number | null;
};

export type InterpretErrorCode =
  | "invalid_request"
  | "missing_api_key"
  | "invalid_api_key"
  | "rate_limited"
  | "upstream_error";

export type InterpretErrorBody = { error: { code: InterpretErrorCode; message: string } };
