"use client";

import { useCallback, useSyncExternalStore } from "react";
import { isAirportCode } from "@/lib/airports";

const STORAGE_KEY = "home-airport";
const CHANGE_EVENT = "home-airport-change";
export const DEFAULT_HOME_AIRPORT = "JFK";

// Storage can throw in private windows. This keeps the choice for the current visit.
let sessionHome: string | null = null;

function read(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isAirportCode(stored)) return stored;
  } catch {
    // Fall through to the in-memory choice.
  }
  return sessionHome ?? DEFAULT_HOME_AIRPORT;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function useHomeAirport(): [string, (code: string) => void] {
  const home = useSyncExternalStore(subscribe, read, () => DEFAULT_HOME_AIRPORT);
  const setHome = useCallback((code: string) => {
    sessionHome = code;
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // The in-memory choice still applies.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);
  return [home, setHome];
}
