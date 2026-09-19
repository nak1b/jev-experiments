/*
 * Calendar math for date parts that Jev reads from the traveler's words.
 * Jev only names the parts, such as "October" or "next Friday".
 * This file turns them into real dates, because the model is weak at date arithmetic.
 * Dates are ISO strings (YYYY-MM-DD) handled in UTC so the host time zone never shifts them.
 */

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

export type Month = (typeof MONTHS)[number];
export type Weekday = (typeof WEEKDAYS)[number];

export const DATE_MODES = ["calendar_date", "relative_day", "period", "none"] as const;
export const DAY_ANCHORS = ["today", "tomorrow", "day_after", "weekday", "none"] as const;
export const WEEK_OFFSETS = ["current", "next", "none"] as const;
export const PERIOD_KINDS = ["weekend", "week", "early_month", "mid_month", "late_month", "whole_month", "none"] as const;
export const MONTH_OFFSETS = ["this_month", "next_month", "month_after_next", "none"] as const;

export type DateParts = {
  mode: (typeof DATE_MODES)[number];
  month: Month | "none";
  day: number | "none";
  dayAnchor: (typeof DAY_ANCHORS)[number];
  weekday: Weekday | "none";
  weekOffset: (typeof WEEK_OFFSETS)[number];
  periodKind: (typeof PERIOD_KINDS)[number];
  monthOffset: (typeof MONTH_OFFSETS)[number];
};

/* Inclusive on both ends. */
export type DateRange = { start: string; end: string };

export type ResolvedDates = {
  range: DateRange;
  /* The parts the result depends on, so callers can take the weakest confidence among them. */
  used: (keyof DateParts)[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

function parseIso(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && toIso(parseIso(value)) === value;
}

export function addDays(iso: string, days: number): string {
  return toIso(new Date(parseIso(iso).getTime() + days * DAY_MS));
}

/* Monday is 0 and Sunday is 6. */
function weekdayIndex(iso: string): number {
  return (parseIso(iso).getUTCDay() + 6) % 7;
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function isoFor(year: number, monthIndex: number, day: number): string {
  return toIso(new Date(Date.UTC(year, monthIndex, day)));
}

export function eachDay(range: DateRange): string[] {
  const days: string[] = [];
  for (let day = range.start; day <= range.end; day = addDays(day, 1)) days.push(day);
  return days;
}

/*
 * A bare weekday means the next one on or after today.
 * "next" means that weekday in the following calendar week.
 * "current" means this week, rolling forward a week if that day has passed.
 */
function resolveWeekday(today: string, weekday: Weekday, offset: DateParts["weekOffset"]): string {
  const target = WEEKDAYS.indexOf(weekday);
  const thisMonday = addDays(today, -weekdayIndex(today));
  if (offset === "next") return addDays(thisMonday, 7 + target);
  if (offset === "current") {
    const day = addDays(thisMonday, target);
    return day >= today ? day : addDays(day, 7);
  }
  return addDays(today, (target - weekdayIndex(today) + 7) % 7);
}

function resolveCalendarDate(parts: DateParts, today: string): ResolvedDates | null {
  if (parts.month === "none" || parts.day === "none") return null;
  const monthIndex = MONTHS.indexOf(parts.month);
  let year = parseIso(today).getUTCFullYear();
  if (parts.day > daysInMonth(year, monthIndex)) return null;
  if (isoFor(year, monthIndex, parts.day) < today) year += 1;
  const day = isoFor(year, monthIndex, parts.day);
  return { range: { start: day, end: day }, used: ["mode", "month", "day"] };
}

function resolveRelativeDay(parts: DateParts, today: string): ResolvedDates | null {
  const single = (day: string, used: (keyof DateParts)[]): ResolvedDates => ({
    range: { start: day, end: day },
    used: ["mode", "dayAnchor", ...used],
  });
  switch (parts.dayAnchor) {
    case "today":
      return single(today, []);
    case "tomorrow":
      return single(addDays(today, 1), []);
    case "day_after":
      return single(addDays(today, 2), []);
    case "weekday":
      if (parts.weekday === "none") return null;
      return single(resolveWeekday(today, parts.weekday, parts.weekOffset), ["weekday", "weekOffset"]);
    case "none":
      return null;
  }
}

function resolveMonth(parts: DateParts, today: string): { year: number; monthIndex: number; used: (keyof DateParts)[] } | null {
  const now = parseIso(today);
  if (parts.month !== "none") {
    return { year: now.getUTCFullYear(), monthIndex: MONTHS.indexOf(parts.month), used: ["month"] };
  }
  const offset = { this_month: 0, next_month: 1, month_after_next: 2, none: null }[parts.monthOffset];
  if (offset === null) return null;
  const total = now.getUTCMonth() + offset;
  return { year: now.getUTCFullYear() + Math.floor(total / 12), monthIndex: total % 12, used: ["monthOffset"] };
}

function resolvePeriod(parts: DateParts, today: string): ResolvedDates | null {
  const thisMonday = addDays(today, -weekdayIndex(today));
  const weekShift = parts.weekOffset === "next" ? 7 : 0;

  if (parts.periodKind === "weekend" || parts.periodKind === "week") {
    // A weekend trip can leave on Friday, so the weekend runs Friday to Sunday.
    const firstDay = parts.periodKind === "weekend" ? 4 : 0;
    const start = addDays(thisMonday, weekShift + firstDay);
    const end = addDays(thisMonday, weekShift + 6);
    return {
      range: { start: start < today ? today : start, end },
      used: ["mode", "periodKind", "weekOffset"],
    };
  }

  if (parts.periodKind === "none") return null;
  const month = resolveMonth(parts, today);
  if (!month) return null;

  const span = (year: number): DateRange => {
    const last = daysInMonth(year, month.monthIndex);
    const [first, final] = {
      early_month: [1, 10],
      mid_month: [11, 20],
      late_month: [21, last],
      whole_month: [1, last],
    }[parts.periodKind as "early_month" | "mid_month" | "late_month" | "whole_month"];
    return { start: isoFor(year, month.monthIndex, first), end: isoFor(year, month.monthIndex, final) };
  };

  let range = span(month.year);
  if (range.end < today) range = span(month.year + 1);
  if (range.start < today) range = { start: today, end: range.end };
  return { range, used: ["mode", "periodKind", ...month.used] };
}

export function resolveDates(parts: DateParts, today: string): ResolvedDates | null {
  switch (parts.mode) {
    case "calendar_date":
      return resolveCalendarDate(parts, today);
    case "relative_day":
      return resolveRelativeDay(parts, today);
    case "period":
      return resolvePeriod(parts, today);
    case "none":
      return null;
  }
}

export function defaultRange(today: string): DateRange {
  return { start: addDays(today, 1), end: addDays(today, 7) };
}
