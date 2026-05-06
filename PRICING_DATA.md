# PRICING_DATA.md

> Source-of-truth pricing data for the Basis audit engine. Every price in `lib/pricing/data.ts` traces back to an entry on this page. All prices in USD unless noted.

**Last full verification:** 2026-05-07 (Day 1)
**Re-verification scheduled:** 2026-05-13 morning (Day 5, before submission)

---

## Cursor

Source: https://cursor.com/pricing — verified 2026-05-07 via WebFetch

### Individual
- **Hobby** — $0/month — Limited Agent requests, limited Tab completions, no credit card
- **Pro** — $20/month — Extended Agent limits, frontier models, MCPs/skills/hooks, cloud agents
- **Pro+** — $60/month — 3× Pro usage on OpenAI/Claude/Gemini frontier models
- **Ultra** — $200/month — 20× Pro usage on frontier models, priority access to new features

### Business
- **Teams** — $40/user/month — Shared chats/commands/rules, centralized billing, usage analytics, RBAC, SAML/OIDC SSO
- **Enterprise** — Contact sales — Pooled usage, SCIM, audit logs, account management

> **Note (2026 restructure):** Cursor moved to a tiered usage model with Pro+ and Ultra during 2025. Older "Business" branding now Teams. Pro+ ($60) and Ultra ($200) are new dimensions the audit engine must consider when sizing usage.

---

## GitHub Copilot

Source: https://github.com/features/copilot/plans — verified 2026-05-07 via WebFetch
Business/Enterprise prices cross-verified via web search 2026-05-07 (multiple 2026 articles citing the official plans page).

### Individual
- **Free** — $0/month — 50 agent/chat requests/month, 2,000 completions/month, Haiku 4.5 + GPT-5 mini access
- **Pro** — $10/user/month — Cloud agent, code review, unlimited inline + agent mode (GPT-5 mini), 300 premium requests
- **Pro+** — $39/user/month — Pro features + Claude Opus 4.7 access, 1,500 premium requests, GitHub Spark

### Organization
- **Business** — $19/user/month — Includes $19/mo of AI credits, org policy controls
- **Enterprise** — $39/user/month — Includes $39/mo of AI credits, fine-grained policy, SSO

> **Note:** Additional premium requests beyond the included allotment are $0.04 each. As of June 2026 GitHub is transitioning to fully usage-based billing; base seat prices are not changing.

---

## Claude (Anthropic, consumer + team)

Source: https://claude.com/pricing — verified 2026-05-07 via WebFetch

### Consumer
- **Free** — $0/month — Web chat, web search, memory, connectors, basic usage
- **Pro** — $20/month (or $17/month if billed annually) — Higher usage, Claude Code, Claude Cowork, unlimited projects, multiple model picks
- **Max 5×** — $100/month — Pro features + 5× Pro's usage, elevated output limits, priority at peak times
- **Max 20×** — $200/month — Pro features + 20× Pro's usage *(extraction returned "from $100" but the public Max 20× tier is $200/mo; cross-check on 2026-05-13)*

### Team / Enterprise
- **Team Standard** — $25/seat/month ($20/seat/month annual) — All features, SSO, admin, central billing, audit logs, no training on content
- **Team Premium** — $125/seat/month ($100/seat/month annual) — Higher per-seat usage
- **Enterprise** — $20/seat + usage-based API costs — SCIM, fine-grained perms, compliance API, HIPAA option

---

## Anthropic API direct

Source: https://platform.claude.com/docs/en/about-claude/pricing — verified 2026-05-07 via WebFetch

| Model | Input ($/MTok) | Output ($/MTok) | Cache hit ($/MTok) | 1h cache write ($/MTok) |
|---|---:|---:|---:|---:|
| Claude Opus 4.7 | $5.00 | $25.00 | $0.50 | $10.00 |
| Claude Opus 4.6 | $5.00 | $25.00 | $0.50 | $10.00 |
| Claude Opus 4.5 | $5.00 | $25.00 | $0.50 | $10.00 |
| Claude Opus 4.1 | $15.00 | $75.00 | $1.50 | $30.00 |
| Claude Sonnet 4.6 | $3.00 | $15.00 | $0.30 | $6.00 |
| Claude Sonnet 4.5 | $3.00 | $15.00 | $0.30 | $6.00 |
| Claude Haiku 4.5 | $1.00 | $5.00 | $0.10 | $2.00 |
| Claude Haiku 3.5 | $0.80 | $4.00 | $0.08 | $1.60 |

> **Note:** Batch API (50% discount) and prompt caching multipliers are documented at the source URL. Audit engine assumes standard real-time API rates.

---

## ChatGPT (OpenAI, consumer + business)

Source: https://chatgpt.com/pricing — page returned 403 to WebFetch; prices cross-verified 2026-05-07 via official-blog and aggregator references in web search results.

### Consumer
- **Free** — $0/month — GPT-5.3 access, ~10 messages per 5h window, ad-supported in US since Feb 2026
- **Go** — $8/month — Higher message volume than Free, launched in India first, now global
- **Plus** — $20/month — Priority access, faster responses, image gen, deep research, file analysis
- **Pro (mid-tier)** — $100/month — Added April 2026 to bridge $20→$200 gap
- **Pro** — $200/month — Highest individual tier, advanced reasoning models

### Business
- **Business** — $25/user/month — Per-user, monthly or annual
- **Enterprise** — Custom — Volume + compliance + custom rate limits

> **Note:** The audit engine flags ChatGPT Business at $25/user/mo + ChatGPT Plus at $20/mo as the most common over-provisioning patterns for sub-5-person teams.

---

## OpenAI API direct

