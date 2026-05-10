import { TOOLS } from "@/lib/pricing/data";
import type { AuditResult } from "./types";

function fmtUsd(n: number): string {
  const isWhole = Math.abs(n - Math.round(n)) < 0.005;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Math.round(n * 100) / 100);
}

/**
 * Plain-text fallback summary used when Gemini fails / is rate-limited.
 * Used by /api/summary's circuit breaker and by ResultsContent before the
 * client-side AI fetch resolves.
 *
 * brain.md §11.5 — "Each template interpolates real numbers from the audit.
 * They should read as well as the AI version on a tired day."
 */
export function templateSummary(result: AuditResult): string {
  const monthly = fmtUsd(result.totalMonthlySavingsUsd);
  const annual = fmtUsd(result.totalAnnualSavingsUsd);
  const topFinding = result.findings.find((f) => f.monthlySavingsUsd > 0);
  const toolLabel = topFinding ? TOOLS[topFinding.tool].label : null;

  if (result.tier === "high") {
    return (
      `Your stack is leaking ${monthly}/month (${annual} per year). ` +
      `The biggest single lift is on ${toolLabel}: ${topFinding?.reason} ` +
      `The findings below show the math, line by line, with sources.`
    );
  }
  if (result.tier === "optimal") {
    return (
      `You're spending well. We didn't find a meaningful change to recommend ` +
      `across your current stack. The plans you're on are appropriately sized ` +
      `for your usage. We'll keep an eye on pricing changes and can email you ` +
      `if anything shifts.`
    );
  }
  return (
    `There's about ${monthly}/month (${annual}/year) of straightforward ` +
    `savings on your stack. Most of it comes from right-sizing existing ` +
    `plans${topFinding ? ` — starting with ${toolLabel}` : " — see the details below"}.`
  );
}
