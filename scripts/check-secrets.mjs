/*
 * Pre-commit guard that stops local secrets from reaching git.
 * It blocks staged env files other than .env.example.
 * It also blocks any added line that contains a secret value from a local env file.
 * Matching the real values catches a key whatever its format.
 * It only ever prints variable names, never values.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const SECRET_NAME = /KEY|SECRET|TOKEN|PASSWORD/i;
const MIN_SECRET_LENGTH = 12;

const isLocalEnvFile = (name) => /^\.env($|\.)/.test(name) && name !== ".env.example";

const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

/* Env files are gitignored, so git lists them as ignored. --directory keeps folders like node_modules to one line. */
function localEnvFiles() {
  return git("ls-files", "--others", "--ignored", "--exclude-standard", "--directory", "-z")
    .split("\0")
    .filter((path) => path && !path.endsWith("/") && isLocalEnvFile(path.split("/").pop()));
}

function readLocalSecrets() {
  const secrets = new Map();
  for (const file of localEnvFiles()) {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || !SECRET_NAME.test(match[1])) continue;
      const value = match[2].replace(/^(['"])(.*)\1$/, "$2");
      if (value.length >= MIN_SECRET_LENGTH) secrets.set(value, `${match[1]} from ${file}`);
    }
  }
  return secrets;
}

const problems = [];

const stagedPaths = git("diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z").split("\0").filter(Boolean);
for (const path of stagedPaths) {
  if (isLocalEnvFile(path.split("/").pop())) problems.push(`${path} is a local env file.`);
}

const secrets = readLocalSecrets();
if (secrets.size > 0) {
  let currentFile = "";
  const diff = git("diff", "--cached", "--no-color", "--no-ext-diff", "-U0");
  for (const line of diff.split("\n")) {
    if (line.startsWith("+++ ")) {
      currentFile = line.replace(/^\+\+\+ (b\/)?/, "");
      continue;
    }
    if (!line.startsWith("+")) continue;
    for (const [value, label] of secrets) {
      if (line.includes(value)) problems.push(`${currentFile} contains the value of ${label}.`);
    }
  }
}

if (problems.length > 0) {
  console.error("Commit blocked to protect your secrets:");
  for (const problem of new Set(problems)) console.error(`  - ${problem}`);
  console.error("Unstage or remove the secret, then commit again.");
  process.exit(1);
}
