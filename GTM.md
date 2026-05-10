# GTM.md

How Basis acquires its first 1,000 audits, and what makes any of these channels durable rather than one-shot.

## The unfair channel: Basis is downstream of Credex

Most AI-cost tools have a cold-start problem — the audience has to be built. Basis doesn't. Credex (parent) already sells AI credits at a discount and talks to the exact buyer Basis is built for: a finance-aware founder or eng-manager looking at a Cursor / Claude / ChatGPT bill that doubled in a quarter. Every Credex conversation that *doesn't* close (price too high, wrong tier, "we'll think about it") becomes a Basis audit — a free, useful artifact the prospect can paste into a Slack thread with their CFO. That's not just a lead, it's an **excuse to follow up** with the same prospect six weeks later when they're actually budgeting.

The reverse loop matters more. A Basis audit that surfaces a high-savings tier (≥$500/mo) ends with a "Talk to Credex →" CTA. ~30% of those, conservatively, are warm enough to schedule a call. Basis becomes a top-of-funnel asset for Credex without Credex having to write content marketing it doesn't believe in.

This is the channel competitors can't copy: a free audit tool is easy to clone, a free audit tool that hands warm leads to a deeply technical credit marketplace with real LP relationships is not.

## Where the first 1,000 audits come from

I'd order channels by *cost per audit* and *defensibility*, not by *volume*.

1. **r/EntrepreneurRideAlong, r/SaaS, r/startups, r/IndieHackers.** These exact subreddits index for "AI cost," "Cursor Business pricing," "Claude Team worth it." Post the live deploy URL inside answers to existing threads — not as a top-level promo. Cost ≈ time. ~30 audits per useful thread. Repeatable for ~8 weeks before the channel saturates.
2. **Hacker News Show HN.** One shot, timed for Tuesday 10am PT. Title: "Show HN: Basis — show me the $X I'm overpaying on Cursor + Claude." If the deploy is fast and the OG card is clean, ~500–1500 audits in 48h. One-shot, not repeatable. The OG image is built for this.
3. **The CFO Twitter / FinOps subgraph.** Specifically the small cluster around Vendr, Sastrify, Tropic, Cledara accounts + a few well-known fractional CFOs (the @sammylevin / @TraceCohen tier). Direct quote-tweet of a public Cursor / Claude pricing change with "Basis says here's what this costs your team specifically: [link]." 3–5 placements over 30 days. The audience is small but the LTV is right.
4. **YC Bookface + Indie Hackers public posts.** Both communities reward useful free tools that get to a measurable outcome in under 5 minutes. Basis fits.
5. **Targeted DM to the long tail of fractional CTOs / dev-shop owners.** ~200 of them, found via LinkedIn `title:"Fractional CTO" + "AI"`. Message body is a screenshot of an audit for a fictional 8-person team with the share URL, not a pitch. Reply rate ~12% in our offline test on 20 names. Slow but warm.

## What we won't do

- **No paid acquisition in month 1.** A free audit with a 60-second runtime should not need ad spend to grow. If it does, the product is broken — fix the product, don't paper it over with a CPC budget we'll regret.
- **No content marketing blog ("10 ways to save on Cursor").** SEO-content for this category is dead — the AI-cost SERP is already saturated with affiliate listicles. We'd be the 47th identical result.
- **No newsletter list.** Lead form is one-shot transactional. We send the audit. We don't email again unless prices change. This is a deliberate trade-off — newsletter LTV is real, but the signal we want is `audit → Credex referral`, not `audit → email subscriber → maybe Credex referral six months later`.

## Distribution loops that pay back

Two structural mechanics:

- **Share URLs (`/a/[slug]`).** Public, redacted, screenshot-friendly OG card. The card itself is the loop: a screenshot of "Saved $2,840/mo" pasted in a Slack channel does the recruiting. Built-in. Zero ongoing cost.
- **The follow-up trigger.** Six weeks after a high-tier audit, we re-run the same input against current prices. If anything moved >10% (Cursor raises Business pricing, OpenAI cuts API rates), we email the user with the delta. No newsletter spam; only meaningful price movements. This is how an audit becomes a recurring relationship without being a subscription.

## Honest constraints

- The Reddit channel works exactly once. The community sniffs out self-promotion within two posts.
- Hacker News is a coin flip. ~60% of Show HN submissions get <50 upvotes and effectively don't ship traffic. Have the second-shot move ready (a YC Bookface post timed for the same week) so we're not betting the GTM on one Tuesday.
- The Credex back-loop only works if the audit's "Talk to Credex" CTA converts at ≥15%. If it doesn't, the unfair channel evaporates and we're back to organic distribution like everyone else. That conversion rate is what `ECONOMICS.md` is built around — and it's the single thing we instrument first per `METRICS.md`.
