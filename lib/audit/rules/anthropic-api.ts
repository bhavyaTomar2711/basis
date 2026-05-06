import { formatUsd } from "../helpers";
import type { AuditInput, ToolEntry, ToolFinding } from "../types";

/**
 * Anthropic API direct.
 *
 * Spend > $500/mo on retail API → flag credits / volume route.
 * Spend > $1500/mo → high-confidence flag.
 */
export function auditAnthropicApi(
  entry: ToolEntry,
  _input: AuditInput,
): ToolFinding {
  const current = entry.monthlySpendUsd;

  if (current >= 1500) {
    const savings = current * 0.2;
    return {
      tool: "anthropic_api",
      currentPlan: entry.plan,
      currentMonthlyUsd: current,
      seats: entry.seats,
      recommendedAction: "use_credits",
      monthlySavingsUsd: Math.round(savings),
      reason: `At ${formatUsd(current)}/mo on retail Anthropic, discounted credits typically save 15–25%.`,
      math: `Retail Anthropic API at ${formatUsd(current)}/mo. Discounted credits (e.g. via Credex) at ~20% off list = ${formatUsd(current * 0.8)}/mo. Delta: ~${formatUsd(savings)}/mo.`,
      sourceRefs: [4],
      confidence: "high",
    };
  }

  if (current >= 500) {
    const savings = current * 0.15;
    return {
      tool: "anthropic_api",
      currentPlan: entry.plan,
      currentMonthlyUsd: current,
      seats: entry.seats,
      recommendedAction: "use_credits",
      monthlySavingsUsd: Math.round(savings),
      reason: `Retail token billing above $500/mo is the threshold where credit-purchase routes start paying off.`,
      math: `Retail Anthropic API at ${formatUsd(current)}/mo. Credit-route savings typically 15% at this tier = ${formatUsd(current * 0.85)}/mo. Delta: ~${formatUsd(savings)}/mo.`,
      sourceRefs: [4],
      confidence: "medium",
    };
  }

  return {
    tool: "anthropic_api",
    currentPlan: entry.plan,
    currentMonthlyUsd: current,
    seats: entry.seats,
    recommendedAction: "keep",
    monthlySavingsUsd: 0,
    reason: `Below $500/mo, retail Anthropic API pricing is fine. The savings from credit-purchase routes don't outweigh the operational overhead.`,
    math: `Retail spend ${formatUsd(current)}/mo. Standard rates: Sonnet 4.6 $3/$15 per MTok, Opus 4.7 $5/$25, Haiku 4.5 $1/$5.`,
    sourceRefs: [4],
    confidence: "high",
  };
}
