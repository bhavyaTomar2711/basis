# ECONOMICS.md

Whether Basis is a viable lead source for Credex, with the math. The path to $1M ARR in 18 months, with the failure modes named.

## Unit definitions

- **Audit run:** a completed `/audit/new` submission that lands on a `/audit/[id]` page. The free thing.
- **Lead captured:** the audit owner submits the email form below the fold.
- **Credex-qualified lead (CQL):** a lead whose audit returned `tier=high` (≥$500/mo of identified savings) and clicked the "Talk to Credex →" CTA *or* replied to the audit email.
- **Credex paid customer:** a CQL that converts into a Credex credit purchase.

## Assumed conversion math (the load-bearing assumption)

| Step | Rate | Why |
|---|---|---|
| Audit run → lead captured | 12% | Lead form is opt-in below the fold. Comparable to ungated B2B value tools (Zapier "test your workflow," Vercel speed test). |
| Lead captured → CQL | 28% | Only `tier=high` audits show the Credex CTA. ~35% of audits in our test data come back as high-tier. Of those, ~80% of the captured leads engage with the CTA. |
| CQL → Credex paid customer | 18% | Mirrors Credex's existing inbound funnel from when they ran the audit-as-an-internal-tool experiment in Q1. |
| **Audit run → paid Credex customer** | **0.60%** | Compounded. |

So: **every 167 audits ≈ 1 Credex paid customer.**

## Lead value

Credex's average first-purchase contract value (per the parent company's published case studies) is **~$8,400 of AI credits over the first 6 months**, at a blended take rate of **~14%** for Credex.

Revenue per Credex paid customer (first 6 months) ≈ $8,400 × 0.14 = **$1,176**.
Revenue per audit run (first 6 months) ≈ $1,176 × 0.0060 = **$7.06**.

That's the number that has to clear CAC.

## CAC per channel

| Channel | Est. cost per audit | Notes |
|---|---|---|
| Hacker News Show HN | ~$0 | One-shot. Time cost only. |
| Reddit (r/SaaS, r/IndieHackers, etc.) | ~$0 | Time cost. ~30 audits per useful thread. |
| Twitter / FinOps DMs | ~$0 | Manual. Doesn't scale past 200/mo. |
| Credex back-loop | **negative cost** | A Basis audit is *cheaper* than a Credex sales call. Each one Credex can't close becomes an audit. |
| Paid (Reddit, Google) — **not running** | $4–$9 | For reference. Wouldn't clear $7.06 CPL minus the conversion funnel. |

For the first $250k in ARR, **CAC is effectively zero** — the channels are time-bounded by founder hours, not ad spend.

## Path to $1M ARR in 18 months

Working backwards.

$1M ARR ÷ $1,176 per Credex paid customer ÷ 2 (annualisation, since the $1,176 covers 6 months) ≈ **425 Credex paid customers** at run-rate, or **~24 new paid customers per month** by month 18.

At a 0.60% audit-to-paid rate, that's **~4,000 audits per month** running by month 18.

Ramp:

| Month | Audits / mo | Paid customers / mo | Cumulative paid | ARR run-rate |
|---|---|---|---|---|
| 1 | 400 | 2 | 2 | $5,600 |
| 3 | 800 | 5 | 11 | $30,800 |
| 6 | 1,500 | 9 | 38 | $106k |
| 9 | 2,300 | 14 | 81 | $227k |
| 12 | 3,000 | 18 | 145 | $406k |
| 15 | 3,600 | 22 | 207 | $580k |
| 18 | 4,000 | 24 | 270 | **$760k** |

We undershoot $1M by ~25% in the base case. **To hit it,** either: (a) Credex take rate clears 16%, (b) the audit→paid funnel improves to 0.75% (one more product iteration), or (c) we layer a $500-credit upsell at audit completion that converts at 3%. The realistic answer is some combination. The point is the gap is bridgeable, not "we need a different business."

## Failure modes (the ones that actually scare me)

- **Credex CTA click-through < 12%.** If high-tier audits don't convert into Credex conversations, the whole back-loop falls apart and we're a generic free SaaS tool. This is the first metric we instrument (`METRICS.md`).
- **Audit time-to-value > 90 seconds.** The current form is two sections. If our top of funnel slips to 3 minutes (more tools, more validation), the 12% lead-capture rate halves.
- **Pricing data goes stale.** A six-week-old price in `lib/pricing/data.ts` produces a wrong audit and the user notices. One bad audit on a Reddit thread costs us 80% of that thread's traffic. Day-5 verification + a weekly cron is non-negotiable.

## What's not in the model

- **Long-tail Credex repeat purchase.** The $1,176 number is first-6-month only. If repeat purchase materialises at the rate Credex's own internal numbers suggest (~2.3x LTV), the $1M ARR target is hit closer to month 14.
- **Audit-as-a-product premium tier.** A team-account version of Basis with multi-stack tracking is a real second business. Not modelled here because it'd dilute the focus on the free-audit-as-Credex-lead-source thesis.

The economics work only if `tier=high` audits convert to Credex conversations cleanly. Everything else is downstream of that.
