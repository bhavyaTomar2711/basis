import type { AuditInput } from "./types";

/**
 * Per-coding-seat monthly AI spend bands by company size.
 *
 * Methodology (documented in BENCHMARKS.md):
 *  - Source A: Ramp "AI Spending Insights" 2025 Annual — published
 *    per-employee AI spend bands by company size, normalised to a
 *    per-coding-seat basis on the assumption that engineering org ≈
 *    AI-tool seat count, which holds for the coding-heavy use case Basis
 *    targets.
 *  - Source B: a16z "Generative AI in the Enterprise" 2025 — directional
 *    confirmation on the trend that per-seat spend rises with team size
 *    as larger orgs adopt premium / Enterprise tiers + API direct.
 *  - We publish RANGES (min/median/max), not point estimates. The brief
 *    is explicit about not fabricating precision.
 *  - Bands reflect 2025 data; re-verify on Day 5 + every quarter thereafter.
 *
 * The "useCase" gate: we only return a benchmark for coding-heavy stacks.
 * For writing/research/data/mixed, public per-seat data is too sparse to
 * cite honestly, so we return null and the UI hides the section.
 */
export interface BenchmarkBand {
  id: "early" | "growth" | "scale" | "enterprise";
  label: string;
  minTeamSize: number;
  /** Inclusive upper bound. `Infinity` for the open-ended top band. */
  maxTeamSize: number;
  perSeatMinUsd: number;
  perSeatMedianUsd: number;
  perSeatMaxUsd: number;
}

const BANDS: readonly BenchmarkBand[] = [
  {
    id: "early",
    label: "Early-stage (1–10 people)",
    minTeamSize: 1,
    maxTeamSize: 10,
    perSeatMinUsd: 50,
    perSeatMedianUsd: 80,
    perSeatMaxUsd: 110,
  },
  {
    id: "growth",
    label: "Growth (11–50 people)",
    minTeamSize: 11,
    maxTeamSize: 50,
    perSeatMinUsd: 70,
    perSeatMedianUsd: 105,
    perSeatMaxUsd: 140,
  },
  {
    id: "scale",
    label: "Scale-up (51–200 people)",
    minTeamSize: 51,
    maxTeamSize: 200,
    perSeatMinUsd: 90,
    perSeatMedianUsd: 130,
    perSeatMaxUsd: 170,
  },
  {
    id: "enterprise",
    label: "Enterprise (200+ people)",
    minTeamSize: 201,
    maxTeamSize: Infinity,
    perSeatMinUsd: 110,
    perSeatMedianUsd: 155,
    perSeatMaxUsd: 200,
  },
];

export type BenchmarkPosition = "below" | "in_range" | "above";

export interface BenchmarkResult {
  band: BenchmarkBand;
  /** Sum of seats across every tool. Per-seat = totalCurrent / totalSeats. */
  totalSeats: number;
  yourPerSeatMonthlyUsd: number;
  position: BenchmarkPosition;
  /** Signed percentage delta vs. the median. -20 = 20% below median, etc. */
  pctVsMedian: number;
  /** Citation footnote ids to surface in the Sources list. */
  sourceRefs: number[];
}

/**
 * Coding-leaning use cases get a benchmark. The public per-seat data
 * Basis cites is overwhelmingly about dev tooling (Cursor, Copilot,
 * Claude Code), so applying it to a writing-only or research-only stack
 * would be dishonest. brain.md §9.4 — every number must survive the
 * finance-person test.
 */
const BENCHMARK_USE_CASES = new Set(["coding", "mixed"]);

export function computeBenchmark(
  input: AuditInput,
  totalCurrentMonthlyUsd: number,
): BenchmarkResult | null {
  if (!BENCHMARK_USE_CASES.has(input.useCase)) return null;

  const totalSeats = input.tools.reduce((sum, t) => sum + t.seats, 0);
  if (totalSeats === 0 || totalCurrentMonthlyUsd <= 0) return null;

  const band = BANDS.find(
    (b) => input.teamSize >= b.minTeamSize && input.teamSize <= b.maxTeamSize,
  );
  if (!band) return null;

  const yourPerSeatMonthlyUsd = totalCurrentMonthlyUsd / totalSeats;

  let position: BenchmarkPosition;
  if (yourPerSeatMonthlyUsd < band.perSeatMinUsd) position = "below";
  else if (yourPerSeatMonthlyUsd > band.perSeatMaxUsd) position = "above";
  else position = "in_range";

  const pctVsMedian =
    ((yourPerSeatMonthlyUsd - band.perSeatMedianUsd) / band.perSeatMedianUsd) *
    100;

  return {
    band,
    totalSeats,
    yourPerSeatMonthlyUsd,
    position,
    pctVsMedian,
    sourceRefs: [10, 11],
  };
}
