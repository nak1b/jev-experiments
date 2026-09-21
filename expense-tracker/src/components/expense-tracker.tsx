"use client";

import { Trash2, TriangleAlert } from "lucide-react";
import { useRef, useState } from "react";
import { localToday, UsageSidebar, UsageTopBar, useJevReading } from "@jev/kit";
import { formatAmount, parseAmount } from "@/lib/amount";
import { totalsFor, type Expense, type ExpenseTags } from "@/lib/expense";
import { applyTags, categoryLabel, type Chip } from "@/lib/tag-state";
import { StaticChip, TagChip } from "./chip";
import { TotalsPanel } from "./totals";
import { addExpense, removeExpense, useExpenses } from "./use-expenses";

const EXAMPLES = ["Uber to the airport $34", "Costco groceries $120.50", "Figma seat 15 dollars a month"];

const EMPTY: ReadonlySet<string> = new Set();

function withKey(set: ReadonlySet<string>, key: string): ReadonlySet<string> {
  return new Set(set).add(key);
}

function entryChips(expense: Expense): string[] {
  const chips = [categoryLabel(expense.category)];
  if (expense.kind) chips.push(expense.kind === "business" ? "Work" : "Personal");
  if (expense.recurring) chips.push("Repeats");
  if (expense.reimbursable) chips.push("Claim back");
  if (expense.necessity) chips.push(expense.necessity === "treat" ? "Treat" : "Necessity");
  return chips;
}

export function ExpenseTracker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [confirmed, setConfirmed] = useState(EMPTY);
  const [dismissed, setDismissed] = useState(EMPTY);
  const expenses = useExpenses();

  const { status, data, failure, calls, clear } = useJevReading<ExpenseTags>({ endpoint: "/api/tag", text });

  const amount = parseAmount(text);
  const applied = applyTags(text.trim() ? data : null, { confirmed, dismissed });
  const totals = totalsFor(expenses);
  const ready = status === "ready" && amount !== null;

  function changeText(value: string) {
    setText(value);
    setConfirmed(EMPTY);
    setDismissed(EMPTY);
    if (!value.trim()) clear();
  }

  function save() {
    if (!ready || amount === null) return;
    addExpense({
      id: crypto.randomUUID(),
      text: text.trim(),
      amount,
      date: localToday(),
      category: applied.category ?? "other",
      kind: applied.kind,
      recurring: applied.recurring,
      reimbursable: applied.reimbursable,
      necessity: applied.necessity,
    });
    changeText("");
    inputRef.current?.focus();
  }

  return (
    <>
      <UsageTopBar calls={calls} reading={status === "loading"} />

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
        <div className="min-w-0">
          <header className="pt-6">
            <h1 className="text-[15px] font-bold">Expense tracker</h1>
          </header>

          <main className="pb-24 pt-14 sm:pt-20">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                save();
              }}
            >
              <label htmlFor="expense" className="sr-only">
                What did you spend on?
              </label>
              <input
                ref={inputRef}
                id="expense"
                value={text}
                onChange={(event) => changeText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  save();
                }}
                placeholder="What did you spend on?"
                autoComplete="off"
                maxLength={200}
                className="w-full border-b-[3px] border-ink bg-transparent pb-3 text-[clamp(1.375rem,3.4vw,2rem)] font-semibold leading-tight tracking-[-0.01em] placeholder:text-muted/70 focus:shadow-[0_6px_0_0_var(--signal)] focus:outline-none"
              />

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <ul aria-label="What Jev read" className="flex flex-wrap gap-2">
                  {applied.chips.map((chip) => (
                    <TagChip
                      key={chip.key}
                      chip={chip}
                      onConfirm={(tag: Chip) => setConfirmed((keys) => withKey(keys, tag.key))}
                      onDismiss={(tag: Chip) => setDismissed((keys) => withKey(keys, tag.key))}
                    />
                  ))}
                </ul>

                {text.trim() && (
                  <p aria-live="polite" className="text-[13px] text-muted">
                    {status === "loading" && "Reading…"}
                    {status !== "loading" && amount === null && "Add an amount, like $12."}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!ready}
                  className="ml-auto h-9 rounded-[3px] bg-ink px-4 text-[14px] font-semibold text-paper disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  Add {amount === null ? "expense" : formatAmount(amount)}
                </button>
              </div>
            </form>

            {failure && (
              <div
                role="alert"
                className="mt-8 flex items-start gap-3 rounded-[3px] border-l-4 border-signal bg-panel px-4 py-3.5 text-panel-ink"
              >
                <TriangleAlert aria-hidden size={20} className="mt-0.5 shrink-0 text-signal" />
                <p>{failure.message}</p>
              </div>
            )}

            {expenses.length === 0 ? (
              <section aria-labelledby="examples-heading" className="mt-12">
                <h2 id="examples-heading" className="text-[15px] font-semibold text-muted">
                  Try one of these
                </h2>
                <ul className="mt-3 border-t border-rule">
                  {EXAMPLES.map((example) => (
                    <li key={example} className="border-b border-rule">
                      <button
                        type="button"
                        onClick={() => {
                          changeText(example);
                          inputRef.current?.focus();
                        }}
                        className="w-full py-3 text-left text-lg decoration-signal decoration-2 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                      >
                        {example}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <>
                <section aria-labelledby="entries-heading" className="mt-10">
                  <h2 id="entries-heading" className="text-[15px] font-semibold text-muted">
                    {expenses.length} {expenses.length === 1 ? "expense" : "expenses"}
                  </h2>
                  <ul className="mt-3 border-t border-rule">
                    {expenses.map((expense) => (
                      <li
                        key={expense.id}
                        className="flex items-start justify-between gap-4 border-b border-rule bg-surface px-4 py-3.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{expense.text}</p>
                          <ul className="mt-2 flex flex-wrap gap-1.5">
                            {entryChips(expense).map((label) => (
                              <StaticChip key={label} label={label} />
                            ))}
                          </ul>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <p className="text-lg font-bold tabular-nums">{formatAmount(expense.amount)}</p>
                          <button
                            type="button"
                            onClick={() => removeExpense(expense.id)}
                            aria-label={`Remove ${expense.text}`}
                            className="grid size-8 place-items-center rounded-[3px] text-muted hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>

                <TotalsPanel totals={totals} />
              </>
            )}
          </main>
        </div>

        <div className="hidden pt-6 lg:block">
          <UsageSidebar calls={calls} reading={status === "loading"} />
        </div>
      </div>
    </>
  );
}
