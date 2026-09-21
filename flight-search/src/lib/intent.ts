import type { Reading } from "@jev/kit";
import type { DateRange } from "./dates";

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

export type InterpretErrorCode =
  | "invalid_request"
  | "missing_api_key"
  | "invalid_api_key"
  | "rate_limited"
  | "upstream_error";
