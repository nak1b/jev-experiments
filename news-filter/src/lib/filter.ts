import "server-only";
import { jevCostUsd, type JevReply } from "@jev/kit";
import type { FilterResult, Mode } from "./compare";
import { postQuestion, questionKey, ruleState } from "./questions";
import { getTypeSafeClient } from "./typesafe";

export type PostTitle = { id: number; title: string };

type Call = { show: Record<number, number>; model: string; inputTokens: number; outputTokens: number };

/* One request with a question for every post. */
async function askTogether(rule: string, posts: PostTitle[], signal?: AbortSignal): Promise<Call[]> {
  const questions = Object.fromEntries(posts.map((post) => [questionKey(post.id), postQuestion(post.title)]));
  const { answers, model, usage } = await getTypeSafeClient().systemOne({ state: ruleState(rule), questions }, { signal });
  const show: Record<number, number> = {};
  for (const post of posts) {
    const answer = answers[questionKey(post.id)];
    if (answer?.type === "noul") show[post.id] = answer.noul;
  }
  return [{ show, model, inputTokens: usage.input_tokens, outputTokens: usage.output_tokens }];
}

/* One request per post, all in flight at once, each with the same single question it would get when batched. */
async function askSeparately(rule: string, posts: PostTitle[], signal?: AbortSignal): Promise<Call[]> {
  return Promise.all(
    posts.map(async (post) => {
      const key = questionKey(post.id);
      const { answers, model, usage } = await getTypeSafeClient().systemOne(
        { state: ruleState(rule), questions: { [key]: postQuestion(post.title) } },
        { signal },
      );
      const answer = answers[key];
      return {
        show: answer?.type === "noul" ? { [post.id]: answer.noul } : {},
        model,
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
      };
    }),
  );
}

export async function filterPosts(
  rule: string,
  posts: PostTitle[],
  mode: Mode,
  signal?: AbortSignal,
): Promise<JevReply<FilterResult>> {
  const started = performance.now();
  const calls = mode === "batched" ? await askTogether(rule, posts, signal) : await askSeparately(rule, posts, signal);
  const latencyMs = Math.round(performance.now() - started);

  const inputTokens = calls.reduce((sum, call) => sum + call.inputTokens, 0);
  const outputTokens = calls.reduce((sum, call) => sum + call.outputTokens, 0);
  const costs = calls.map((call) => jevCostUsd(call.model, call.inputTokens));
  const costUsd = costs.includes(null) ? null : costs.reduce<number>((sum, cost) => sum + (cost ?? 0), 0);

  return {
    data: {
      mode,
      rule,
      show: Object.assign({}, ...calls.map((call) => call.show)),
      stats: { latencyMs, tokens: inputTokens + outputTokens, costUsd, requests: calls.length },
    },
    model: calls[0]?.model ?? "unknown",
    latencyMs,
    usage: { inputTokens, outputTokens },
    costUsd,
  };
}
