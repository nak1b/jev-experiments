"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { JevCall } from "./usage";

/* What an experiment's API route returns for one reading. */
export type JevReply<T> = {
  data: T;
  model: string;
  /* Time spent waiting on Jev, measured on the server. */
  latencyMs: number;
  usage: { inputTokens: number; outputTokens: number };
  /* Estimated from list prices. Null when the model's price is unknown. */
  costUsd: number | null;
};

export type JevErrorBody = { error: { code: string; message: string } };

export type ReadingFailure = { code: string; message: string };

export type JevReadingState<T> = {
  status: "idle" | "loading" | "ready" | "error";
  /* The newest successful reading. It stays on screen while the next one loads. */
  data: T | null;
  failure: ReadingFailure | null;
  /* Every reading this visit, oldest first. Clearing the text keeps them. */
  calls: readonly JevCall[];
  clear: () => void;
};

type Options = {
  endpoint: string;
  text: string;
  /* Extra fields sent with the text, such as today's date. */
  body?: Record<string, unknown>;
  /* Long enough to skip most keystrokes, short enough to feel live. */
  debounceMs?: number;
};

type Settled = { text: string; failure: ReadingFailure | null };

async function request<T>(endpoint: string, body: unknown, signal: AbortSignal): Promise<JevReply<T>> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const payload: unknown = await response.json().catch(() => null);
  if (response.ok) return payload as JevReply<T>;
  const failure = (payload as JevErrorBody | null)?.error;
  throw failure ?? { code: "upstream_error", message: `The server answered with status ${response.status}.` };
}

/* Sends text to an experiment's API route as it is typed, and keeps a record of what each reading cost. */
export function useJevReading<T>({ endpoint, text, body, debounceMs = 250 }: Options): JevReadingState<T> {
  const trimmed = text.trim();
  const extra = JSON.stringify(body ?? {});
  const [settled, setSettled] = useState<Settled | null>(null);
  const [latest, setLatest] = useState<T | null>(null);
  const [calls, setCalls] = useState<readonly JevCall[]>([]);

  useEffect(() => {
    if (!trimmed) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      request<T>(endpoint, { ...JSON.parse(extra), text: trimmed }, controller.signal).then(
        (reply) => {
          setLatest(reply.data);
          setSettled({ text: trimmed, failure: null });
          setCalls((previous) => [
            ...previous,
            {
              latencyMs: reply.latencyMs,
              tokens: reply.usage.inputTokens + reply.usage.outputTokens,
              costUsd: reply.costUsd,
            },
          ]);
        },
        (error: unknown) => {
          if (controller.signal.aborted) return;
          const failure: ReadingFailure =
            error && typeof error === "object" && "code" in error && "message" in error
              ? (error as ReadingFailure)
              : { code: "network", message: "Could not reach the server. Check that the dev server is running." };
          setSettled({ text: trimmed, failure });
        },
      );
    }, debounceMs);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [endpoint, trimmed, extra, debounceMs]);

  const clear = useCallback(() => {
    setLatest(null);
    setSettled(null);
  }, []);

  return useMemo(() => {
    if (!trimmed) return { status: "idle", data: null, failure: null, calls, clear };
    const current = settled?.text === trimmed ? settled : null;
    if (!current) return { status: "loading", data: latest, failure: null, calls, clear };
    if (current.failure) return { status: "error", data: latest, failure: current.failure, calls, clear };
    return { status: "ready", data: latest, failure: null, calls, clear };
  }, [trimmed, settled, latest, calls, clear]);
}
