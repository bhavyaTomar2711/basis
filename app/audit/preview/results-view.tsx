"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { runAudit } from "@/lib/audit/engine";
import { templateSummary } from "@/lib/audit/summary-template";
import type { AuditInput, AuditResult, ToolFinding } from "@/lib/audit/types";
import { TOOLS } from "@/lib/pricing/data";
import { citation } from "@/lib/pricing/sources";
import { TOOL_MARKS } from "@/lib/brand-marks";

const STORAGE_KEY = "basis.audit-pending";

function fmtUsd(n: number): string {
  const isWhole = Math.abs(n - Math.round(n)) < 0.005;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Math.round(n * 100) / 100);
}

/** Stable 6-char id derived from the audit input — purely deterministic. */
function deriveAuditId(input: AuditInput): string {
  const seed =
    input.tools
      .map((t) => `${t.tool}:${t.plan}:${t.monthlySpendUsd}:${t.seats}`)
      .join("|") +
    `|${input.teamSize}|${input.useCase}`;
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
}

export function ResultsView() {
  const [input, setInput] = useState<AuditInput | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setMissing(true);
        return;
      }
      setInput(JSON.parse(raw) as AuditInput);
    } catch {
      setMissing(true);
    }
  }, []);

  const result = useMemo<AuditResult | null>(() => {
    if (!input) return null;
    try {
      return runAudit(input);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [input]);

  if (missing) return <NoInputState />;
  if (!result) return <LoadingState />;

  return <ResultsContent result={result} />;
}

/* ============================================
   Main results layout
   ============================================ */
export function ResultsContent({
  result,
  persistedAuditId,
  initialAiSummary,
  shareSlug,
  publicShare = false,
}: {
  result: AuditResult;
  /** Supabase row id for AI-summary fetch. Absent on /audit/preview. */
  persistedAuditId?: string;
  /** Cached summary from the audits table; null if Gemini hasn't run yet. */
  initialAiSummary?: string | null;
  /** nanoid slug — needed for the share URL + email flow. */
  shareSlug?: string;
  /** True when rendered at /a/[slug]: hides lead capture and share-this card. */
  publicShare?: boolean;
}) {
  const tier = result.tier;
  const sourcesUsed = useMemo(() => {
    const set = new Set<number>();
    for (const f of result.findings) for (const id of f.sourceRefs) set.add(id);
    return Array.from(set).sort((a, b) => a - b);
  }, [result]);
  // Display-only audit ID for the doc header. For the preview path (no persisted row)
  // we derive a stable id from the input hash; for the persisted path the prop wins.
  const auditId = useMemo(
    () => persistedAuditId?.slice(0, 6).toUpperCase() ?? deriveAuditId(result.input),
    [persistedAuditId, result.input],
  );

  return (
    <article className="mx-auto max-w-3xl">
      {/* document header */}
      <div className="flex items-baseline justify-between border-b border-rule pb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            AUDIT · #{auditId}
          </span>
          {publicShare ? (
            <span className="rounded-full bg-bg px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
              Shared
            </span>
          ) : persistedAuditId ? (
            <span className="rounded-full bg-green-tint px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-green-deep">
              Saved
            </span>
          ) : (
            <span className="rounded-full bg-bg px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
              Preview
            </span>
          )}
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
          {new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* hero — savings */}
      <header className="mt-10 sm:mt-14">
        {tier === "high" && (
          <span className="inline-flex items-center gap-2 rounded-full bg-green-tint px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-green-deep">
            High-impact savings
          </span>
        )}
        {tier === "optimal" && (
          <span className="inline-flex items-center gap-2 rounded-full bg-bg px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
            You&rsquo;re spending well
          </span>
        )}
        {tier === "medium" && (
          <span className="inline-flex items-center gap-2 rounded-full bg-bg px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
            Straightforward savings
          </span>
        )}

        <h1 className="mt-4 text-balance">
          <CountUp
            value={result.totalMonthlySavingsUsd}
            className="font-money text-[clamp(2.75rem,9vw,5.5rem)] font-semibold leading-none tracking-tight text-green-deep"
          />
          <span className="ml-3 align-baseline text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            saved / month
          </span>
        </h1>
        <p className="mt-3 font-mono text-base text-ink-muted">
          {fmtUsd(result.totalAnnualSavingsUsd)} saved per year ·{" "}
          {fmtUsd(result.totalCurrentMonthlyUsd)}/mo current →{" "}
          {fmtUsd(result.totalRecommendedMonthlyUsd)}/mo recommended
        </p>
      </header>

      {/* executive summary */}
      <ExecutiveSummary
        result={result}
        persistedAuditId={persistedAuditId}
        initialAiSummary={initialAiSummary}
      />

      {/* findings — receipt rows in a card */}
      <section className="mt-12">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
          Findings
        </p>
        <div className="card-shadow mt-3 overflow-hidden rounded-3xl border border-rule bg-surface">
          <ul className="divide-y divide-rule">
            {result.findings.map((f, idx) => (
              <li key={idx}>
                <FindingRow finding={f} />
              </li>
            ))}
          </ul>

          {/* total row */}
          <div className="flex items-baseline justify-between bg-green-tint px-6 py-5 sm:px-8">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-green-deep/80">
              Total saved / month
            </span>
            <span className="font-money text-2xl font-semibold tabular-nums text-green-deep sm:text-3xl">
              {fmtUsd(result.totalMonthlySavingsUsd)}
            </span>
          </div>
        </div>
      </section>

      {/* high-savings CTA */}
      {tier === "high" && (
        <section className="mt-12">
          <div className="card-shadow rounded-3xl border border-rule bg-surface p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
              Capture more
            </p>
            <h3 className="mt-3 text-2xl font-bold tracking-tight">
              Most of these savings come from switching providers.
            </h3>
            <p className="mt-3 text-pretty text-lg leading-relaxed text-ink-muted">
              Credex sells the same AI credits at a discount, sourced from
              companies that overforecast. If you&rsquo;d like an introduction,
              we&rsquo;ll connect you.
            </p>
            <a
              href="https://credex.rocks"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-cta-bg px-6 text-sm font-medium text-cta-ink transition hover:-translate-y-px hover:bg-[#1a1a1c]"
            >
              Talk to Credex →
            </a>
          </div>
        </section>
      )}

      {tier === "optimal" && (
        <section className="mt-12">
          <div className="card-shadow rounded-3xl border border-rule bg-surface p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
              You&rsquo;re spending well
            </p>
            <h3 className="mt-3 text-2xl font-bold tracking-tight">
              No major changes recommended.
            </h3>
            <p className="mt-3 text-pretty text-lg leading-relaxed text-ink-muted">
              Want a heads-up if pricing changes for something on your stack?
              Drop your email and we&rsquo;ll let you know.
            </p>
          </div>
        </section>
      )}

      {/* sources */}
      <section className="mt-12">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
          Sources
        </p>
        <ol className="mt-3 space-y-2 font-mono text-xs text-ink-muted">
          {sourcesUsed.map((id) => {
            const c = citation(id);
            return (
              <li key={id} className="flex gap-3">
                <span className="text-ink-faint">[{id}]</span>
                <span>
                  {c.vendor} · {c.url} · retrieved {c.retrievedOn}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Lead capture + share — only on the owner-private view, never on
          the public /a/[slug] page (per brain.md §12.1 + §13.2). */}
      {!publicShare && persistedAuditId && shareSlug && (
        <>
          <LeadCaptureCard
            auditId={persistedAuditId}
            defaultTeamSize={result.input.teamSize}
          />
          <ShareCard slug={shareSlug} />
        </>
      )}
    </article>
  );
}

/* ============================================
   Per-finding row
   ============================================ */
function FindingRow({ finding }: { finding: ToolFinding }) {
  const Mark = TOOL_MARKS[finding.tool];
  const tool = TOOLS[finding.tool];
  const plan = tool.plans.find((p) => p.id === finding.currentPlan);
  const isOverspend = finding.monthlySavingsUsd > 0;

  return (
    <div
      className={`grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-[auto_1fr_auto] sm:px-8 sm:py-6 ${
        isOverspend ? "" : ""
      }`}
    >
      <span className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-bg text-ink sm:inline-flex">
        <Mark className="size-5" />
      </span>

      <div>
        <p className="text-base font-semibold text-ink">
          {tool.label}{" "}
          <span className="font-normal text-ink-muted">· {plan?.name}</span>
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          {finding.reason}
        </p>
        <p className="mt-2 font-mono text-xs leading-relaxed text-ink-faint">
          {finding.math}{" "}
          {finding.sourceRefs.map((id) => (
            <sup key={id} className="ml-0.5 text-ink-faint">
              [{id}]
            </sup>
          ))}
        </p>
      </div>

      <div className="text-right">
        {isOverspend ? (
          <>
            <p className="font-mono text-xs uppercase tracking-wider text-ink-faint">
              Saves
            </p>
            <p className="mt-1 font-money text-xl font-semibold tabular-nums text-green-deep">
              {fmtUsd(finding.monthlySavingsUsd)}
              <span className="font-sans text-xs font-medium text-green-deep/70">
                /mo
              </span>
            </p>
          </>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-bg px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
            <span className="size-1.5 rounded-full bg-ink-faint" />
            Keep
          </span>
        )}
      </div>
    </div>
  );
}

/* ============================================
   Executive summary — renders the cached AI summary if present, otherwise
   shows the deterministic template immediately and triggers a background
   /api/summary fetch (only when the audit is persisted).
   No "AI-generated" label per brain.md §11.3.
   ============================================ */
function ExecutiveSummary({
  result,
  persistedAuditId,
  initialAiSummary,
}: {
  result: AuditResult;
  persistedAuditId?: string;
  initialAiSummary?: string | null;
}) {
  const fallback = useMemo(() => templateSummary(result), [result]);
  const [summary, setSummary] = useState<string>(
    initialAiSummary ?? fallback,
  );
  const [generating, setGenerating] = useState(false);
  // Guard against React 19 Strict Mode's double-invoked effects in dev.
  // Without this, two concurrent /api/summary calls would both miss cache,
  // both call Gemini (with temperature → non-deterministic output), and the
  // second response would overwrite the first in the UI mid-paint.
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Skip if no persisted audit (preview path), already have an AI summary,
    // or we've already fired the request once for this mount.
    if (!persistedAuditId || initialAiSummary) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    let cancelled = false;
    setGenerating(true);
    fetch("/api/summary", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ auditId: persistedAuditId }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: { summary?: string }) => {
        if (cancelled) return;
        if (data.summary) setSummary(data.summary);
      })
      .catch((err) => {
        console.warn("Summary fetch failed:", err);
      })
      .finally(() => {
        if (!cancelled) setGenerating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [persistedAuditId, initialAiSummary]);

  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
          Executive summary
        </p>
        {generating && (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            Refining…
          </span>
        )}
      </div>
      <div className="card-shadow mt-3 rounded-3xl border border-rule bg-surface p-6 sm:p-8">
        <p className="text-pretty text-lg leading-relaxed text-ink">
          {summary}
        </p>
      </div>
    </section>
  );
}

/* ============================================
   Count-up — vanilla JS, no framer-motion needed
   Respects prefers-reduced-motion via globals.css overrides.
   ============================================ */
function CountUp({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || value === 0) {
      setShown(value);
      return;
    }
    const start = performance.now();
    const duration = 1100;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(value * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span className={className}>{fmtUsd(shown)}</span>;
}

/* ============================================
   Empty / loading states
   ============================================ */
function NoInputState() {
  return (
    <div className="card-shadow mx-auto max-w-md rounded-3xl border border-rule bg-surface p-8 text-center">
      <h2 className="text-2xl font-bold tracking-tight">No audit pending.</h2>
      <p className="mt-3 text-ink-muted">
        Looks like you got here directly. Start a new audit and your results
        will show here.
      </p>
      <Link
        href="/audit/new"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-cta-bg px-5 text-sm font-medium text-cta-ink transition hover:-translate-y-px hover:bg-[#1a1a1c]"
      >
        Start a new audit
      </Link>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="h-8 w-40 animate-pulse rounded bg-bg" />
      <div className="mt-8 h-20 w-72 animate-pulse rounded bg-bg" />
      <div className="card-shadow mt-12 rounded-3xl border border-rule bg-surface p-8">
        <div className="h-4 w-24 animate-pulse rounded bg-bg" />
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-bg" />
        <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-bg" />
      </div>
    </div>
  );
}

/* ============================================
   Lead capture — per brain.md §12.1 / §12.2.
   Sits below the fold so value is shown first. Email required; everything
   else optional. Honeypot inline. On submit, posts to /api/lead and swaps
   to a confirmation state.
   ============================================ */
const ROLE_OPTIONS = [
  { id: "founder_ceo", label: "Founder / CEO" },
  { id: "eng_manager", label: "Eng Manager" },
  { id: "cto_vp", label: "CTO / VP" },
  { id: "ic", label: "IC" },
  { id: "other", label: "Other" },
] as const;

function LeadCaptureCard({
  auditId,
  defaultTeamSize,
}: {
  auditId: string;
  defaultTeamSize: number;
}) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState<string>("");
  const [teamSize, setTeamSize] = useState<number>(defaultTeamSize);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "saved_no_email" | "error"
  >("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [emailPreview, setEmailPreview] = useState<{
    subject: string;
    html: string;
  } | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;

    const form = e.currentTarget;
    const honeypot = (form.elements.namedItem("website") as HTMLInputElement | null)
      ?.value;
    if (honeypot) return;

    setStatus("submitting");
    setErrMsg(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          auditId,
          email: email.trim(),
          company: company.trim() || null,
          role: role || null,
          teamSize: Number.isFinite(teamSize) ? teamSize : null,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const data = (await res.json()) as {
        ok: boolean;
        emailSent?: boolean;
        shareUrl?: string;
        emailPreview?: { subject: string; html: string } | null;
      };
      setSentTo(email.trim());
      setShareUrl(data.shareUrl ?? null);
      setEmailPreview(data.emailPreview ?? null);
      // If the API saved the lead but Resend declined the send (sandbox mode
      // without a verified domain rejects non-registered recipients), don't
      // claim "check your inbox" — that's a lie. Render the email inline
      // instead so the user (or reviewer) sees the exact content we would
      // have delivered.
      setStatus(data.emailSent === false ? "saved_no_email" : "success");
    } catch (err) {
      setStatus("error");
      setErrMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (status === "saved_no_email") {
    return (
      <section className="mt-12">
        <div className="card-shadow rounded-3xl border border-rule bg-surface p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
            Email preview
          </p>
          <h3 className="mt-3 text-2xl font-bold tracking-tight">
            Here&rsquo;s the report we would have sent.
          </h3>
          <p className="mt-3 text-pretty text-base leading-relaxed text-ink-muted">
            Our Resend sender domain isn&rsquo;t verified for production yet,
            so the API rejects delivery to addresses other than the registered
            account. The rendered email is below — exact same HTML that
            would land in{" "}
            <span className="font-medium text-ink">{sentTo}</span>&rsquo;s
            inbox once we verify the domain.
          </p>

          {emailPreview && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-rule">
              <div className="border-b border-rule bg-bg px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                  Subject
                </p>
                <p className="mt-1 text-sm font-medium text-ink">
                  {emailPreview.subject}
                </p>
              </div>
              <EmailPreviewFrame html={emailPreview.html} />
            </div>
          )}

          {shareUrl && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Share link
              </p>
              <code className="mt-2 block truncate rounded-xl border border-rule bg-bg px-3.5 py-2.5 font-mono text-sm text-ink">
                {shareUrl}
              </code>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (status === "success") {
    return (
      <section className="mt-12">
        <div className="card-shadow rounded-3xl border border-rule bg-surface p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-deep">
            Sent
          </p>
          <h3 className="mt-3 text-2xl font-bold tracking-tight">
            Check your inbox.
          </h3>
          <p className="mt-3 text-pretty text-lg leading-relaxed text-ink-muted">
            We sent the report to{" "}
            <span className="font-medium text-ink">{sentTo}</span>. If it
            doesn&rsquo;t arrive in a minute or two, check spam.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <form
        onSubmit={onSubmit}
        className="card-shadow rounded-3xl border border-rule bg-surface p-6 sm:p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
          Get the report
        </p>
        <h3 className="mt-3 text-2xl font-bold tracking-tight">
          Email yourself a copy.
        </h3>
        <p className="mt-2 text-pretty text-base leading-relaxed text-ink-muted">
          A PDF-style summary you can forward to your CFO, plus a private share
          link.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="lead-email"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint"
            >
              Email
            </label>
            <input
              id="lead-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="mt-2 block h-11 w-full rounded-xl border border-rule bg-bg px-3.5 text-base text-ink outline-none transition focus:border-green focus:bg-surface"
            />
          </div>
          <div>
            <label
              htmlFor="lead-company"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint"
            >
              Company <span className="font-normal normal-case text-ink-faint">(optional)</span>
            </label>
            <input
              id="lead-company"
              type="text"
              autoComplete="organization"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="mt-2 block h-11 w-full rounded-xl border border-rule bg-bg px-3.5 text-base text-ink outline-none transition focus:border-green focus:bg-surface"
            />
          </div>
          <div>
            <label
              htmlFor="lead-role"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint"
            >
              Role <span className="font-normal normal-case text-ink-faint">(optional)</span>
            </label>
            <select
              id="lead-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-2 block h-11 w-full rounded-xl border border-rule bg-bg px-3 text-base text-ink outline-none transition focus:border-green focus:bg-surface"
            >
              <option value="">—</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="lead-teamsize"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint"
            >
              Team size
            </label>
            <input
              id="lead-teamsize"
              type="number"
              min={1}
              max={100000}
              value={teamSize}
              onChange={(e) =>
                setTeamSize(Math.max(1, Number(e.target.value) || 1))
              }
              className="mt-2 block h-11 w-full rounded-xl border border-rule bg-bg px-3.5 text-base text-ink outline-none transition focus:border-green focus:bg-surface"
            />
          </div>
        </div>

        {/* honeypot — non-empty == bot, silently 200 */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="absolute left-[-9999px] size-0 opacity-0"
        />

        {errMsg && (
          <p
            role="alert"
            aria-live="polite"
            className="mt-4 text-sm text-red-600"
          >
            {errMsg}
          </p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={status === "submitting"}
            className="inline-flex h-11 items-center justify-center rounded-full bg-cta-bg px-6 text-sm font-medium text-cta-ink transition hover:-translate-y-px hover:bg-[#1a1a1c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? "Sending…" : "Email me the report →"}
          </button>
          <p className="text-xs text-ink-faint">
            One-off send. No newsletter. We won&rsquo;t share your address.
          </p>
        </div>
      </form>
    </section>
  );
}

/* ============================================
   Email preview frame — renders the email HTML inside a same-origin iframe
   so the email's inline styles can't leak into the page (and vice versa).
   Auto-sizes to content on load.
   ============================================ */
function EmailPreviewFrame({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(600);

  // Inject <base target="_top"> so any link click inside the preview
  // navigates the parent window instead of loading the destination
  // *inside* the sandboxed iframe (which would render unstyled because
  // sandbox="" denies same-origin CSS/JS).
  const previewHtml = useMemo(() => {
    if (/<base\b/i.test(html)) return html;
    if (/<head[^>]*>/i.test(html)) {
      return html.replace(/<head[^>]*>/i, (m) => `${m}<base target="_top">`);
    }
    if (/<html[^>]*>/i.test(html)) {
      return html.replace(
        /<html[^>]*>/i,
        (m) => `${m}<head><base target="_top"></head>`,
      );
    }
    return `<base target="_top">${html}`;
  }, [html]);

  const onLoad = () => {
    const doc = ref.current?.contentDocument;
    if (doc?.body) {
      // +32 absorbs the body's own bottom margin in some clients without
      // the gutter clipping the bottom row.
      setHeight(doc.body.scrollHeight + 32);
    }
  };

  return (
    <iframe
      ref={ref}
      title="Email preview"
      srcDoc={previewHtml}
      // allow-top-navigation-by-user-activation pairs with <base target="_top">
      // so user-initiated link clicks can break out of the sandbox into the
      // parent. Everything else (scripts, forms, same-origin) stays denied.
      sandbox="allow-top-navigation-by-user-activation"
      onLoad={onLoad}
      style={{ height }}
      className="block w-full border-0 bg-white"
    />
  );
}

/* ============================================
   Share card — copy-able link to /a/[slug].
   Shown on the private /audit/[id] page only.
   ============================================ */
function ShareCard({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const [href, setHref] = useState<string>(`/a/${slug}`);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHref(`${window.location.origin}/a/${slug}`);
    }
  }, [slug]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API blocked (insecure context, browser policy) — fall back
      // to selecting the text so the user can copy manually.
      const el = document.getElementById("share-url-text") as HTMLElement | null;
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  return (
    <section className="mt-8">
      <div className="card-shadow rounded-3xl border border-rule bg-surface p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
          Share this audit
        </p>
        <h3 className="mt-3 text-2xl font-bold tracking-tight">
          Public share link.
        </h3>
        <p className="mt-2 text-pretty text-base leading-relaxed text-ink-muted">
          Same report, no email needed to view. Your address is never shown on
          the share page.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <code
            id="share-url-text"
            className="block min-w-0 flex-1 truncate rounded-xl border border-rule bg-bg px-3.5 py-2.5 font-mono text-sm text-ink"
          >
            {href}
          </code>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-rule bg-bg px-5 text-sm font-medium text-ink transition hover:border-ink-faint"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>
    </section>
  );
}
