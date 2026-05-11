import type { ToolId } from "@/lib/pricing/types";

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";
export type Role = "founder_ceo" | "eng_manager" | "cto_vp" | "ic" | "other";

export interface ToolEntry {
  tool: ToolId;
  /** plan id, e.g. "pro", "business" — must exist in pricing data */
  plan: string;
  /** user-entered monthly USD spend (the source of truth from their bill) */
  monthlySpendUsd: number;
  /** how many seats / users */
  seats: number;
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
  role?: Role;
}

export type RecommendedAction =
  | "keep"
  | "downgrade"
  | "switch_provider"
  | "use_credits"
  | "consolidate";

export interface RecommendedTool {
  tool: ToolId;
  plan?: string;
  estimatedMonthlyUsd: number;
}

export interface ToolFinding {
  tool: ToolId;
  currentPlan: string;
  currentMonthlyUsd: number;
  seats: number;
  recommendedAction: RecommendedAction;
  recommendedTo?: RecommendedTool;
  monthlySavingsUsd: number;
  /** one-sentence human reason */
  reason: string;
  /** the *math*: numbers that show the saving. brain.md §9.4 — never empty. */
  math: string;
  /** PRICING_DATA.md footnote ids (1-based) */
  sourceRefs: number[];
  confidence: "high" | "medium" | "low";
}

export type SavingsTier = "high" | "medium" | "optimal";

export interface AuditResult {
  findings: ToolFinding[];
  totalCurrentMonthlyUsd: number;
  totalRecommendedMonthlyUsd: number;
  totalMonthlySavingsUsd: number;
  totalAnnualSavingsUsd: number;
  tier: SavingsTier;
  /** input echoed back, useful for serialization */
  input: AuditInput;
}
