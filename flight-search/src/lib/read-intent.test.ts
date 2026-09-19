import { describe, expect, it } from "vitest";
import { airlineQuestionKey } from "./questions";
import { readIntent, type CoreAnswers } from "./read-intent";

const TODAY = "2026-09-18";

type Overrides = Record<string, { choice?: string; confidence?: number; probabilities?: Record<string, number>; noul?: number; score?: number }>;

const noul = (value: number) => ({ type: "noul", noul: value });
const choice = (value: string, confidence = 1, probabilities: Record<string, number> = { [value]: confidence }) => ({
  type: "choice",
  choice: value,
  confidence,
  probabilities,
});

/* Answers for a message that says nothing, with the given questions overridden. */
function answers(overrides: Overrides = {}): CoreAnswers {
  const base: Record<string, unknown> = {
    origin_named: noul(0.02),
    origin: choice("JFK", 0.1),
    destination_named: noul(0.02),
    destination_described: noul(0.02),
    destination: choice("LHR", 0.1),
    nonstop: noul(0.02),
    avoid_overnight: noul(0.02),
    departure_time: choice("any"),
    cabin: choice("unspecified"),
    priority: { type: "score", score: 1, confidence: 0.9, probabilities: { 0: 0.05, 1: 0.9, 2: 0.05 } },
    date_mode: choice("none"),
    month: choice("none"),
    day: choice("none"),
    day_anchor: choice("none"),
    weekday: choice("none"),
    week_offset: choice("none"),
    period_kind: choice("none"),
    month_offset: choice("none"),
  };
  for (const [key, value] of Object.entries(overrides)) {
    base[key] = { ...(base[key] as object), ...value };
  }
  return base as CoreAnswers;
}

describe("readIntent", () => {
  it("reads nothing from a message that says nothing", () => {
    expect(readIntent(answers(), {}, TODAY)).toEqual({
      origin: null,
      destination: null,
      suggestions: [],
      dates: null,
      nonstop: null,
      departureTime: null,
      avoidOvernight: null,
      cabin: null,
      priority: null,
      avoidAirlines: [],
    });
  });

  it("is sure of a clearly named destination and offers no suggestions", () => {
    const intent = readIntent(
      answers({
        destination_named: { noul: 0.97 },
        destination_described: { noul: 0.98 },
        destination: { choice: "LIS", confidence: 0.95, probabilities: { LIS: 0.97, OPO: 0.03 } },
      }),
      {},
      TODAY,
    );
    expect(intent.destination).toEqual({ value: "LIS", certainty: "sure", confidence: 0.95 });
    expect(intent.suggestions).toEqual([]);
  });

  it("offers suggestions for a described place and leaves the destination open", () => {
    const intent = readIntent(
      answers({
        origin_named: { noul: 0.95 },
        origin: { choice: "BCN", confidence: 0.9 },
        destination_named: { noul: 0.1 },
        destination_described: { noul: 0.93 },
        destination: {
          choice: "BCN",
          confidence: 0.2,
          probabilities: { BCN: 0.3, LIS: 0.25, ATH: 0.2, FCO: 0.1, PMI: 0.08, NCE: 0.05, OSL: 0.02 },
        },
      }),
      {},
      TODAY,
    );
    expect(intent.destination).toBeNull();
    // Barcelona is the origin, and Oslo is below the cut-off.
    expect(intent.suggestions.map((suggestion) => suggestion.code)).toEqual(["LIS", "ATH", "FCO", "PMI", "NCE"]);
  });

  it("marks a middling Noul as a guess", () => {
    expect(readIntent(answers({ nonstop: { noul: 0.65 } }), {}, TODAY).nonstop).toEqual({
      value: true,
      certainty: "guess",
      confidence: 0.65,
    });
  });

  it("takes the weakest part's confidence for a date", () => {
    const intent = readIntent(
      answers({
        date_mode: { choice: "calendar_date", confidence: 0.95 },
        month: { choice: "October", confidence: 0.9 },
        day: { choice: "12", confidence: 0.45 },
      }),
      {},
      TODAY,
    );
    expect(intent.dates).toEqual({
      value: { start: "2026-10-12", end: "2026-10-12" },
      certainty: "guess",
      confidence: 0.45,
    });
  });

  it("maps the priority score to a sort order", () => {
    const cheap = readIntent(answers({ priority: { score: 0.2, confidence: 0.8 } }), {}, TODAY);
    const comfort = readIntent(answers({ priority: { score: 1.8, confidence: 0.8 } }), {}, TODAY);
    const neutral = readIntent(answers({ priority: { score: 1, confidence: 0.8 } }), {}, TODAY);
    expect(cheap.priority?.value).toBe("cheapest");
    expect(comfort.priority?.value).toBe("best");
    expect(neutral.priority).toBeNull();
  });

  it("ignores 'unspecified' and 'any' choices", () => {
    const intent = readIntent(answers({ cabin: { choice: "business", confidence: 0.9 } }), {}, TODAY);
    expect(intent.cabin?.value).toBe("business");
    expect(intent.departureTime).toBeNull();
  });

  it("lists airlines to avoid", () => {
    const intent = readIntent(answers(), { [airlineQuestionKey("FR")]: 0.96, [airlineQuestionKey("U2")]: 0.1 }, TODAY);
    expect(intent.avoidAirlines).toEqual([{ value: "FR", certainty: "sure", confidence: 0.96 }]);
  });
});
