# TESTS.md

Every test in this codebase, what it covers, and how to run it.

---

## How to run

```bash
# All tests (Vitest)
pnpm test

# Watch mode
pnpm test --watch

# Coverage (if needed)
pnpm test --coverage
```

All 24 tests run in under 2 seconds with no network access, no database, and no environment variables.

---

## Test files

### `lib/audit/__tests__/engine.test.ts` — 14 tests

Unit tests for the pure-function audit engine. These cover every major rule module and the cross-tool consolidation pass. The engine never touches I/O, so tests run with zero mocks and zero setup.

| Test | What it covers |
|---|---|
| **Defensibility invariant** | Every finding across a multi-tool input has a `math` string longer than 20 chars containing `$`. This is the finance-person test from brain.md §9.4 — it can't be silently broken. |
| **Cursor Teams → Pro (2 seats)** | Cursor Teams at $40/seat should recommend Pro at $20/seat for ≤ 3 seats in coding. Verifies savings = $40, action = `downgrade`, confidence = `high`. |
| **Cursor Ultra → Pro+ (solo non-coding)** | Ultra at $200 for a solo writing user should recommend Pro+ at $60. Verifies savings = $140, action = `downgrade`. |
| **ChatGPT Business → Plus (2 users)** | Business at $25/seat × 2 should recommend Plus × 2 for teams ≤ 5. Verifies savings = $10, action = `downgrade`. |
| **ChatGPT Pro → Plus (non-research)** | Pro at $200 for coding use should recommend Plus ($20). Savings = $180. |
| **Claude Team Standard → Pro (1 seat)** | Team Standard ($25) for a solo user should recommend Pro ($20). Savings = $5. |
| **Claude Pro monthly → annual** | Monthly Pro ($20) should flag the $17 annual rate as a saving. Verifies savings = $3, reason contains "annual". |
| **OpenAI API ≥ $1500 → use_credits** | API spend at $2000 should recommend credit purchase via Credex. Action = `use_credits`, confidence = `high`. |
| **Anthropic API < $500 → keep** | $200 API spend should stay on retail (no switch needed). Action = `keep`, savings = $0. |
| **Triple coding-IDE consolidation** | Cursor Pro + Copilot Pro + Windsurf Pro for 2 people should flag the cheapest (Copilot at $10) as redundant. Action = `consolidate`. |
| **Zero tools** | Empty tools array returns zero savings, zero findings, tier = `optimal` without throwing. |
| **High-tier annualisation** | A stack with ≥ $500/mo of savings should report tier = `high` and annualSavings = round(monthly × 12 × 100) / 100. |
| **Optimal stack** | Cursor Pro + low Anthropic API spend should return tier = `optimal` with < $100 total monthly savings. |
| **Unknown tool throws** | Passing a non-existent tool id should throw an error (not silently return). |

---

### `lib/audit/__tests__/benchmarks.test.ts` — 10 tests

Unit tests for `computeBenchmark()` — the pure function that places a team's per-seat spend inside a peer-range band.

| Test | What it covers |
|---|---|
| **Null for non-coding use cases** | `writing`, `research`, `data` all return `null`. The benchmark band only renders for coding-heavy stacks where the cited per-seat data applies. |
| **Null for zero seats** | A tool entry with 0 seats returns `null` (division-by-zero guard). |
| **Null for zero spend** | Total monthly spend of $0 returns `null` (a no-spend edge case the form can't produce, but worth covering defensively). |
| **Early-stage band for 5-person team** | `teamSize: 5` should select the `early` band (1–10). At $400 spend / 5 seats = $80/seat = exactly the early median → position = `in_range`. |
| **Enterprise band for 500-person team** | `teamSize: 500` selects the `enterprise` band (201+). |
| **Above classification** | Growth band max is $140/seat. $200/seat → position = `above`, pctVsMedian > 0. |
| **Below classification** | Growth band min is $70/seat. $20/seat → position = `below`, pctVsMedian < 0. |
| **Source refs** | Every result surfaces `[10, 11]` — the Ramp 2025 and a16z 2025 citations. |
| **pctVsMedian arithmetic** | Growth median is $105/seat. At exactly $105/seat → pctVsMedian = 0. |
| **Mixed use case is included** | `useCase: "mixed"` returns a result (not null). Only non-coding useCases are excluded. |

---

## What's not tested

**API routes (`/api/audit`, `/api/summary`, `/api/lead`):** These require a live Supabase instance and real env vars. Not worth the setup cost for a v1 submission; the audit engine they call is fully covered by the unit tests above.

**UI components:** Manual smoke test on the deployed preview after each major change. No Playwright smoke test was shipped for v1 — the brief's one Playwright test was deferred to a stretch task.

**OG image generation:** `next/og` ImageResponse is tested by rendering the image route in a browser and inspecting the output. No automated snapshot test.

---

## CI

GitHub Actions runs the full test suite on every push to main:

```yaml
# .github/workflows/ci.yml
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
```

All four steps must be green before merging. The workflow file is at [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
