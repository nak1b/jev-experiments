"use client";

import { formatCount, formatSpend, UsageSidebar, UsageTopBar, useJevReading } from "@jev/kit";
import { TriangleAlert, X } from "lucide-react";
import { useRef, useState } from "react";
import { agreement, isShown, type FilterResult, type Mode } from "@/lib/compare";
import { discussionUrl, type Post } from "@/lib/post";

const EXAMPLES = [
  "Only AI and machine learning",
  "Hide anything about crypto or politics",
  "Only posts a mobile developer would care about",
];

const MODE_LABELS: Record<Mode, string> = {
  batched: "One call",
  separate: "One call per post",
};

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

type Latest = Partial<Record<Mode, FilterResult>>;

type ModeColumnProps = { mode: Mode; result: FilterResult | undefined; active: boolean; waiting: string };

function ModeColumn({ mode, result, active, waiting }: ModeColumnProps) {
  const stats = result?.stats;
  return (
    <div className={`rounded-[3px] border px-4 py-3 ${active ? "border-ink bg-surface" : "border-rule"}`}>
      <p className="text-[13px] font-semibold">
        {MODE_LABELS[mode]}
        {stats && (
          <span className="font-normal text-muted">
            {" "}
            ({formatCount(stats.requests)} {stats.requests === 1 ? "request" : "requests"})
          </span>
        )}
      </p>
      {stats ? (
        <dl className="mt-2 grid grid-cols-3 gap-2 tabular-nums">
          <div>
            <dt className="text-[12px] text-muted">Cost</dt>
            <dd className="font-semibold">{formatSpend(stats.costUsd)}</dd>
          </div>
          <div>
            <dt className="text-[12px] text-muted">Tokens</dt>
            <dd className="font-semibold">{formatCount(stats.tokens)}</dd>
          </div>
          <div>
            <dt className="text-[12px] text-muted">Time</dt>
            <dd className="font-semibold">{formatCount(stats.latencyMs)} ms</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-2 text-[13px] text-muted">{waiting}</p>
      )}
    </div>
  );
}