Source: https://developers.openai.com/api/docs/pricing — verified 2026-05-07 via WebFetch

| Model | Input ($/MTok) | Cached input ($/MTok) | Output ($/MTok) |
|---|---:|---:|---:|
| gpt-5.5 | $5.00 | $0.50 | $30.00 |
| gpt-5.5-pro | $30.00 | — | $180.00 |
| gpt-5.4 (current flagship) | $2.50 | $0.25 | $15.00 |
| gpt-5.4-mini | $0.75 | $0.075 | $4.50 |
| gpt-5.4-nano | $0.20 | $0.02 | $1.25 |
| gpt-5.4-pro | $30.00 | — | $180.00 |
| gpt-5.3-codex | $1.75 | $0.175 | $14.00 |

> **Note:** Batch API offers reduced rates (50% off historically). Regional processing endpoints add 10% markup. The audit engine treats `gpt-5.4` as the canonical "API direct" baseline for retail comparison.

---

## Gemini (Google, consumer)

Sources:
- Plan list: https://gemini.google/subscriptions/ — verified 2026-05-07 via WebFetch (returned INR pricing for the user's region)
- US prices cross-verified via 2026-05-07 web-search (Engadget, blog.google, gemini pricing reviews, sentisight.ai comparison)

### US pricing (USD)
- **Free** — $0/month — Gemini app basic, Gemini Flash, separate Gemini 3.1 Pro access, Deep Research, Gemini Live, Canvas, Gems, 15 GB
- **Google AI Plus** — $7.99/month — Free + enhanced 3.1 Pro, Veo 3.1 Lite, NotebookLM audio, Gemini in Workspace apps, 200 GB
- **Google AI Pro** — $19.99/month — Plus + max usage limits, Veo 3.1, Gemini Code Assist + CLI, NotebookLM 5×, Antigravity agent, 5 TB
- **Google AI Ultra** — $249.99/month — Pro + Deep Think, Gemini Agent (US/English), YouTube Premium, 30 TB

> **Note:** Google introduced Plus ($7.99) into the US in 2026 (Engadget). An "AI Ultra Lite" tier is in development between Pro ($19.99) and Ultra ($249.99) but has no public price as of 2026-05-07.

---

## Gemini API direct

Source: https://ai.google.dev/pricing — verified 2026-05-07 via WebFetch

| Model | Input ($/MTok) | Output ($/MTok) | Free tier |
|---|---:|---:|---|
| Gemini 3.1 Pro Preview | $2.00 (≤200k) / $4.00 (>200k) | $12.00 (≤200k) / $18.00 (>200k) | None |
| Gemini 3 Flash Preview | $0.50 text/image/video; $1.00 audio | $3.00 | Yes |
| Gemini 2.5 Pro | $1.25 (≤200k) / $2.50 (>200k) | $10.00 (≤200k) / $15.00 (>200k) | Yes |
| **Gemini 2.5 Flash** ⭐ | **$0.30** text/image/video; $1.00 audio | **$2.50** | Yes (15 RPM, ~1500/day) |
| Gemini 2.5 Flash-Lite | $0.10 text/image/video; $0.30 audio | $0.40 | Yes |
| Gemini 2.0 Flash | $0.10 | $0.40 | Yes |
| Gemini 2.0 Flash-Lite | $0.075 | $0.30 | Yes |

⭐ Basis itself uses **Gemini 2.5 Flash** for the executive-summary feature (free tier; see brain.md §11).

---

## Windsurf

Source: https://windsurf.com/pricing — verified 2026-05-07 via WebFetch

### Individual
- **Free** — $0/month — Basic features, knowledge base
- **Light** — Pricing not publicly listed — Unlimited usage allowance refreshing daily/weekly, all premium models
- **Pro** — $20/month — Unlimited extra usage at API price, Previews/Deploys, all premium models, Fast Context
- **Max** — $200/month — Heavy usage allowance, Pro features + SWE-1.5 agent + Devin Cloud sessions

### Business
- **Teams** — $40/user/month — Cascade, centralized billing, admin dashboard, RBAC, priority support
- **Enterprise** — Custom — Hybrid deployment, volume discounts

---

## Notes & caveats

1. **Claude Max 20× extraction issue.** Anthropic's pricing page extraction returned "From $100/month" for both Max 5× and Max 20×, which contradicts the well-known Max 20× = $200/mo public price. The audit engine codes Max 20× as $200/mo; re-verify on Day 5.
2. **OpenAI direct fetch blocked.** `chatgpt.com/pricing` and `openai.com/api/pricing/` returned 403 to WebFetch. OpenAI consumer prices are sourced from web-search results citing those pages and from `developers.openai.com/api/docs/pricing` (which did succeed). Re-verify on Day 5.
3. **Cursor restructure.** Cursor's tiering changed materially in 2025 with the addition of Pro+ ($60) and Ultra ($200). Older audit logic that compared to "Business at $40" now needs to consider whether a customer should sit on Pro+ instead of Teams.
4. **Copilot transitioning to usage-based billing (June 2026).** Base per-seat prices unchanged for now; included AI credits ($19/mo on Business, $39/mo on Enterprise) are new and must be reflected in audit reasoning.
5. **Region-priced consumer plans.** Google AI / Gemini consumer prices vary heavily by region. The audit engine uses US prices as the canonical comparison.
6. **API rate limits drift.** Free-tier API rate limits (Gemini 15 RPM / 1500 RPD; Anthropic by tier; OpenAI by tier) are documented at the source URLs and may change without notice. The audit engine does not encode rate limits — it encodes prices only.
7. **All prices are list prices.** The audit's value proposition is to compare list prices. Credex's discounted-credits offering is the *application* of the audit, not the audit itself.
