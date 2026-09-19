# jev-experiments

Small experiments with Jev, each in its own folder.

## Jev and TypeSafe

[TypeSafe](https://typesafe.ai) builds System One models: models that make fast, structured decisions instead of writing text.
Jev is their first one.
You send it some text and a set of typed questions, and it answers each one with probabilities and a confidence.
A Choice picks one option from a list, a Score rates against a scale, and a Noul answers yes or no as a probability.
Jev answers in well under a second, and only input tokens are billed.
Read more in the [TypeSafe docs](https://docs.typesafe.ai/introduction).

## Experiments

None yet. See "Adding an experiment" below.

## Setup

1. Run `npm install` at the root. It installs every experiment and the git hooks.
2. Create your local env file with `cp .env.example .env.local`.
3. Paste your key from the [TypeSafe console](https://console.typesafe.ai/settings/keys) into `.env.local`.
4. Keep the file private with `chmod 600 .env.local`.
5. Start an experiment with the command in its README.

Every experiment reads the key from this one root `.env.local`.
It is gitignored, and a pre-commit hook blocks any commit that contains it.

## Adding an experiment

Create a folder at the root, add it to `workspaces` and add a `dev:<name>` script in the root `package.json`.
Give it a README that explains how it works and how it uses Jev, then add it to the experiments list above.
