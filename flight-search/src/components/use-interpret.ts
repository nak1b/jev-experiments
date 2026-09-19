"use client";

import { useCallback, useEffect, useState } from "react";
import type { InterpretErrorBody, InterpretErrorCode, InterpretResponse } from "@/lib/intent";
import type { JevCall } from "@/lib/usage";

// Long enough to skip most keystrokes, short enough to feel live.
const DEBOUNCE_MS = 250;

export type InterpretFailure = { code: InterpretErrorCode | "network"; message: string };

export type InterpretState = {
  status: "idle" | "loading" | "ready" | "error";
  /* The newest successful reading. It stays on screen while the next one loads. */
  response: InterpretResponse | null;
  failure: InterpretFailure | null;
  /* Every reading this visit, oldest first. Clearing the search keeps them. */
  calls: readonly JevCall[];
  clear: () => void;
};

type Settled = { query: string; failure: InterpretFailure | null };

export function localToday(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

async function requestReading(query: string, signal: AbortSignal): Promise<InterpretResponse> {
  const response = await fetch("/api/interpret", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, today: localToday() }),
    signal,
  });
  const body: unknown = await response.json().catch(() => null);
  if (response.ok) return body as InterpretResponse;
  const failure = (body as InterpretErrorBody | null)?.error;
  throw failure ?? { code: "upstream_error", message: `The server answered with status ${response.status}.` };
}

export function useInterpret(query: string): InterpretState {
  const text = query.trim();
  const [settled, setSettled] = useState<Settled | null>(null);
  const [latest, setLatest] = useState<InterpretResponse | null>(null);
  const [calls, setCalls] = useState<readonly JevCall[]>([]);

  useEffect(() => {
    if (!text) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      requestReading(text, controller.signal).then(
        (response) => {
          setLatest(response);
          setSettled({ query: text, failure: null });
          setCalls((previous) => [
            ...previous,
            {
              latencyMs: response.latencyMs,
              tokens: response.usage.inputTokens + response.usage.outputTokens,
              costUsd: response.costUsd,
            },
          ]);
        },
        (error: unknown) => {
          if (controller.signal.aborted) return;
          const failure: InterpretFailure =
            error && typeof error === "object" && "code" in error && "message" in error
              ? (error as InterpretFailure)
              : { code: "network", message: "Could not reach the server. Check that the dev server is running." };
          setSettled({ query: text, failure });
        },
      );
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text]);

  const clear = useCallback(() => {
    setLatest(null);
    setSettled(null);
  }, []);

  if (!text) return { status: "idle", response: null, failure: null, calls, clear };
  const current = settled?.query === text ? settled : null;
  if (!current) return { status: "loading", response: latest, failure: null, calls, clear };
  if (current.failure) return { status: "error", response: latest, failure: current.failure, calls, clear };
  return { status: "ready", response: latest, failure: null, calls, clear };
}
