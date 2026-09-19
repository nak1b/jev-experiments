/*
 * Combines what Jev read with what the traveler clicked into the search that actually runs.
 * Sure readings apply right away. Guesses wait for the traveler to confirm them.
 * Defaults fill anything still missing, and each piece becomes a sign in the UI.
 */
import { getAirline } from "./airlines";
import { getAirport } from "./airports";
import { defaultRange, type DateRange } from "./dates";
import type { FlightFilters } from "./flights";
import { formatRange } from "./format";
import type { Cabin, Priority, Reading, SearchIntent, TimeOfDay } from "./intent";

export type SignField =
  | "origin"
  | "destination"
  | "dates"
  | "nonstop"
  | "departureTime"
  | "avoidOvernight"
  | "cabin"
  | "priority"
  | "avoidAirline";

export type Sign = {
  key: string;
  field: SignField;
  label: string;
  detail?: string;
  kind: "sure" | "guess" | "default";
  /* Null when the traveler picked the value, not Jev. */
  confidence: number | null;
};

export type TravelerChoices = {
  confirmed: ReadonlySet<string>;
  dismissed: ReadonlySet<string>;
  homeAirport: string;
  pickedDestination: string | null;
};

export type EffectiveSearch = {
  signs: Sign[];
  origin: string;
  destination: string | null;
  range: DateRange;
  filters: FlightFilters;
  priority: Priority;
};

const TIME_LABELS: Record<TimeOfDay, string> = {
  early_morning: "Early morning",
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  overnight: "Late night",
};

const CABIN_LABELS: Record<Cabin, string> = {
  economy: "Economy",
  premium_economy: "Premium economy",
  business: "Business",
  first: "First",
};

const PRIORITY_LABELS: Record<Exclude<Priority, "balanced">, string> = {
  cheapest: "Cheapest first",
  best: "Shortest first",
};

export function signKey(field: SignField, value: string): string {
  return `${field}:${value}`;
}

export function buildSearch(intent: SearchIntent | null, choices: TravelerChoices, today: string): EffectiveSearch {
  const signs: Sign[] = [];

  /* Adds the sign for one reading and returns its value when it applies to the search. */
  function take<T>(
    field: SignField,
    reading: Reading<T> | null | undefined,
    id: (value: T) => string,
    describe: (value: T) => Pick<Sign, "label" | "detail">,
  ): T | null {
    if (!reading) return null;
    const key = signKey(field, id(reading.value));
    if (choices.dismissed.has(key)) return null;
    const applied = reading.certainty === "sure" || choices.confirmed.has(key);
    signs.push({ key, field, ...describe(reading.value), kind: applied ? "sure" : "guess", confidence: reading.confidence });
    return applied ? reading.value : null;
  }

  const place = (code: string) => ({ label: getAirport(code).city, detail: code });

  const jevOrigin = take("origin", intent?.origin, (code) => code, place);
  const origin = jevOrigin ?? choices.homeAirport;
  if (!jevOrigin) {
    signs.push({ key: signKey("origin", `home-${origin}`), field: "origin", ...place(origin), kind: "default", confidence: null });
  }

  // A destination the traveler picked beats a Jev guess, but not a place Jev is sure they named.
  let destination: string | null;
  const picked = choices.pickedDestination;
  if (picked && intent?.destination?.certainty !== "sure") {
    destination = picked;
    signs.push({ key: signKey("destination", picked), field: "destination", ...place(picked), kind: "sure", confidence: null });
  } else {
    destination = take("destination", intent?.destination, (code) => code, place);
  }

  const jevRange = take("dates", intent?.dates, (range) => `${range.start}_${range.end}`, (range) => ({
    label: formatRange(range),
  }));
  const range = jevRange ?? defaultRange(today);
  if (!jevRange) {
    signs.push({ key: signKey("dates", "default"), field: "dates", label: "Next 7 days", kind: "default", confidence: null });
  }

  const nonstop = take("nonstop", intent?.nonstop, () => "yes", () => ({ label: "Nonstop" }));
  const departureTime = take("departureTime", intent?.departureTime, (time) => time, (time) => ({
    label: TIME_LABELS[time],
  }));
  const avoidOvernight = take("avoidOvernight", intent?.avoidOvernight, () => "yes", () => ({ label: "No red-eyes" }));
  const cabin = take("cabin", intent?.cabin, (value) => value, (value) => ({ label: CABIN_LABELS[value] }));
  const priority = take("priority", intent?.priority, (value) => value, (value) => ({ label: PRIORITY_LABELS[value] }));

  const avoidAirlines = new Set<string>();
  for (const reading of intent?.avoidAirlines ?? []) {
    const code = take("avoidAirline", reading, (value) => value, (value) => ({ label: `No ${getAirline(value).name}` }));
    if (code) avoidAirlines.add(code);
  }

  return {
    signs,
    origin,
    destination,
    range,
    filters: {
      nonstop: nonstop === true,
      departureTime,
      avoidOvernight: avoidOvernight === true,
      cabin: cabin ?? "economy",
      avoidAirlines,
    },
    priority: priority ?? "balanced",
  };
}
