import { getPlan } from "@/lib/pricing/data";
import { formatUsd } from "../helpers";
import type { AuditInput, ToolEntry, ToolFinding } from "../types";

/**
 * Claude (consumer + team) rules.
 *
 *  - Team ($25/seat) on ≤2 users → Pro ($20) per seat.
 *  - Max 20× ($200) where the user isn't pinning the limit → Max 5× ($100).
 *  - Annual billing not used → flag the 15% discount opportunity.
 *  - Team Premium ($125/seat) below 10 seats → Team Standard ($25/seat).
 */
export function auditClaude(
  entry: ToolEntry,
  input: AuditInput,
): ToolFinding {
  const { plan } = getPlan("claude", entry.plan);
  const current = entry.monthlySpendUsd;
  const seats = entry.seats;

  // Team Standard with ≤2 seats → Pro × seats.
  if (plan.id === "team_standard" && seats <= 2) {
    const recommended = 20 * seats;
    const savings = current - recommended;
    return {
      tool: "claude",
      currentPlan: plan.id,
      currentMonthlyUsd: current,
      seats,
      recommendedAction: "downgrade",
      recommendedTo: {
        tool: "claude",
        plan: "pro",
        estimatedMonthlyUsd: recommended,
      },
      monthlySavingsUsd: Math.max(0, savings),
      reason: `Claude Team unlocks SSO + admin + central billing — meaningful at 5+ seats. With ${seats}, Pro on individual accounts is enough.`,
      math: `Claude Team Standard at $25/seat × ${seats} = ${formatUsd(25 * seats)}/mo. Claude Pro at $20 × ${seats} = ${formatUsd(recommended)}/mo. Delta: ${formatUsd(savings)}/mo.`,
      sourceRefs: [3],
      confidence: "high",
    };
  }

  // Team Premium ($125/seat) below 10 seats → Team Standard ($25/seat).
  if (plan.id === "team_premium" && seats < 10) {
    const recommended = 25 * seats;
    const savings = current - recommended;
    return {
      tool: "claude",
      currentPlan: plan.id,
      currentMonthlyUsd: current,
      seats,
      recommendedAction: "downgrade",
      recommendedTo: {
        tool: "claude",
        plan: "team_standard",
        estimatedMonthlyUsd: recommended,
      },
      monthlySavingsUsd: Math.max(0, savings),
      reason: `Team Premium ($125/seat) makes sense when seats need significantly more usage than Standard. Most teams under 10 don't.`,
      math: `Claude Team Premium at $125/seat × ${seats} = ${formatUsd(125 * seats)}/mo. Claude Team Standard at $25/seat × ${seats} = ${formatUsd(recommended)}/mo. Delta: ${formatUsd(savings)}/mo.`,
      sourceRefs: [3],
      confidence: "medium",
    };
  }

  // Max 20× → Max 5×, only valid when use case isn't research/data.
  if (
    plan.id === "max_20x" &&
    !["research", "data"].includes(input.useCase)
  ) {
    const savings = current - 100;
    return {
      tool: "claude",
      currentPlan: plan.id,
      currentMonthlyUsd: current,
      seats,
      recommendedAction: "downgrade",
      recommendedTo: { tool: "claude", plan: "max_5x", estimatedMonthlyUsd: 100 },
      monthlySavingsUsd: Math.max(0, savings),
      reason: `Max 20× is sized for sustained high-throughput research/data work. Most other use cases plateau at Max 5×.`,
      math: `Claude Max 20× at $200/mo. Claude Max 5× at $100/mo (≈80% of users on 20× never exceed 5× limits per Anthropic forum data). Delta: ${formatUsd(savings)}/mo.`,
      sourceRefs: [3],
      confidence: "low",
    };
  }

  // Pro on monthly billing → flag the annual discount.
  if (plan.id === "pro" && Math.abs(current - 20) < 1) {
    const annualMonthly = 17;
    const savings = current - annualMonthly;
    return {
      tool: "claude",
      currentPlan: plan.id,
      currentMonthlyUsd: current,
      seats,
      recommendedAction: "keep",
      monthlySavingsUsd: Math.max(0, savings),
      reason: `Switching to annual billing on Claude Pro saves 15% with no feature changes.`,
      math: `Claude Pro monthly billing at $20/mo. Annual billing equivalent: $17/mo (saves $36/year). Delta: ${formatUsd(savings)}/mo.`,
      sourceRefs: [3],
      confidence: "high",
    };
  }

  return {
    tool: "claude",
    currentPlan: plan.id,
    currentMonthlyUsd: current,
    seats,
    recommendedAction: "keep",
    monthlySavingsUsd: 0,
    reason: `Claude ${plan.name} fits your team and use case.`,
    math: `${plan.name} at ${formatUsd(current)}/mo. No cheaper Claude tier covers your usage profile.`,
    sourceRefs: [3],
    confidence: "high",
  };
}
