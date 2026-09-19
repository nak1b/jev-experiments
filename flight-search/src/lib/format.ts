import type { DateRange } from "./dates";

const utcDate = (iso: string) => new Date(`${iso}T00:00:00Z`);

const dayFormat = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: "short", timeZone: "UTC" });
const monthDayFormat = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
const clockFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
const priceFormat = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
// Jev calls cost fractions of a cent, so amounts under a cent keep three significant digits.
const centsFormat = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });
const fractionOfCentFormat = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumSignificantDigits: 3,
});
const countFormat = new Intl.NumberFormat();

export function formatDay(iso: string): string {
  return dayFormat.format(utcDate(iso));
}

export function formatDayParts(iso: string): { weekday: string; monthDay: string } {
  const date = utcDate(iso);
  return { weekday: weekdayFormat.format(date), monthDay: monthDayFormat.format(date) };
}

export function formatRange(range: DateRange): string {
  if (range.start === range.end) return formatDay(range.start);
  return monthDayFormat.formatRange(utcDate(range.start), utcDate(range.end));
}

/* Accepts minutes past midnight, including values past 1440 for arrivals on a later day. */
export function formatClock(minutes: number): string {
  const wrapped = ((minutes % 1440) + 1440) % 1440;
  return clockFormat.format(new Date(Date.UTC(2000, 0, 1, 0, wrapped)));
}

export function dayShift(minutes: number): number {
  return Math.floor(minutes / 1440);
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

export function formatPrice(usd: number): string {
  return priceFormat.format(usd);
}

export function formatSpend(usd: number | null): string {
  if (usd === null) return "cost unknown";
  return usd === 0 || usd >= 0.01 ? centsFormat.format(usd) : fractionOfCentFormat.format(usd);
}

export function formatCount(value: number): string {
  return countFormat.format(value);
}

export function formatPercent(probability: number): string {
  return `${Math.round(probability * 100)}%`;
}
