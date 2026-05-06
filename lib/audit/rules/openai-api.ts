import { formatUsd } from "../helpers";
import type { AuditInput, ToolEntry, ToolFinding } from "../types";

/**
 * OpenAI API direct.
 *
 *  - Spend > $500/mo → flag credit-purchase route.
 *  - Always flag the gpt-5.4 → gpt-5.4-mini swap as a possible cost lever
 *    when spend is meaningful.
 */
export function auditOpenaiApi(
  entry: ToolEntry,
  _input: AuditInput,
): ToolFinding {
  const current = entry.monthlySpendUsd;

  if (current >= 1500) {
    const savings = current * 0.2;
    return {
      tool: "openai_api",
      currentPlan: entry.plan,
      currentMonthlyUsd: current,
      seats: entry.seats,
      recommendedAction: "use_credits",
      monthlySavingsUsd: Math.round(savings),
      reason: `At ${formatUsd(current)}/mo on retail OpenAI, discounted credits typically save 15–25%.`,
      math: `Retail OpenAI API at ${formatUsd(current)}/mo. Discounted credits at ~20% off list = ${formatUsd(current * 0.8)}/mo. Delta: ~${formatUsd(savings)}/mo. Also worth evaluating: shifting bulk traffic from gpt-5.4 ($2.50/$15) to gpt-5.4-mini ($0.75/$4.50) for non-frontier tasks.`,
      sourceRefs: [6],
      confidence: "high",
    };
  }

  if (current >= 500) {
    const savings = current * 0.15;
    return {
      tool: "openai_api",
      currentPlan: entry.plan,
      currentMonthlyUsd: current,
      seats: entry.seats,
      recommendedAction: "use_credits",
      monthlySavingsUsd: Math.round(savings),
      reason: `Above $500/mo, credit-purchase routes start paying off. Mini-model routing for non-frontier tasks usually adds another 30–50% on top.`,
      math: `Retail OpenAI API at ${formatUsd(current)}/mo. Credit savings ~15% at this tier = ${formatUsd(current * 0.85)}/mo. Delta: ~${formatUsd(savings)}/mo.`,
      sourceRefs: [6],
      confidence: "medium",
    };
  }

  return {
    tool: "openai_api",
    currentPlan: entry.plan,
    currentMonthlyUsd: current,
    seats: entry.seats,
    recommendedAction: "keep",
    monthlySavingsUsd: 0,
    reason: `Below $500/mo, retail OpenAI API pricing is fine. Look at routing non-frontier traffic to gpt-5.4-mini before chasing credit deals.`,
    math: `Retail spend ${formatUsd(current)}/mo. Standard rates: gpt-5.4 $2.50/$15 per MTok, gpt-5.4-mini $0.75/$4.50, gpt-5.4-nano $0.20/$1.25.`,
    sourceRefs: [6],
    confidence: "high",
  };
}
