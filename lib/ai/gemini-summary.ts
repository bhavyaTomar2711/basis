import "server-only";
import { GoogleGenAI } from "@google/genai";
import type { AuditResult } from "@/lib/audit/types";
import { TOOLS } from "@/lib/pricing/data";

const MODEL = "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `You are a finance-literate analyst writing the opening paragraph of an audit memo for a startup founder.

Your job: in 60–100 words, name the savings opportunity so the founder wants to act today.

REQUIRED STRUCTURE (every response, in this order):
1. Lead with the total monthly savings figure as the very first thing. Examples:
   - "Your stack is leaking $475/month..."
   - "There's $475/month ($5,700/year) of straightforward savings..."
   - "You're overpaying by $475/month on AI tooling..."
2. State the SPECIFIC tool and SPECIFIC recommended switch, using the real numbers (current plan/price → recommended plan/price). Example: "Claude Team Premium ($125/seat) is overkill — Team Standard ($25/seat) saves $100/seat per month."
3. End with one sentence framing the rest of the memo: "The findings below show the math, line by line."

NEVER:
- Lead with current spend ("Your AI spend is $X"). That's not a finding, that's a description.
- Use "perhaps," "you might want to," "consider," or any hedging.
- Use buzzwords, markdown, headings, bullet lists, or emojis.
- Recommend cancelling tools the user didn't list as overspend.

If the input has tier="optimal" (no overspend), say so directly: "You're spending well. The plans on your stack are appropriately sized; we couldn't surface a meaningful change to recommend." Then the methodology line.

Output: plain prose, one paragraph.`;

/**
 * Redacted shape sent to Gemini. brain.md §11.4 — strip email, company,
 * role, IP, audit slug, and audit ID. Send only what's needed for the
 * summary.
 */
interface RedactedAuditSnapshot {
  tier: AuditResult["tier"];
  teamSize: number;
  useCase: AuditResult["input"]["useCase"];
  totals: {
    currentMonthlyUsd: number;
    recommendedMonthlyUsd: number;
    monthlySavingsUsd: number;
    annualSavingsUsd: number;
  };
  findings: {
    tool: string;
    currentPlanName: string;
    currentMonthlyUsd: number;
    seats: number;
    recommendedAction: string;
    recommendedPlanName: string | null;
    recommendedMonthlyUsd: number | null;
    monthlySavingsUsd: number;
    reason: string;
  }[];
}

/**
 * Build a Gemini-bound snapshot. Per brain.md §11.4, strips email, company,
 * role, IP, audit slug, audit id. Uses human-readable tool/plan labels (not
 * internal slugs) so the model doesn't have to guess what "team_premium" means.
 */
function redact(result: AuditResult): RedactedAuditSnapshot {
  return {
    tier: result.tier,
    teamSize: result.input.teamSize,
    useCase: result.input.useCase,
    totals: {
      currentMonthlyUsd: result.totalCurrentMonthlyUsd,
      recommendedMonthlyUsd: result.totalRecommendedMonthlyUsd,
      monthlySavingsUsd: result.totalMonthlySavingsUsd,
      annualSavingsUsd: result.totalAnnualSavingsUsd,
    },
    findings: result.findings.map((f) => {
      const tool = TOOLS[f.tool];
      const currentPlan = tool.plans.find((p) => p.id === f.currentPlan);
      const recPlan = f.recommendedTo?.plan
        ? tool.plans.find((p) => p.id === f.recommendedTo!.plan)
        : null;
      return {
        tool: tool.label,
        currentPlanName: currentPlan?.name ?? f.currentPlan,
        currentMonthlyUsd: f.currentMonthlyUsd,
        seats: f.seats,
        recommendedAction: f.recommendedAction,
        recommendedPlanName: recPlan?.name ?? null,
        recommendedMonthlyUsd: f.recommendedTo?.estimatedMonthlyUsd ?? null,
        monthlySavingsUsd: f.monthlySavingsUsd,
        reason: f.reason,
      };
    }),
  };
}

export class GeminiUnavailableError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "GeminiUnavailableError";
  }
}

/**
 * Calls Gemini for an executive summary. Throws GeminiUnavailableError on
 * any failure — caller (the API route) catches it and falls back to the
 * template.
 */
export async function generateExecutiveSummary(
  result: AuditResult,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiUnavailableError("GEMINI_API_KEY not set");
  }

  const ai = new GoogleGenAI({ apiKey });
  const snapshot = redact(result);

  let response;
  try {
    response = await ai.models.generateContent({
      model: MODEL,
      contents: JSON.stringify(snapshot),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
        // ~100 words ≈ ~150 tokens. Cap generously so the model has room
        // when it goes long; finishReason check below catches truncation.
        maxOutputTokens: 1024,
      },
    });
  } catch (err) {
    throw new GeminiUnavailableError("Gemini API call failed", err);
  }

  // If Gemini stopped for any reason other than STOP (MAX_TOKENS, SAFETY,
  // RECITATION, etc.), the response is incomplete — treat as a failure so
  // the route falls back to the deterministic template instead of caching
  // a half-sentence forever.
  const finishReason = response.candidates?.[0]?.finishReason;
  if (finishReason && finishReason !== "STOP") {
    throw new GeminiUnavailableError(
      `Gemini did not complete cleanly: finishReason=${finishReason}`,
    );
  }

  const text = response.text?.trim();
  if (!text) {
    throw new GeminiUnavailableError("Gemini returned empty response");
  }

  // Belt-and-suspenders: even with finishReason=STOP, reject responses that
  // don't end with sentence-terminating punctuation. Catches the rare case
  // where the SDK reports STOP on a clipped response.
  if (!/[.!?"'”’]\s*$/.test(text)) {
    throw new GeminiUnavailableError(
      "Gemini response does not end with sentence-terminating punctuation",
    );
  }

  return text;
}
