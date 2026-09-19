# jev-experiments

Experiments with Jev, the TypeSafe System One model.
Each experiment lives in its own folder at the repo root and has its own AGENTS.md with rules for that folder.
Read it before changing the experiment.

## Tech stack

- TypeScript, Next.js (App Router) and Tailwind CSS.
- npm workspaces, with one lockfile at the root.
- Vitest for unit tests.
- New experiments use the same stack unless there is a clear reason not to.
- Next.js here is newer than most training data. Read the docs in `node_modules/next/dist/docs/` before writing Next.js code.

## Secrets

- Never commit keys, tokens, passwords or any other secret.
- The TypeSafe key lives only in the root `.env.local`. Experiments load it from there instead of keeping a copy.
- Never read, print or edit a local env file. Only `.env.example` is safe to open.
- Call TypeSafe only from server code. Never send a key to a browser, and never give a secret the `NEXT_PUBLIC_` prefix.
- Never skip the git hooks with `--no-verify`. The pre-commit hook blocks env files and key values.

## Commits

- Use Conventional Commits: `type(scope): summary`, such as `feat(flight-search): add cabin filter`.
- Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.
- The scope is the experiment folder, or `repo` for shared files. Leave it out when a change spans everything.
- Write the summary in the imperative, in lower case, with no full stop.
- Never add AI or agent attribution: no co-author trailers and no "Generated with" lines, in commits or pull requests.
- The commit-msg hook checks these rules.

## Writing

- Never use the em dash. Use a plain dash or rewrite the sentence.
- In Markdown, put each full sentence on its own line.
- Write comments in plain, short sentences, one idea each.
- Comment only what the code cannot say: why a choice was made, a constraint, or a gotcha. Never restate a name or type.
- Use `/* ... */` for comments above a function, type or export, and for any comment longer than one line. Use `//` for one-line comments inside a function.
- Never hand-edit generated files, such as `package-lock.json`, `next-env.d.ts` or the Next.js block in an experiment's AGENTS.md.

## Working

- Weigh quality, simplicity and long-term maintainability above the time a change takes.
- Before fixing a bug, reproduce it the way a user would hit it.
- Keep `npm run lint`, `npm run typecheck` and `npm test` passing from the root. Fix failures and flaky tests you find, even ones you did not cause.
- Check UI changes in a real browser at desktop and phone widths, in light and dark mode. Fix anything that looks off.
