<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project rules

- The repo rules in `../AGENTS.md` apply here too.
- `README.md` explains how the app works and how it uses Jev. Update it when you change the questions, the confidence bands or the request flow.
- Call TypeSafe only through `getTypeSafeClient()` in `src/lib/typesafe.ts`.
- Keep every Jev question in `src/lib/questions.ts`, sent in one call.
- Let code do arithmetic, including parsing amounts and adding up totals. Ask Jev only for judgments.
