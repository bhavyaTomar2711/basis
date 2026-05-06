import { getPlan } from "@/lib/pricing/data";
import { formatUsd } from "../helpers";
import type { AuditInput, ToolEntry, ToolFinding } from "../types";

/**
 * ChatGPT (consumer + business) rules.
 *
 *  - Business ($25/seat) on ≤2 users → individual Plus ($20).
 *  - Pro ($200) when use case isn't research/data → Plus ($20) usually fits.
 *  - Mid Pro ($100) without specialized reasoning needs → Plus.
 */
export function auditChatgpt(
  entry: ToolEntry,
  input: AuditInput,
): ToolFinding {
  const { plan } = getPlan("chatgpt", entry.plan);
  const current = entry.monthlySpendUsd;
  const seats = entry.seats;

  if (plan.id === "business" && seats <= 2) {
    const recommended = 20 * seats;
    const savings = current - recommended;
    return {
      tool: "chatgpt",
      currentPlan: plan.id,
      currentMonthlyUsd: current,
      seats,
      recommendedAction: "downgrade",
      recommendedTo: {
        tool: "chatgpt",
        plan: "plus",
        estimatedMonthlyUsd: recommended,
      },
      monthlySavingsUsd: Math.max(0, savings),
      reason: `ChatGPT Business adds admin + workspace controls — useful at 5+ seats. With ${seats}, individual Plus is cheaper.`,
      math: `ChatGPT Business at $25/seat × ${seats} = ${formatUsd(25 * seats)}/mo. ChatGPT Plus at $20 × ${seats} = ${formatUsd(recommended)}/mo. Delta: ${formatUsd(savings)}/mo.`,
      sourceRefs: [5],
      confidence: "high",
    };
  }

  if (plan.id === "pro" && !["research", "data"].includes(input.useCase)) {
    const savings = current - 20;
    return {
      tool: "chatgpt",
      currentPlan: plan.id,
      currentMonthlyUsd: current,
      seats,
      recommendedAction: "downgrade",
      recommendedTo: { tool: "chatgpt", plan: "plus", estimatedMonthlyUsd: 20 },
      monthlySavingsUsd: Math.max(0, savings),
      reason: `Pro is sized for sustained advanced-reasoning workloads. Most teams don't hit those limits and Plus covers the same models.`,
      math: `ChatGPT Pro at $200/mo. ChatGPT Plus at $20/mo (same model access, lower message ceiling). Delta: ${formatUsd(savings)}/mo.`,
      sourceRefs: [5],
      confidence: "medium",
    };
  }

  if (plan.id === "pro_mid" && !["research", "data"].includes(input.useCase)) {
    const savings = current - 20;
    return {
      tool: "chatgpt",
      currentPlan: plan.id,
      currentMonthlyUsd: current,
      seats,
      recommendedAction: "downgrade",
      recommendedTo: { tool: "chatgpt", plan: "plus", estimatedMonthlyUsd: 20 },
      monthlySavingsUsd: Math.max(0, savings),
      reason: `The mid Pro tier ($100) bridges Plus → $200 Pro. If you don't need extended reasoning runs, Plus covers your usage.`,
      math: `ChatGPT Pro (mid) at $100/mo. ChatGPT Plus at $20/mo. Delta: ${formatUsd(savings)}/mo.`,
      sourceRefs: [5],
      confidence: "medium",
    };
  }

  return {
    tool: "chatgpt",
    currentPlan: plan.id,
    currentMonthlyUsd: current,
    seats,
    recommendedAction: "keep",
    monthlySavingsUsd: 0,
    reason: `ChatGPT ${plan.name} is appropriate for your team and use case.`,
    math: `${plan.name} at ${formatUsd(current)}/mo. No cheaper ChatGPT tier matches your needs.`,
    sourceRefs: [5],
    confidence: "high",
  };
}
