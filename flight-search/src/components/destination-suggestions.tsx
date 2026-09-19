"use client";

import { PlaneLanding } from "lucide-react";
import { getAirport } from "@/lib/airports";
import { formatPercent } from "@/lib/format";
import type { DestinationSuggestion } from "@/lib/intent";

type Props = {
  suggestions: DestinationSuggestion[];
  picked: string | null;
  onPick: (code: string) => void;
};

/* Shown when the traveler describes a kind of place. The bars show how Jev spread its probability. */
export function DestinationSuggestions({ suggestions, picked, onPick }: Props) {
  const top = suggestions[0]?.probability ?? 1;
  return (
    <section aria-labelledby="suggestions-heading" className="@container mt-10">
      <h2 id="suggestions-heading" className="text-[15px] font-semibold text-muted">
        Places that fit what you said
      </h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 @2xl:grid-cols-3">
        {suggestions.map(({ code, probability }) => {
          const airport = getAirport(code);
          const isPicked = picked === code;
          return (
            <li key={code}>
              <button
                type="button"
                onClick={() => onPick(code)}
                aria-pressed={isPicked}
                aria-label={`Fly to ${airport.city}. Jev gives it ${formatPercent(probability)}.`}
                className={`flex w-full items-stretch overflow-hidden rounded-[3px] bg-panel text-left text-panel-ink outline-offset-2 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-ink ${
                  isPicked ? "outline-3 outline-signal" : ""
                }`}
              >
                <span aria-hidden className="grid w-10 shrink-0 place-items-center text-signal">
                  <PlaneLanding size={18} strokeWidth={2.25} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1.5 py-2.5 pr-3">
                  <span className="truncate font-semibold">
                    {airport.city} <span className="hidden font-normal opacity-65 sm:inline">{code}</span>
                  </span>
                  <span className="flex items-center gap-2.5">
                    <span aria-hidden className="h-1 flex-1 overflow-hidden rounded-full bg-panel-ink/15">
                      <span className="block h-full bg-signal" style={{ width: `${(probability / top) * 100}%` }} />
                    </span>
                    <span className="text-[12px] tabular-nums opacity-80">{formatPercent(probability)}</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
