import "server-only";
import { jevCostUsd, type JevReply } from "@jev/kit";
import type { ExpenseTags } from "./expense";
import { QUESTIONS } from "./questions";
import { readExpense } from "./read-expense";
import { getTypeSafeClient } from "./typesafe";

export async function tagExpense(text: string, signal?: AbortSignal): Promise<JevReply<ExpenseTags>> {
  const started = performance.now();
  const { answers, model, usage } = await getTypeSafeClient().systemOne({ state: text, questions: QUESTIONS }, { signal });
  const latencyMs = Math.round(performance.now() - started);

  return {
    data: readExpense(answers),
    model,
    latencyMs,
    usage: { inputTokens: usage.input_tokens, outputTokens: usage.output_tokens },
    costUsd: jevCostUsd(model, usage.input_tokens),
  };
}
