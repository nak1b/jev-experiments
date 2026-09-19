import { choice, noul, score } from "@typesafe-ai/sdk";
import { AIRLINES } from "./airlines";
import { AIRPORTS } from "./airports";
import { MONTHS, WEEKDAYS } from "./dates";

/*
 * Every question goes out in one Jev call, including ones that only matter for some requests.
 * Jev answers them in parallel, and code ignores the answers it does not need.
 * The docs call this speculative fan-out.
 */

const NOT_SAID = "The traveler does not say this.";

const airportOptions = Object.fromEntries(AIRPORTS.map((airport) => [airport.code, `${airport.city}, ${airport.country}`]));

const labelsOnly = (labels: readonly string[]) => Object.fromEntries(labels.map((label) => [label, null]));

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, index) => String(index + 1));

export const CORE_QUESTIONS = {
  origin_named: noul("The traveler names the city or airport they are flying from."),
  origin: choice("Which city or airport is the traveler flying from?", airportOptions),
  destination_named: noul("The traveler names one specific city or airport they want to fly to."),
  destination_described: noul(
    "The traveler says where they want to fly to, either by naming a place or by describing the kind of place.",
  ),
  destination: choice("Which city or airport best fits where the traveler wants to fly to?", airportOptions),
  nonstop: noul("The traveler asks for a nonstop or direct flight."),
  avoid_overnight: noul("The traveler wants to avoid overnight or red-eye flights."),
  departure_time: choice("At what time of day does the traveler want the flight to depart?", {
    early_morning: "Early morning, before 8am",
    morning: "Morning, from 8am to noon",
    afternoon: "Afternoon, from noon to 5pm",
    evening: "Evening, from 5pm to 9pm",
    overnight: "Late at night, or a red-eye",
    any: "The traveler does not say a time of day",
  }),
  cabin: choice("Which cabin does the traveler want to fly in?", {
    economy: "Economy or coach",
    premium_economy: "Premium economy",
    business: "Business class",
    first: "First class",
    unspecified: "The traveler does not say a cabin",
  }),
  priority: score("How much does the traveler care about a low price compared with comfort and convenience?", [
    "Price matters most. The traveler asks for something cheap or on a budget.",
    "The traveler does not say whether price or comfort matters more.",
    "Comfort and convenience matter most. The traveler is willing to pay more.",
  ]),
  date_mode: choice("How does the traveler say when they want to depart?", {
    calendar_date: "A calendar date that names a month, such as 'October 12' or 'the 3rd of March'",
    relative_day: "One day relative to today, such as 'today', 'tomorrow', or 'next Friday'",
    period: "A span of days, such as 'this weekend', 'next week', 'early October', or 'next month'",
    none: "The traveler does not say when they want to depart",
  }),
  month: choice("If the departure date or period names a month, which month is it?", {
    ...labelsOnly(MONTHS),
    none: "No month is named.",
  }),
  day: choice("If the departure is a calendar date, which day of the month is it?", {
    ...labelsOnly(DAYS_OF_MONTH),
    none: NOT_SAID,
  }),
  day_anchor: choice("If the departure is one day relative to today, which day is it?", {
    today: null,
    tomorrow: null,
    day_after: "The day after tomorrow",
    weekday: "A named day of the week",
    none: NOT_SAID,
  }),
  weekday: choice("If the departure names a day of the week, which day is it?", {
    ...labelsOnly(WEEKDAYS),
    none: NOT_SAID,
  }),
  week_offset: choice("If the departure names a weekday, a weekend, or a week, which week is it?", {
    current: "This week, such as 'this Friday' or 'this weekend'",
    next: "The following week, such as 'next Friday' or 'next weekend'",
    none: "No week is given",
  }),
  period_kind: choice("If the departure is a span of days, what kind of span is it?", {
    weekend: "A weekend",
    week: "A whole week",
    early_month: "The start of a month, roughly days 1 to 10",
    mid_month: "The middle of a month, roughly days 11 to 20",
    late_month: "The end of a month, from about day 21",
    whole_month: "A whole month",
    none: NOT_SAID,
  }),
  month_offset: choice("If the departure period is a month given relative to now, which month is it?", {
    this_month: "This month",
    next_month: "Next month",
    month_after_next: "The month after next",
    none: "The month is not given relative to now",
  }),
};

export function airlineQuestionKey(airlineCode: string): string {
  return `avoid_airline_${airlineCode}`;
}

export const AIRLINE_QUESTIONS = Object.fromEntries(
  AIRLINES.map((airline) => [
    airlineQuestionKey(airline.code),
    noul(`The traveler does not want to fly with ${airline.name}.`),
  ]),
);
