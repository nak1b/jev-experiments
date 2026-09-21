"use client";

import { useSyncExternalStore } from "react";
import type { Expense } from "@/lib/expense";

const STORAGE_KEY = "expenses";
const EMPTY: readonly Expense[] = [];

let expenses: readonly Expense[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

/* Storage can throw in private windows, and then the list simply lives for this visit. */
function load(): void {
  if (loaded) return;
  loaded = true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) expenses = JSON.parse(stored) as Expense[];
  } catch {
    // Keep the empty list.
  }
}

function update(next: readonly Expense[]): void {
  expenses = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // The list still works for this visit.
  }
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void): () => void {
  load();
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function snapshot(): readonly Expense[] {
  load();
  return expenses;
}

export function addExpense(expense: Expense): void {
  load();
  update([expense, ...expenses]);
}

export function removeExpense(id: string): void {
  load();
  update(expenses.filter((expense) => expense.id !== id));
}

export function useExpenses(): readonly Expense[] {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}
