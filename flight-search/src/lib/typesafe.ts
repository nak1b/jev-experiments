import "server-only";
import { TypeSafeClient } from "@typesafe-ai/sdk";

let client: TypeSafeClient | undefined;

export function hasTypeSafeApiKey(): boolean {
  return Boolean(process.env.TYPESAFE_API_KEY?.trim());
}

/*
 * Created on first use so `next build` works without a key.
 * The SDK reads TYPESAFE_API_KEY and throws a clear error when it is missing.
 * The "server-only" import fails the build if a client component imports this file.
 */
export function getTypeSafeClient(): TypeSafeClient {
  client ??= new TypeSafeClient();
  return client;
}
