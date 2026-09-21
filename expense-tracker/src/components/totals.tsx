"use client";

import { formatAmount } from "@/lib/amount";
import type { Totals } from "@/lib/expense";
import { categoryLabel } from "@/lib/tag-state";

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[22px] font-semibold leading-none tracking-tight tabular-nums">{value}</p>
      <p className="mt-1.5 text-[13px] text-muted">{label}</p>
    </div>
  );
}

export function TotalsPanel({ totals }: { totals: Totals }) {
  const largest = totals.byCategory[0]?.amount ?? 1;

  return (
    <section aria-labelledby="totals-heading" className="mt-10 border-t border-rule pt-5">
      <h2 id="totals-heading" className="sr-only">
        Totals
      </h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
        <Figure label="Tracked" value={formatAmount(totals.all)} />
        <Figure label="Work" value={formatAmount(totals.business)} />
        <Figure label="Personal" value={formatAmount(totals.personal)} />
        <Figure label="Repeating" value={formatAmount(totals.recurring)} />
      </div>

      {totals.byCategory.length > 0 && (
        <ul className="mt-6 space-y-2">
          {totals.byCategory.map(({ category, amount, count }) => (
            <li key={category} className="grid grid-cols-[7rem_minmax(0,1fr)_5rem] items-center gap-3">
              <span className="truncate text-[14px]">{categoryLabel(category)}</span>
              <span aria-hidden className="h-2 overflow-hidden rounded-full bg-rule">
                <span className="block h-full bg-signal" style={{ width: `${(amount / largest) * 100}%` }} />
              </span>
              <span className="text-right text-[14px] tabular-nums" title={`${count} ${count === 1 ? "entry" : "entries"}`}>
                {formatAmount(amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
