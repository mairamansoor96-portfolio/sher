# Sher — guide for Claude sessions

**Read `SPEC.md` first, every session.** It is the full spec and the source of
truth. Follow its content, copyright, typography and accessibility rules exactly.
If a request conflicts with the spec, point out the conflict before acting. If the
spec needs to change, update `SPEC.md` in the same change.

@AGENTS.md

## What Sher is

One classical Urdu couplet a day, the same for everyone, made understandable in
layers (Nastaliq → Roman Urdu → word glosses → plain meaning → "why it lands")
and shareable as a poster. Principles: one a day (no feed), understanding on
demand (the poem is the hero), real sourced poetry, craft over decoration, and no
accounts and no backend.

## Stack and layout

- Next.js (App Router), TypeScript, Tailwind v4, **static export** (`output: "export"`, built to `out/`). No server code, route handlers or runtime APIs.
- `app/tokens.css`: the **only** place for colours, type sizes, spacing and radii. Use token utilities (`text-ink`, `text-couplet`, `leading-nastaliq`, `px-gutter`…), never raw values in components.
- `lib/types.ts`: the content model, copied from SPEC.md.
- `lib/content.ts`: loads `data/*.json` at build time, validates them (the build fails on bad content) and filters out drafts in production. Import it only from Server Components.
- `lib/config.ts`: `TIME_ZONE` (Asia/Karachi) and `LAUNCH_DATE`. **Never change `LAUNCH_DATE` after launch.**
- `lib/today.ts`: pure date and schedule logic, tested in `lib/today.test.ts`.
- `components/TodaySher.tsx`: works out today's couplet **in the browser**, because the static HTML is built once and visited every day.

Commands: `npm run dev`, `npm run build`, `npm run lint`, `npm test`, `npx tsc --noEmit`.

## Content rules (from SPEC.md)

- All content lives in `data/shers.json`, `data/poets.json` and `data/schedule.json`.
- Production shows only `status: "verified"` couplets; drafts show only in development. With nothing verified, Today shows a friendly empty state.
- Today's sher is `schedule[daysSinceLaunch % schedule.length]`. The day changes at midnight Asia/Karachi. **Only append to the schedule**, so past days never change.
- `glossary[].word` must match text in `lines` exactly.
- `attribution: "disputed"` always shows its `attributionNote`. Never hide a dispute.
- Every couplet shows its source. A couplet is checked against a printed edition before it is marked verified.

## Copyright rules

- Use public-domain poets only: Ghalib, Mir Taqi Mir, Dagh Dehlvi, Bahadur Shah Zafar, Altaf Hussain Hali, Akbar Allahabadi, Wali Mohammad Wali, Mir Anees and Naji Shakir. Iqbal is allowed only for couplets published before 1929, with the collection named.
- Never include modern poets under copyright (e.g. Faiz, Faraz, Jaun Elia, Parveen Shakir).
- Write transliterations, meanings, glosses and notes in our own words. Never copy them from Rekhta or published translations.
- The About page credits Rekhta and lists the editions used.

## Typography rules

- Poetry and Urdu UI use Noto Nastaliq Urdu. English UI uses Atkinson Hyperlegible (provisional).
- Couplets are 34px on Today and 26px in lists (rem tokens), with **line height ≥ 2.2**, generous vertical padding, and **no `overflow: hidden`** on couplet containers.
- **Balancing rule** (milestone 2): set both misras to the width of the wider one by widening word spaces only (`text-align: justify` plus `text-align-last: justify`). **Never use `letter-spacing` on Urdu.** If the wider line doesn't fit, shrink both lines together. If the shorter line would need more than ~40% extra space, leave it natural and centred.
- Roman lines sit under their Urdu line, left-aligned to the same width, smaller, and never stretched.
- Posters follow the same rule, wait for `document.fonts.load()` and measure real glyph bounds.

## Accessibility rules

- Every Urdu element has `lang="ur"` and `dir="rtl"`. Roman lines have `lang="ur-Latn"`.
- Screen-reader order: Urdu lines, then Roman (if on), then meaning (if on). Decorative elements are `aria-hidden`.
- Layer controls are real toggle buttons with `aria-pressed`. The word sheet is a labelled dialog that returns focus to the word.
- Meet WCAG AA contrast, use touch targets of at least 48px, and keep the layout working at 200% text size. Couplet size scales with the user's text size.
- Respect reduced motion.
- Privacy: no accounts, no backend, no tracking analytics. Store the bayaz and preferences in `localStorage`, always wrapped in try/catch.

## Milestones

See the "Build milestones" table in SPEC.md. **Done:** milestone 1 (scaffold, tokens, types, data loading, schedule logic, basic Today page), milestone 2 (`components/Couplet.tsx` balancing, with the maths in `lib/balance.ts`) and milestone 3 (`components/SherView.tsx` layers, `components/GlossSheet.tsx`, layer state in `lib/layers.ts`, word matching in `lib/gloss.ts`).
