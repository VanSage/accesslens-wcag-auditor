<div align="center">
  
# AccessLens

</div>

**See what your users can't.**
  
A one-click WCAG accessibility auditor. Paste any HTML and get real
`axe-core` findings — grouped by severity, explained plainly, scored 0–100 —
plus draft alt text for images missing it. No login. No API key required.

Built for the ChatGPT Codex India Hackathon 2026, Track 8 — AI for Societal
Good.

---

## Why this exists

Roughly 9 in 10 websites fail basic accessibility checks today, and every
failure is a door closed to someone: a screen-reader user who hits an
unlabeled form field, a low-vision user who can't read grey-on-white text, a
keyboard-only user who can't reach a `<div onclick>` "button." Most teams
don't skip accessibility out of malice — they skip it because finding the
problems is tedious and fixing them feels vague. AccessLens collapses both
steps: point it at markup, get a scored, prioritized, plain-English list of
exactly what to fix and why.

## Prerequisites

| Mode | Requirement |
|---|---|
| **Demo / default** | **None.** No login, no API key. `axe-core` runs entirely client-side in your browser. |
| **Live (optional)** | `OPENAI_API_KEY` — only used to enrich alt-text drafts with an LLM. The app is fully functional without it (falls back to a deterministic filename heuristic). |

## Run it locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, click **Load sample page**, click **Run
audit**. You'll see the score chart populate, violations grouped by
severity, and draft alt text for the sample's un-alt'd images — all with no
key.

> `npm install` runs a postinstall step (`scripts/copy-axe.js`) that copies
> `axe-core`'s minified build into `public/axe-core.min.js`. This is how the
> app fetches axe-core same-origin and inlines it into the sandboxed audit
> frame — see **How the audit sandbox works** below.

## Deploy to Vercel (5 minutes)

1. Push this folder to a new GitHub repo.
2. [vercel.com/new](https://vercel.com/new) → import the repo → **Deploy**
   (no environment variables needed for the default demo).
3. Optional: add `OPENAI_API_KEY` in Project Settings → Environment
   Variables to enable AI-enriched alt text.

## Tests

```bash
npm test            # Vitest — scoring + alt-text heuristic, unit-tested
npm run test:e2e    # Playwright — full audit flow against the sample page
```

## How the audit sandbox works

This is the part worth explaining to a judge who asks "how does this
actually work":

1. The pasted/loaded HTML is handed to an `<iframe>` with
   `sandbox="allow-scripts"` — **deliberately without** `allow-same-origin`.
   That gives the frame an opaque origin, so the parent page can *never*
   reach into it via `contentWindow`/`contentDocument`, no matter what the
   pasted markup contains.
2. Because the frame's origin is opaque, `axe-core` can't be loaded via a
   normal `<script src>` — the frame's CSP is
   `default-src 'none'; script-src 'unsafe-inline'`, so it can't fetch
   anything over the network either.
3. Instead, the **parent** page fetches `/axe-core.min.js` (an ordinary,
   same-origin request) once, and inlines that source directly into the
   HTML document handed to the frame via `srcdoc`.
4. Inside the frame, our small runner script calls `axe.run()` and reports
   results back to the parent with `postMessage` — the only channel
   available to an opaque-origin frame, and exactly the right one: it can
   send data out but the parent can't reach in.
5. A 8-second watchdog `setTimeout` guards against pasted markup that hangs
   the frame.

Net effect: arbitrary, untrusted HTML gets a real accessibility audit
without ever executing in a context that can touch the rest of the page.

## Scoring

```
score = 100 − Σ (impact_weight × affected_node_count)   for every violation
critical: 10   serious: 6   moderate: 3   minor: 1
clamped to [0, 100]
```

Defined once in `lib/score.ts`, pinned against hand-computed values in
`tests/score.test.ts` — not an LLM guess.

## Design notes

The visual language borrows from an optometrist's Snellen chart — the
"20/20" eye test — because that's the most literal, honest metaphor for
what this tool does: it shows you what's illegible to someone else. The
score reveal blurs out toward the bottom of the chart as the score drops,
so a bad score *feels* like the thing it's describing. Palette avoids the
usual AI-generated-app defaults (cream + terracotta, or black + neon) in
favor of a cooler "eye-chart paper" white, chart-navy ink, and a restrained
signal palette (sage/amber/red) that doubles as the severity legend.

## Project structure

```
app/
  page.tsx              main flow
  components/           ScoreChart, EditorPanel, ViolationsList, AltTextPanel
  api/alt-text/route.ts optional LLM alt-text enrichment
lib/
  buildAuditDocument.ts sandboxed iframe document builder
  useAudit.ts            orchestrates fetch axe-core -> run -> postMessage
  score.ts                deterministic scoring
  altText.ts              deterministic alt-text heuristic
  report.ts                Markdown report generator
public/sample.html      seeded, deliberately inaccessible demo page
tests/                  Vitest unit tests
tests/e2e/              Playwright smoke test
```

## Make it yours before you submit

Judges check originality — don't submit the demo verbatim. Fast, high-value
changes:

- **Batch-audit multiple pages or a live URL** via a server-side proxy route
  (`app/api/fetch-url/route.ts`) instead of paste-only.
- **A colour-contrast fixer** that suggests an accessible palette instead of
  just flagging the failing pair.
- **A CI mode** — `/api/audit` returning JSON with a pass/fail exit code and
  a configurable severity threshold, for a GitHub Action.
- **Mobile-specific checks** — tap target size, viewport zoom lock, etc.,
  layered on top of axe-core's desktop-oriented ruleset.
- Swap the sample page and copy for a domain you personally care about
  (your college's site, a local NGO, a startup's landing page) — it makes
  the demo story concrete and yours.

## How Codex built this

This repo was scaffolded end-to-end from a single structured prompt
covering: architecture constraints (sandboxed iframe, no `allow-same-origin`,
CSP-locked frame), a deterministic scoring formula pinned by unit tests, a
seeded inaccessible sample page for a reliable demo, and an optional
（never required）LLM enrichment path for alt text. The build proceeded in
milestones — sandbox + axe wiring first, then scoring, then the UI, then
tests — running the dev server and test suite after each milestone.

---

*AccessLens is a triage and drafting aid. It surfaces real `axe-core`
findings but automated tools only catch roughly 30–50% of WCAG issues —
always pair this with manual testing and real assistive technology before
calling a page compliant.*
