"use client";

import { TriangleAlert, X } from "lucide-react";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { getAirport } from "@/lib/airports";
import { generateFlights, searchFlights } from "@/lib/flights";
import type { SearchIntent } from "@/lib/intent";
import { buildSearch, type Sign } from "@/lib/search-state";
import { DestinationSuggestions } from "./destination-suggestions";
import { FlightBoard } from "./flight-board";
import { HomeAirportSign, SignView } from "./sign";
import { useHomeAirport } from "./use-home-airport";
import { localToday, UsageSidebar, UsageTopBar, useJevReading } from "@jev/kit";

const EXAMPLES = [
  "Cheap nonstop from Boston to Lisbon early next month",
  "Somewhere warm in Europe next weekend, but not on Ryanair",
  "Business class to Tokyo on October 14, leaving in the morning",
  "Chicago this Friday evening, no red-eyes",
];

const EMPTY: ReadonlySet<string> = new Set();

function withKey(set: ReadonlySet<string>, key: string): ReadonlySet<string> {
  return new Set(set).add(key);
}

function Message({ children }: { children: ReactNode }) {
  return <p className="mt-10 max-w-prose text-lg text-muted">{children}</p>;
}

export function FlightSearch() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState("");
  const [confirmed, setConfirmed] = useState(EMPTY);
  const [dismissed, setDismissed] = useState(EMPTY);
  const [picked, setPicked] = useState<string | null>(null);
  const [home, setHome] = useHomeAirport();
  const { status, data: intentData, failure, calls, clear } = useJevReading<SearchIntent>({
    endpoint: "/api/interpret",
    text: query,
    body: { today: localToday() },
  });

  // The box grows with the sentence so the traveler can always see everything Jev reads.
  useLayoutEffect(() => {
    const box = inputRef.current;
    if (!box) return;
    const fit = () => {
      box.style.height = "auto";
      box.style.height = `${box.scrollHeight}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [query]);

  function changeQuery(value: string) {
    setQuery(value);
    if (value.trim()) return;
    clear();
    setConfirmed(EMPTY);
    setDismissed(EMPTY);
    setPicked(null);
  }

  function dismiss(sign: Sign) {
    // A destination with no confidence came from a suggestion the traveler picked.
    if (sign.field === "destination" && sign.confidence === null) setPicked(null);
    else setDismissed((keys) => withKey(keys, sign.key));
  }

  const hasQuery = query.trim() !== "";
  const reading = status === "loading";
  const intent = hasQuery ? intentData : null;
  const search = intent
    ? buildSearch(intent, { confirmed, dismissed, homeAirport: home, pickedDestination: picked }, localToday())
    : null;
  const showSuggestions = Boolean(intent?.suggestions.length) && intent?.destination?.certainty !== "sure";
  const sameAirport = search?.destination === search?.origin;
  const results =
    search?.destination && !sameAirport
      ? searchFlights(generateFlights(search.origin, search.destination, search.range), search.filters, search.priority)
      : [];

  return (
    <>
      <UsageTopBar calls={calls} reading={reading} />

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
        <div className="min-w-0">
          <header className="pt-6">
            <h1 className="text-[15px] font-bold">Flight search</h1>
          </header>

          <main className="pb-24 pt-16 sm:pt-24">
            <div className="relative">
              <label htmlFor="trip" className="sr-only">
                Describe your trip
              </label>
              <textarea
                ref={inputRef}
                id="trip"
                rows={1}
                value={query}
                onChange={(event) => changeQuery(event.target.value.replace(/\s*\n\s*/g, " "))}
                onKeyDown={(event) => {
                  // The search runs as you type, so Enter has nothing to submit.
                  if (event.key === "Enter") event.preventDefault();
                }}
                placeholder="Where do you want to fly?"
                autoComplete="off"
                spellCheck={false}
                maxLength={300}
                className="block w-full resize-none overflow-hidden border-b-[3px] border-ink bg-transparent pb-3 pr-12 text-[clamp(1.625rem,4.2vw,2.625rem)] font-semibold leading-tight tracking-[-0.01em] placeholder:text-muted/70 focus:shadow-[0_6px_0_0_var(--signal)] focus:outline-none"
              />
              {hasQuery && (
                <button
                  type="button"
                  onClick={() => {
                    changeQuery("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear"
                  className="absolute bottom-4 right-0 grid size-9 place-items-center rounded-[3px] text-muted hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-ink"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              )}
            </div>

            {hasQuery && search && (
              <ul aria-label="What Jev understood" className="mt-5 flex flex-wrap gap-2">
                {search.signs.map((sign) =>
                  sign.kind === "default" && sign.field === "origin" ? (
                    <HomeAirportSign key="home" code={home} onChange={setHome} />
                  ) : (
                    <SignView
                      key={sign.key}
                      sign={sign}
                      onConfirm={(guess) => setConfirmed((keys) => withKey(keys, guess.key))}
                      onDismiss={dismiss}
                    />
                  ),
                )}
              </ul>
            )}

            {failure && (
              <div
                role="alert"
                className="mt-8 flex items-start gap-3 rounded-[3px] border-l-4 border-signal bg-panel px-4 py-3.5 text-panel-ink"
              >
                <TriangleAlert aria-hidden size={20} className="mt-0.5 shrink-0 text-signal" />
                <p>{failure.message}</p>
              </div>
            )}

            {!hasQuery && (
              <section aria-labelledby="examples-heading" className="mt-10">
                <h2 id="examples-heading" className="text-[15px] font-semibold text-muted">
                  Try one of these
                </h2>
                <ul className="mt-3 border-t border-rule">
                  {EXAMPLES.map((example) => (
                    <li key={example} className="border-b border-rule">
                      <button
                        type="button"
                        onClick={() => {
                          changeQuery(example);
                          inputRef.current?.focus();
                        }}
                        className="w-full py-3.5 text-left text-lg decoration-signal decoration-2 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                      >
                        {example}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {search && showSuggestions && intent && (
              <DestinationSuggestions suggestions={intent.suggestions} picked={picked} onPick={setPicked} />
            )}

            {search && !search.destination && !showSuggestions && (
              <Message>Say where you want to go, like &ldquo;to Lisbon&rdquo; or &ldquo;somewhere warm&rdquo;.</Message>
            )}

            {search?.destination && sameAirport && (
              <Message>
                You are already in {getAirport(search.origin).city}. Say where you want to fly from or to.
              </Message>
            )}

            {search?.destination && !sameAirport && results.length === 0 && (
              <Message>No flights match every sign. Remove one to see more.</Message>
            )}

            {search && results.length > 0 && (
              <FlightBoard
                key={search.signs.map((sign) => sign.key).join("|")}
                results={results}
                priority={search.priority}
                cabin={search.filters.cabin}
              />
            )}
          </main>
        </div>

        <div className="hidden pt-6 lg:block">
          <UsageSidebar calls={calls} reading={reading} />
        </div>
      </div>
    </>
  );
}
