import type { ApiPricing, ToolPricing } from "./types";

/**
 * Typed pricing data.
 * Every entry traces back to PRICING_DATA.md via the `source` footnote id.
 * When PRICING_DATA.md is re-verified, update the `verifiedOn` field on each
 * tool and bump retrieval dates in `sources.ts`.
 */

export const TOOLS: Record<string, ToolPricing> = {
  cursor: {
    id: "cursor",
    label: "Cursor",
    url: "https://cursor.com/pricing",
    verifiedOn: "2026-05-07",
    plans: [
      {
        id: "hobby",
        name: "Hobby",
        monthlyUsd: 0,
        billing: "flat",
        summary: "Free tier with limited Agent + Tab usage.",
        source: 1,
      },
      {
        id: "pro",
        name: "Pro",
        monthlyUsd: 20,
        billing: "flat",
        summary: "Extended Agent limits + frontier models.",
        source: 1,
      },
      {
        id: "pro_plus",
        name: "Pro+",
        monthlyUsd: 60,
        billing: "flat",
        summary: "3× Pro usage on frontier models.",
        source: 1,
      },
      {
        id: "ultra",
        name: "Ultra",
        monthlyUsd: 200,
        billing: "flat",
        summary: "20× Pro usage; priority access to new features.",
        source: 1,
      },
      {
        id: "teams",
        name: "Teams",
        monthlyUsd: 40,
        billing: "per_seat",
        summary: "$40/seat. Shared rules, RBAC, SSO.",
        source: 1,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyUsd: null,
        billing: "custom",
        summary: "Pooled usage, SCIM, audit logs.",
        source: 1,
      },
    ],
  },

  copilot: {
    id: "copilot",
    label: "GitHub Copilot",
    url: "https://github.com/features/copilot/plans",
    verifiedOn: "2026-05-07",
    plans: [
      {
        id: "free",
        name: "Free",
        monthlyUsd: 0,
        billing: "flat",
        summary: "50 chat requests + 2,000 completions/month.",
        source: 2,
      },
      {
        id: "pro",
        name: "Pro",
        monthlyUsd: 10,
        billing: "per_seat",
        summary: "$10/seat. 300 premium requests/month.",
        source: 2,
      },
      {
        id: "pro_plus",
        name: "Pro+",
        monthlyUsd: 39,
        billing: "per_seat",
        summary: "$39/seat. 1,500 premium requests, Opus 4.7 access.",
        source: 2,
      },
      {
        id: "business",
        name: "Business",
        monthlyUsd: 19,
        billing: "per_seat",
        summary: "$19/seat. Org policy + included AI credits.",
        source: 2,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyUsd: 39,
        billing: "per_seat",
        summary: "$39/seat. Fine-grained policy + SSO + $39/mo credits.",
        source: 2,
      },
    ],
  },

  claude: {
    id: "claude",
    label: "Claude",
    url: "https://claude.com/pricing",
    verifiedOn: "2026-05-07",
    plans: [
      {
        id: "free",
        name: "Free",
        monthlyUsd: 0,
        billing: "flat",
        summary: "Web chat, basic usage limits.",
        source: 3,
      },
      {
        id: "pro",
        name: "Pro",
        monthlyUsd: 20,
        annualMonthlyUsd: 17,
        billing: "flat",
        summary: "Higher usage, Claude Code, projects.",
        source: 3,
      },
      {
        id: "max_5x",
        name: "Max 5×",
        monthlyUsd: 100,
        billing: "flat",
        summary: "5× Pro usage; elevated output limits.",
        source: 3,
      },
      {
        id: "max_20x",
        name: "Max 20×",
        monthlyUsd: 200,
        billing: "flat",
        summary: "20× Pro usage; highest individual tier.",
        source: 3,
      },
      {
        id: "team_standard",
        name: "Team Standard",
        monthlyUsd: 25,
        annualMonthlyUsd: 20,
        billing: "per_seat",
        summary: "$25/seat. SSO, admin, central billing.",
        source: 3,
      },
      {
        id: "team_premium",
        name: "Team Premium",
        monthlyUsd: 125,
        annualMonthlyUsd: 100,
        billing: "per_seat",
        summary: "$125/seat. Higher per-seat usage.",
        source: 3,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyUsd: 20,
        billing: "per_seat",
        summary: "$20/seat + usage. SCIM, compliance API.",
        source: 3,
      },
    ],
  },

  chatgpt: {
    id: "chatgpt",
    label: "ChatGPT",
    url: "https://chatgpt.com/pricing",
    verifiedOn: "2026-05-07",
    plans: [
      {
        id: "free",
        name: "Free",
        monthlyUsd: 0,
        billing: "flat",
        summary: "GPT-5.3, ~10 messages per 5h, ad-supported.",
        source: 5,
      },
      {
        id: "go",
        name: "Go",
        monthlyUsd: 8,
        billing: "flat",
        summary: "Higher message volume, no ads.",
        source: 5,
      },
      {
        id: "plus",
        name: "Plus",
        monthlyUsd: 20,
        billing: "flat",
        summary: "Priority access, image gen, deep research.",
        source: 5,
      },
      {
        id: "pro_mid",
        name: "Pro (mid-tier)",
        monthlyUsd: 100,
        billing: "flat",
        summary: "Mid-tier added Apr 2026 to bridge $20 → $200 gap.",
        source: 5,
      },
      {
        id: "pro",
        name: "Pro",
        monthlyUsd: 200,
        billing: "flat",
        summary: "Highest individual tier; advanced reasoning models.",
        source: 5,
      },
      {
        id: "business",
        name: "Business",
        monthlyUsd: 25,
        billing: "per_seat",
        summary: "$25/seat. Per-user, monthly or annual.",
        source: 5,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyUsd: null,
        billing: "custom",
        summary: "Volume + compliance + custom rate limits.",
        source: 5,
      },
    ],
  },

  anthropic_api: {
    id: "anthropic_api",
    label: "Anthropic API direct",
    url: "https://platform.claude.com/docs/en/about-claude/pricing",
    verifiedOn: "2026-05-07",
    plans: [
      {
        id: "usage",
        name: "Pay-as-you-go",
        monthlyUsd: null,
        billing: "usage",
        summary:
          "Token-priced. Sonnet 4.6 $3/$15 per MTok; Opus 4.7 $5/$25; Haiku 4.5 $1/$5.",
        source: 4,
      },
    ],
  },

  openai_api: {
    id: "openai_api",
    label: "OpenAI API direct",
    url: "https://developers.openai.com/api/docs/pricing",
    verifiedOn: "2026-05-07",
    plans: [
      {
        id: "usage",
        name: "Pay-as-you-go",
        monthlyUsd: null,
        billing: "usage",
        summary:
          "Token-priced. gpt-5.4 $2.50/$15 per MTok; gpt-5.4-mini $0.75/$4.50; gpt-5.4-nano $0.20/$1.25.",
        source: 6,
      },
    ],
  },

  gemini: {
    id: "gemini",
    label: "Gemini (Google)",
    url: "https://gemini.google/subscriptions/",
    verifiedOn: "2026-05-07",
    plans: [
      {
        id: "free",
        name: "Free",
        monthlyUsd: 0,
        billing: "flat",
        summary: "Gemini Flash + separate 3.1 Pro access, basic limits.",
        source: 7,
      },
      {
        id: "ai_plus",
        name: "Google AI Plus",
        monthlyUsd: 7.99,
        billing: "flat",
        summary: "Enhanced 3.1 Pro, Veo 3.1 Lite, NotebookLM, 200 GB.",
        source: 7,
      },
      {
        id: "ai_pro",
        name: "Google AI Pro",
        monthlyUsd: 19.99,
        billing: "flat",
        summary: "Max usage limits, Code Assist, Antigravity, 5 TB.",
        source: 7,
      },
      {
        id: "ai_ultra",
        name: "Google AI Ultra",
        monthlyUsd: 249.99,
        billing: "flat",
        summary: "Deep Think, Gemini Agent, YouTube Premium, 30 TB.",
        source: 7,
      },
    ],
  },

  windsurf: {
    id: "windsurf",
    label: "Windsurf",
    url: "https://windsurf.com/pricing",
    verifiedOn: "2026-05-07",
    plans: [
      {
        id: "free",
        name: "Free",
        monthlyUsd: 0,
        billing: "flat",
        summary: "Basic features + knowledge base.",
        source: 9,
      },
      {
        id: "pro",
        name: "Pro",
        monthlyUsd: 20,
        billing: "flat",
        summary: "Unlimited extra usage at API price, all premium models.",
        source: 9,
      },
      {
        id: "max",
        name: "Max",
        monthlyUsd: 200,
        billing: "flat",
        summary: "Heavy usage allowance, SWE-1.5, Devin Cloud sessions.",
        source: 9,
      },
      {
        id: "teams",
        name: "Teams",
        monthlyUsd: 40,
        billing: "per_seat",
        summary: "$40/seat. Cascade, central billing, RBAC, priority support.",
        source: 9,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyUsd: null,
        billing: "custom",
        summary: "Hybrid deployment, volume discounts.",
        source: 9,
      },
    ],
  },
};

