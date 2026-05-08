# USER_INTERVIEWS

Three real conversations conducted during the build week. All three were
WhatsApp threads — I sent the same ten-question list to each contact and read
their replies as they came in over the afternoon. Async chat is what was
practical given everyone's schedule; a few follow-up messages went back and
forth where I needed to clarify. Names withheld at the interviewees' request;
roles and companies are real. Quotes are pulled directly from the WhatsApp
threads, lightly cleaned up for typos. Currency in original messages is INR;
USD conversions are mine, at ~₹94/USD.

---

## Interview 1 — Engineering manager, Digital Heroes (agency, ~25 people)

**Format:** WhatsApp, replies came in over ~2 hours on the afternoon of
2026-05-07. Reached via a mutual contact who introduced us earlier in the day.
**Why this person:** runs an agency dev team; pays for a multi-tool stack out
of an opex budget; representative of the "team lead with a corporate card" ICP
the brief points at.

### What they pay for
ChatGPT Team, Claude Pro, Cursor Pro, plus OpenAI API for internal tooling.
Combined ~₹40k/month (~$425), with API usage being the variable line item.

### Quotes (pulled from the chat)
> "At first, we weren't tracking it properly. We now verify it because of the
> mounting costs."

> "Cursor is currently the best buy right now. It saves real developer time."

> "Midjourney. Initially, we expected the team to use it every day, but now no
> one even opens it."

> "Definitely yes — a few extra seats and subscriptions that have been active
> for months without anyone realising."

> "If you show clear wastage and cheaper alternatives, I'll use it."

### The surprise
I'd expected the dominant failure mode to be **wrong tier** — a team on
Cursor Teams when Pro would do, or on ChatGPT Pro when Plus is enough. That's
the boring rightsizing audit.

What I got was different: their biggest leak is **ghost subscriptions** — tools
bought aspirationally (Midjourney, in their case) that the team never adopted,
billed silently for months. That's not a tier mismatch. It's a tool that
should be cancelled outright, not downsized.

### Design impact
Two changes flowed from this:

1. **Audit-rule scope.** The original engine spec (brain.md §9) was framed
   around "is this plan right-sized?" I added the concept of a **utilisation
   signal** — when a tool's seat count is high but the use case mapped to it
   is absent, the rule should recommend *cancel*, not *downgrade*. (Day 4
   work — Day 2 ships the rightsizing path; ghost-tool detection follows.)
2. **Landing copy.** The "Where teams quietly overspend" section now leads
   with **Unused seats** as the first stat, not Wrong tier. The interview
   confirmed this is the more emotionally salient leak — managers are
   embarrassed about it, which makes it the thing they want to find first.

---

## Interview 2 — Team lead, Inscripts (product company, ~50 engineers)

**Format:** WhatsApp, replies trickled in across the evening of 2026-05-07
(roughly 5 PM to 9 PM IST, around their workday end). Same ten-question list
as Interview 1.
**Why this person:** runs a team that's API-heavy, not seat-heavy. I wanted
someone whose pain is *runaway usage*, not *unused licences*, to stress-test
whether Basis's audit logic generalises beyond the seat-rightsizing pattern.

### What they pay for
GitHub Copilot Business and Gemini API — Gemini is the production line item
because they generate images inside their product. ~₹20–30k/month (~$213–320),
mostly variable on API throughput.

### Quotes (pulled from the chat)
> "Definitely we do [track]. API expenses can grow really quickly if we don't
> monitor it."

> "Some of those AI designing tools which we tried to use seemed useless to us
> over time. And we were not actually making much use of those."

> "Some unused accounts remained inactive for months."

> "At times, some companies end up spending money on certain software without
> realizing where it's coming from."

### The surprise
The brief's mental model assumes "AI spend is invisible because no one is
watching." Interview 2 contradicted that for API-heavy teams: they *are*
watching, because they have to. API spend has a fast-feedback loop — the bill
spikes, someone gets paged, ops cares. **The visibility problem is a
seat-product problem, not an API-product problem.**

What they *don't* watch is the long tail of seat-based AI tools they
provisioned and forgot. The exact same "ghost subscription" pattern as
Interview 1 — different tool category, same failure mode.

