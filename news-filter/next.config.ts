import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import path from "node:path";

/*
 * Every experiment shares one key file at the repo root, so there is a single copy of the secret.
 * Next.js only reads env files from this folder, so the root ones are loaded here first.
 */
loadEnvConfig(path.join(__dirname, ".."), process.env.NODE_ENV !== "production");

const nextConfig: NextConfig = {
  // The kit ships TypeScript source, so Next compiles it with the app.
  transpilePackages: ["@jev/kit"],
};

export default nextConfig;
