/*
 * Sample flight data. It is generated, not real.
 * The same route and day always produce the same flights, so results stay stable while the traveler types.
 */
import { AIRLINES, type Airline } from "./airlines";
import { distanceKm, getAirport, type Airport } from "./airports";
import { eachDay, type DateRange } from "./dates";
import type { Cabin, Priority, TimeOfDay } from "./intent";

export type Flight = {
  id: string;
  airline: Airline;
  flightNumber: string;
  origin: Airport;
  destination: Airport;
  via: Airport | null;
  date: string;
  /* Minutes after local midnight at the origin. */
  departMinutes: number;
  /* Minutes after midnight of the departure date, in destination local time. Can pass 1440 or go below 0. */
  arriveMinutes: number;
  durationMinutes: number;
  overnight: boolean;
  /* USD. Low-cost airlines only sell economy. */
  prices: Partial<Record<Cabin, number>>;
};

export type FlightFilters = {
  nonstop: boolean;
  departureTime: TimeOfDay | null;
  avoidOvernight: boolean;
  cabin: Cabin;
  avoidAirlines: ReadonlySet<string>;
};

export type FlightResult = { flight: Flight; price: number };

// Longer windows add little and slow down rendering.
const MAX_DAYS = 31;

const CABIN_MULTIPLIER: Record<Cabin, number> = {
  economy: 1,
  premium_economy: 1.75,
  business: 3.9,
  first: 6.8,
};

const TIME_WINDOWS: Record<TimeOfDay, (minutes: number) => boolean> = {
  early_morning: (m) => m >= 300 && m < 480,
  morning: (m) => m >= 480 && m < 720,
  afternoon: (m) => m >= 720 && m < 1020,
  evening: (m) => m >= 1020 && m < 1260,
  overnight: (m) => m >= 1260 || m < 300,
};

/* FNV-1a hash feeding a mulberry32 generator. Small, fast, and deterministic. */
function seededRandom(seed: string): () => number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  let state = hash >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function blockMinutes(from: Airport, to: Airport): number {
  return Math.round((distanceKm(from, to) / 830) * 60 + 30);
}

/*
 * Airlines rarely fly domestic routes in another region, so a same-region route only gets that region's airlines.
 * Low-cost airlines only fly short routes.
 */
export function routeAirlines(origin: Airport, destination: Airport): Airline[] {
  const shortHaul = distanceKm(origin, destination) < 3000;
  const eligible = AIRLINES.filter((airline) => {
    if (airline.lowCost && !shortHaul) return false;
    const hub = getAirport(airline.hub);
    const servesRoute =
      origin.region === destination.region
        ? hub.region === origin.region
        : airline.regions.includes(origin.region) && airline.regions.includes(destination.region);
    return servesRoute && (mayFlyNonstop(airline, origin, destination) || hubDetour(origin, hub, destination) <= MAX_HUB_DETOUR);
  });
  if (eligible.length > 0) return eligible;
  return AIRLINES.filter((airline) => !airline.lowCost && airline.regions.includes(origin.region));
}

function nonstopChance(km: number): number {
  if (km < 1500) return 0.9;
  if (km < 5000) return 0.7;
  if (km < 9000) return 0.5;
  return 0.3;
}

// Connecting through a hub is only plausible when it adds less than half again to the distance.
const MAX_HUB_DETOUR = 1.5;

function hubDetour(origin: Airport, hub: Airport, destination: Airport): number {
  return (distanceKm(origin, hub) + distanceKm(hub, destination)) / distanceKm(origin, destination);
}

/*
 * Full-service airlines only fly nonstop to or from their home country.
 * Elsewhere they connect through their hub. Low-cost airlines fly point to point.
 */
function mayFlyNonstop(airline: Airline, origin: Airport, destination: Airport): boolean {
  if (airline.lowCost) return true;
  const homeCountry = getAirport(airline.hub).country;
  return homeCountry === origin.country || homeCountry === destination.country;
}

