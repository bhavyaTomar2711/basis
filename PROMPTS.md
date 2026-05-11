# PROMPTS.md

The Gemini system prompt used for the executive summary feature, the PII redaction rationale, and what didn't work.

---

## The prompt

Used in `lib/ai/gemini-summary.ts`. Model: `gemini-2.5-flash`. Temperature: 0.4. Max output tokens: 1024.

### System instruction

```
You are a finance-literate analyst writing the opening paragraph of an audit memo for a startup founder.

Your job: in 60–100 words, name the savings opportunity so the founder wants to act today.

REQUIRED STRUCTURE (every response, in this order):
1. Lead with the total monthly savings figure as the very first thing. Examples:
   - "Your stack is leaking $475/month..."
   - "There's $475/month ($5,700/year) of straightforward savings..."
   - "You're overpaying by $475/month on AI tooling..."
2. State the SPECIFIC tool and SPECIFIC recommended switch, using the real numbers (current plan/price → recommended plan/price). Example: "Claude Team Premium ($125/seat) is overkill — Team Standard ($25/seat) saves $100/seat per month."
3. End with one sentence framing the rest of the memo: "The findings below show the math, line by line."

NEVER:
- Lead with current spend ("Your AI spend is $X"). That's not a finding, that's a description.
- Use "perhaps," "you might want to," "consider," or any hedging.
- Use buzzwords, markdown, headings, bullet lists, or emojis.
- Recommend cancelling tools the user didn't list as overspend.

If the input has tier="optimal" (no overspend), say so directly: "You're spending well. The plans on your stack are appropriately sized; we couldn't surface a meaningful change to recommend." Then the methodology line.

Output: plain prose, one paragraph.
```

### User message (JSON of redacted audit snapshot)

```json
{
  "tier": "medium",
  "teamSize": 8,
  "useCase": "coding",
  "totals": {
    "currentMonthlyUsd": 480,
    "recommendedMonthlyUsd": 320,
    "monthlySavingsUsd": 160,
    "annualSavingsUsd": 1920
  },
  "findings": [
    {
      "tool": "Cursor",
      "currentPlanName": "Teams",
      "currentMonthlyUsd": 320,
      "seats": 8,
      "recommendedAction": "downgrade",
      "recommendedPlanName": "Pro",
      "recommendedMonthlyUsd": 160,
      "monthlySavingsUsd": 160,
      "reason": "Teams overhead (SSO, SAML, RBAC) not justified for a sub-10-person team."
    },
    {
      "tool": "Claude",
      "currentPlanName": "Pro",
      "currentMonthlyUsd": 160,
      "seats": 8,
      "recommendedAction": "keep",
      "recommendedPlanName": null,
      "recommendedMonthlyUsd": null,
      "monthlySavingsUsd": 0,
      "reason": "Claude Pro at $20/seat is already the right tier for a coding-heavy team."
    }
  ]
}
```

---

## PII redaction

The snapshot sent to Gemini contains **no personally identifiable information**. Specifically, the following fields are stripped before the API call:

| Field | Why stripped |
|---|---|
| `email` | Never in the audit object; only in `leads`. Belt-and-suspenders: never deserialised into the redacted snapshot. |
| `companyName` | Not collected on the audit form at all; only optional on the lead form. Not accessible to the summary generator. |
| `role` | Same as companyName — lead form only. |
| `auditId` | A UUID that could be used to look up the full audit including lead data. Stripped. |
| `slug` | The public share URL identifier. If logged by Google in training data, a third party could access the audit. Stripped. |
| `ipHash` | The sha256(ip + salt) used for rate limiting. Technically not PII, but no reason to send it. |

What *is* sent: tool labels (e.g., "Cursor"), plan names (e.g., "Teams"), seat counts, dollar figures, use case, team size, savings amounts, and the pre-computed `reason` strings from the engine.

**Why this matters:** Gemini's free tier may train on prompt data. The audit contains enough context to identify a company if it includes their name, email, and tool stack together. By stripping identifiers, the snapshot reads as generic "8-person startup, coding, Cursor Teams + Claude Pro" — not attributable to any specific company.

The redaction is implemented in `lib/ai/gemini-summary.ts` in the `redact()` function. Every change to what gets sent must be reviewed against brain.md §11.4.

---

## What didn't work

**Temperature 0 → summaries that were technically correct but lifeless.**
First attempt: temperature 0 for maximum consistency. The output was accurate but bureaucratic — "The audit has identified $160 in monthly savings across 1 tool. The primary finding is that Cursor Teams at $40/seat can be replaced with Cursor Pro at $20/seat for a saving of $160 per month." Correct. Citable. Boring. Nobody would forward it to their CFO. Bumped to 0.4, which adds just enough variation to make the lead sentence feel like a human analyst wrote it.

**Asking for a bulleted list first → context-window waste and format fragility.**
Second attempt: structured the system instruction to first produce a "key findings list" then a "narrative paragraph." The idea was to make the model think before it wrote. In practice it produced a bulleted list that the response parser then had to strip — adding latency and a parsing step. Simplified to: one paragraph, required structure, examples of the lead sentence. The examples anchor the format better than any "first produce X then produce Y" instruction.

**No explicit word limit → 200-word summaries.**
Third attempt (without `maxOutputTokens` cap): the model consistently produced 150–200 word summaries. Correct, thorough, too long for the card slot on the results page. Added both the word count instruction in the system prompt ("60–100 words") *and* the `maxOutputTokens: 1024` cap. The model respects word count instructions when they're in the system prompt, not just in the user message.

**`finishReason` not checked → truncated summaries cached permanently.**
Found in dev: a Gemini response with `finishReason: "MAX_TOKENS"` was being cached as if complete. The text ended mid-sentence. Every subsequent visit to that audit showed the truncated summary. Fix: check `finishReason !== "STOP"` and throw `GeminiUnavailableError` on any other value. The route then falls back to the template, which caches a complete summary. Additionally, on every read of a cached summary, the route checks that the last character is sentence-terminating punctuation — if not, it nulls the cache and regenerates. Self-healing without a migration.

**Gemini "STOP" on a clipped response (belt-and-suspenders).**
Rare but observed: `finishReason = "STOP"` on a response that was clearly mid-sentence. The model apparently decided it was done even though the sentence wasn't. Added a second check: `if (!/[.!?"'"']\s*$/.test(text)) throw GeminiUnavailableError`. Belt-and-suspenders for the case where the SDK reports STOP on a clipped response.
