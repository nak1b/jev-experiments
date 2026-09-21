import type { JevErrorBody } from "@jev/kit";
import { APIUserAbortError, AuthenticationError, RateLimitError } from "@typesafe-ai/sdk";
import { tagExpense } from "@/lib/interpret";
import { hasTypeSafeApiKey } from "@/lib/typesafe";

// Each call spends API credit, so a long paste should not reach Jev.
const MAX_TEXT_LENGTH = 200;

function fail(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } } satisfies JevErrorBody, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "invalid_request", "Send a JSON body with text.");
  }

  const { text } = (body ?? {}) as { text?: unknown };
  if (typeof text !== "string" || !text.trim() || text.length > MAX_TEXT_LENGTH) {
    return fail(400, "invalid_request", `Send text between 1 and ${MAX_TEXT_LENGTH} characters.`);
  }
  if (!hasTypeSafeApiKey()) {
    return fail(500, "missing_api_key", "Add TYPESAFE_API_KEY to .env.local at the repo root, then restart the dev server.");
  }

  try {
    return Response.json(await tagExpense(text.trim(), request.signal));
  } catch (error) {
    // The browser moved on to newer text, so nobody reads this response.
    if (error instanceof APIUserAbortError) return new Response(null, { status: 499 });
    if (error instanceof RateLimitError) {
      return fail(429, "rate_limited", "Jev is getting too many requests. Keep typing to try again.");
    }
    if (error instanceof AuthenticationError) {
      return fail(502, "invalid_api_key", "TypeSafe rejected the API key in the root .env.local. Check it or create a new one.");
    }
    console.error("Jev request failed", error);
    return fail(502, "upstream_error", "Jev could not read that expense. The server log has details.");
  }
}