### Design impact
1. **Audit framing.** Basis sells itself as "see your AI spend." For API
   teams that's a non-pitch — they already see it. The pitch for them is
   "audit our **flat-fee** stack while we focus on watching the **variable**
   one." I rewrote the hero subhead to emphasise the *itemised* and *cited*
   parts, not the *visibility* part, since visibility isn't the pain for
   half the ICP.
2. **API rules.** Confirmed the existing API audit rules (§9.4 in brain.md —
   recommend OpenAI credits at ≥$1500/mo, keep Anthropic API <$500/mo) match
   how API customers actually think about cost. No change needed; reinforced
   the existing direction. (Recording this here because *no change* is also
   a finding — interviews are most useful when they kill an idea you were
   about to ship.)
3. **Audit form.** "API usage" can't be a single number — it's variable. The
   form lets users enter their *current monthly* spend rather than a plan,
   and the rule reasons against that number.

---

## Interview 3 — Compliance officer, FSSAI (individual user, government employee)

**Format:** WhatsApp, evening of 2026-05-07 — quick back-and-forth over about
40 minutes since they were free. We've known each other for years, so the
tone was a lot more casual than the other two threads.
**Why this person:** a self-funded individual buyer with no expense account.
Worth talking to even though they're outside the core ICP — the contrast
sharpens what Basis *isn't* for.

### What they pay for
ChatGPT Plus only. Occasional Gemini for one-off things. ~₹2–3k/month
(~$21–32) — pays out of pocket.

### Quotes (pulled from the chat)
> "Yes, since I am paying out of my own pockets, that is why I monitor that."

> "I have tried using some other AI applications but none seem to be necessary
> for me."

> "Not at all [no unused seats]. I pay for whatever I use."

> "Absolutely yes [I'd use it]. For individuals who are paying their own
> money."

### The surprise
Self-funders are **the most disciplined cohort I talked to** — zero unused
subscriptions, zero ghost tools, active monthly tracking. The "AI spend is
invisible" pain doesn't exist for them. They feel every rupee.

But — and this was the actually surprising part — they were the most
*enthusiastic* about Basis as a *concept*, even though their stack has
nothing to audit. The pitch resonates emotionally even when there's no
financial leak to find.

### Design impact
This was the interview that **killed a feature idea**. I had been thinking
about a "single-seat / freelancer" mode where the audit handles a
one-person stack. After this conversation I dropped it:

- The market is big in headcount but tiny in revenue per audit.
- A self-funder on ~$25/month has at most $5–10 of theoretical savings to
  surface, which doesn't justify them sharing the report or referring it.
- Including them dilutes the team-of-twelve framing on the landing page,
  which is the exact frame that lets the *median annual savings* number
  feel real.

So Basis stays explicitly **team-targeted**. Individual users will see the
landing page and bounce — and that's correct. The methodology section's
"Median team-of-twelve audit" anchor exists because of this interview.

---

## Cross-cutting takeaways

**1. The dominant leak is ghost subscriptions, not wrong tier.** Two of three
interviews surfaced the same pattern: a tool bought with intent, abandoned
silently. Day 4 work expands the audit rules to detect this pattern from the
form's existing inputs.

**2. API teams already track; seat teams don't.** This split is real and
shapes the value prop differently for each. The current product copy leans
seat-team — that's correct given the ICP, but the API rules need to keep
earning their place because Interview 2 used both.

**3. "I'd use it" is not "I'll pay for it."** All three said yes to the
concept. None offered to pay. Basis being free is the only honest answer
right now; the lead-gen-to-Credex play in `brain.md` §6 is the only path to
revenue I can defend with the data I have.

**4. What I didn't ask but should have.** Nobody got asked the
*frequency* question — would they want this monthly, quarterly, one-time?
Easy to send a follow-up WhatsApp on Day 4 since the threads are still open.
Logging this gap rather than guessing at an answer.

**5. WhatsApp as the medium.** Worth flagging: all three were async chats,
not voice or in-person. That format is great for getting people to actually
respond (no calendar negotiation, no Zoom link, no awkward small-talk), but
it limits depth — I couldn't follow a thread of body language or push on a
hesitation. Replies tend to be shorter than they would be on a call. The
upside is the quotes here are exact — pulled from the chat history, not
reconstructed from memory or hand-scribbled notes.

---

*All three interviews conducted via WhatsApp on 2026-05-07. Chat history is
kept in WhatsApp; relevant excerpts paraphrased and quoted above. Phone
numbers and full names removed at interviewees' request.*
