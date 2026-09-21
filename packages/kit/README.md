# @jev/kit

The pieces every experiment shares, so each one only holds what makes it different.

| File | What it gives |
| --- | --- |
| `src/theme.css` | The shared look: an airport wayfinding palette, in light and dark. Each app sets `--app-font`. |
| `src/readings.ts` | The sure and guess bands, and the helpers that turn Jev answers into readings. |
| `src/use-jev-reading.ts` | Sends text to an experiment's API route as it is typed, and records what each reading cost. |
| `src/usage-panel.tsx` | The cost, tokens and speed panel, as a sidebar on wide screens and a top bar on narrow ones. |
| `src/pricing.ts` | Jev list prices. Update this when TypeSafe ships a new model version. |
| `src/usage.ts`, `src/format.ts`, `src/today.ts` | Visit totals, money and count formatting, and today's date. |

The package ships TypeScript source rather than a build, so each app lists it in `transpilePackages` in `next.config.ts`
and points Tailwind at it with `@source` in `globals.css`.
