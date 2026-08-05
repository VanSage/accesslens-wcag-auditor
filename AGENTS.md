# AGENTS.md

Notes for any coding agent (Codex or otherwise) working in this repo.

## What this project is
    
AccessLens is a one-click WCAG accessibility auditor. Paste HTML → axe-core
runs inside a sandboxed iframe → the app shows grouped violations, a
deterministic 0–100 score, plain-English fixes, and draft alt text for
images missing it. No login, no API key, everything client-side by default.

## Non-negotiable architecture constraints

1. **The audit iframe uses `sandbox="allow-scripts"` and never
   `allow-same-origin`.** Do not add `allow-same-origin` to "simplify" reading
   results — that would give arbitrary pasted markup a same-origin escape
   hatch into the parent page. Results must always come back via
   `postMessage`, handled in `lib/useAudit.ts`.
2. **axe-core is never fetched by the sandboxed frame.** The parent page
   fetches `/axe-core.min.js` (same-origin) and `lib/buildAuditDocument.ts`
   inlines that source text directly into the frame's `srcdoc`. The frame's
   CSP is `default-src 'none'; script-src 'unsafe-inline'` — it cannot make
   network requests of its own.
3. **Scoring is deterministic**, defined once in `lib/score.ts`
   (`IMPACT_WEIGHTS`), and unit-tested against hand-computed values in
   `tests/score.test.ts`. Do not let an LLM compute or adjust the score.
4. **The optional `/api/alt-text` route only rephrases/enriches** —
   `lib/altText.ts`'s deterministic heuristic is always the default and the
   app must work with `OPENAI_API_KEY` unset (the route returns 501 and the
   client silently keeps the heuristic draft).

## Working efficiently in this repo

- Read `lib/types.ts` first — it's the shared vocabulary for axe-core
  results, alt-text suggestions, and audit runs.
- Run `npm install` (triggers `scripts/copy-axe.js` via postinstall) before
  `npm run dev` — without it, `/axe-core.min.js` won't exist in `public/`
  and the audit will fail with a clear error message, not silently.
- `npm test` (Vitest) covers `lib/score.ts` and `lib/altText.ts` — pure
  functions, fast, no browser needed.
- `npm run test:e2e` (Playwright) builds the app, starts it, loads the
  bundled sample page, runs a real audit, and asserts violations render.
- Small, frequent commits: `git commit --author="Codex <codex@openai.com>"`.

## Extending this

- New rule categories: axe-core's ruleset is used as-is; don't hand-roll
  additional WCAG checks unless you also add tests pinning expected output
  on a known-bad fixture (see `public/sample.html`).
- New scoring behavior: change `IMPACT_WEIGHTS` in `lib/score.ts` and update
  the pinned expected values in `tests/score.test.ts` in the same commit.
- Live-URL auditing (fetching an external page to audit) needs a server-side
  proxy — do not attempt to fetch cross-origin URLs directly from the
  browser; that will fail on CORS and was intentionally left out of v1.
