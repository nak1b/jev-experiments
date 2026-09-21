import "server-only";
import type { Question, ResultFor } from "@typesafe-ai/sdk";
import type { SearchIntent } from "./intent";
import { jevCostUsd, type JevReply } from "@jev/kit";
import { AIRLINE_QUESTIONS, CORE_QUESTIONS } from "./questions";
import { readIntent } from "./read-intent";
import { getTypeSafeClient } from "./typesafe";

const QUESTIONS = { ...CORE_QUESTIONS, ...AIRLINE_QUESTIONS };

export async function interpret(text: string, today: string, signal?: AbortSignal): Promise<JevReply<SearchIntent>> {
  const started = performance.now();
  const { answers, model, usage } = await getTypeSafeClient().systemOne({ state: text, questions: QUESTIONS }, { signal });
  const latencyMs = Math.round(performance.now() - started);

  // The spread above loses the airline keys from the answer type, so look them up by name.
  const byKey: Readonly<Record<string, ResultFor<Question> | undefined>> = answers;
  const airlineNouls: Record<string, number> = {};
  for (const key of Object.keys(AIRLINE_QUESTIONS)) {
    const answer = byKey[key];
    if (answer?.type === "noul") airlineNouls[key] = answer.noul;
  }

  return {
    data: readIntent(answers, airlineNouls, today),
    model,
    latencyMs,
    usage: { inputTokens: usage.input_tokens, outputTokens: usage.output_tokens },
    costUsd: jevCostUsd(model, usage.input_tokens),
  };
}
