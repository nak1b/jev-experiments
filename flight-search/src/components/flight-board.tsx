"use client";

import { useState } from "react";
import type { FlightResult } from "@/lib/flights";
import { dayShift, formatClock, formatDay, formatDayParts, formatDuration, formatPrice } from "@/lib/format";
import type { Cabin, Priority } from "@/lib/intent";

const PAGE_SIZE = 12;

const ORDER_LABELS: Record<Priority, string> = {
  cheapest: "cheapest first",
  best: "shortest first",
  balanced: "best mix of price and time first",
};

const CABIN_NAMES: Record<Cabin, string> = {
  economy: "economy",
  premium_economy: "premium economy",
  business: "business class",
  first: "first class",
};

function Stops({ result }: { result: FlightResult }) {
  const { via } = result.flight;
  return <>{via ? `1 stop in ${via.city}` : "Nonstop"}</>;
}

function Arrival({ minutes }: { minutes: number }) {
  const shift = dayShift(minutes);
  return (
    <>
      {formatClock(minutes)}
      {shift !== 0 && (
        <sup className="ml-0.5 text-[11px] font-semibold text-muted" title={shift > 0 ? "Arrives a day later" : "Arrives a day earlier"}>
          {shift > 0 ? `+${shift}` : shift}
        </sup>
      )}
    </>
  );
}

/*
 * Results styled after air traffic control flight strips.
 * The colored edge marks nonstop flights in signal yellow.
 */
function FlightStrip({ result }: { result: FlightResult }) {
  const { flight, price } = result;
  const edge = flight.via ? "bg-rule" : "bg-signal";
  const { weekday, monthDay } = formatDayParts(flight.date);

  return (
    <li className="relative border-b border-rule bg-surface">
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1.5 ${edge}`} />

      <div className="hidden grid-cols-[5rem_7.5rem_minmax(0,1fr)_7.5rem_minmax(0,10rem)_5.5rem] items-center gap-x-6 py-4 pl-6 pr-5 @3xl:grid">
        <p className="text-[15px] font-semibold leading-snug">
          {weekday}
          <br />
          <span className="font-normal text-muted">{monthDay}</span>
        </p>
        <div>
          <p className="text-xl font-semibold tabular-nums">{formatClock(flight.departMinutes)}</p>
          <p className="mt-0.5 text-[13px] text-muted">{flight.origin.code}</p>
        </div>
        <div className="text-center">
          <p className="text-[13px] tabular-nums text-muted">{formatDuration(flight.durationMinutes)}</p>
          <div aria-hidden className="relative my-1.5 h-px bg-rule">
            {flight.via && <span className="absolute left-1/2 top-1/2 size-1.5 -translate-1/2 rounded-full bg-muted" />}
          </div>
          <p className="text-[13px] text-muted">
            <Stops result={result} />
          </p>
        </div>
        <div>
          <p className="text-xl font-semibold tabular-nums">
            <Arrival minutes={flight.arriveMinutes} />
          </p>
          <p className="mt-0.5 text-[13px] text-muted">{flight.destination.code}</p>
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{flight.airline.name}</p>
          <p className="mt-0.5 text-[13px] text-muted">{flight.flightNumber}</p>
        </div>
        <p className="text-right text-xl font-bold tabular-nums">{formatPrice(price)}</p>
      </div>

      <div className="flex items-start justify-between gap-4 py-3.5 pl-5 pr-4 @3xl:hidden">
        <div className="min-w-0">
          <p className="text-lg font-semibold tabular-nums">
            {formatClock(flight.departMinutes)} to <Arrival minutes={flight.arriveMinutes} />
          </p>
          <p className="mt-1 text-[13px] text-muted">
            {formatDay(flight.date)}, {formatDuration(flight.durationMinutes)}, <Stops result={result} />
          </p>
          <p className="mt-0.5 truncate text-[13px] text-muted">
            {flight.airline.name} {flight.flightNumber}
          </p>
        </div>
        <p className="text-lg font-bold tabular-nums">{formatPrice(price)}</p>
      </div>
    </li>
  );
}

type FlightBoardProps = { results: FlightResult[]; priority: Priority; cabin: Cabin };

export function FlightBoard({ results, priority, cabin }: FlightBoardProps) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const count = results.length;

  return (
    <section aria-labelledby="results-heading" className="@container mt-10">
      <h2 id="results-heading" className="text-[15px] font-semibold text-muted">
        {count} {CABIN_NAMES[cabin]} {count === 1 ? "flight" : "flights"}, {ORDER_LABELS[priority]}
      </h2>
      <ul className="mt-3 border-t border-rule">
        {results.slice(0, visible).map((result) => (
          <FlightStrip key={result.flight.id} result={result} />
        ))}
      </ul>
      {visible < count && (
        <button
          type="button"
          onClick={() => setVisible((shown) => shown + PAGE_SIZE)}
          className="mt-4 rounded-[3px] border border-rule bg-surface px-4 py-2.5 font-semibold hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Show more flights
        </button>
      )}
    </section>
  );
}
