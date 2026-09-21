import type { JevErrorBody } from "@jev/kit";
import { APIUserAbortError, AuthenticationError, RateLimitError } from "@typesafe-ai/sdk";
import { MODES, type Mode } from "@/lib/compare";
import { filterPosts, type PostTitle } from "@/lib/filter";
import { POST_COUNT } from "@/lib/hn";
import { hasTypeSafeApiKey } from "@/lib/typesafe";

// Each call spends API credit, so long input should not reach Jev.
const MAX_RULE_LENGTH = 200;
const MAX_TITLE_LENGTH = 300;

function fail(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } } satisfies JevErrorBody, { status });
}

function isPostTitle(value: unknown): value is PostTitle {
  if (!value || typeof value !== "object") return false;
  const { id, title } = value as Record<string, unknown>;
  return Number.isInteger(id) && typeof title === "string" && title.length > 0 && title.length <= MAX_TITLE_LENGTH;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "invalid_request", "Send a JSON body with text, mode and posts.");
  }

  const { text, mode, posts } = (body ?? {}) as { text?: unknown; mode?: unknown; posts?: unknown };
  if (typeof text !== "string" || !text.trim() || text.length > MAX_RULE_LENGTH) {
    return fail(400, "invalid_request", `Send a rule between 1 and ${MAX_RULE_LENGTH} characters.`);
  }
  if (typeof mode !== "string" || !(MODES as readonly string[]).includes(mode)) {
    return fail(400, "invalid_request", `Send a mode: ${MODES.join(" or ")}.`);
  }
  if (!Array.isArray(posts) || posts.length === 0 || posts.length > POST_COUNT || !posts.every(isPostTitle)) {
    return fail(400, "invalid_request", `Send between 1 and ${POST_COUNT} posts, each with an id and a title.`);
  }
  if (!hasTypeSafeApiKey()) {
    return fail(500, "missing_api_key", "Add TYPESAFE_API_KEY to .env.local at the repo root, then restart the dev server.");
  }

  try {
    return Response.json(await filterPosts(text.trim(), posts, mode as Mode, request.signal));
  } catch (error) {
    // The browser moved on to a newer rule, so nobody reads this response.
    if (error instanceof APIUserAbortError) return new Response(null, { status: 499 });
    if (error instanceof RateLimitError) {
      return fail(429, "rate_limited", "Jev is getting too many requests. Wait a moment, then edit the rule to try again.");
    }
    if (error instanceof AuthenticationError) {
      return fail(502, "invalid_api_key", "TypeSafe rejected the API key in the root .env.local. Check it or create a new one.");
    }
    console.error("Jev request failed", error);
    return fail(502, "upstream_error", "Jev could not read that rule. The server log has details.");
  }
}