/** API token pricing (for substitute-tool comparisons). */
export const API_PRICING: ApiPricing[] = [
  {
    provider: "anthropic",
    url: "https://platform.claude.com/docs/en/about-claude/pricing",
    verifiedOn: "2026-05-07",
    models: [
      {
        id: "claude-opus-4-7",
        name: "Claude Opus 4.7",
        inputPerMTok: 5,
        outputPerMTok: 25,
        cachedInputPerMTok: 0.5,
        source: 4,
      },
      {
        id: "claude-sonnet-4-6",
        name: "Claude Sonnet 4.6",
        inputPerMTok: 3,
        outputPerMTok: 15,
        cachedInputPerMTok: 0.3,
        source: 4,
      },
      {
        id: "claude-haiku-4-5",
        name: "Claude Haiku 4.5",
        inputPerMTok: 1,
        outputPerMTok: 5,
        cachedInputPerMTok: 0.1,
        source: 4,
      },
    ],
  },
  {
    provider: "openai",
    url: "https://developers.openai.com/api/docs/pricing",
    verifiedOn: "2026-05-07",
    models: [
      {
        id: "gpt-5.5",
        name: "gpt-5.5",
        inputPerMTok: 5,
        outputPerMTok: 30,
        cachedInputPerMTok: 0.5,
        source: 6,
      },
      {
        id: "gpt-5.4",
        name: "gpt-5.4",
        inputPerMTok: 2.5,
        outputPerMTok: 15,
        cachedInputPerMTok: 0.25,
        source: 6,
      },
      {
        id: "gpt-5.4-mini",
        name: "gpt-5.4-mini",
        inputPerMTok: 0.75,
        outputPerMTok: 4.5,
        cachedInputPerMTok: 0.075,
        source: 6,
      },
      {
        id: "gpt-5.4-nano",
        name: "gpt-5.4-nano",
        inputPerMTok: 0.2,
        outputPerMTok: 1.25,
        cachedInputPerMTok: 0.02,
        source: 6,
      },
    ],
  },
  {
    provider: "google",
    url: "https://ai.google.dev/pricing",
    verifiedOn: "2026-05-07",
    models: [
      {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        inputPerMTok: 0.3,
        outputPerMTok: 2.5,
        source: 8,
      },
      {
        id: "gemini-2.5-flash-lite",
        name: "Gemini 2.5 Flash-Lite",
        inputPerMTok: 0.1,
        outputPerMTok: 0.4,
        source: 8,
      },
      {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        inputPerMTok: 1.25,
        outputPerMTok: 10,
        source: 8,
      },
    ],
  },
];

/** Look up a plan by tool + plan id, throws if missing. */
export function getPlan(toolId: string, planId: string) {
  const tool = TOOLS[toolId];
  if (!tool) throw new Error(`Unknown tool: ${toolId}`);
  const plan = tool.plans.find((p) => p.id === planId);
  if (!plan) throw new Error(`Unknown plan: ${toolId}/${planId}`);
  return { tool, plan };
}
