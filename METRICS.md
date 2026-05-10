# METRICS.md

What I instrument first, why those three numbers and not others, and the threshold that triggers a re-think.

## North Star

**$ of identified monthly savings, summed across all `tier=high` audits in the trailing 30 days, that converted into a Credex conversation.**

Why this and not "audits per month": volume is a vanity metric for a tool that exists to feed Credex leads. A week of 2,000 low-tier audits that surface "you're spending well" is structurally less valuable than a week of 300 high-tier audits that translate into Credex demos. The North Star has to encode the *conversion-weighted savings throughput*, not raw audit count.

## Three inputs

The North Star can move for exactly three reasons. We instrument each:

1. **Weekly audits run.** Plain count of `audits.created_at` rows. Covers the top of funnel — proxy for distribution working. Watching for: week-over-week growth ≥ 15% during the first 8 weeks.
2. **Lead-capture conversion rate.** `leads.audit_id` ÷ `audits.id` over the same 7-day window, only counting audits whose tier was `high` or `medium`. Watching for: ≥ 12%. Below 8% and the lead form copy is wrong — A/B test the headline.
3. **High-tier → Credex referral rate.** Of all leads where the underlying audit was `tier=high`, what % clicked the `Talk to Credex →` CTA or replied to the email. Watching for: ≥ 15%. Below 8% and the *audit itself* is wrong — the CTA isn't credible, or the savings number isn't believable enough to drive an action.

If all three are healthy, the North Star takes care of itself. If one is broken, only one of three things is the issue, which makes diagnosis fast.

## First instrumentation

Day 4 ships **Vercel Web Analytics** (cookieless, zero-config, no `next/script` overhead) for page-level traffic + the existing Supabase rows as the durable event log. No PostHog, no Segment, no Amplitude in v1 — the three inputs above are derivable from `audits` + `leads` plus a single `cta_clicked` column we'll add to `leads` next week.

Specifically:
- Audit runs: `select count(*) from audits where created_at > now() - interval '7 days'`.
- Lead-capture rate: `select count(*) filter (where audit_id is not null) / count(*) from audits ...` with a join to `leads`.
- Credex referral rate: `count(*) filter (where cta_clicked) / count(*) from leads ...`. The `cta_clicked` column gets set by a fire-and-forget POST from the Credex CTA button on `/audit/[id]`.

A weekly cron writes the three numbers to a single `metrics_weekly` table. The dashboard is a Notion page with four rows. The simplest thing that could possibly work, until it can't.

## Pivot trigger

Through end of month 2, if **any of the three inputs sits below 50% of its threshold for two consecutive weeks**, that's the signal to re-think — not adjust copy, but question the structure.

Concretely:
- < 50 audits in week 8: distribution thesis is wrong. Pause the build, talk to 5 founders, find out why they didn't run an audit when shown one.
- < 4% lead capture: the audit itself isn't credible enough to want a copy of. The math column, the sources, *something* is failing the trust check. Triage which.
- < 4% Credex referral rate from high-tier audits: the back-loop is broken. Basis is then a useful tool, but not a Credex lead source — and the entire `ECONOMICS.md` thesis falls apart. At that point, the choices are (a) make Basis a paid standalone product, or (b) sunset.

The pivot trigger isn't "if growth is slow" — slow growth is normal, especially in the Reddit-and-DM-driven first 8 weeks. It's specifically *structural failure of one of the three load-bearing rates*. That's what justifies questioning the strategy, not the volume.

## Metrics we deliberately don't track

- **Session duration / scroll depth** on the audit page. Not actionable. A user who skims for 30 seconds and copies the share URL is equally valuable to one who reads for 5 minutes.
- **Bounce rate on `/`.** The landing page is a conversion funnel, not a content page. Bounce is the wrong abstraction.
- **NPS.** No quarterly survey. The signal we care about — would a founder paste the audit in their CFO Slack — is observable from share-URL traffic, not from a "0-10 how likely are you to recommend" prompt.

Three numbers. One triage path. One pivot trigger. That's the v1 dashboard.
