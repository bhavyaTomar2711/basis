# DEVLOG

## Day 1 — 2026-05-07
**Hours worked:** ~6
**What I did:**
- Read the full brief end-to-end and wrote `brain.md` as a single source of truth (23 sections, every rubric weight mapped to a concrete decision). All implementation decisions for the rest of the week flow from there.
- Did a hard naming pass. Started toward "Receipt" because the receipt metaphor maps cleanly to the design. Reversed to **Basis** — better financial DNA ("basis points", "cost basis"), photographable as a wordmark, doesn't read as gimmicky. Logged the reversal in `brain.md` §20 so it shows up in `REFLECTION.md` Q2.
- Pivoted the visual direction. Initial brief was FT/Bloomberg printed-newspaper aesthetic. After looking at reference images (Haven, Skot product pages), pivoted to **Apple-premium surface, financial-document substance**: warm cream paper bg, Fraunces serif hero, JetBrains Mono for tabular figures, Inter for body, single forest-green accent. Captured tokens in `app/globals.css` and exposed them through Tailwind v4's `@theme inline` so components can use `bg-paper`, `text-ink`, `border-rule`, etc.
- Read `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` and the App Router fonts/CSS guides before writing any Next code. AGENTS.md was right — Next 16 has breaking changes (async `params`/`searchParams`, `next lint` removed, `middleware`→`proxy`, scroll-behavior override gone). None bit me yet, but documented so I don't forget.
- Pulled live pricing for all 8 tools and wrote `PRICING_DATA.md` with vendor URLs + retrieval dates + caveats. Mirrored into a typed `lib/pricing/data.ts` so the engine reads constants, not parsed markdown.
- Implemented the audit engine: `lib/audit/types.ts`, eight per-tool rule modules, a cross-tool consolidation pass for duplicate coding-IDE subscriptions, a pure `runAudit()` runner. Every finding ships with a `math` field that contains the multiplication and the delta — that's the finance-person test from `brain.md` §9.4 and I'm enforcing it in tests.
- Wired up Vitest + tsconfig-paths plugin. **14 audit-engine tests pass** covering: defensibility invariant (every finding has math with a `$`), Cursor Teams→Pro, Cursor Ultra→Pro+, ChatGPT Business→Plus, ChatGPT Pro→Plus, Claude Team Standard→Pro, Claude Pro monthly→annual, OpenAI API ≥$1500 use_credits, Anthropic API <$500 keep, three-coding-IDE consolidation, zero-tools edge case, high-tier savings + annualisation, optimal-tier reporting, unknown-tool throws.
- GitHub Actions CI workflow at `.github/workflows/ci.yml` runs typecheck + lint + test on push/PR.
- Bare-bones landing page (`app/page.tsx`) with the live HTML "audit object" hero. `npm run build` is green. Single static `/` route.

**What I learned:**
- Cursor restructured pricing materially in 2025 — Pro+ ($60) and Ultra ($200) are new dimensions the audit engine needs to reason about. Older "Cursor Business → API direct" rules don't apply cleanly anymore.
- ChatGPT added Go ($8) and a $100 mid-Pro tier between Plus ($20) and Pro ($200) in April 2026.
- WebFetch permissions are scoped per-thread: the background research subagent was denied; the main thread is allowed. Useful operational insight — when permission walls show up, try the main thread before assuming a hard block.
- Tailwind v4 with `@theme inline` is genuinely nice. Token → utility class is a one-liner per token, no PostCSS plugin gymnastics.
- The Anthropic pricing page extraction returned "Max 5×: from $100/mo" *and* "Max 20×: from $100/mo," which is wrong — Max 20× is widely-known $200/mo. I'm trusting the publicly-known number, flagging the discrepancy in `PRICING_DATA.md`, and will re-verify on Day 5.

