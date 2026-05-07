"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { runAudit } from "@/lib/audit/engine";
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
function ResultsContent({ result }: { result: AuditResult }) {
  const tier = result.tier;
  const sourcesUsed = useMemo(() => {
    const set = new Set<number>();
    for (const f of result.findings) for (const id of f.sourceRefs) set.add(id);
    return Array.from(set).sort((a, b) => a - b);
  }, [result]);
  // Stable audit ID derived from the input — same input always yields the same id.
  const auditId = useMemo(() => deriveAuditId(result.input), [result.input]);

  return (
    <article className="mx-auto max-w-3xl">
      {/* document header */}
      <div className="flex items-baseline justify-between border-b border-rule pb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            AUDIT · #{auditId}
          </span>
          <span className="rounded-full bg-green-tint px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-green-deep">
            Preview
          </span>
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
      <section className="mt-12">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
          Executive summary
        </p>
        <div className="card-shadow mt-3 rounded-3xl border border-rule bg-surface p-6 sm:p-8">
          <p className="text-pretty text-lg leading-relaxed text-ink">
            <TemplateSummary result={result} />
          </p>
        </div>
      </section>

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
   Template summary (template-only on Day 2;
   Day 3 will swap in Gemini with this as the fallback)
   ============================================ */
function TemplateSummary({ result }: { result: AuditResult }) {
  const monthly = fmtUsd(result.totalMonthlySavingsUsd);
  const annual = fmtUsd(result.totalAnnualSavingsUsd);
  const topFinding = result.findings.find((f) => f.monthlySavingsUsd > 0);
  const toolLabel = topFinding ? TOOLS[topFinding.tool].label : null;

  if (result.tier === "high") {
    return (
      <>
        Your stack is leaking <strong>{monthly}/month</strong>{" "}
        ({annual} per year). The biggest single lift is on{" "}
        <strong>{toolLabel}</strong>: {topFinding?.reason} The findings below
        show the math, line by line, with sources.
      </>
    );
  }
  if (result.tier === "optimal") {
    return (
      <>
        You&rsquo;re spending well. We didn&rsquo;t find a meaningful change to
        recommend across your current stack. The plans you&rsquo;re on are
        appropriately sized for your usage. We&rsquo;ll keep an eye on pricing
        changes and can email you if anything shifts.
      </>
    );
  }
  return (
    <>
      There&rsquo;s about <strong>{monthly}/month</strong> ({annual}/year) of
      straightforward savings on your stack. Most of it comes from
      right-sizing existing plans —{" "}
      {topFinding ? `starting with ${toolLabel}` : "see the details below"}.
    </>
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
