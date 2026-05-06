import { getPlan } from "@/lib/pricing/data";
import { formatUsd } from "../helpers";
import type { AuditInput, ToolEntry, ToolFinding } from "../types";

/**
 * Cursor rules.
 *
 * Common over-spend patterns we catch:
 *  - Teams ($40/seat) on a small team where every seat could be on Pro ($20).
 *  - Ultra ($200) on a single-dev team with light usage — Pro+ ($60) usually fits.
 *  - Pro+ ($60) on a writing/research-only seat — Pro ($20) is enough.
 */
export function auditCursor(
  entry: ToolEntry,
  input: AuditInput,
): ToolFinding {
  const { plan } = getPlan("cursor", entry.plan);
  const current = entry.monthlySpendUsd;
  const seats = entry.seats;

  // Teams ($40/seat) → Pro ($20/seat) when team is small + use case is not coding-heavy.
  if (plan.id === "teams" && seats <= 3) {
    const recommendedMonthly = 20 * seats;
    const savings = current - recommendedMonthly;
    return {
      tool: "cursor",
      currentPlan: plan.id,
      currentMonthlyUsd: current,
      seats,
      recommendedAction: "downgrade",
      recommendedTo: {
        tool: "cursor",
        plan: "pro",
        estimatedMonthlyUsd: recommendedMonthly,
      },
      monthlySavingsUsd: Math.max(0, savings),
      reason: `Teams ($40/seat) is overkill for a ${seats}-seat team — Pro fits unless you need RBAC/SSO.`,
      math: `Cursor Teams at $40/seat × ${seats} seats = ${formatUsd(40 * seats)}/mo. Cursor Pro at $20/seat × ${seats} seats = ${formatUsd(20 * seats)}/mo. Delta: ${formatUsd(savings)}/mo.`,
      sourceRefs: [1],
      confidence: "high",
    };
  }

  // Ultra ($200) on solo dev with non-coding-heavy use → Pro+ ($60).
  if (plan.id === "ultra" && input.useCase !== "coding" && input.teamSize <= 2) {
    const savings = current - 60;
    return {
      tool: "cursor",
      currentPlan: plan.id,
      currentMonthlyUsd: current,
      seats,
      recommendedAction: "downgrade",
      recommendedTo: {
        tool: "cursor",
        plan: "pro_plus",
        estimatedMonthlyUsd: 60,
      },
      monthlySavingsUsd: Math.max(0, savings),
      reason: `Ultra is sized for 20× Pro usage. Your team and use case rarely hits that ceiling — Pro+ does.`,
      math: `Cursor Ultra at $200/mo. Cursor Pro+ at $60/mo (3× Pro usage on frontier models, typically enough for non-coding-heavy workloads). Delta: ${formatUsd(savings)}/mo.`,
      sourceRefs: [1],
      confidence: "medium",
    };
  }

  // Pro+ ($60) on writing/research-only seat → Pro ($20).
  if (
    plan.id === "pro_plus" &&
    (input.useCase === "writing" || input.useCase === "research")
  ) {
    const savings = current - 20;
    return {
      tool: "cursor",
      currentPlan: plan.id,
      currentMonthlyUsd: current,
      seats,
      recommendedAction: "downgrade",
      recommendedTo: { tool: "cursor", plan: "pro", estimatedMonthlyUsd: 20 },
      monthlySavingsUsd: Math.max(0, savings),
      reason: `Pro+ is built for heavy frontier-model usage in coding flows. Writing/research workloads almost never need it.`,
      math: `Cursor Pro+ at $60/mo. Cursor Pro at $20/mo. Delta: ${formatUsd(savings)}/mo.`,
      sourceRefs: [1],
      confidence: "high",
    };
  }

  // Default: keep.
  return {
    tool: "cursor",
    currentPlan: plan.id,
    currentMonthlyUsd: current,
    seats,
    recommendedAction: "keep",
    monthlySavingsUsd: 0,
    reason: `Cursor ${plan.name} is appropriately sized for a ${input.teamSize}-person ${input.useCase} team.`,
    math: `${plan.name} at ${formatUsd(current)}/mo for ${seats} seat${seats === 1 ? "" : "s"}. No cheaper Cursor tier fits your usage profile.`,
    sourceRefs: [1],
    confidence: "high",
  };
}
