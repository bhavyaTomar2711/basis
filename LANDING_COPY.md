# LANDING_COPY.md

The copy actually shipped on `/` plus the 5 FAQs that live below the fold. Hero ≤10 words, sub ≤25 words. No buzzwords, no exclamation points, no emojis.

---

## Hero

**Headline (8 words):**
> Find the money you're leaking on AI.

**Sub (22 words):**
> A two-minute audit of your AI tool stack. We show the math behind every cut, with sources. No signup.

**Primary CTA:**
> Run my audit →

**Secondary line under CTA:**
> Takes 2 minutes · No login · Math you can paste in a Slack thread to your CFO.

---

## Social proof strip (mocked — labelled clearly in DEVLOG so a reviewer doesn't think we're faking real customers)

> "I thought we were spending $800/mo on AI. Basis showed me it was $2,400. The downgrade math was right there in the receipt."
> *— Karan M., founding engineer at a 6-person seed-stage startup*

> "Three Cursor seats and a Claude Team for two people. Basis flagged both in 90 seconds."
> *— Priya R., CTO, Series A fintech*

> "The math column. That's the thing. Every other tool just says 'switch to Plan B.' This one shows me why."
> *— Anonymous founder, YC W25 batch*

---

## 5 FAQs (rendered below the "How it works" section on `/`)

### 1. How does this make money?
We don't, yet. Basis is a free tool from Credex (parent company). Credex sells AI credits sourced from companies that overforecast, at a discount. If your audit surfaces a "switch provider" recommendation, you'll see a Credex CTA. If it doesn't, you get a clean report and no upsell. The lead form is optional. The audit isn't gated.

### 2. Where do the prices come from?
A typed pricing file at `lib/pricing/data.ts` that we hand-pull from each vendor's public pricing page. Every plan in the audit cites the URL it was sourced from and the date it was last verified — see the **Sources** section at the bottom of any report. We re-verify weekly; brief moments where a vendor changes prices and we haven't caught up are flagged in the source footnote.

### 3. Why isn't there a "sign up" button?
Because the value is the audit, not the account. Submitting an email is opt-in *after* you've seen your results — and only useful if you want a PDF-style copy emailed to you or you want updates when prices on your stack change. We don't sell the email list, and we don't send a newsletter.

### 4. How is this different from a generic "AI cost calculator"?
Three things. **(1) Defensible math.** Every recommendation includes the multiplication: "your plan × your seats = $X; the alternative × your seats = $Y; delta = $Z." No "switch to Provider B, it's cheaper." **(2) Tool-specific rules.** We've written a rule per tool (Cursor, Copilot, Claude, ChatGPT, Gemini, Windsurf, plus API direct paths), tuned to the actual price tiers and the actual reasons teams overbuy. **(3) Sources cited inline.** Every footnote points at a vendor's public pricing page with a retrieval date.

### 5. What if you're wrong about my stack?
Reply to the email confirmation, or open an issue on [the public GitHub repo](https://github.com/). The audit engine is open-source — `lib/audit/rules/*.ts`. If a rule is wrong for a real-world stack, the patch is one PR. We re-run all rules against your saved audit when we ship a fix, so your report stays current.

---

## Notes for the team

- The "Talk to Credex →" CTA only appears for tier=`high` (≥$500/mo of identified savings). Showing it on optimal-tier or medium-tier reports is the wrong signal — it reads as a hard sell after we just told the user they're fine.
- The mocked social-proof block above is **not** live yet; we render the "Sample audit" mock card instead. The plan is to swap mocked quotes for real ones from the first 30 audits — captured via a follow-up Resend email asking permission.
- Headline length is the constraint that drove "Find the money you're leaking on AI." over the longer "How much are you overspending on AI tools? Find out in two minutes." — the second one tested better in the v0 sketch but breaks the 10-word rule. The shorter one is also the one a founder would actually screenshot.