export function generateFlights(originCode: string, destinationCode: string, range: DateRange): Flight[] {
  const origin = getAirport(originCode);
  const destination = getAirport(destinationCode);
  if (origin.code === destination.code) return [];

  const airlines = routeAirlines(origin, destination);
  const km = distanceKm(origin, destination);
  const offsetMinutes = Math.round((destination.utcOffset - origin.utcOffset) * 60);

  return eachDay(range)
    .slice(0, MAX_DAYS)
    .flatMap((date) => {
      const random = seededRandom(`${origin.code}-${destination.code}-${date}`);
      const count = 4 + Math.floor(random() * 5);

      return Array.from({ length: count }, (_, index): Flight => {
        const airline = airlines[Math.floor(random() * airlines.length)];
        const hub = getAirport(airline.hub);
        const hubOnRoute = hub.code === origin.code || hub.code === destination.code;
        const canConnect = !airline.lowCost && !hubOnRoute && hubDetour(origin, hub, destination) <= MAX_HUB_DETOUR;
        const canFlyNonstop = mayFlyNonstop(airline, origin, destination);
        const nonstop = !canConnect || (canFlyNonstop && (hubOnRoute || random() < nonstopChance(km)));
        const via = nonstop ? null : hub;

        // Wind and routing make the same trip vary by a few minutes from flight to flight.
        const jitter = Math.round((random() - 0.5) * 24);
        const durationMinutes =
          jitter +
          (via
            ? blockMinutes(origin, via) + 50 + Math.round(random() * 150) + blockMinutes(via, destination)
            : blockMinutes(origin, destination));
        const departMinutes = 330 + Math.round((random() * 1080) / 5) * 5;
        const overnight = (departMinutes >= 1260 || departMinutes < 300) && durationMinutes >= 240;

        let economy = (60 + km * 0.07) * (0.8 + random() * 0.7);
        if (!via) economy *= 1.1;
        if (airline.lowCost) economy *= 0.55;
        if (overnight) economy *= 0.88;

        const prices: Partial<Record<Cabin, number>> = { economy: Math.round(economy) };
        if (!airline.lowCost) {
          for (const cabin of ["premium_economy", "business", "first"] as const) {
            prices[cabin] = Math.round(economy * CABIN_MULTIPLIER[cabin]);
          }
        }

        return {
          id: `${origin.code}-${destination.code}-${date}-${index}`,
          airline,
          flightNumber: `${airline.code} ${100 + Math.floor(random() * 8900)}`,
          origin,
          destination,
          via,
          date,
          departMinutes,
          arriveMinutes: departMinutes + durationMinutes + offsetMinutes,
          durationMinutes,
          overnight,
          prices,
        };
      });
    });
}

function compareBy(priority: Priority, results: FlightResult[]): (a: FlightResult, b: FlightResult) => number {
  const stops = (result: FlightResult) => (result.flight.via ? 1 : 0);
  if (priority === "cheapest") return (a, b) => a.price - b.price;
  if (priority === "best") {
    return (a, b) => a.flight.durationMinutes + stops(a) * 90 - (b.flight.durationMinutes + stops(b) * 90);
  }
  // Balanced: each flight's price and duration relative to the best on offer, weighted equally.
  const cheapest = Math.min(...results.map((result) => result.price));
  const fastest = Math.min(...results.map((result) => result.flight.durationMinutes));
  const balance = (result: FlightResult) => result.price / cheapest + result.flight.durationMinutes / fastest;
  return (a, b) => balance(a) - balance(b);
}

export function searchFlights(flights: Flight[], filters: FlightFilters, priority: Priority): FlightResult[] {
  const results = flights.flatMap((flight): FlightResult[] => {
    const price = flight.prices[filters.cabin];
    if (price === undefined) return [];
    if (filters.nonstop && flight.via) return [];
    if (filters.avoidOvernight && flight.overnight) return [];
    if (filters.departureTime && !TIME_WINDOWS[filters.departureTime](flight.departMinutes)) return [];
    if (filters.avoidAirlines.has(flight.airline.code)) return [];
    return [{ flight, price }];
  });
  return results.sort(compareBy(priority, results));
}
