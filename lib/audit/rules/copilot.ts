import { getPlan } from "@/lib/pricing/data";
import { formatUsd } from "../helpers";
import type { AuditInput, ToolEntry, ToolFinding } from "../types";

/**
 * GitHub Copilot rules.
 *
 *  - Business ($19/seat) on ≤4 seats coding → consider Individual Pro ($10/seat).
 *  - Pro+ ($39/seat) without coding-heavy use → Pro ($10/seat).
 *  - Enterprise ($39/seat) below 25 seats → likely Business ($19/seat) is enough.
 */
export function auditCopilot(
  entry: ToolEntry,
  input: AuditInput,
): ToolFinding {
  const { plan } = getPlan("copilot", entry.plan);
  const current = entry.monthlySpendUsd;
  const seats = entry.seats;

  if (plan.id === "business" && seats <= 4) {
    const recommended = 10 * seats;
    const savings = current - recommended;
    return {
      tool: "copilot",
      currentPlan: plan.id,
      currentMonthlyUsd: current,
      seats,
      recommendedAction: "downgrade",
      recommendedTo: {
        tool: "copilot",
        plan: "pro",
        estimatedMonthlyUsd: recommended,
      },
      monthlySavingsUsd: Math.max(0, savings),
      reason: `Copilot Business is for orgs that need policy + audit. With ${seats} seats, individual Pro is usually enough.`,
      math: `Copilot Business at $19/seat × ${seats} = ${formatUsd(19 * seats)}/mo. Copilot Pro at $10/seat × ${seats} = ${formatUsd(recommended)}/mo. Delta: ${formatUsd(savings)}/mo.`,
      sourceRefs: [2],
      confidence: "medium",
    };
  }

  if (plan.id === "pro_plus" && input.useCase !== "coding") {
    const savings = current - 10 * seats;
    return {
      tool: "copilot",
      currentPlan: plan.id,
      currentMonthlyUsd: current,
      seats,
      recommendedAction: "downgrade",
      recommendedTo: {
        tool: "copilot",
        plan: "pro",
        estimatedMonthlyUsd: 10 * seats,
      },
      monthlySavingsUsd: Math.max(0, savings),
      reason: `Pro+ unlocks 1,500 premium requests for heavy coding flows. Other workloads rarely use that.`,
      math: `Copilot Pro+ at $39/seat × ${seats} = ${formatUsd(39 * seats)}/mo. Copilot Pro at $10/seat × ${seats} = ${formatUsd(10 * seats)}/mo. Delta: ${formatUsd(savings)}/mo.`,
      sourceRefs: [2],
      confidence: "high",
    };
  }

  if (plan.id === "enterprise" && input.teamSize < 25) {
    const recommended = 19 * seats;
    const savings = current - recommended;
    return {
      tool: "copilot",
      currentPlan: plan.id,
      currentMonthlyUsd: current,
      seats,
      recommendedAction: "downgrade",
      recommendedTo: {
        tool: "copilot",
        plan: "business",
        estimatedMonthlyUsd: recommended,
      },
      monthlySavingsUsd: Math.max(0, savings),
      reason: `Enterprise adds fine-grained policy + SSO — useful at scale. Below ~25 seats, Business is the better fit.`,
      math: `Copilot Enterprise at $39/seat × ${seats} = ${formatUsd(39 * seats)}/mo. Copilot Business at $19/seat × ${seats} = ${formatUsd(recommended)}/mo. Delta: ${formatUsd(savings)}/mo.`,
      sourceRefs: [2],
      confidence: "medium",
    };
  }

  return {
    tool: "copilot",
    currentPlan: plan.id,
    currentMonthlyUsd: current,
    seats,
    recommendedAction: "keep",
    monthlySavingsUsd: 0,
    reason: `Copilot ${plan.name} fits your team size and use case.`,
    math: `${plan.name} at ${formatUsd(current)}/mo for ${seats} seat${seats === 1 ? "" : "s"}. No cheaper Copilot tier matches.`,
    sourceRefs: [2],
    confidence: "high",
  };
}
