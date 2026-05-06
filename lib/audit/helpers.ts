import { TOOLS, getPlan } from "@/lib/pricing/data";
import type { ToolEntry } from "./types";

/** USD → "$1,234" or "$1,234.56" with two decimals when needed. */
export function formatUsd(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const isWhole = Number.isInteger(rounded);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rounded);
}

/** True if the entry's monthly spend looks like a per-seat plan × seats. */
export function spendMatchesPerSeat(entry: ToolEntry): boolean {
  const { plan } = getPlan(entry.tool, entry.plan);
  if (plan.billing !== "per_seat" || plan.monthlyUsd === null) return false;
  const expected = plan.monthlyUsd * entry.seats;
  // tolerate ±10% rounding / partial months
  return Math.abs(entry.monthlySpendUsd - expected) <= expected * 0.1;
}

/** Return the cheapest equivalent self-billed tier from the same vendor. */
export function cheaperPlanFromSameVendor(
  toolId: ToolEntry["tool"],
  currentPlanId: string,
): { id: string; monthlyUsd: number } | null {
  const tool = TOOLS[toolId];
  const current = tool.plans.find((p) => p.id === currentPlanId);
  if (!current || current.monthlyUsd === null) return null;
  const ceiling = current.monthlyUsd;

  const cheaper = tool.plans
    .filter(
      (p) =>
        p.billing === current.billing &&
        p.monthlyUsd !== null &&
        p.monthlyUsd > 0 &&
        p.monthlyUsd < ceiling,
    )
    .sort((a, b) => (b.monthlyUsd as number) - (a.monthlyUsd as number))[0];

  if (!cheaper || cheaper.monthlyUsd === null) return null;
  return { id: cheaper.id, monthlyUsd: cheaper.monthlyUsd };
}