export function NewsFilter({ posts }: { posts: Post[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rule, setRule] = useState("");
  const [mode, setMode] = useState<Mode>("batched");
  const [latest, setLatest] = useState<Latest>({});
  const [seen, setSeen] = useState<FilterResult | null>(null);

  const { status, data, failure, calls, clear } = useJevReading<FilterResult>({
    endpoint: "/api/filter",
    text: rule,
    body: { mode, posts: posts.map(({ id, title }) => ({ id, title })) },
    // Separate mode sends a request per post, so wait a little longer before asking.
    debounceMs: 400,
  });

  // Remember the newest result for each mode, so the two can be compared for the same rule.
  if (data && data !== seen) {
    setSeen(data);
    setLatest((previous) => ({ ...previous, [data.mode]: data }));
  }

  const trimmed = rule.trim();
  const current = data && data.rule === trimmed && data.mode === mode ? data : null;
  const forRule = (which: Mode) => (latest[which]?.rule === trimmed ? latest[which] : undefined);
  const batched = forRule("batched");
  const separate = forRule("separate");
  const agreed = batched && separate ? agreement(batched, separate) : null;
  const judged = trimmed ? (current ?? data) : null;
  const shownCount = posts.filter((post) => isShown(judged?.show[post.id])).length;

  function waitingText(which: Mode): string {
    if (!trimmed) return "Type a rule to measure it.";
    if (which === mode) return status === "error" ? "No reading yet." : "Reading…";
    return "Switch to this mode to measure it for this rule.";
  }

  function changeRule(value: string) {
    setRule(value);
    if (!value.trim()) clear();
  }

  return (
    <>
      <UsageTopBar calls={calls} reading={status === "loading"} />

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
        <div className="min-w-0">
          <header className="pt-6">
            <h1 className="text-[15px] font-bold">News filter</h1>
          </header>

          <main className="pb-24 pt-14 sm:pt-20">
            <div className="relative">
              <label htmlFor="rule" className="sr-only">
                Which posts do you want to see?
              </label>
              <input
                ref={inputRef}
                id="rule"
                value={rule}
                onChange={(event) => changeRule(event.target.value)}
                placeholder="Which posts do you want to see?"
                autoComplete="off"
                maxLength={200}
                className="w-full border-b-[3px] border-ink bg-transparent pb-3 pr-12 text-[clamp(1.375rem,3.4vw,2rem)] font-semibold leading-tight tracking-[-0.01em] placeholder:text-muted/70 focus:shadow-[0_6px_0_0_var(--signal)] focus:outline-none"
              />
              {trimmed && (
                <button
                  type="button"
                  onClick={() => {
                    changeRule("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear"
                  className={`absolute bottom-3 right-0 grid size-9 place-items-center rounded-[3px] text-muted hover:bg-ink/5 hover:text-ink ${FOCUS}`}
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              )}
            </div>

            {!trimmed && (
              <ul aria-label="Example rules" className="mt-4 flex flex-wrap gap-2">
                {EXAMPLES.map((example) => (
                  <li key={example}>
                    <button
                      type="button"
                      onClick={() => {
                        changeRule(example);
                        inputRef.current?.focus();
                      }}
                      className={`rounded-[3px] border border-rule bg-surface px-3 py-1.5 text-[14px] hover:border-ink/40 ${FOCUS}`}
                    >
                      {example}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <section aria-labelledby="compare-heading" className="mt-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="compare-heading" className="text-[15px] font-semibold text-muted">
                  How to ask Jev
                </h2>
                <div
                  role="group"
                  aria-label="How to ask Jev"
                  className="flex overflow-hidden rounded-[3px] border border-ink"
                >
                  {(Object.keys(MODE_LABELS) as Mode[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={mode === option}
                      onClick={() => setMode(option)}
                      className={`px-3 py-1.5 text-[14px] font-semibold ${FOCUS} ${
                        mode === option ? "bg-ink text-paper" : "hover:bg-ink/5"
                      }`}
                    >
                      {MODE_LABELS[option]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <ModeColumn
                  mode="batched"
                  result={batched}
                  active={mode === "batched"}
                  waiting={waitingText("batched")}
                />
                <ModeColumn
                  mode="separate"
                  result={separate}
                  active={mode === "separate"}
                  waiting={waitingText("separate")}
                />
              </div>
              <p aria-live="polite" className="mt-2 text-[13px] text-muted">
                {agreed && status !== "loading" && `Both ways agree on ${agreed.agree} of ${agreed.total} posts.`}
              </p>
            </section>

            {failure && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-3 rounded-[3px] border-l-4 border-signal bg-panel px-4 py-3.5 text-panel-ink"
              >
                <TriangleAlert aria-hidden size={20} className="mt-0.5 shrink-0 text-signal" />
                <p>{failure.message}</p>
              </div>
            )}

            <section aria-labelledby="posts-heading" className="mt-8">
              <h2 id="posts-heading" className="text-[15px] font-semibold text-muted">
                {judged
                  ? `${shownCount} of ${posts.length} posts match`
                  : `Hacker News front page, ${posts.length} posts`}
              </h2>
              <ol className="mt-3 border-t border-rule">
                {posts.map((post, index) => {
                  const probability = judged?.show[post.id];
                  const shown = isShown(probability);
                  return (
                    <li
                      key={post.id}
                      className={`relative flex gap-4 border-b border-rule bg-surface py-3 pl-5 pr-4 transition-opacity motion-reduce:transition-none ${
                        shown ? "" : "opacity-35"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`absolute inset-y-0 left-0 w-1.5 ${judged && shown ? "bg-signal" : "bg-transparent"}`}
                      />
                      <span className="w-6 shrink-0 pt-0.5 text-right text-[13px] tabular-nums text-muted">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <a
                          href={post.url ?? discussionUrl(post.id)}
                          target="_blank"
                          rel="noreferrer"
                          className={`font-semibold decoration-signal decoration-2 underline-offset-4 hover:underline ${FOCUS}`}
                        >
                          {post.title}
                        </a>
                        <p className="mt-0.5 text-[13px] text-muted">
                          {post.site && <span>{post.site}, </span>}
                          {formatCount(post.points)} points,{" "}
                          <a
                            href={discussionUrl(post.id)}
                            target="_blank"
                            rel="noreferrer"
                            className={`hover:underline ${FOCUS}`}
                          >
                            {formatCount(post.comments)} comments
                          </a>
                          {!shown && <span className="sr-only">. Hidden by your rule.</span>}
                        </p>
                      </div>
                      {probability !== undefined && (
                        <span
                          className="shrink-0 pt-0.5 text-[13px] tabular-nums text-muted"
                          title="Jev's probability that this post fits your rule"
                        >
                          {Math.round(probability * 100)}%
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          </main>
        </div>

        <div className="hidden pt-6 lg:block">
          <UsageSidebar calls={calls} reading={status === "loading"} />
        </div>
      </div>
    </>
  );
}
