"use client";

import { useId, type ReactNode } from "react";
import { formatCount, formatSpend } from "./format";
import { summarize, type JevCall } from "./usage";

/*
 * The experiment's numbers: what Jev readings cost, how many tokens they use, and how fast they come back.
 * Signal yellow marks the running totals for the visit. Each reading costs about the same, so the total is the number that moves.
 */

type UsageProps = { calls: readonly JevCall[]; reading: boolean };

function HeadlineStat({ value, label, large = false }: { value: ReactNode; label: string; large?: boolean }) {
  return (
    <div>
      <p className={`font-semibold leading-none tracking-tight text-signal ${large ? "text-[34px]" : "text-[26px]"}`}>
        {value}
      </p>
      <p className="mt-2 text-[13px] text-panel-ink/80">{label}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="text-[13px] text-panel-ink/80">{label}</dt>
      <dd className="text-[17px] font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

/* Wide screens: a panel that stays in view beside the search. */
export function UsageSidebar({ calls, reading }: UsageProps) {
  const headingId = useId();
  const last = calls.at(-1);
  const visit = summarize(calls);

  return (
    <aside aria-labelledby={headingId} className="sticky top-6 rounded-[3px] bg-panel p-5 text-panel-ink">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={headingId} className="text-[15px] font-semibold">
          Cost, tokens and speed
        </h2>
        <p aria-live="polite" className="text-[13px] text-panel-ink/60">
          {reading ? "Reading…" : ""}
        </p>
      </div>

      {last ? (
        <>
          <h3 className="mt-5 text-[13px] text-panel-ink/60">This visit</h3>
          <div className="mt-3 space-y-5">
            <HeadlineStat large value={formatSpend(visit.costUsd)} label="Spent" />
            <div className="grid grid-cols-2 gap-4">
              <HeadlineStat value={formatCount(visit.tokens)} label="Tokens" />
              <HeadlineStat value={formatCount(visit.readings)} label={visit.readings === 1 ? "Reading" : "Readings"} />
            </div>
          </div>

          <h3 className="mt-6 border-t border-panel-ink/15 pt-5 text-[13px] text-panel-ink/60">Last reading</h3>
          <dl className="mt-2">
            <StatRow label="Cost" value={formatSpend(last.costUsd)} />
            <StatRow label="Tokens" value={formatCount(last.tokens)} />
            <StatRow label="Response time" value={`${formatCount(last.latencyMs)} ms`} />
          </dl>
        </>
      ) : (
        <p className="mt-3 text-[15px] leading-snug text-panel-ink/80">
          Start typing. The cost, tokens and speed of each reading show up here.
        </p>
      )}
    </aside>
  );
}

/* Narrow screens: a bar pinned to the top of the page. */
export function UsageTopBar({ calls, reading }: UsageProps) {
  const last = calls.at(-1);
  if (!last && !reading) return null;
  const visit = summarize(calls);
  const readings = `${formatCount(visit.readings)} ${visit.readings === 1 ? "reading" : "readings"}`;

  return (
    <section aria-label="Cost, tokens and speed" className="sticky top-0 z-30 bg-panel text-panel-ink lg:hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 py-2.5 sm:px-8">
        {last ? (
          <>
            <p className="flex flex-wrap items-baseline gap-x-4 text-[15px] font-semibold tabular-nums text-signal">
              <span className="sr-only text-[13px] font-normal text-panel-ink/70 sm:not-sr-only">This visit</span>
              <span>{formatSpend(visit.costUsd)}</span>
              <span>{formatCount(visit.tokens)} tokens</span>
              <span>{readings}</span>
            </p>
            <p className="text-[13px] tabular-nums text-panel-ink/70">
              Last reading: {formatSpend(last.costUsd)}, {formatCount(last.tokens)} tokens, {formatCount(last.latencyMs)} ms
            </p>
          </>
        ) : (
          <p className="text-[13px] text-panel-ink/70">Reading…</p>
        )}
      </div>
    </section>
  );
}
