import "server-only";
import { loadEnvConfig } from "@next/env";
import { TypeSafeClient } from "@typesafe-ai/sdk";
import path from "node:path";

/*
 * Experiments share one key file at the repo root.
 * next.config.ts loads it for the config, but route handlers can run in a worker that never
 * evaluated the config, so load it here too. This module is server only, so the key stays there.
 */
if (!process.env.TYPESAFE_API_KEY?.trim()) {
  loadEnvConfig(path.join(process.cwd(), ".."), process.env.NODE_ENV !== "production");
}

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
