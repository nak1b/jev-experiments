/*
 * commit-msg hook that enforces the commit rules in AGENTS.md.
 * The first line must follow Conventional Commits, such as "feat(flight-search): add cabin filter".
 * The message must not contain an em dash or AI attribution.
 */
import { readFileSync } from "node:fs";

const TYPES = ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"];
const HEADER = new RegExp(`^(${TYPES.join("|")})(\\([a-z0-9-]+\\))?!?: \\S`);
const MAX_HEADER_LENGTH = 100;
const AI_ATTRIBUTION = /^co-authored-by:.*(claude|anthropic|openai|copilot|gpt)|generated with .*(claude|chatgpt|copilot)/im;

const message = readFileSync(process.argv[2], "utf8")
  .split("\n")
  .filter((line) => !line.startsWith("#"))
  .join("\n")
  .trim();
const header = message.split("\n")[0];

// Messages that git writes itself, for merges and autosquash, pass as they are.
if (/^(Merge |Revert "|fixup! |squash! |amend! )/.test(header)) process.exit(0);

const problems = [];
if (!HEADER.test(header)) {
  problems.push(`Start with a type, like "feat(flight-search): add cabin filter". Types: ${TYPES.join(", ")}.`);
}
if (header.length > MAX_HEADER_LENGTH) problems.push(`Keep the first line under ${MAX_HEADER_LENGTH} characters.`);
if (message.includes("\u2014")) problems.push("Replace the em dash with a plain dash.");
if (AI_ATTRIBUTION.test(message)) problems.push("Remove the AI attribution line.");

if (problems.length > 0) {
  console.error("Commit message rejected:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
