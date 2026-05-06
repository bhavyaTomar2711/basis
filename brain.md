# brain.md — Basis

> **Single source of truth for the Credex AI Spend Audit project.** Every implementation decision flows from this document. When reality contradicts the plan, update this file — do not let it go stale. Section numbers are stable references; cite them in commit messages and PRs.

---

## 0. Status

| | |
|---|---|
| Locked name | **Basis** |
| Started | 2026-05-07 |
| Submission window | 5 working days within a 6-day calendar |
| Deadline | **2026-05-13** (hard) |
| Last brain.md update | 2026-05-07 |
| Current phase | Day 1 — Spine |

---

## 1. North Star

### 1.1 What we're building
A free public web app where any startup founder or engineering manager can input the AI tools they pay for, get an instant on-screen audit showing where they're overspending, see total monthly + annual savings, capture the report by email, and share a redacted public version via a unique URL.

### 1.2 Who it's for
**Primary user:** Founder or engineering manager at a 5–50 person startup, $20k–$500k MRR, currently spending $300–$5,000/month on AI tools across their team. Technical enough to evaluate alternatives, time-poor enough to never have audited their stack.

**Why they care:** They suspect they're overpaying but have no benchmark. There is no "Mint for AI tool spend" — yet.

### 1.3 The opportunity (from brief)
Receipt is two things at once:
1. A **genuinely useful free tool** for any startup with an AI bill.
2. A **lead-generation asset for Credex** — high-savings audits surface Credex (the discounted-credits marketplace) as the way to capture more of the savings.

### 1.4 What makes this submission exceptional vs. a pass
The 100-point rubric weights entrepreneurial thinking (25) + thinking models (15) + audit-logic polish (10) at **50 points combined**. Most candidates over-invest in code (15 points) and under-invest in entrepreneurial docs. We invert the default:
- **Audit logic a finance person would defend.** Numbers traceable to vendor URLs. Reasoning shown, not hidden.
- **Three real user interviews with surprising findings.** Most candidates fake these.
- **A landing page that looks like a Credex product, not an intern project.** Apple-premium surface, financial-document substance.
- **One bonus done well** (benchmark mode) over three done sloppily.
- **Honest DEVLOG** with two zero-hour entries rather than fake daily ones.

---

## 2. Naming & Positioning

### 2.1 Name
**Basis** — locked.

Why it works:
- Financial DNA: "basis points," "cost basis." Unambiguously money-language.
- Two syllables, easy to say, photographable as a wordmark.
- Not AI-tropey. Reads like a real B2B fintech brand.
- Domain-search-friendly (basis.tools / trybasis / basis-audit type variants exist).

The wordmark is just **Basis** in Fraunces 600 with a tracking-tight `-0.02em`. No icon mark in v1.

### 2.2 Tagline (primary)
**"The basis for your AI spend."** *(double meaning — foundation, and "basis points")*

### 2.3 Tagline (alternates)
- "See what your AI stack actually costs."
- "A second opinion on your AI bill."
- "Your AI spend, on the record."

### 2.4 One-line positioning
Basis is a free 2-minute audit of your team's AI tool spend. It tells you which plans you're overpaying for, which you should swap, and what you'd save in a year. No login, no sales call, no spam.

### 2.5 What Basis is *not*
- Not a SaaS dashboard.
- Not a procurement tool.
- Not a real-time spend tracker.
- Not a Credex marketing page (Credex appears only when savings are large).

---

## 3. Visual Identity

### 3.1 Design philosophy
**Apple-premium surface, financial-document substance.** Every other AI tool right now looks the same: dark mode, purple gradients, glassmorphism, sparkle ✨ icons, Geist on Geist on Geist. Basis earns trust *because* it doesn't look like AI. The surface is calm, photographic, generously spaced — like Haven or Apple's product pages. The substance — the audit itself — is rendered as a real document with citations, tabular numbers, and footnotes.

The single biggest design move: **the audit document is the hero product**, photographed/rendered the way Apple photographs an iPhone — floating, soft shadow, slight tilt, on a warm cream background.

**Dark mode: deferred.** Light theme only in v1. Tokens are CSS custom properties so dark mode can be added later without refactoring components.

### 3.2 Color tokens

```css
/* light (default) */
--bg:          #F7F4EE;  /* warm cream paper, NOT pure white */
--bg-elev:     #FFFFFF;  /* cards, modals */
--ink:         #0E0E0C;  /* primary text, near-black warm */
--ink-muted:   #5C5A55;  /* secondary text */
--rule:        #E5E1D8;  /* hairlines, borders */
--green:       #1E3A2A;  /* financial accent — money, not tech */
--green-tint:  #EDF1EC;  /* savings highlight background */
--alert-tint:  #FFF1E5;  /* FT-salmon for overspend rows */
--alert-ink:   #B23A1F;  /* overspend text */
--cta-bg:      #0E0E0C;  /* black pill button */
--cta-ink:     #F7F4EE;  /* button text */

/* dark (optional, ship if time permits) */
--bg-dark:     #0E0E0C;
--ink-dark:    #F7F4EE;
--rule-dark:   #2A2A26;
```

**Restraint rule:** never use more than two of these colors in any single viewport, plus the bg. The whitespace is the design.

### 3.3 Typography

| Role | Family | Weight | Use |
|---|---|---|---|
| Display | **Fraunces** (variable, free, Google Fonts) | 600–900 | Hero headlines, hero savings number, section titles |
| Body | **Inter** (variable, free) | 400, 500 | All UI text, paragraphs, labels |
| Mono | **JetBrains Mono** (variable, free) | 400, 500 | Tabular figures, audit receipt rows, citations |

