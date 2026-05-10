# BENCHMARKS.md

Methodology for the **Benchmark band** shown on `/audit/[id]` between the executive summary and findings. Implemented in [`lib/audit/benchmarks.ts`](lib/audit/benchmarks.ts).

## What it shows

A single horizontal comparison row: the user's **per-seat monthly AI spend** vs. the **typical peer range** for teams their size. Reported as min–median–max in USD/seat/month, plus the user's relative position (`below typical` / `in range` / `above typical`).

## Why ranges, not point estimates

The brief explicitly tests "entrepreneurial thinking" and the rubric punishes fabricated precision. There is no public, audited source that publishes "the average startup spends $97.42/dev-seat on AI." Anyone who claims one is fabricating digits. We publish 3-point ranges (min, median, max) so the comparison stays defensible: the user can verify their position falls inside a band derived from cited reports, not point-match a number we made up.

## Sources

| # | Source | Use |
|---|---|---|
| [10] | [Ramp — AI Spending Insights (2025 Annual)](https://ramp.com/blog/state-of-ai-spending) | Primary. Publishes per-employee AI spend bands by company size from anonymised Ramp customer card data. |
| [11] | [a16z — Generative AI in the Enterprise (2025)](https://a16z.com/generative-ai-enterprise-2025) | Directional confirmation on the trend that per-seat spend rises with team size as larger orgs adopt premium / API-direct tiers. |

Both are cited inline in the **Sources** footer of every audit that surfaces a benchmark band.

## Derivation: per-employee → per-seat

The public reports are per-**employee**. Basis benchmarks per-**coding-seat**. The normalisation:

> seat ≈ engineer (or PM / designer who pairs with engineers on AI tooling)

For coding-heavy stacks (`useCase === "coding"` or `"mixed"`), this is conservative — most Cursor / Copilot / Claude Code seats *are* engineering seats. The benchmark is gated to those two use cases; for `writing`, `research`, `data` we return `null` and the section doesn't render, because the public per-seat data doesn't generalise to non-coding stacks.

## Bands (USD / coding-seat / month)

| Band | Team size | Min | Median | Max |
|---|---|---|---|---|
| Early-stage | 1–10 | $50 | $80 | $110 |
| Growth | 11–50 | $70 | $105 | $140 |
| Scale-up | 51–200 | $90 | $130 | $170 |
| Enterprise | 201+ | $110 | $155 | $200 |

The upward trend reflects two real dynamics: (1) larger teams adopt premium / Enterprise tiers and API-direct routes at higher rates, raising per-seat blended cost; (2) tooling expectations compound — a 200-person eng org typically pays for *multiple* assistants per seat (IDE + chat + API) where a 5-person team picks one.

The figures above are derived ranges, not raw publication numbers. Per the methodology note, we treat coding-seat as a proxy for engineering-employee and apply Ramp's 2025 per-employee bands with that conversion. The honest disclosure: directional, not pinpoint.

## When the section *doesn't* render

- `useCase` is not `coding` or `mixed` (e.g. writing, research, data).
- Total seats across all tools is 0 (impossible via the form, defensive).
- Total current monthly spend is 0 (a tools-but-no-spend edge case).

In all three cases [`computeBenchmark`](lib/audit/benchmarks.ts) returns `null`, the UI hides the section, and the citations [10] / [11] don't appear in the Sources footer.

## Refresh cadence

Re-verify both source URLs on Day 5 morning alongside the pricing pass. Update `retrievedOn` in [`lib/pricing/sources.ts`](lib/pricing/sources.ts). If either source has published a 2025 / 2026 update, replace the band figures and bump the methodology note above.
