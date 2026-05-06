import type { ToolId } from "@/lib/pricing/types";
import { auditAnthropicApi } from "./rules/anthropic-api";
import { auditChatgpt } from "./rules/chatgpt";
import { auditClaude } from "./rules/claude";
import { auditCopilot } from "./rules/copilot";
import { auditCursor } from "./rules/cursor";
import { auditGemini } from "./rules/gemini";
import { auditOpenaiApi } from "./rules/openai-api";
import { auditWindsurf } from "./rules/windsurf";
import type {
  AuditInput,
  AuditResult,
  SavingsTier,
  ToolEntry,
  ToolFinding,
} from "./types";

const RULES: Record<ToolId, (e: ToolEntry, i: AuditInput) => ToolFinding> = {
  cursor: auditCursor,
  copilot: auditCopilot,
  claude: auditClaude,
  chatgpt: auditChatgpt,
  anthropic_api: auditAnthropicApi,
  openai_api: auditOpenaiApi,
  gemini: auditGemini,
  windsurf: auditWindsurf,
};

/**
 * Cross-tool consolidation pass.
 *
 * Multiple coding-IDE subscriptions (Cursor + Copilot + Windsurf) at the same
 * time are almost always redundant. We rewrite the *cheapest* of those into
 * a "consolidate" finding suggesting they cancel that one and keep the others.
 */
function applyConsolidation(
  findings: ToolFinding[],
  input: AuditInput,
): ToolFinding[] {
  const codingTools: ToolId[] = ["cursor", "copilot", "windsurf"];
  const codingActive = findings.filter((f) =>
    codingTools.includes(f.tool) && f.currentMonthlyUsd > 0,
  );

  if (codingActive.length < 2 || input.useCase !== "coding") return findings;

  const cheapest = [...codingActive].sort(
    (a, b) => a.currentMonthlyUsd - b.currentMonthlyUsd,
  )[0];

  return findings.map((f) => {
    if (f !== cheapest) return f;
    return {
      ...f,
      recommendedAction: "consolidate",
      monthlySavingsUsd: f.currentMonthlyUsd,
      reason: `Cursor + Copilot + Windsurf overlap heavily for coding use cases. Cancelling the cheapest of the three rarely changes day-to-day workflow.`,
      math: `${f.currentPlan} at $${f.currentMonthlyUsd}/mo, fully redundant when paired with the other two coding-IDE subscriptions you have. Saves $${f.currentMonthlyUsd}/mo.`,
      confidence: "medium",
    };
  });
}

function tierFor(monthlySavings: number): SavingsTier {
  if (monthlySavings >= 500) return "high";
  if (monthlySavings < 100) return "optimal";
  return "medium";
}

/**
 * Run an audit. Pure function: same input → same output.
 * Does no I/O, throws only on truly bad input (unknown tool, etc).
 */
export function runAudit(input: AuditInput): AuditResult {
  const findings: ToolFinding[] = input.tools.map((entry) => {
    const rule = RULES[entry.tool];
    if (!rule) throw new Error(`No audit rule for tool: ${entry.tool}`);
    return rule(entry, input);
  });

  const consolidated = applyConsolidation(findings, input);

  const totalCurrentMonthlyUsd = consolidated.reduce(
    (sum, f) => sum + f.currentMonthlyUsd,
    0,
  );
  const totalMonthlySavingsUsd = consolidated.reduce(
    (sum, f) => sum + f.monthlySavingsUsd,
    0,
  );
  const totalRecommendedMonthlyUsd =
    totalCurrentMonthlyUsd - totalMonthlySavingsUsd;

  return {
    findings: consolidated.sort(
      (a, b) => b.monthlySavingsUsd - a.monthlySavingsUsd,
    ),
    totalCurrentMonthlyUsd: round2(totalCurrentMonthlyUsd),
    totalRecommendedMonthlyUsd: round2(totalRecommendedMonthlyUsd),
    totalMonthlySavingsUsd: round2(totalMonthlySavingsUsd),
    totalAnnualSavingsUsd: round2(totalMonthlySavingsUsd * 12),
    tier: tierFor(totalMonthlySavingsUsd),
    input,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
