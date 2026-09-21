# expense-tracker

Type one line per expense, such as "Uber to the airport $34", and it gets tagged and added to a running total.
The point is the cost panel: five questions per reading instead of flight-search's 43, which makes each reading roughly seven times cheaper.

Run it from the repo root with `npm run dev:expense-tracker`, then open http://localhost:3001.

## How it uses Jev

Each time you pause typing, the line goes to Jev in one call with five questions.

| Question type | Used for |
| --- | --- |
| Choice | Category (ten of them) and whether the spending is for work or personal |
| Noul | Is it a repeating charge, and could it be claimed back |
| Score | Is it a necessity or a treat |

Readings land in the same three bands as flight-search.
A sure reading becomes a filled yellow chip and is saved with the entry.
A guess becomes a dashed chip with a question mark, and applies only when you click it.
Anything below that is ignored.
Every yes-or-no question spells out what counts as no, so a tag the line never mentions stays off.

Jev is never asked about money.
`src/lib/amount.ts` reads the amount out of the text, and `totalsFor` in `src/lib/expense.ts` adds the totals up.
Entries are saved in the browser, so the list survives a refresh and never leaves the machine.

## Code map

| File | Job |
| --- | --- |
| `src/lib/questions.ts` | The five questions sent to Jev |
| `src/lib/read-expense.ts` | Turns answers into sure or guessed tags |
| `src/lib/tag-state.ts` | Combines tags with your clicks into what gets saved |
| `src/lib/amount.ts` | Reads the amount out of the text |
| `src/lib/expense.ts` | Categories, the saved shape, and the totals |
| `src/app/api/tag/route.ts` | The only route that calls Jev |
| `src/components/use-expenses.ts` | The saved list, kept in browser storage |

The cost panel, the confidence bands and the reading hook come from `@jev/kit`, shared with the other experiments.

## Scripts

- `npm run dev` starts the dev server on port 3001.
- `npm run build` creates a production build.
- `npm run lint` runs ESLint.
- `npm run typecheck` generates the Next.js route types, then runs the TypeScript compiler.
- `npm test` runs the unit tests.
