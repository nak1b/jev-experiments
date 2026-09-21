import {
  CHOICE_GUESS,
  CHOICE_SURE,
  NOUL_GUESS,
  NOUL_SURE,
  oneOf,
  readChoice,
  readNoul,
  reading,
  type ChoiceAnswer,
  type Reading,
} from "@jev/kit";
import type { SystemOneResult } from "@typesafe-ai/sdk";
import { AIRLINES } from "./airlines";
import { isAirportCode } from "./airports";
import {
  DATE_MODES,
  DAY_ANCHORS,
  MONTH_OFFSETS,
  MONTHS,
  PERIOD_KINDS,
  resolveDates,
  WEEK_OFFSETS,
  WEEKDAYS,
  type DateParts,
  type DateRange,
} from "./dates";
import { CABINS, TIMES_OF_DAY, type DestinationSuggestion, type SearchIntent } from "./intent";
import { airlineQuestionKey, type CORE_QUESTIONS } from "./questions";

export type CoreAnswers = SystemOneResult<typeof CORE_QUESTIONS>["answers"];

const MAX_SUGGESTIONS = 5;
const MIN_SUGGESTION_PROBABILITY = 0.03;

// The priority score runs from 0 (price first) to 2 (speed first).
const CHEAPEST_BELOW = 0.67;
const BEST_ABOVE = 1.33;

/* A place needs two signals. The Noul says a place is named, and the Choice says which one. */
function readPlace(namedProbability: number, place: ChoiceAnswer): Reading<string> | null {
  if (namedProbability < NOUL_GUESS || place.confidence < CHOICE_GUESS || !isAirportCode(place.choice)) return null;
  const sure = namedProbability >= NOUL_SURE && place.confidence >= CHOICE_SURE;
  return reading(place.choice, Math.min(namedProbability, place.confidence), sure);
}

function readSuggestions(
  answers: CoreAnswers,
  origin: Reading<string> | null,
  destination: Reading<string> | null,
): DestinationSuggestion[] {
  if (destination?.certainty === "sure" || answers.destination_described.noul < NOUL_GUESS) return [];
  return Object.entries(answers.destination.probabilities)
    .filter(([code, probability]) => {
      return (
        probability >= MIN_SUGGESTION_PROBABILITY &&
        code !== origin?.value &&
        code !== destination?.value &&
        isAirportCode(code)
      );
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_SUGGESTIONS)
    .map(([code, probability]) => ({ code, probability }));
}

function readDates(answers: CoreAnswers, today: string): Reading<DateRange> | null {
  const pick = <T extends string>(value: string, allowed: readonly T[]): T | "none" =>
    oneOf(value, allowed) ? value : "none";
  const day = Number(answers.day.choice);

  const parts: DateParts = {
    mode: pick(answers.date_mode.choice, DATE_MODES),
    month: pick(answers.month.choice, MONTHS),
    day: Number.isInteger(day) && day >= 1 && day <= 31 ? day : "none",
    dayAnchor: pick(answers.day_anchor.choice, DAY_ANCHORS),
    weekday: pick(answers.weekday.choice, WEEKDAYS),
    weekOffset: pick(answers.week_offset.choice, WEEK_OFFSETS),
    periodKind: pick(answers.period_kind.choice, PERIOD_KINDS),
    monthOffset: pick(answers.month_offset.choice, MONTH_OFFSETS),
  };
  const confidences: Record<keyof DateParts, number> = {
    mode: answers.date_mode.confidence,
    month: answers.month.confidence,
    day: answers.day.confidence,
    dayAnchor: answers.day_anchor.confidence,
    weekday: answers.weekday.confidence,
    weekOffset: answers.week_offset.confidence,
    periodKind: answers.period_kind.confidence,
    monthOffset: answers.month_offset.confidence,
  };

  const resolved = resolveDates(parts, today);
  if (!resolved) return null;
  // A date is only as trustworthy as the weakest part it was built from.
  const confidence = Math.min(...resolved.used.map((part) => confidences[part]));
  if (confidence < CHOICE_GUESS) return null;
  return reading(resolved.range, confidence, confidence >= CHOICE_SURE);
}

function readPriority(answers: CoreAnswers): SearchIntent["priority"] {
  const { score, confidence } = answers.priority;
  const value = score < CHEAPEST_BELOW ? "cheapest" : score > BEST_ABOVE ? "best" : null;
  if (!value || confidence < CHOICE_GUESS) return null;
  return reading(value, confidence, confidence >= CHOICE_SURE);
}

function readAvoidedAirlines(answers: CoreAnswers, airlineNouls: Readonly<Record<string, number>>): Reading<string>[] {
  if (answers.avoids_airline.noul < NOUL_GUESS) return [];
  return AIRLINES.flatMap((airline) => {
    const avoid = readNoul(airlineNouls[airlineQuestionKey(airline.code)] ?? 0);
    return avoid ? [{ ...avoid, value: airline.code }] : [];
  });
}

export function readIntent(
  answers: CoreAnswers,
  airlineNouls: Readonly<Record<string, number>>,
  today: string,
): SearchIntent {
  const origin = readPlace(answers.origin_named.noul, answers.origin);
  const destination = readPlace(answers.destination_named.noul, answers.destination);

  return {
    origin,
    destination,
    suggestions: readSuggestions(answers, origin, destination),
    dates: readDates(answers, today),
    nonstop: readNoul(answers.nonstop.noul),
    departureTime: readChoice(answers.departure_time, TIMES_OF_DAY),
    avoidOvernight: readNoul(answers.avoid_overnight.noul),
    cabin: readChoice(answers.cabin, CABINS),
    priority: readPriority(answers),
    avoidAirlines: readAvoidedAirlines(answers, airlineNouls),
  };
}
