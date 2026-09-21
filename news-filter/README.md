# news-filter

Filter the Hacker News front page with a rule in plain words, such as "Only AI and machine learning".
Posts that do not fit fade out.
The real question is how to ask Jev about many things at once: in one call, or one call per item.

Run it from the repo root with `npm run dev:news-filter`, then open http://localhost:3002.

## How it uses Jev

The rule goes in the state, and every headline gets the same yes-or-no question: "Given the reader's rule, should this post be shown?"
A post shows when Jev's probability is 0.5 or more.

A switch picks how the 30 questions are sent.

- **One call** puts all 30 questions in a single request.
- **One call per post** sends 30 requests with one question each, all at the same time.

Both modes send exactly the same words, built in `src/lib/questions.ts`, so batching is the only difference.
The two cards show the latest cost, tokens and time for each mode, and a line says how many posts the two modes agree on.

## What we measured

For "Only AI and machine learning" on the front page of September 20, 2026:

| Mode | Requests | Cost | Tokens | Time |
| --- | --- | --- | --- | --- |
| One call | 1 | $0.00012 | 3,614 | 373 ms |
| One call per post | 30 | $0.000456 | 11,734 | 474 ms |

Batching was about 3.8 times cheaper and a little faster, and both modes agreed on all 30 posts.
Each separate request pays for its own overhead and a fresh copy of the rule, which is where the extra tokens come from.

## Code map

| File | Job |
| --- | --- |
| `src/lib/hn.ts` | Loads the top 30 stories from Hacker News's public API, cached for five minutes |
| `src/lib/questions.ts` | The question both modes ask |
| `src/lib/filter.ts` | Runs a mode and adds up its cost, tokens and time |
| `src/lib/compare.ts` | The show line and the agreement count |
| `src/app/api/filter/route.ts` | The only route that calls Jev |

The cost panel and the reading hook come from [`@jev/kit`](../packages/kit/README.md), shared with the other experiments.

## Scripts

- `npm run dev` starts the dev server on port 3002.
- `npm run build` creates a production build.
- `npm run lint` runs ESLint.
- `npm run typecheck` generates the Next.js route types, then runs the TypeScript compiler.
- `npm test` runs the unit tests.
