import { getPlan } from "@/lib/pricing/data";
import { formatUsd } from "../helpers";
import type { AuditInput, ToolEntry, ToolFinding } from "../types";

/**
 * Gemini consumer rules.
 *
 *  - Google AI Ultra ($249.99) when use case isn't research/data → AI Pro ($19.99).
 *  - AI Pro ($19.99) when use case is light writing → AI Plus ($7.99).
 */
export function auditGemini(
  entry: ToolEntry,
  input: AuditInput,
): ToolFinding {
  const { plan } = getPlan("gemini", entry.plan);
  const current = entry.monthlySpendUsd;
  const seats = entry.seats;

  if (plan.id === "ai_ultra" && !["research", "data"].includes(input.useCase)) {
    const savings = current - 19.99;
    return {
      tool: "gemini",
      currentPlan: plan.id,
      currentMonthlyUsd: current,
      seats,
      recommendedAction: "downgrade",
      recommendedTo: { tool: "gemini", plan: "ai_pro", estimatedMonthlyUsd: 19.99 },
      monthlySavingsUsd: Math.max(0, savings),
      reason: `AI Ultra ($249.99) is built around Deep Think + Gemini Agent, both research-heavy. Other use cases plateau on AI Pro.`,
      math: `Google AI Ultra at $249.99/mo. Google AI Pro at $19.99/mo (max model usage limits, Code Assist, 5 TB). Delta: ${formatUsd(savings)}/mo.`,
      sourceRefs: [7],
      confidence: "medium",
    };
  }

  if (plan.id === "ai_pro" && input.useCase === "writing") {
    const savings = current - 7.99;
    return {
      tool: "gemini",
      currentPlan: plan.id,
      currentMonthlyUsd: current,
      seats,
      recommendedAction: "downgrade",
      recommendedTo: { tool: "gemini", plan: "ai_plus", estimatedMonthlyUsd: 7.99 },
      monthlySavingsUsd: Math.max(0, savings),
      reason: `AI Pro's high model usage ceilings and Code Assist aren't load-bearing for writing-only workflows.`,
      math: `Google AI Pro at $19.99/mo. Google AI Plus at $7.99/mo (Gemini in Workspace apps, NotebookLM, 200 GB). Delta: ${formatUsd(savings)}/mo.`,
      sourceRefs: [7],
      confidence: "medium",
    };
  }

  return {
    tool: "gemini",
    currentPlan: plan.id,
    currentMonthlyUsd: current,
    seats,
    recommendedAction: "keep",
    monthlySavingsUsd: 0,
    reason: `Gemini ${plan.name} fits your use case.`,
    math: `${plan.name} at ${formatUsd(current)}/mo. No cheaper Gemini consumer tier matches.`,
    sourceRefs: [7],
    confidence: "high",
  };
}
