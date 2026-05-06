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
