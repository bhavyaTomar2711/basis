/**
 * Pricing data types — see PRICING_DATA.md for sources.
 * Every constant in `data.ts` must conform to one of these.
 */

export type ToolId =
  | "cursor"
  | "copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export type Billing = "flat" | "per_seat" | "usage" | "custom";

export interface Plan {
  /** stable id, kebab-case, unique within a tool */
  id: string;
  /** human-readable plan name */
  name: string;
  /** monthly USD list price (0 = free, null = contact-sales / custom) */
  monthlyUsd: number | null;
  /** annual-billed monthly USD price, when available */
  annualMonthlyUsd?: number;
  /** how the price scales */
  billing: Billing;
  /** one-line summary used in tooltips and audit reasoning */
  summary: string;
  /** PRICING_DATA.md citation index (filled by data.ts) */
  source: number;
}

export interface ToolPricing {
  id: ToolId;
  /** human-readable vendor + product label */
  label: string;
  /** primary canonical pricing-page URL */
  url: string;
  /** ISO date the data was last verified */
  verifiedOn: string;
  /** plans available */
  plans: Plan[];
}

/** API-direct usage pricing (per-million-token, USD). */
export interface ApiModel {
  /** stable id */
  id: string;
  /** human-readable name */
  name: string;
  /** input tokens, $/MTok */
  inputPerMTok: number;
  /** output tokens, $/MTok */
  outputPerMTok: number;
  /** cache-hit tokens, $/MTok (optional) */
  cachedInputPerMTok?: number;
  source: number;
}

export interface ApiPricing {
  provider: "anthropic" | "openai" | "google";
  url: string;
  verifiedOn: string;
  models: ApiModel[];
}

export interface SourceCitation {
  /** 1-based footnote number */
  id: number;
  vendor: string;
  url: string;
  retrievedOn: string;
}