**Type scale (mobile → desktop):**
- Hero: 56pt → 96pt (Fraunces 700, line-height 0.95, letter-spacing -0.02em)
- H1: 40pt → 56pt (Fraunces 700)
- H2: 28pt → 36pt (Fraunces 600)
- Body large: 18pt → 20pt (Inter 400, line-height 1.5)
- Body: 16pt (Inter 400)
- Caption: 13pt (Inter 500, letter-spacing 0.02em, uppercase for labels)
- Number / mono: matches surrounding context, with `font-feature-settings: "tnum" 1, "ss01" 1`

**Numbers always use tabular figures.** This is non-negotiable. A column of dollar amounts must align by digit.

### 3.4 Spacing & layout
- **8pt grid.** All spacing is a multiple of 4px, ideally 8px.
- **Container widths:** 720px for prose, 960px for the audit, 1200px max for landing sections.
- **Section vertical padding:** 96px desktop / 48px mobile minimum between major sections.
- **Generous margins** on the page itself: 24px on mobile, 64px+ on desktop. Never full-bleed text.
- **Hairline rules** (1px solid var(--rule)) instead of card shadows for separating sections in the audit document.
- **Card shadow** (only used on the hero "product" object, not on UI cards): `0 24px 48px -12px rgba(14,14,12,0.12), 0 8px 16px -8px rgba(14,14,12,0.08)`.

### 3.5 Motion principles
**Almost none, deliberately.** AI tools jiggle. Audits don't.

Permitted motion:
1. **Hero savings count-up** on results page mount: 1.2s ease-out, respects `prefers-reduced-motion`.
2. **Receipt rows stagger fade** on results page: 50ms stagger, 400ms ease-out, respects reduced-motion.
3. **View Transitions API** for landing → form → results where supported.
4. **Subtle pill-button hover lift:** `transform: translateY(-1px)`, 150ms.

Forbidden:
- Parallax.
- Scroll-triggered reveals beyond the receipt rows.
- Animated gradients.
- Any motion that loops.

### 3.6 Iconography
- **Lucide** icons, weight 1.5, size 20px default.
- Tool logos (Cursor, Claude, ChatGPT, etc.): use each vendor's official SVG mark from their press kit. Never default favicons.
- No sparkle ✨, no robot 🤖, no AI clichés.

### 3.7 Hero product treatment (the signature move)
The landing-page hero shows the **audit document itself as a beautiful object**. Specifically:
- A paper card (white, slightly off-white edge) with a torn or dotted-line top edge.
- Header: "AUDIT REPORT · #A1B2C3 · [date]" in mono.
- Body: 3–4 itemized rows showing tools, current spend → recommended → savings, with dotted leader lines.
- Bottom: huge serif "Total saved: $2,840/mo" in green.
- Floating with soft shadow on the cream background, slight 3° rotation tilt.
- Implementation options: (a) render in HTML/CSS and screenshot, (b) Figma export to SVG/PNG, (c) build it as live HTML — recommended, zero-asset, scales perfectly, can animate.

Build it as live HTML. The hero is then literally a live preview of the product.