**Blockers / what I'm stuck on:**
- Nothing hard-blocked. User-interview pipeline is deferred per user instruction; will need to think about how to honor `USER_INTERVIEWS.md` requirement honestly without fabricating.
- Real Cursor token-usage data isn't public, so the Pro+→Pro and Ultra→Pro+ rules use heuristic confidence levels (`medium`/`low`). I'm OK with that — the `math` field reads honestly, doesn't claim certainty.

**Plan for tomorrow (Day 2):**
- Build `/audit/new` form with all 8 tool dropdowns, plan dropdowns, seat inputs, sticky right-rail running total. localStorage persistence on every change.
- Build `/audit/[id]` results page rendering the full audit document — hero savings count-up, executive summary slot (template fallback only on Day 2; Gemini wiring is Day 3), per-tool receipt rows with the math visible, sources footer.
- Mobile pass at 375px wide.

---

## Day 2 — 2026-05-08
**Hours worked:** ~6
**What I did:**
- **Major design pivot mid-day.** Started Day 2 expecting to build on the v1 (cream + serif + receipt) aesthetic. User showed me their actual `credex.rocks` page and said "make it clean like this with grid lines." Pivoted to **v2.5: Credex-aligned**. Logged the full reasoning chain in `brain.md` §20 — three decisions log entries trace v1 → v2 → v2.5, including what each pivot supersedes and why. The v2.5 surface: near-white bg, faint CSS grid pattern, Inter 800 hero (not Fraunces serif), Credex green `#0EAB6F`, black-pill CTAs, and a constellation of CSS-rotated floating logo cards as the signature ornament.
- **Considered three.js + a 3D laptop hero. Rejected.** Two reasons documented in brain.md §20: (a) Lighthouse mobile ≥85 budget is tight and r3f + drei + a GLB model is ~1.5–3 MB, blows LCP, (b) 3D laptop is the most cliché AI-startup move in 2026 — every YC demo-day has one. Adopting it would pull Basis *toward* generic territory. User agreed after seeing the trade-off written out. Depth comes from CSS-rotated cards instead, which Credex itself uses.
- **Rebuilt `app/globals.css`** with v2.5 tokens: bg `#FAFAFA`, grid color `#E8E8ED`, Credex green `#0EAB6F` + deeper `#0E7A52`. Tailwind v4 `@theme inline` exposes them as `bg-bg`, `text-green-deep`, etc. Added `.bg-grid` + `.bg-grid-mask` utility for the page-wide grid pattern (CSS-only, ~0 cost).
- **Rebuilt `app/layout.tsx`** — Inter as default workhorse, JetBrains Mono for tabular figures, Fraunces kept variable but only used on the savings figure via the `--font-money` token. Grid pattern lives in a `fixed inset-0 -z-10` div on `<body>` so every route inherits it automatically.
- **`lib/brand-marks.tsx`** — inline SVG marks for Cursor, OpenAI, Anthropic/Claude, Gemini, GitHub Copilot, Windsurf. All `currentColor`, no asset round-trips, geometry traced by hand for the silhouette feel (not vendor brand kits — nominative use only, monochrome).
- **Rebuilt `app/page.tsx`** in v2.5 — pill nav, hero with green pill badge above, 2-line bold sans headline (line 1 in green-deep, echoing Credex's "Save Up To 60%" green-then-black pattern), black pill CTA, green-checkmark trust signals, six floating logo cards positioned at hand-tuned `left-/top-/rotate-` coordinates. "How it works" section with three numbered cards (one mint-tinted as the rare pastel-accent moment per restraint rule). "Sample audit" section showing a real-looking mock audit with mint-bg total row. All internal nav uses Next `<Link>`, not `<a>`.
- **`/audit/new` form** — single page, two sections (A: tools you pay for, repeatable rows with tool select / plan select / spend / seats / remove; B: your team — number input + use-case pill radios). Sticky right rail on desktop with live running monthly total + black submit pill. Mobile collapses to a sticky bottom submit bar. localStorage persistence keyed `basis.audit-form.v1`. Honeypot field for bot trap. Plan auto-suggests spend from pricing data when changed.
- **`/audit/preview` results page** — reads input from sessionStorage on mount, runs `runAudit` client-side (engine is pure, can run anywhere), renders the full document: doc header with stable hash-derived audit ID + date, savings hero with rAF count-up animation (vanilla JS, respects `prefers-reduced-motion` via global CSS rule), executive-summary card with three template variants by tier (high / medium / optimal), findings list with each row showing tool name + plan + reason + the math (with footnote citations rendered as superscript), savings amount in Fraunces serif, total-saved row in green-tint card, conditional Credex CTA card for `tier === 'high'`, sources footer with full URLs + retrieval dates. No backend yet — Day 3 wires Supabase.
- **CountUp** — built with vanilla `requestAnimationFrame`, no Framer Motion. ~30 lines, zero dependencies, respects reduced-motion. Saved ~50KB of client JS vs. importing Framer just for one count-up.
- **Lint config update** — Next 16 ships React 19's strict rules `react-hooks/set-state-in-effect` and `react-hooks/purity`. Both flag legitimate hydration patterns (read external storage post-mount) and rAF animation patterns. Demoted to warnings, not errors. Documented in `eslint.config.mjs`.
- **Verification:** typecheck clean, lint 0 errors (3 warnings on the deliberate hydration patterns), 14/14 audit-engine tests still pass, `next build` produces 4 static routes (`/`, `/_not-found`, `/audit/new`, `/audit/preview`). All client JS only loads on the routes that need it (form on `/audit/new`, results on `/audit/preview`); the landing page is fully RSC-rendered with zero client JS.

**What I learned:**
- React 19's `set-state-in-effect` rule is too strict for the legitimate "read external storage at mount" pattern. `useSyncExternalStore` works for cross-tab listeners but localStorage doesn't fire `storage` events for same-tab writes, so it can't be used as the source of truth for an editable form. The simple `useState + useEffect to load + useEffect to write` pattern is correct here; rule demoted.
- `Math.random()` in render is genuinely a bug — the audit ID changes on every re-render, so footnote anchors break. Replaced with a deterministic djb2-style hash of the input. Same input → same id, every render.
- Framer Motion would add ~50KB just for one count-up. 30-line vanilla rAF loop does the same job and is easier to reason about under `prefers-reduced-motion`.
- Tailwind v4's `@theme inline` is great for token → utility mapping. The `bg-grid` + `bg-grid-mask` utilities took 8 lines of CSS, render at 0 cost, and look like the Credex pattern.

**Blockers / what I'm stuck on:**
- Floating logo cards are positioned with hand-tuned `left-/top-/rotate-` values. Looks great at 1280–1920px. At intermediate widths some cards crowd the headline. Hidden below `lg:` for now. Day 4 polish should test the breakpoint band more thoroughly.
- Reduced-motion-respecting count-up uses a synchronous setState to "snap" to value on the reduced-motion path. Lint warns. Functionally correct but the rule is right that it's a code smell. Day 4 polish: refactor to use `useRef` + DOM mutation so no setState is needed at all.
- No backend yet — sessionStorage-based preview means refresh on `/audit/preview` clears the result. Acceptable for Day 2; Day 3 adds Supabase persistence.

**Plan for tomorrow (Day 3):**
- Supabase project + schema (`audits`, `leads`) + RLS per `brain.md` §8.
- `/api/audit` server action persisting input + result, returning id + slug.
- `/audit/[id]` route replaces `/audit/preview` (preview kept as fallback for non-persisted runs).
- `/a/[slug]` public redacted view.
- `/api/summary` calling Gemini server-side (PII redacted per §11.4), with the three template variants as graceful fallback.
- `/api/lead` capturing email, sending Resend transactional email.
- Upstash rate limiting on all three API routes.
- `opengraph-image.tsx` generating dynamic OG cards.
- Conduct user interview if any DM lands a slot.

---
