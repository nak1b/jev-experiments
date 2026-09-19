import { describe, expect, it } from "vitest";
import type { SearchIntent } from "./intent";
import { buildSearch, signKey, type TravelerChoices } from "./search-state";

const TODAY = "2026-09-18";

const EMPTY_INTENT: SearchIntent = {
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
};

const NO_CHOICES: TravelerChoices = {
  confirmed: new Set(),
  dismissed: new Set(),
  homeAirport: "JFK",
  pickedDestination: null,
};

describe("buildSearch", () => {
  it("falls back to the home airport and the next seven days", () => {
    const search = buildSearch(EMPTY_INTENT, NO_CHOICES, TODAY);
    expect(search.origin).toBe("JFK");
    expect(search.range).toEqual({ start: "2026-09-19", end: "2026-09-25" });
    expect(search.signs.map((sign) => sign.kind)).toEqual(["default", "default"]);
  });

  it("applies sure readings right away", () => {
    const intent: SearchIntent = { ...EMPTY_INTENT, nonstop: { value: true, certainty: "sure", confidence: 0.95 } };
    expect(buildSearch(intent, NO_CHOICES, TODAY).filters.nonstop).toBe(true);
  });

  it("holds a guess back until the traveler confirms it", () => {
    const intent: SearchIntent = { ...EMPTY_INTENT, nonstop: { value: true, certainty: "guess", confidence: 0.6 } };
    const guessed = buildSearch(intent, NO_CHOICES, TODAY);
    expect(guessed.filters.nonstop).toBe(false);
    expect(guessed.signs.find((sign) => sign.field === "nonstop")?.kind).toBe("guess");

    const confirmed = buildSearch(intent, { ...NO_CHOICES, confirmed: new Set([signKey("nonstop", "yes")]) }, TODAY);
    expect(confirmed.filters.nonstop).toBe(true);
    expect(confirmed.signs.find((sign) => sign.field === "nonstop")?.kind).toBe("sure");
  });

  it("drops a dismissed sign and its filter", () => {
    const intent: SearchIntent = { ...EMPTY_INTENT, cabin: { value: "business", certainty: "sure", confidence: 0.9 } };
    const search = buildSearch(intent, { ...NO_CHOICES, dismissed: new Set([signKey("cabin", "business")]) }, TODAY);
    expect(search.filters.cabin).toBe("economy");
    expect(search.signs.some((sign) => sign.field === "cabin")).toBe(false);
  });

  it("lets a picked destination replace a guess", () => {
    const intent: SearchIntent = { ...EMPTY_INTENT, destination: { value: "LIS", certainty: "guess", confidence: 0.4 } };
    const search = buildSearch(intent, { ...NO_CHOICES, pickedDestination: "ATH" }, TODAY);
    expect(search.destination).toBe("ATH");
    expect(search.signs.filter((sign) => sign.field === "destination")).toEqual([
      expect.objectContaining({ label: "Athens", kind: "sure", confidence: null }),
    ]);
  });

  it("keeps a destination Jev is sure of over a picked one", () => {
    const intent: SearchIntent = { ...EMPTY_INTENT, destination: { value: "LIS", certainty: "sure", confidence: 0.95 } };
    expect(buildSearch(intent, { ...NO_CHOICES, pickedDestination: "ATH" }, TODAY).destination).toBe("LIS");
  });
});