### 3.8 OG share image direction
A torn-page audit certificate, generated dynamically per audit via Next.js `opengraph-image.tsx`:
- 1200x630 cream background
- Top: "RECEIPT" wordmark + "AUDIT REPORT" subtitle in mono
- Center: huge serif savings number ("$2,840/mo saved")
- Below: tool icons in a row (the user's stack)
- Bottom: redacted company name (`•••••••`) + date + URL
- Dotted-line top edge, soft shadow, paper texture

**Why this matters:** the OG image is the viral loop. Most AI tools' OG images are interchangeable dark gradients. Ours will look like a leaked document in a Twitter feed.

---

## 4. Information Architecture

### 4.1 Routes
| Route | Purpose | Auth | OG |
|---|---|---|---|
| `/` | Landing — hero, value, "Run my audit" CTA | none | static |
| `/audit/new` | Form (single page, sectioned) | none | static |
| `/audit/[id]` | User's full audit (post-form, identifying info present) | session token in cookie | static |
| `/a/[slug]` | Public shareable redacted audit | none | dynamic per slug |
| `/api/audit` | POST: run audit, return id + slug | none, rate-limited | n/a |
| `/api/lead` | POST: capture email after audit | none, rate-limited | n/a |
| `/api/summary` | POST: generate AI summary (server-only Gemini call) | none, rate-limited | n/a |
| `/about` | Optional: how the audit works, FAQ, methodology | none | static |
| `/methodology` | Optional: every rule, every source, every assumption | none | static |

### 4.2 User flow
```
Landing (/)
  ↓ click "Run my audit"
Form (/audit/new)
  ↓ submit
Results (/audit/[id])  ← AI summary loads async, shows skeleton
  ↓ optional: capture email
  ↓ optional: click "Share"
Public share (/a/[slug])  ← redacted version
```

---

## 5. Page Specs

### 5.1 Landing — `/`

**Hero section** (full viewport on desktop, 80vh mobile):
- Top nav: small "Receipt" wordmark left (Fraunces 600, 18pt), "How it works" / "Methodology" links right, mobile hamburger.
- Centered hero: serif headline (3 lines max). Working copy:
  > **"See what your AI stack actually costs."**
- Subhead in muted ink, max 2 lines: "An itemized audit of your team's AI spend. Two minutes, no login, no sales call."
- Black pill CTA: "Run my audit" → `/audit/new`
- Below CTA: tiny line "Free · 2 minutes · No login required"
- **Hero object:** the live HTML audit-receipt card, floating right or below, tilted 3°.

**Section 2 — How it works** (3 steps, hairline-separated):
1. List your tools — "We support Cursor, Copilot, Claude, ChatGPT, Gemini, plus the API direct plans."
2. Tell us your team — "Headcount and primary use case. That's it."
3. Get your audit — "Per-tool recommendations, total savings, shareable report."

**Section 3 — Sample audit** (anchor link target):
- Show a fully-rendered example audit inline (using mock data). Lets visitors see what they get before submitting.

**Section 4 — Why it's free / Credex disclosure**:
- Honest, single paragraph. "Receipt is built and run by Credex. We make money when companies with significant AI overspend talk to us about discounted credits. Most companies who run an audit will never speak to us, and that's fine — the audit is genuinely free." This honesty *itself* is the trust signal.

**Section 5 — FAQ** (5 Q&As, sourced from `LANDING_COPY.md`).

**Footer:** wordmark, links (methodology, GitHub repo, privacy), Credex attribution.

### 5.2 Form — `/audit/new`

**Single page, three sections**, no multi-step wizard.

**Section A — "Tools you pay for"**
- Repeatable rows. Each row: tool dropdown, plan dropdown (changes per tool), monthly spend (auto-suggested from plan, editable), seats (number).
- "+ Add another tool" link.
- Inline validation, never a popup.

Supported tools (per brief):
- Cursor — Hobby / Pro / Business / Enterprise
- GitHub Copilot — Individual / Business / Enterprise
- Claude — Free / Pro / Max / Team / Enterprise / API direct
- ChatGPT — Plus / Team / Enterprise / API direct
- Anthropic API direct
- OpenAI API direct
- Gemini — Pro / Ultra / API
- Windsurf (chosen as the "+1") — Pro / Teams

**Section B — "Your team"**
- Team size: single number input.
- Primary use case: radio pills — Coding / Writing / Data / Research / Mixed.

**Section C — Submit**
- Single black pill "Run my audit" CTA.
- Honeypot field (CSS-hidden) named `website` for bot trap.

**Right rail (desktop only)** — sticky:
- "Estimated monthly spend: $X,XXX" updating live as the user types. Shows immediate value before they submit.

**Persistence:** form state mirrored to `localStorage` on every change. Restored on mount. Cleared on successful submit.

**Submit:** POST to `/api/audit` with payload, navigate to `/audit/[id]`.

### 5.3 Results — `/audit/[id]`

The hero of the entire product. This is the page that gets screenshotted and shared.

**Top — Document header:**
- Mono caption row: "AUDIT REPORT · #A1B2C3 · 07 May 2026 · prepared for [Company name or 'You']"
- Hairline rule below.

**Hero block:**
- Massive Fraunces 700 serif: **"$2,840 / month saved"** (count-up on mount)
- Below in mono muted: "$34,080 saved per year"
- Pill row: "Save report (email)" + "Share" + "Export PDF" (if bonus shipped)

**Executive summary card:**
- Soft cream-elev background, hairline border, no shadow.
- Header: "Executive summary" in caption case (NOT "AI-generated" — see §11.3 for the framing rationale).
- Body: ~100-word AI-generated paragraph from Gemini, or template fallback.
- Skeleton state while loading.

**Itemized findings — the receipt:**
- Mono section header: "FINDINGS"
- One row per tool the user has, in spend-descending order.
- Each row shows:
  - Tool name + plan (Inter 500)
  - Current spend (mono right-aligned)
  - **Recommendation** (one sentence, Inter 400)
  - **Why** (one sentence, Inter 400 muted) — this is where the math goes, e.g., *"Cursor Business at $40/seat × 8 seats = $320/mo. For coding-only use under 80M tokens/mo, Anthropic API direct via Claude Code averages $25/dev = $200/mo. Saves $120/mo."*
  - Savings line (mono green right-aligned)
- Hairline between rows. No card shadows.
- Rows where the recommended action is "no change" appear in muted ink, not green.
- Rows flagging significant overspend get a faint `--alert-tint` background.

**Total row** (after findings):
- Mono "TOTAL SAVED" left, mono green amount right.
- 2px rule above (the "double-underline" from accounting paper).

**Sources footer:**
- Mono caption: "SOURCES"
- Numbered footnotes citing each tool's pricing URL + retrieval date.

**Credex CTA block** (conditional):
- If `monthlySavings > $500`: prominent block. "Most of these savings come from switching providers. Credex sells the same credits at a discount. Talk to us."
- If `monthlySavings < $100` or already optimal: a different block. "You're spending well. Want a check-in next quarter when prices change? Drop your email."
- Never manufacture savings to trigger the high-savings CTA.

**Email gate** (post-results, modal or inline below the audit):
- "Save this report to your inbox." Email + optional company name + role + team size.
- After submit: confirmation, transactional email sent via Resend, Credex disclosure shown for high-savings cases.

### 5.4 Public share — `/a/[slug]`

Identical layout to `/audit/[id]` with these changes:
- Company name redacted as `•••••••`.
- Email never shown.
- "Run your own audit" CTA injected at top.
- Different OG image (dynamic per slug).
- No email gate (already given).

### 5.5 Email confirmation page (post-lead-capture)
Single-page minimal: "Check your inbox. We sent your report to [email]." Plus the share link and a "back to audit" button.

### 5.6 404 / error states
- 404: serif "Page not found." with a return-home pill. Same paper aesthetic.
- API errors on results page: graceful skeleton + "Couldn't load summary, here's the audit anyway" template fallback (§11.5).

---

## 6. Component Inventory

| Component | Variants | Notes |
|---|---|---|
| `Button` | primary (black pill), secondary (outline), ghost | All pill-shaped, 44px min height for a11y |
| `Pill` | label, status | rounded-full, small text |
| `Input` | text, number, email | Underline style on focus, not boxed |
| `Select` | tool, plan | Custom, keyboard-navigable |
| `RadioGroup` | use case | Pill-style options |
| `Card` | elevated, framed | Framed = hairline border. Elevated = white bg + soft shadow (only for hero object). |
| `ReceiptRow` | finding, total | Tabular layout with dotted leader lines |
| `HeroObject` | static, animated | Live HTML "audit document" hero |
| `Skeleton` | text, paragraph | Matches content shape exactly |
| `CountUp` | number | Animates 0 → target, respects reduced-motion |
| `Footnote` | numbered | Mono, with hover-jump to source URL |
| `Toast` | success, error | Bottom-center, dismissible, auto-hide |

---

## 7. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js** (App Router, RSC) | Already initialized. Server Actions for form submit, dynamic OG images, edge-ready. **AGENTS.md note: read `node_modules/next/dist/docs/` before writing code — this Next.js has breaking changes from training data.** |
| Language | **TypeScript strict** | Brief strongly prefers; type the audit engine end-to-end |
| Styling | **Tailwind CSS** + custom CSS for type/color tokens | Tokens defined in `globals.css`, Tailwind theme extended to read them |
| Component primitives | **shadcn/ui** (selected components only) | Don't ship the whole library — pick: Button, Dialog, Input, Select, Toast |
| Fonts | next/font (Fraunces, Inter, JetBrains Mono) | Self-hosted, no FOUT, optimal CLS |
| Motion | **Framer Motion** | Only for count-up + row stagger |
| State | URL state for slug; `localStorage` for form persistence; React `useState` otherwise — no Redux | Simple |
| Backend | **Supabase** (Postgres + RLS) | Free tier, real Postgres, instant API |
| Email | **Resend** | Free tier 3k/mo, great DX, React Email templates |
| LLM | **Gemini 2.5 Flash** via `@google/genai` | Free tier (15 RPM, ~1500 RPD). PII never sent. |
| Rate limiting | **Upstash Redis** (free tier) | IP-keyed, per-route limits |
| Analytics | **Vercel Analytics** + **Vercel Web Vitals** | Free, privacy-respecting, no cookies |
| Tests | **Vitest** (audit engine), **Playwright** (1 smoke) | Fast, ESM-native |
| CI | **GitHub Actions** | lint + typecheck + test on every push to main |
| Hosting | **Vercel** | Native Next.js, free hobby tier, edge OG |

### 7.1 Justification for `ARCHITECTURE.md`
- Next.js: file-system routing, RSC for fast pages, built-in OG image generator, server actions reduce boilerplate.
- Supabase over Firebase: real Postgres = the audit engine can move to a server function querying live data later; Firestore document model would lock us in.
- Gemini over Anthropic: cost. Anthropic was preferred but free credits gated. Documented honestly.
- Tailwind over CSS-in-JS: faster, less runtime, easier to enforce design tokens.

---

## 8. Data Model

### 8.1 Tables

**`audits`**
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| slug | text unique | nanoid(10) for public URL |
| created_at | timestamptz default now() | |
| input | jsonb | Full form payload |
| result | jsonb | Computed audit output |
| ai_summary | text nullable | Filled async |
| total_monthly_savings_usd | numeric | Indexed for sorting / benchmarking |
| total_annual_savings_usd | numeric | |
| user_agent | text nullable | For analytics, no IP |
| ip_hash | text nullable | sha256(ip + salt) for rate limiting only |

**`leads`**
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| audit_id | uuid FK → audits.id | One audit can have at most one lead |
| email | text | Lowercased, validated |
| company | text nullable | |
| role | text nullable | |
| team_size | int nullable | |
| created_at | timestamptz default now() | |
| email_sent_at | timestamptz nullable | When Resend confirmed delivery |
| consultation_requested | bool default false | For high-savings flow |

### 8.2 RLS policies
- `audits`: anyone can SELECT by slug (public). INSERT requires server-side service role (rate-limited at API layer).
- `leads`: SELECT denied to public. INSERT requires service role.
- Service role key never exposed to client; only used server-side.

### 8.3 What gets returned to the public `/a/[slug]` page
From `audits.result` and `audits.input`, the public version strips:
- `input.companyName` (if collected — currently it's only in `leads`)
- Anything in `leads`

---

## 9. Audit Engine

### 9.1 TypeScript interfaces

```ts
type ToolId =
  | 'cursor' | 'copilot' | 'claude' | 'chatgpt'
  | 'anthropic_api' | 'openai_api' | 'gemini' | 'windsurf';

type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed';

interface ToolEntry {
  tool: ToolId;
  plan: string;            // canonical plan id per tool
  monthlySpendUsd: number; // user-entered, source of truth
  seats: number;
}

interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

interface ToolFinding {
  tool: ToolId;
  currentPlan: string;
  currentMonthlyUsd: number;
  recommendedAction: 'keep' | 'downgrade' | 'switch_provider' | 'use_credits';
  recommendedTo?: { tool: ToolId; plan: string; monthlyUsd: number };
  monthlySavingsUsd: number;
  reason: string;       // 1-sentence human reason
  math: string;         // 1-2 sentence numeric reasoning, shown on the receipt
  sourceRefs: number[]; // footnote numbers into PRICING_DATA citations
  confidence: 'high' | 'medium' | 'low';
}

interface AuditResult {
  findings: ToolFinding[];
  totalMonthlySavingsUsd: number;
  totalAnnualSavingsUsd: number;
  tier: 'high' | 'medium' | 'optimal'; // drives CTA block on results page
  sources: { id: number; vendor: string; url: string; retrievedAt: string }[];
}

function runAudit(input: AuditInput): AuditResult;
```

### 9.2 Rule structure
Each tool has a rule module: `lib/audit/rules/<tool>.ts`. Rules are pure functions:

```ts
type RuleFn = (entry: ToolEntry, ctx: AuditContext) => ToolFinding;
```

`ctx` exposes team size, use case, and a `pricing` lookup for cross-tool comparison.

### 9.3 Rules per tool (initial draft — refine on Day 1 with live pricing)

**Cursor:**
- If plan = Business AND seats ≤ 3 AND useCase ≠ 'coding'-heavy → recommend Pro per seat.
- If plan = Pro AND useCase = 'coding' AND seats ≥ 5 → flag potential Anthropic API direct via Claude Code as alternative (citing typical usage tiers).
- If plan = Hobby → keep.

**GitHub Copilot:**
- If plan = Business AND seats ≤ 5 → consider Individual.
- If user has Cursor *and* Copilot AND useCase = 'coding' → flag duplicate spend.

**Claude:**
- If plan = Team AND seats ≤ 2 → recommend Pro × seats.
- If plan = Max AND user spends < $150/mo equivalent on API → keep.
- If plan = API direct AND useCase = 'writing'/'research' AND spend < $100/mo → keep, low waste.

**ChatGPT:**
- If plan = Team AND seats ≤ 2 → recommend Plus × seats.
- If plan = Enterprise AND teamSize < 50 → flag overprovision.

**Anthropic API direct / OpenAI API direct:**
- These are the *substitute* layer. Used as alternatives in other rules.
- Spend threshold checks: if API spend > $500/mo, flag credit purchase via Credex as path.

**Gemini:**
- If plan = Ultra AND useCase ≠ 'research'/'data' → recommend Pro.

**Windsurf:**
- If user has Windsurf + Cursor + Copilot → flag editor-tooling redundancy.

### 9.4 Defensibility — the finance-person test
Every finding's `math` field must:
- Cite the unit price.
- Show the multiplication.
- Show the alternative's unit price.
- Show the delta.

Example acceptable math string:
> *"Cursor Business at $40/seat × 8 seats = $320/mo. For coding-only use, Anthropic API direct via Claude Code averages $25/dev (per Anthropic's published guidance, see source #4) → 8 × $25 = $200/mo. Delta: $120/mo."*

Example unacceptable math string:
> *"You should switch to Claude Code, it's cheaper."*

If the finding can't pass this test, it doesn't ship.

### 9.5 Tier thresholds
- `high`: totalMonthlySavingsUsd ≥ 500 → Credex CTA prominent.
- `medium`: 100 ≤ totalMonthlySavingsUsd < 500 → standard CTA.
- `optimal`: totalMonthlySavingsUsd < 100 → "you're spending well" CTA + notify-me signup.

---

## 10. Pricing Data

### 10.1 Approach
Single file `PRICING_DATA.md` at repo root. Format per the brief:

```md
## Cursor
- Hobby: $0 — https://cursor.sh/pricing — verified 2026-05-07
- Pro: $20/user/month — https://cursor.sh/pricing — verified 2026-05-07
- Business: $40/user/month — https://cursor.sh/pricing — verified 2026-05-07
- Enterprise: contact sales — https://cursor.sh/pricing — verified 2026-05-07
```

Mirror this data into a typed `lib/pricing/data.ts` so the engine reads typed constants, not parsed markdown.

### 10.2 Refresh cadence
- Day 1: pull all prices, write `PRICING_DATA.md`, populate `data.ts`.
- Day 5 morning: re-verify every URL, update any changed prices.

### 10.3 What to capture per plan
- Vendor + plan name + monthly USD price + seat-based or flat + URL + retrieval date.
- Plus relevant usage limits (Claude Pro msg quota, ChatGPT Plus token budget) — used by rules.

---

## 11. AI Integration

### 11.1 Provider
**Google Gemini** via `@google/genai` SDK. Model: `gemini-2.5-flash`. Server-side only (`/api/summary`). Key in env, never client-exposed.

### 11.2 Rate limits and cost
Free tier limits: 15 RPM, ~1500 requests/day, 1M tokens/min. We bake in:
- App-level rate limit (Upstash) at 1 summary per IP per 60s.
- A circuit breaker: if Gemini returns 429 three times in a 5-minute window, flip to template fallback for the next 10 minutes.

### 11.3 Framing decision: do NOT label the summary "AI-generated"
The summary card header reads **"Executive summary"**, not "AI insight ✨." Three reasons:
1. Trust: founders trust an audit that *looks* like a CFO wrote it. Sparkles undermine the document framing.
2. Brief alignment: the brief explicitly tests "knowing when not to use AI" — over-celebrating AI in the UI is the wrong signal.
3. Honesty: a small `Generated` caption with hover tooltip discloses AI use without making it the headline.

This is a deliberate, testable choice. Document in `REFLECTION.md` Q4.

### 11.4 PII redaction
Free-tier Gemini may train on prompts. Therefore:
- **Never send** to Gemini: email, company name, role, IP, audit slug.
- **Send only:** tool list (anonymized to `tool/plan/seat-count`), team size, use case, computed savings tier.
- Document in `PROMPTS.md` as a deliberate privacy decision.

### 11.5 Prompt + fallback templates
Full prompt lives in `PROMPTS.md` (also reproduced in code). Outline:

```
SYSTEM: You are a finance-literate analyst writing the executive summary of an
AI-spend audit for a startup founder. Tone: direct, helpful, slightly dry. No
buzzwords. No emojis. Reference the user's actual numbers. ~100 words. Output
plain text only, no markdown.

USER: <JSON of redacted findings + totals + tier>
```

Template fallback (used when Gemini fails or rate-limited) — three variants by tier:
- **High-savings:** "Your stack is leaking ~$XXX a month..."
- **Medium-savings:** "There's $XXX/mo of straightforward savings here..."
- **Optimal:** "You're spending well. The plans you're on are appropriate for your usage..."

Each template interpolates real numbers from the audit. They should read as well as the AI version on a tired day.

---

## 12. Lead Capture

### 12.1 Timing
**After value is shown, never before.** The audit renders fully on `/audit/[id]`. The email gate appears as a card *below* the fold, plus a sticky pill prompt after 30s of dwell.

### 12.2 Fields
- Email (required, validated)
- Company name (optional)
- Role (optional, dropdown: Founder/CEO, Eng Manager, CTO/VP, IC, Other)
- Team size (optional, prefilled from form)

### 12.3 Email
- Provider: **Resend**.
- Template: React Email, subject "Your AI spend audit — $X,XXX/mo identified", body recaps top 3 findings + link to public share + Credex disclosure for high-savings cases.
- Sent server-side from `/api/lead`, awaited before responding to client (so we can confirm delivery).

### 12.4 Abuse protection
**Stack: Upstash rate limit + honeypot field.**
- Upstash: 5 audits per IP per hour, 3 emails per IP per hour.
- Honeypot: hidden `website` field; non-empty submissions silently 200 with no DB write.
- No CAPTCHA in v1 (friction). Document the trade-off in `DEVLOG.md`.

---

## 13. Sharing

### 13.1 Slug
`nanoid(10)`, URL-safe. Stored on `audits.slug`. `/a/[slug]` resolves the public view.

### 13.2 Public vs private fields
| Field | Public `/a/[slug]` | Private `/audit/[id]` |
|---|---|---|
| Tool list, plans, seats | ✅ | ✅ |
| Findings, math, sources | ✅ | ✅ |
| Total savings | ✅ | ✅ |
| AI summary | ✅ | ✅ |
| Company name | ❌ (`•••••••`) | ✅ |
| Email | ❌ | ✅ (only in confirmation banner) |

### 13.3 OG image
Dynamic per slug via `app/a/[slug]/opengraph-image.tsx`. See §3.8 for design.

### 13.4 Twitter card
`summary_large_image` with same dynamic image.

---

## 14. Accessibility & Performance Budget

### 14.1 Lighthouse mobile targets (brief requires)
- Performance ≥ 85
- Accessibility ≥ 90
- Best Practices ≥ 90
- SEO ≥ 90 (not required but free)

### 14.2 A11y requirements
- All interactive elements ≥ 44×44px hit target.
- Focus visible — branded focus ring `outline: 2px solid var(--green); outline-offset: 2px`.
- Color contrast: ink on bg = 16:1 ✅, muted on bg = 7:1 ✅. Verify any new color additions.
- Form inputs have associated labels (not just placeholders).
- Errors announced via `aria-live="polite"`.
- Modal traps focus, ESC closes.
- Skip-to-content link for keyboard users.
- `prefers-reduced-motion` respected for all animations.
- Logical heading order (one h1, h2 per section).
- Icons have `aria-label` or are `aria-hidden`.
- Screen-reader-only labels for icon buttons.

### 14.3 Performance tactics
- next/font for self-hosted Fraunces/Inter/JBM, `display: swap`, single weight axis variable fonts.
- Hero "object" is HTML (no image asset).
- Tool logos are inline SVG, not PNG.
- No client JS on pages that don't need it (RSC by default).
- Images use `next/image` with explicit width/height (no CLS).
- `<link rel="preconnect">` to Supabase, Resend, Gemini.
- No third-party analytics beyond Vercel Analytics (cookieless).

---

## 15. Testing Strategy

### 15.1 Vitest unit (audit engine — minimum 5, target 10+)
1. **`engine.solo.test.ts`** — 1-person team, Cursor Pro + Claude Pro → expects "keep" on both, low savings tier.
2. **`engine.cursor-business-overprovision.test.ts`** — Cursor Business with 2 seats coding-only → expects downgrade to Pro × 2.
3. **`engine.chatgpt-team-overkill.test.ts`** — ChatGPT Team for 2 users → expects Plus × 2 recommendation.
4. **`engine.duplicate-coding-tools.test.ts`** — User has Cursor + Copilot + Windsurf → expects redundancy flag.
5. **`engine.optimal.test.ts`** — Already-optimal stack → totalSavings < $100, tier = 'optimal'.
6. **`engine.high-savings-tier.test.ts`** — Stack with > $500/mo savings → tier = 'high'.
7. **`engine.api-spend-credits.test.ts`** — $1500/mo OpenAI API → flag credit purchase route.
8. **`engine.team-size-mismatch.test.ts`** — Plan seats > teamSize → flag overprovision.
9. **`engine.zero-tools.test.ts`** — Empty input → graceful zero-result, not an error.
10. **`engine.math-strings.test.ts`** — Every finding has a non-empty `math` field with a `$` and a multiplication.

### 15.2 Playwright smoke (1 happy path)
- Visit `/`, click CTA, fill form with a known stack, submit, assert results page renders savings number > 0, assert summary card appears (template fallback ok), submit email, assert success toast.

### 15.3 Visual sanity
- Manual screenshot compare on desktop + mobile after each major UI change.
- No tooling required for v1.

### 15.4 CI gating
GH Actions workflow runs on every push:
1. `pnpm install --frozen-lockfile`
2. `pnpm typecheck` (tsc --noEmit)
3. `pnpm lint`
4. `pnpm test` (Vitest)
5. (optional) Playwright smoke against `pnpm build && pnpm start`

Branch protection: require green CI before merging to main.

---

## 16. CI/CD

### 16.1 GH Actions (`.github/workflows/ci.yml`)
- Triggers: push to main, PRs to main.
- Node 22.x, pnpm via corepack.
- Cache pnpm store + Next build cache.
- Runs typecheck → lint → test → build.

### 16.2 Vercel
- Connected to GitHub repo, deploys main → production, all branches → preview.
- Env vars set in Vercel dashboard:
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `RESEND_API_KEY`
  - `GEMINI_API_KEY`
  - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - `APP_URL` (for OG image absolute URLs)

### 16.3 No secrets in repo
`.env.example` checked in with empty placeholders + comments. `.env.local` gitignored. Vercel envs configured via dashboard, not CLI from a dev machine. Document in README.

---

## 17. 5-Day Plan

### Day 1 — Spine (8h target)
**Goal:** the engine works correctly before any pixel is polished.
- [ ] Read `node_modules/next/dist/docs/` for App Router specifics (per AGENTS.md).
- [ ] Tailwind config; install Fraunces/Inter/JBM via next/font; commit color tokens to globals.css.
- [ ] `lib/pricing/data.ts` populated from live vendor pricing pages.
- [ ] `PRICING_DATA.md` written with citations.
- [ ] `lib/audit/` engine implemented per §9. Pure functions, no I/O.
- [ ] Vitest configured. ≥5 tests passing.
- [ ] GH Actions CI workflow: typecheck + lint + test green.
- [ ] Bare-bones landing page (just headline + CTA) — user deploys.
- [ ] DEVLOG entry #1.
- [ ] *(deferred to user)* User-interview outreach.

**Done when:** local `pnpm test` green, audit engine returns correct results for the test scenarios, landing page renders locally, DEVLOG #1 committed.

### Day 2 — UI day (8h target)
**Goal:** the form and results page look like the real product on mobile.
- [ ] Landing page hero: Fraunces headline, hero "audit object" rendered as live HTML.
- [ ] Sample audit section on landing.
- [ ] `/audit/new` form: all sections, all tools, plan dropdowns, localStorage persistence, sticky right rail.
- [ ] `/audit/[id]` results page rendering full audit from Supabase (or in-memory for now).
- [ ] Receipt component, hero savings count-up, skeleton states.
- [ ] Mobile pass — test at 375px wide.
- [ ] Lighthouse pre-check on deployed preview.
- [ ] DEVLOG entry #2.
- [ ] Conduct user interview #1 if scheduled.

**Done when:** end-to-end click-through works on the deployed preview using a real input, even if save-to-DB is not yet wired.

### Day 3 — Backend (8h target)
**Goal:** real persistence, real email, real share URLs, real AI.
- [ ] Supabase project, schema, RLS per §8.
- [ ] `/api/audit` server action persisting input + result, returning id + slug.
- [ ] `/api/summary` calling Gemini server-side, with PII redacted.
- [ ] Template fallback (§11.5) with three tier variants.
- [ ] `/api/lead` capturing email, sending Resend transactional email.
- [ ] `/a/[slug]` public redacted view.
- [ ] `opengraph-image.tsx` for both `/audit/[id]` and `/a/[slug]`.
- [ ] Upstash rate limiting on all three API routes.
- [ ] Honeypot field.
- [ ] DEVLOG entry #3.
- [ ] Conduct user interview #2.

**Done when:** running an audit, receiving the email, and opening the share URL on a different browser all work on production.

### Day 4 — Polish + bonus + half the docs (8h target)
**Goal:** Lighthouse scores hit, one bonus shipped, four entrepreneurial docs drafted.
- [ ] Lighthouse pass — Perf ≥85, A11y ≥90, BP ≥90 on mobile.
- [ ] **Bonus pick: Benchmark mode.** "Your AI spend per developer is $X — companies your size average $Y." Cite source(s) honestly.
- [ ] `GTM.md` (300–700 words). Specific channels, real subreddits/communities, the unfair-distribution-channel angle.
- [ ] `ECONOMICS.md` (300–700 words). Lead value, CAC per channel, conversion math, $1M-ARR-in-18-months scenario.
- [ ] `METRICS.md` (200–500 words). North Star + 3 inputs + first-instrumentation + pivot trigger.
- [ ] `LANDING_COPY.md`. Hero headline ≤10 words, sub ≤25, CTA, mocked social proof, 5 FAQs.
- [ ] DEVLOG entry #4.
- [ ] Conduct user interview #3.

**Done when:** lighthouse green, benchmark feature live, four entrepreneurial docs at first-draft quality.

### Day 5 — Writing day + final polish (6h target)
**Goal:** every required deliverable file is final-draft. Submission-ready.
- [ ] `USER_INTERVIEWS.md` from real notes, three entries, each with quotes + surprise + design impact.
- [ ] `REFLECTION.md` — answer all 5 honestly. The one about a reversed mid-week decision is real (the FT-aesthetic → Apple-premium pivot is one).
- [ ] `ARCHITECTURE.md` with Mermaid diagram + 10k-audits/day section.
- [ ] `README.md`: 2–3 sentence summary, 3+ screenshots, Quick start, Decisions section (5 trade-offs), deploy URL.
- [ ] `TESTS.md`: list every test, what it covers, how to run.
- [ ] `PROMPTS.md`: full prompt, why this shape, what didn't work.
- [ ] Final pricing URL re-verification — update `PRICING_DATA.md` retrieval dates.
- [ ] Final deploy. Smoke-test on a stranger's phone.
- [ ] DEVLOG entry #5.
- [ ] Submit.

**Done when:** the Google Form is filled with all four items, every required file is present, CI is green on the latest commit.

### DEVLOG entries for non-working days
Per §17 honesty rule, write 2 zero-hour entries with real reasons for the days not worked. Honesty scores higher than fake.

---

## 18. Required Deliverable Files (full checklist from brief)

| File | Status | Owner section |
|---|---|---|
| `README.md` | ⬜ | §17 Day 5 |
| `ARCHITECTURE.md` | ⬜ | §17 Day 5 |
| `DEVLOG.md` | ⬜ daily | §17 every day |
| `REFLECTION.md` | ⬜ | §17 Day 5 |
| `TESTS.md` | ⬜ | §17 Day 5 |
| `PRICING_DATA.md` | ⬜ | §10, Day 1 + Day 5 verify |
| `PROMPTS.md` | ⬜ | §11 + Day 5 |
| `GTM.md` | ⬜ | §17 Day 4 |
| `ECONOMICS.md` | ⬜ | §17 Day 4 |
| `USER_INTERVIEWS.md` | ⬜ | Day 5 (interviews on Days 2/3/4) |
| `LANDING_COPY.md` | ⬜ | §17 Day 4 |
| `METRICS.md` | ⬜ | §17 Day 4 |
| `.github/workflows/ci.yml` | ⬜ | §16, Day 1 |
| Live deployed URL | ⬜ | Day 1 (skeleton) → Day 5 (final) |
| Public GitHub repo | ⬜ | Day 1 |

---

## 19. Rubric Map (how each weight is earned)

| Dimension | Weight | How we earn it |
|---|---|---|
| Entrepreneurial thinking | 25 | Specific, weird GTM channels (§Day 4). Real interview surprises (§Day 5). Defensible economics with numbers. Landing copy that doesn't read AI-generated. |
| Engineering skills | 15 | Green CI (§16), 10+ tests (§15), deployed and reachable, a11y considered (§14). Conventional commits, ≥5 distinct commit days. |
| Thinking models | 15 | ARCHITECTURE depth (mermaid + 10k/day section). REFLECTION specificity (real reversed decision: FT→Apple pivot). README Decisions section with 5 real trade-offs. |
| Programming skills | 15 | Pure-function audit engine (§9). Typed end-to-end. Sensible component inventory (§6). Server actions over hand-rolled APIs where they fit. |
| Hard work | 10 | All 6 MVP features ship. Bonus benchmark feature shipped. Polish pass on Day 4. |
| Discipline & consistency | 10 | DEVLOG with 7 entries (5 working + 2 honest zero-hour). Commits across 5+ days. |
| Audit-logic polish | 10 | Every finding's `math` field passes the finance-person test (§9.4). Sources footnoted. |

---

## 20. Decisions Log

| Date | Decision | Why |
|---|---|---|
| 2026-05-07 | Stack: Next.js + Supabase + Gemini + Resend + Vercel | Free-tier-friendly, fast to ship, RSC + native OG fits the document aesthetic |
| 2026-05-07 | ~~Name: Receipt~~ → **Name: Basis** | User picked Basis. Stronger financial DNA ("basis points," "cost basis"), reads like real B2B fintech, not gimmicky. |
| 2026-05-07 | Deadline locked: 2026-05-13 | User confirmed; 6 calendar days available, 5 working. |
| 2026-05-07 | Design pivot: FT-printed-newspaper → Apple-premium | User reference images (Haven, Skot) point at confident-large-typography + photographed-product hero. Editorial substance kept on the audit page; landing surface goes Apple-premium. |
| 2026-05-07 | LLM: Gemini 2.5 Flash, free tier | Anthropic free credits not available; brief allows "any LLM" |
| 2026-05-07 | AI summary framed as "Executive summary," not "AI-generated ✨" | Trust framing; brief tests "knowing when not to use AI" |
| 2026-05-07 | PII redacted before any Gemini call | Free-tier may train on prompts |
| 2026-05-07 | Single page form, not multi-step wizard | Conversion + form persistence simpler |
| 2026-05-07 | Bonus pick: Benchmark mode (over PDF, widget, referrals) | Highest-leverage on-results-page enhancement; ties into Mint-for-AI-spend positioning |
| 2026-05-07 | Abuse protection: Upstash rate limit + honeypot, no CAPTCHA | Friction trade-off; document in DEVLOG |
| 2026-05-07 | Dark mode deferred to post-submission | Tokens are CSS custom properties so it's a future swap, not a refactor |
| 2026-05-07 | Deployment owned by user | Claude builds and tests locally; user pushes to Vercel/their host |

Add new entries as decisions are made. Never delete past entries — strikethrough if reversed.

---

## 21. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| User interviews don't materialize | Medium | High (instant reject if faked) | Send DMs Day 1 morning. If by Day 3 only 1 booked, escalate to user — fall back to clearly-labelled internal stakeholder convos with founder friends. |
| Pricing changes mid-week | Low | Medium | Re-verify all URLs Day 5 morning. Document retrieval dates per row. |
| Gemini rate limit hit during demo | Low | Low | Template fallback is genuinely good (§11.5). Circuit breaker. |
| Lighthouse perf score < 85 | Medium | Medium | Self-hosted variable fonts, RSC by default, no client JS where unnecessary. Day 4 is the dedicated pass. |
| Next.js App Router gotchas (per AGENTS.md) | Medium | Medium | Read `node_modules/next/dist/docs/` Day 1 before writing routes. Don't trust training-data assumptions about Next. |
| Scope creep on bonus features | High | Medium | Pick ONE bonus (benchmark). Reject all others until MVP + entrepreneurial docs are at submission quality. |
| DEVLOG looks backdated | Low | High (rejection signal) | Commit DEVLOG entry every day, end of day, in its own commit. Backdating is detectable from git history. |

---

## 22. Open Questions (resolve before Day 1)

- [ ] Confirm name "Receipt" with user, or pick alternative.
- [ ] Confirm exact deadline (release date + 7 days).
- [ ] Confirm whether to ship dark mode in v1 or defer to bonus.
- [ ] Confirm bonus pick: Benchmark mode (recommended) vs PDF export.
- [ ] Get user's GitHub username for repo + Vercel team for deploy.
- [ ] Confirm calendar of working days vs zero-hour days for the 7-day window.

---

## 23. Working agreement (how Claude operates on this project)

- **brain.md is the source of truth.** Every PR, commit message, or design decision can cite a section number from this file.
- **Update brain.md when reality differs.** Stale source-of-truth is worse than no source-of-truth.
- **Read `node_modules/next/dist/docs/` before writing Next-specific code** (per AGENTS.md).
- **Commit DEVLOG every day, in its own commit.** Backdating is detectable.
- **Don't add features not in this file.** If something becomes necessary, add it here first, *then* implement.
- **Every audit finding ships with `math`.** No exceptions. The finance-person test is the gate.
- **Never send PII to Gemini.** Audit any change to `/api/summary` against §11.4.
- **Honesty in the DEVLOG and REFLECTION is graded higher than polish.** Don't fabricate.

---

*End of brain.md. Update timestamp + status (§0) on every significant edit.*
