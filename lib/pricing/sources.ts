import type { SourceCitation } from "./types";

/**
 * Canonical citation list. Footnotes referenced by `source` fields in pricing
 * data and `sourceRefs` in audit findings index into this array (1-based).
 *
 * Update retrieval dates whenever PRICING_DATA.md is re-verified.
 */
export const SOURCES: SourceCitation[] = [
  {
    id: 1,
    vendor: "Cursor",
    url: "https://cursor.com/pricing",
    retrievedOn: "2026-05-11",
  },
  {
    id: 2,
    vendor: "GitHub Copilot",
    url: "https://github.com/features/copilot/plans",
    retrievedOn: "2026-05-11",
  },
  {
    id: 3,
    vendor: "Anthropic â€” Claude (consumer)",
    url: "https://claude.com/pricing",
    retrievedOn: "2026-05-11",
  },
  {
    id: 4,
    vendor: "Anthropic â€” API",
    url: "https://platform.claude.com/docs/en/about-claude/pricing",
    retrievedOn: "2026-05-11",
  },
  {
    id: 5,
    vendor: "OpenAI â€” ChatGPT (consumer)",
    url: "https://chatgpt.com/pricing",
    retrievedOn: "2026-05-11",
  },
  {
    id: 6,
    vendor: "OpenAI â€” API",
    url: "https://developers.openai.com/api/docs/pricing",
    retrievedOn: "2026-05-11",
  },
  {
    id: 7,
    vendor: "Google â€” Gemini (consumer)",
    url: "https://gemini.google/subscriptions/",
    retrievedOn: "2026-05-11",
  },
  {
    id: 8,
    vendor: "Google â€” Gemini API",
    url: "https://ai.google.dev/pricing",
    retrievedOn: "2026-05-11",
  },
  {
    id: 9,
    vendor: "Windsurf",
    url: "https://windsurf.com/pricing",
    retrievedOn: "2026-05-11",
  },
  {
    id: 10,
    vendor: "Ramp â€” AI Spending Insights (2025 Annual)",
    url: "https://ramp.com/blog/state-of-ai-spending",
    retrievedOn: "2026-05-11",
  },
  {
    id: 11,
    vendor: "a16z â€” Generative AI in the Enterprise (2025)",
    url: "https://a16z.com/generative-ai-enterprise-2025",
    retrievedOn: "2026-05-11",
  },
];

export function citation(id: number): SourceCitation {
  const found = SOURCES.find((s) => s.id === id);
  if (!found) throw new Error(`No citation #${id}`);
  return found;
}
