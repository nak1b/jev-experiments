import { describe, expect, it } from "vitest";
import { resolveDates, type DateParts } from "./dates";

// A Friday, so weekday and weekend cases have a fixed reference point.
const TODAY = "2026-09-18";

const NONE: DateParts = {
  mode: "none",
  month: "none",
  day: "none",
  dayAnchor: "none",
  weekday: "none",
  weekOffset: "none",
  periodKind: "none",
  monthOffset: "none",
};

const resolve = (parts: Partial<DateParts>) => resolveDates({ ...NONE, ...parts }, TODAY);

describe("resolveDates", () => {
  it("returns null when no date is given", () => {
    expect(resolve({})).toBeNull();
  });

  describe("calendar dates", () => {
    it("resolves a future date in the current year", () => {
      expect(resolve({ mode: "calendar_date", month: "October", day: 12 })).toEqual({
        range: { start: "2026-10-12", end: "2026-10-12" },
        used: ["mode", "month", "day"],
      });
    });

    it("rolls a past date into next year", () => {
      expect(resolve({ mode: "calendar_date", month: "September", day: 3 })?.range.start).toBe("2027-09-03");
    });

    it("keeps today as today", () => {
      expect(resolve({ mode: "calendar_date", month: "September", day: 18 })?.range.start).toBe(TODAY);
    });

    it("rejects a day the month does not have", () => {
      expect(resolve({ mode: "calendar_date", month: "February", day: 30 })).toBeNull();
    });

    it("needs both a month and a day", () => {
      expect(resolve({ mode: "calendar_date", month: "October" })).toBeNull();
    });
  });

  describe("relative days", () => {
    it.each([
      ["today", "2026-09-18"],
      ["tomorrow", "2026-09-19"],
      ["day_after", "2026-09-20"],
    ] as const)("resolves %s", (dayAnchor, expected) => {
      expect(resolve({ mode: "relative_day", dayAnchor })?.range).toEqual({ start: expected, end: expected });
    });

    it("treats a bare weekday as the next one on or after today", () => {
      expect(resolve({ mode: "relative_day", dayAnchor: "weekday", weekday: "Friday" })?.range.start).toBe("2026-09-18");
      expect(resolve({ mode: "relative_day", dayAnchor: "weekday", weekday: "Tuesday" })?.range.start).toBe("2026-09-22");
    });

    it("moves 'next Friday' into the following week", () => {
      const next = resolve({ mode: "relative_day", dayAnchor: "weekday", weekday: "Friday", weekOffset: "next" });
      expect(next?.range.start).toBe("2026-09-25");
      expect(next?.used).toEqual(["mode", "dayAnchor", "weekday", "weekOffset"]);
    });

    it("rolls 'this Monday' forward when it has already passed", () => {
      expect(
        resolve({ mode: "relative_day", dayAnchor: "weekday", weekday: "Monday", weekOffset: "current" })?.range.start,
      ).toBe("2026-09-21");
    });
  });

  describe("periods", () => {
    it("runs this weekend from today through Sunday", () => {
      expect(resolve({ mode: "period", periodKind: "weekend", weekOffset: "current" })?.range).toEqual({
        start: "2026-09-18",
        end: "2026-09-20",
      });
    });

    it("runs next weekend from Friday to Sunday", () => {
      expect(resolve({ mode: "period", periodKind: "weekend", weekOffset: "next" })?.range).toEqual({
        start: "2026-09-25",
        end: "2026-09-27",
      });
    });

    it("runs next week from Monday to Sunday", () => {
      expect(resolve({ mode: "period", periodKind: "week", weekOffset: "next" })?.range).toEqual({
        start: "2026-09-21",
        end: "2026-09-27",
      });
    });

    it("resolves 'early next month' from the month offset", () => {
      expect(resolve({ mode: "period", periodKind: "early_month", monthOffset: "next_month" })).toEqual({
        range: { start: "2026-10-01", end: "2026-10-10" },
        used: ["mode", "periodKind", "monthOffset"],
      });
    });

    it("wraps month offsets across the year end", () => {
      const parts: Partial<DateParts> = { mode: "period", periodKind: "whole_month", monthOffset: "month_after_next" };
      expect(resolveDates({ ...NONE, ...parts }, "2026-11-05")?.range).toEqual({ start: "2027-01-01", end: "2027-01-31" });
    });

    it("starts a period that is underway at today", () => {
      expect(resolve({ mode: "period", periodKind: "mid_month", month: "September" })?.range).toEqual({
        start: "2026-09-18",
        end: "2026-09-20",
      });
    });

    it("moves a period that has ended into next year", () => {
      expect(resolve({ mode: "period", periodKind: "early_month", month: "September" })?.range).toEqual({
        start: "2027-09-01",
        end: "2027-09-10",
      });
    });

    it("ends late February on the last day of the month", () => {
      expect(resolve({ mode: "period", periodKind: "late_month", month: "February" })?.range.end).toBe("2027-02-28");
    });

    it("needs a month for month-based periods", () => {
      expect(resolve({ mode: "period", periodKind: "early_month" })).toBeNull();
    });
  });
});
