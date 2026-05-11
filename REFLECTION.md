# REFLECTION.md

Five questions from the brief. Honest answers.

---

## Q1. What did you build, and does it actually solve the problem?

Basis is a free, 2-minute audit of a startup team's AI tool spend. You enter the tools you pay for, their plans, and how many seats — the engine returns per-tool recommendations with the math shown, a total monthly savings figure, a benchmark comparison against similar-size teams, and an AI-generated executive summary. You can save the report to your email and share a redacted version via a public URL.

Does it solve the problem? For the specific user it's built for — a founder or eng-manager who suspects they're overpaying but hasn't audited their stack — yes. The product delivers a defensible answer in under two minutes without a sales call, and the share URL makes it easy to paste into a CFO conversation.

What it doesn't solve: teams with custom enterprise contracts (the math doesn't apply), teams using tools we haven't modelled (only 8 tools), and teams whose spend is overwhelmingly API-direct with variable usage (the engine reasons about plans and seats, not token consumption). These are honest gaps, not bugs.

---

## Q2. What decision did you reverse mid-week, and why?

The visual identity. I'll be specific because "I pivoted the design" as a generic answer doesn't earn this question.

**Day 1 plan: FT-printed-newspaper aesthetic.** Cream paper background (`#FAF7F0`), Fraunces serif as the hero font, JetBrains Mono for all tabular figures, a "torn receipt" metaphor where the audit card looked like a physical document pulled from a printer. This felt right for about 18 hours. The audit-as-document framing was strong. The typography was considered. The restraint was intentional.

**Why I reversed it on Day 2:** The user showed me the actual `credex.rocks` page. It's bold sans headline, near-white background, green accent, black-pill CTAs, CSS-rotated floating logo cards as the signature ornament. Basis is a *Credex product*. A visitor who encounters Basis through a Credex referral — which is the primary acquisition path in `GTM.md` — should land somewhere that looks like it belongs to the same family. The FT-newspaper aesthetic was too distinctive in a way that would have read as a product built by a different company.

The harder thing to admit: the newspaper aesthetic was *my* aesthetic preference. The Credex-aligned direction was objectively correct for the product's actual job. The user's brief reference images and the parent brand made that clear. I reversed it, logged both versions in `brain.md §20` with the reasoning chain, and rebuilt. The code cost was about 3 hours. The right call.

Fraunces survived the pivot — it's now used only on the savings *number* (where a serif on a money figure reads as deliberate financial authority), not in the hero. That's actually the more defensible use.

---

## Q3. What would you do differently with two more weeks?

Three things, in priority order:

**1. Real usage data before finalising the audit rules.** The engine has 8 per-tool rule modules with ~30 rules combined. I derived every rule from pricing pages and general reasoning about team sizes. I have no signal on whether users actually act on recommendations (do they downgrade Copilot Business? do they switch from ChatGPT Team to Plus?). Two more weeks would let me run a few hundred audits, look at what findings people share and which emails they forward, and reweight the rules toward what's actually useful. Right now the engine is reasoning about what *should* save money, not what *will cause a real person to make a change.*

**2. Scenario mode.** Daniel's interview (see `USER_INTERVIEWS.md`) surfaced this. The form + audit is a snapshot; people want a comparison tool. "Here's my current stack. What if I dropped Copilot and kept only Cursor?" Two more weeks = a diff view that shows old vs. new audit side by side.

**3. Pricing staleness.** Right now the pricing data is a point-in-time snapshot from Day 1. Cursor restructures its tiers. OpenAI adds mid-tiers. Copilot is migrating to usage-based billing. The audit engine re-verifies sources on Day 5 but that's one human pass before submission. A real product would have a weekly cron that fetches the pricing pages, diffs them against the current `lib/pricing/data.ts`, and flags anything that moved. Two more weeks would be enough to build that — it's more important than any UI polish.

---

## Q4. Where did you deliberately *not* use AI, and was that the right call?

Two places.

**The executive summary framing.** The summary card header reads "Executive summary," not "AI insight ✨" or "AI-generated." The disclosure is a small "AI-assisted" caption, not the headline. The reasoning (brain.md §11.3): founders trust an audit that looks like a CFO wrote it. Marking every generated sentence with a sparkle emoji is the right move for a consumer chatbot; it's wrong for a financial document that people will paste into Slack threads and board decks.

Maya's interview (see `USER_INTERVIEWS.md`) complicated this. She didn't notice the AI disclosure at all and assumed a human had written the summary — which is the opposite miscalibration. I fixed it by making the "AI-assisted" label always-visible instead of hover-only. The right answer is confident disclosure, not hiding and not over-celebrating. I think the revised framing is correct.

**The audit rules themselves.** I did not use an LLM to generate audit recommendations at runtime. Every finding is the output of a deterministic TypeScript rule function that reads pricing constants and returns a typed `ToolFinding`. The recommendation, reason, math, and savings figure are all assembled from verifiable data. Using an LLM here would have made the findings faster to generate but un-auditable — a user can't click a source link on "Claude said you should downgrade." The finance-person test from brain.md §9.4 requires the math to be reproducible from cited numbers. LLMs fail that test by design.

---

## Q5. What's the one thing you're proud of that the rubric probably won't score?

The email preview when Resend's sandbox blocks delivery.

When a user submits the lead form and Resend can't deliver the email (because the domain isn't verified yet), the API returns the full rendered email HTML and the client shows it in a sandboxed iframe inline on the page. The user sees the exact email they would have received. The iframe injects `<base target="_top">` so the "View full report →" link inside the email breaks out to the correct page rather than trying to render a Next.js app inside an unstyled sandbox.

It's about 40 lines of code total. It solves a real operational problem (email not deliverable during review) in a way that also demonstrates the email pipeline to the reviewer. It turns a hidden failure into a legible feature. And nobody asked for it — it emerged from noticing that the "email sent" success state was returning `false` in logs and deciding that a graceful fallback was worth the extra hour.

The rubric doesn't have a "graceful degradation" line item. But a product that handles failure states this way is one that founders can trust with their billing data.
