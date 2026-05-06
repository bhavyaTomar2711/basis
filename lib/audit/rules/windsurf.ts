import { getPlan } from "@/lib/pricing/data";
import { formatUsd } from "../helpers";
import type { AuditInput, ToolEntry, ToolFinding } from "../types";

/**
 * Windsurf rules.
 *
 *  - Teams ($40/seat) on ≤3 seats → Pro ($20) per seat.
 *  - Max ($200) when use case isn't coding-heavy → Pro ($20).
 */
export function auditWindsurf(
  entry: ToolEntry,
  input: AuditInput,
): ToolFinding {
  const { plan } = getPlan("windsurf", entry.plan);
  const current = entry.monthlySpendUsd;
  const seats = entry.seats;

  if (plan.id === "teams" && seats <= 3) {
    const recommended = 20 * seats;
    const savings = current - recommended;
    return {
      tool: "windsurf",
      currentPlan: plan.id,
      currentMonthlyUsd: current,
      seats,
      recommendedAction: "downgrade",
      recommendedTo: {
        tool: "windsurf",
        plan: "pro",
        estimatedMonthlyUsd: recommended,
      },
      monthlySavingsUsd: Math.max(0, savings),
      reason: `Windsurf Teams unlocks Cascade + RBAC + admin dashboard. With ${seats} seats, Pro is usually enough.`,
      math: `Windsurf Teams at $40/seat × ${seats} = ${formatUsd(40 * seats)}/mo. Windsurf Pro at $20/seat × ${seats} = ${formatUsd(recommended)}/mo. Delta: ${formatUsd(savings)}/mo.`,
      sourceRefs: [9],
      confidence: "high",
    };
  }

  if (plan.id === "max" && input.useCase !== "coding") {
    const savings = current - 20;
    return {
      tool: "windsurf",
      currentPlan: plan.id,
      currentMonthlyUsd: current,
      seats,
      recommendedAction: "downgrade",
      recommendedTo: { tool: "windsurf", plan: "pro", estimatedMonthlyUsd: 20 },
      monthlySavingsUsd: Math.max(0, savings),
      reason: `Max is sized for sustained heavy agent usage. Non-coding workflows rarely justify the 10× price.`,
      math: `Windsurf Max at $200/mo. Windsurf Pro at $20/mo (unlimited extra usage at API price, all premium models). Delta: ${formatUsd(savings)}/mo.`,
      sourceRefs: [9],
      confidence: "medium",
    };
  }

  return {
    tool: "windsurf",
    currentPlan: plan.id,
    currentMonthlyUsd: current,
    seats,
    recommendedAction: "keep",
    monthlySavingsUsd: 0,
    reason: `Windsurf ${plan.name} fits your team and use case.`,
    math: `${plan.name} at ${formatUsd(current)}/mo. No cheaper Windsurf tier matches.`,
    sourceRefs: [9],
    confidence: "high",
  };
}
