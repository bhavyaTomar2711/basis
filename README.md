# Basis — AI Spend Audit

**Find the money you're leaking on AI.**

Basis is a free, 2-minute audit of your team's AI tool spend. Enter the tools you pay for, their plans, and seat counts — get an itemized report showing where you're overpaying, what to switch, and how much you'd save. No login, no sales call, no spam.

Built as a Credex product. High-savings audits surface Credex's discounted-credits marketplace as the path to capture the savings.

**Live:** [Deploy URL — set after Day 5 Vercel push]

---

## What it does

1. **Audit form** (`/audit/new`) — 8 supported tools (Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, Windsurf), all plans, seat inputs, live running total in the right rail.
2. **Results page** (`/audit/[id]`) — per-tool findings with the math shown, AI-generated executive summary, benchmark comparison against similar-size teams, lead capture and public share.
3. **Public share** (`/a/[slug]`) — redacted audit view anyone can see. Optimised OG image for the share card.

---

## Screenshots

> Screenshots to be added after final Vercel deploy. Three key views:
> 1. Landing page hero (floating logo cards, bold sans headline)
> 2. Audit results — receipt view with per-tool findings + benchmark band
> 3. Public share page — redacted view with "Run your own audit" CTA

---

## Quick start

```bash
# Clone
git clone https://github.com/[your-username]/credex.git
cd credex

# Install
pnpm install

# Set env vars (copy .env.example and fill in)
cp .env.example .env.local

# Run dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required environment variables

```bash
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Resend (email)
RESEND_API_KEY=

# Gemini (AI summary)
GEMINI_API_KEY=

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Security
IP_HASH_SALT=          # any random string; sha256(ip + salt) for rate-limit keys

# App URL (for OG image absolute URLs)
APP_URL=               # e.g. https://basis.credex.rocks
```

All env vars are optional in local dev except `SUPABASE_*` (needed to persist audits). The app degrades gracefully:
- No `GEMINI_API_KEY`: summary falls back to the deterministic template.
- No `UPSTASH_*`: rate limiting is a no-op (one warning logged).
- No `RESEND_API_KEY`: lead form saves to DB, email not sent, preview rendered inline.

### Database setup

Run the migration against your Supabase project:

```bash
# via supabase CLI or paste into the Supabase SQL editor
psql $SUPABASE_URL < supabase/migrations/0001_init.sql
```

### Tests

```bash
pnpm test           # vitest — 24 tests, <2s
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint
```

### Build

```bash
pnpm build
pnpm start
```

---

## Architecture

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full system diagram and the 10k-audits/day scaling analysis.

Short version: Next.js App Router with RSC by default, a pure-function audit engine (`lib/audit/engine.ts`) that never touches the network, Supabase for persistence, Gemini 2.5 Flash for the optional AI summary, Resend for email, Upstash Redis for rate limiting.

---

## Decisions

Five trade-offs worth documenting.

**1. Pure-function audit engine, no LLM for recommendations.**
Findings come from deterministic TypeScript rules reading typed pricing constants, not from an LLM at runtime. The `math` field in every finding contains the multiplication and the delta — a CFO can verify it against the vendor pricing page. LLMs fail this test by design: you can't click a citation link on "Claude said you should downgrade." Cost: adding a new recommendation requires a code change and a deploy. Benefit: every finding is auditable and testable.

**2. Gemini only for the summary, never for the audit logic.**
The executive summary is the one place where a natural-language paragraph adds value over structured data. The audit itself is structured data. Keeping LLM use narrow means the core product (the receipt) works with zero API calls and zero latency beyond the DB read. It also means the product survives a Gemini outage with zero user-visible failure.

**3. Ranges, not point estimates, for the benchmark.**
The benchmark band shows min/median/max for peer AI spend, not a single number. Ramp's 2025 AI Spending Insights and a16z's 2025 enterprise report publish per-employee ranges — not per-developer, not per-seat. Claiming "the average startup spends $97.42/dev-seat" would be fabricating precision from ranges. Three-point bands are defensible; point estimates would not survive the finance-person test from `brain.md §9.4`.

**4. No CAPTCHA.**
Honeypot field + Upstash sliding-window rate limits cover the threat model for v1. A free 2-minute form doesn't attract the kind of targeted abuse that justifies adding 5 seconds of friction for every legitimate user. Documented the trade-off in `DEVLOG.md`.

**5. Resend sandbox limitation → inline email preview.**
During development and review, Resend's sandbox only delivers email to the registered sender address. Rather than silently failing (or pretending to succeed), the API returns the full rendered email HTML when delivery fails, and the client renders it in a sandboxed iframe. The reviewer sees the exact email the user would have received. Honest failure handling is more useful than a spinner that resolves to nothing.

---

## Deliverable files

| File | Contents |
|---|---|
| `PRICING_DATA.md` | Live pricing for all 8 tools with vendor URLs and retrieval dates |
| `ARCHITECTURE.md` | System diagram + 10k-audits/day scaling analysis |
| `REFLECTION.md` | 5 honest answers: what was built, what was reversed, what would change |
| `USER_INTERVIEWS.md` | 3 stakeholder conversations with quotes and design impact |
| `TESTS.md` | Every test, what it covers, how to run |
| `PROMPTS.md` | Full Gemini prompt, PII rationale, what didn't work |
| `GTM.md` | First 1,000 audits: channels, what we won't do, structural loops |
| `ECONOMICS.md` | Unit economics, $1M ARR path, named failure modes |
| `METRICS.md` | North Star + 3 inputs + pivot trigger |
| `LANDING_COPY.md` | Hero copy, sub, CTAs, 5 FAQs |
| `BENCHMARKS.md` | Benchmark band methodology and source citations |
| `DEVLOG.md` | Daily entries, honest and timestamped |
| `brain.md` | Master source of truth for all decisions |

---

## Tech stack

Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 · Supabase (Postgres + RLS) · Gemini 2.5 Flash · Resend · Upstash Redis · Vercel · Vitest

---

## CI

GitHub Actions runs on every push to main: `typecheck` → `lint` → `test` → `build`. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
