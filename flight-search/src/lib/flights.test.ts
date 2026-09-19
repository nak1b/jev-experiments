import { describe, expect, it } from "vitest";
import { getAirport } from "./airports";
import { generateFlights, routeAirlines, searchFlights, type FlightFilters } from "./flights";

const RANGE = { start: "2026-10-01", end: "2026-10-07" };

const NO_FILTERS: FlightFilters = {
  nonstop: false,
  departureTime: null,
  avoidOvernight: false,
  cabin: "economy",
  avoidAirlines: new Set(),
};

describe("generateFlights", () => {
  it("returns the same flights for the same route and dates", () => {
    expect(generateFlights("JFK", "LIS", RANGE)).toEqual(generateFlights("JFK", "LIS", RANGE));
  });

  it("returns flights for every day in the range", () => {
    const days = new Set(generateFlights("JFK", "LIS", RANGE).map((flight) => flight.date));
    expect(days.size).toBe(7);
  });

  it("returns nothing when origin and destination match", () => {
    expect(generateFlights("JFK", "JFK", RANGE)).toEqual([]);
  });

  it("keeps foreign airlines off domestic routes", () => {
    const codes = routeAirlines(getAirport("JFK"), getAirport("ORD")).map((airline) => airline.code);
    expect(codes).toContain("DL");
    expect(codes).not.toContain("BA");
  });

  it("only flies nonstop to or from an airline's home country", () => {
    const flights = generateFlights("JFK", "ATH", { start: "2026-10-01", end: "2026-10-31" });
    const foreign = flights.filter((flight) => ["AC", "BA", "LH", "AF", "KL"].includes(flight.airline.code));
    expect(foreign.length).toBeGreaterThan(0);
    expect(foreign.every((flight) => flight.via?.code === flight.airline.hub)).toBe(true);
  });

  it("keeps low-cost airlines off long routes", () => {
    const codes = routeAirlines(getAirport("JFK"), getAirport("LIS")).map((airline) => airline.code);
    expect(codes).not.toContain("B6");
    expect(codes).toContain("TP");
  });
});

describe("searchFlights", () => {
  const flights = generateFlights("LHR", "BCN", { start: "2026-10-01", end: "2026-10-20" });

  it("sorts by price when asked for the cheapest", () => {
    const prices = searchFlights(flights, NO_FILTERS, "cheapest").map((result) => result.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("drops airlines the traveler wants to avoid", () => {
    const results = searchFlights(flights, { ...NO_FILTERS, avoidAirlines: new Set(["FR", "U2"]) }, "balanced");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((result) => ["FR", "U2"].includes(result.flight.airline.code))).toBe(false);
  });

  it("only keeps morning departures when asked", () => {
    const results = searchFlights(flights, { ...NO_FILTERS, departureTime: "morning" }, "balanced");
    expect(results.every((result) => result.flight.departMinutes >= 480 && result.flight.departMinutes < 720)).toBe(true);
  });

  it("leaves out low-cost airlines for business class", () => {
    const results = searchFlights(flights, { ...NO_FILTERS, cabin: "business" }, "balanced");
    expect(results.some((result) => result.flight.airline.lowCost)).toBe(false);
  });

  it("only keeps nonstop flights when asked", () => {
    const longHaul = generateFlights("JFK", "BKK", RANGE);
    const results = searchFlights(longHaul, { ...NO_FILTERS, nonstop: true }, "balanced");
    expect(results.every((result) => result.flight.via === null)).toBe(true);
  });
});
