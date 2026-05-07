"use client";

import { useEffect, useMemo, useState } from "react";
import { TOOLS } from "@/lib/pricing/data";
import type { ToolId } from "@/lib/pricing/types";
import type { AuditInput, ToolEntry, UseCase } from "@/lib/audit/types";
import { TOOL_MARKS } from "@/lib/brand-marks";

const STORAGE_KEY = "basis.audit-form.v1";
const TOOL_IDS: ToolId[] = [
  "cursor",
  "copilot",
  "claude",
  "chatgpt",
  "anthropic_api",
  "openai_api",
  "gemini",
  "windsurf",
];

const USE_CASES: { id: UseCase; label: string }[] = [
  { id: "coding", label: "Coding" },
  { id: "writing", label: "Writing" },
  { id: "data", label: "Data" },
  { id: "research", label: "Research" },
  { id: "mixed", label: "Mixed" },
];

const DEFAULT_INPUT: AuditInput = {
  tools: [
    {
      tool: "cursor",
      plan: "pro",
      monthlySpendUsd: 20,
      seats: 1,
    },
  ],
  teamSize: 1,
  useCase: "coding",
};

function loadInitial(): AuditInput {
  if (typeof window === "undefined") return DEFAULT_INPUT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_INPUT;
    const parsed = JSON.parse(raw) as AuditInput;
    if (!Array.isArray(parsed.tools)) return DEFAULT_INPUT;
    return parsed;
  } catch {
    return DEFAULT_INPUT;
  }
}

function defaultEntryForTool(toolId: ToolId): ToolEntry {
  const firstPaidPlan =
    TOOLS[toolId].plans.find((p) => (p.monthlyUsd ?? 0) > 0) ??
    TOOLS[toolId].plans[0];
  const monthly =
    firstPaidPlan.billing === "usage"
      ? 0
      : (firstPaidPlan.monthlyUsd ?? 0) * 1;
  return {
    tool: toolId,
    plan: firstPaidPlan.id,
    monthlySpendUsd: monthly,
    seats: 1,
  };
}

export function AuditForm() {
  // Hydration pattern: SSR renders DEFAULT_INPUT, client effect reads localStorage
  // post-mount. The brief flash is acceptable for a form behind a CTA click.
  const [input, setInput] = useState<AuditInput>(DEFAULT_INPUT);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setInput(loadInitial());
    setHydrated(true);
  }, []);

  // Persist on every change.
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
  }, [input, hydrated]);

  // 3) running total
  const runningMonthly = useMemo(
    () => input.tools.reduce((sum, t) => sum + (t.monthlySpendUsd || 0), 0),
    [input.tools],
  );

  // mutators
  const addTool = () => {
    const used = new Set(input.tools.map((t) => t.tool));
    const next = TOOL_IDS.find((id) => !used.has(id)) ?? "cursor";
    setInput((s) => ({ ...s, tools: [...s.tools, defaultEntryForTool(next)] }));
  };
  const removeTool = (idx: number) =>
    setInput((s) => ({
      ...s,
      tools: s.tools.filter((_, i) => i !== idx),
    }));
  const updateTool = (idx: number, partial: Partial<ToolEntry>) =>
    setInput((s) => ({
      ...s,
      tools: s.tools.map((t, i) => (i === idx ? { ...t, ...partial } : t)),
    }));
  const onToolChange = (idx: number, newTool: ToolId) => {
    const fresh = defaultEntryForTool(newTool);
    setInput((s) => ({
      ...s,
      tools: s.tools.map((t, i) => (i === idx ? fresh : t)),
    }));
  };
  const onPlanChange = (idx: number, newPlan: string) => {
    const tool = input.tools[idx].tool;
    const plan = TOOLS[tool].plans.find((p) => p.id === newPlan);
    setInput((s) => ({
      ...s,
      tools: s.tools.map((t, i) =>
        i === idx
          ? {
              ...t,
              plan: newPlan,
              monthlySpendUsd:
                plan?.billing === "usage" || plan?.monthlyUsd === null
                  ? t.monthlySpendUsd
                  : (plan?.monthlyUsd ?? 0) * t.seats,
            }
          : t,
      ),
    }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // honeypot — bots fill the hidden field
    const honeypot = (e.currentTarget.elements.namedItem(
      "website",
    ) as HTMLInputElement | null)?.value;
    if (honeypot) return;
    if (input.tools.length === 0) return;
    window.sessionStorage.setItem(
      "basis.audit-pending",
      JSON.stringify(input),
    );
    window.location.href = "/audit/preview";
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-12 grid w-full max-w-6xl gap-8 lg:mt-16 lg:grid-cols-[1fr_320px] lg:gap-12"
    >
      <div className="space-y-8">
        {/* ------- SECTION A: Tools you pay for ------- */}
        <section>
          <SectionHeader
            number="A"
            title="Tools you pay for"
            hint="Add a row for each AI tool on your team's bill."
          />

          <div className="card-shadow mt-5 rounded-3xl border border-rule bg-surface">
            <ul className="divide-y divide-rule">
              {input.tools.map((entry, idx) => (
                <li key={idx} className="p-5 sm:p-6">
                  <ToolRow
                    entry={entry}
                    onTool={(t) => onToolChange(idx, t)}
                    onPlan={(p) => onPlanChange(idx, p)}
                    onSpend={(v) =>
                      updateTool(idx, { monthlySpendUsd: v })
                    }
                    onSeats={(v) => updateTool(idx, { seats: v })}
                    onRemove={
                      input.tools.length > 1
                        ? () => removeTool(idx)
                        : undefined
                    }
                  />
                </li>
              ))}
            </ul>
            <div className="border-t border-rule p-5 sm:p-6">
              <button
                type="button"
                onClick={addTool}
                disabled={input.tools.length >= TOOL_IDS.length}
                className="inline-flex h-10 items-center justify-center rounded-full border border-rule bg-bg px-5 text-sm font-medium text-ink transition hover:border-ink-faint disabled:cursor-not-allowed disabled:opacity-50"
              >
                + Add another tool
              </button>
            </div>
          </div>
        </section>

        {/* ------- SECTION B: Your team ------- */}
        <section>
          <SectionHeader
            number="B"
            title="Your team"
            hint="Two more inputs and we're done."
          />

          <div className="card-shadow mt-5 grid gap-6 rounded-3xl border border-rule bg-surface p-6 sm:grid-cols-2 sm:p-7">
            <div>
              <Label htmlFor="teamSize">Team size</Label>
              <input
                id="teamSize"
                type="number"
                min={1}
                max={500}
                value={input.teamSize}
                onChange={(e) =>
                  setInput((s) => ({
                    ...s,
                    teamSize: Math.max(1, Number(e.target.value) || 1),
                  }))
                }
                className="mt-2 block h-11 w-full rounded-xl border border-rule bg-bg px-3.5 text-base text-ink outline-none transition focus:border-green focus:bg-surface"
              />
            </div>

            <div>
              <Label>Primary use case</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {USE_CASES.map((u) => {
                  const selected = input.useCase === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() =>
                        setInput((s) => ({ ...s, useCase: u.id }))
                      }
                      className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition ${
                        selected
                          ? "border-ink bg-ink text-cta-ink"
                          : "border-rule bg-bg text-ink hover:border-ink-faint"
                      }`}
                      aria-pressed={selected}
                    >
                      {u.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* honeypot — bots fill it, humans never see it */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="absolute left-[-9999px] size-0 opacity-0"
        />

        {/* mobile-only sticky CTA — pins to the bottom of the viewport */}
        <div className="sticky bottom-4 z-20 lg:hidden">
          <SubmitBar runningMonthly={runningMonthly} />
        </div>
      </div>

      {/* desktop sticky right rail */}
      <aside className="hidden lg:block">
        <div className="sticky top-28">
          <SidebarTotal
            runningMonthly={runningMonthly}
            toolCount={input.tools.length}
          />
        </div>
      </aside>
    </form>
  );
}

/* ============================================
   Sub-components
   ============================================ */

function SectionHeader({
  number,
  title,
  hint,
}: {
  number: string;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
        {number}
      </span>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-ink-muted">{hint}</p>
      </div>
    </div>
  );
}

function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint"
    >
      {children}
    </label>
  );
}

function ToolRow({
  entry,
  onTool,
  onPlan,
  onSpend,
  onSeats,
  onRemove,
}: {
  entry: ToolEntry;
  onTool: (t: ToolId) => void;
  onPlan: (p: string) => void;
  onSpend: (v: number) => void;
  onSeats: (v: number) => void;
  onRemove?: () => void;
}) {
  const tool = TOOLS[entry.tool];
  const Mark = TOOL_MARKS[entry.tool];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.4fr_1.4fr_1fr_0.8fr_auto] sm:items-end sm:gap-4">
      {/* Tool */}
      <div>
        <Label>Tool</Label>
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-rule bg-bg pl-3 has-[select:focus]:border-green has-[select:focus]:bg-surface">
          <Mark className="size-4 shrink-0 text-ink-muted" />
          <select
            value={entry.tool}
            onChange={(e) => onTool(e.target.value as ToolId)}
            className="block h-11 w-full bg-transparent pr-3 text-base text-ink outline-none"
            aria-label="Tool"
          >
            {TOOL_IDS.map((id) => (
              <option key={id} value={id}>
                {TOOLS[id].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Plan */}
      <div>
        <Label>Plan</Label>
        <select
          value={entry.plan}
          onChange={(e) => onPlan(e.target.value)}
          className="mt-2 block h-11 w-full rounded-xl border border-rule bg-bg px-3.5 text-base text-ink outline-none transition focus:border-green focus:bg-surface"
          aria-label="Plan"
        >
          {tool.plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Monthly spend */}
      <div>
        <Label>Spend / mo</Label>
        <div className="mt-2 flex h-11 items-center rounded-xl border border-rule bg-bg pl-3 focus-within:border-green focus-within:bg-surface">
          <span className="font-mono text-sm text-ink-faint">$</span>
          <input
            type="number"
            min={0}
            step={1}
            value={entry.monthlySpendUsd || ""}
            onChange={(e) => onSpend(Number(e.target.value) || 0)}
            className="block h-full w-full bg-transparent px-2 font-mono text-base text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            aria-label="Monthly spend in USD"
          />
        </div>
      </div>

      {/* Seats */}
      <div>
        <Label>Seats</Label>
        <input
          type="number"
          min={1}
          max={500}
          value={entry.seats}
          onChange={(e) =>
            onSeats(Math.max(1, Number(e.target.value) || 1))
          }
          className="mt-2 block h-11 w-full rounded-xl border border-rule bg-bg px-3.5 font-mono text-base text-ink outline-none transition focus:border-green focus:bg-surface"
          aria-label="Seats"
        />
      </div>

      {/* Remove */}
      <div className="sm:pb-0.5">
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex size-10 items-center justify-center rounded-full text-ink-muted transition hover:bg-bg hover:text-ink-muted/80"
            aria-label="Remove tool"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="size-4"
            >
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function SidebarTotal({
  runningMonthly,
  toolCount,
}: {
  runningMonthly: number;
  toolCount: number;
}) {
  return (
    <div className="card-shadow rounded-3xl border border-rule bg-surface p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
        Running total
      </p>
      <p className="mt-3 font-money text-4xl font-semibold tracking-tight text-ink">
        ${runningMonthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        <span className="font-sans text-base font-medium text-ink-muted">
          {" "}
          / mo
        </span>
      </p>
      <p className="mt-1 font-mono text-xs text-ink-faint">
        ${(runningMonthly * 12).toLocaleString("en-US", { maximumFractionDigits: 0 })} / yr ·{" "}
        {toolCount} tool{toolCount === 1 ? "" : "s"}
      </p>

      <button
        type="submit"
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-cta-bg px-6 text-base font-medium text-cta-ink transition hover:-translate-y-px hover:bg-[#1a1a1c] disabled:opacity-50"
        disabled={toolCount === 0}
      >
        Run my audit →
      </button>

      <p className="mt-4 text-xs text-ink-faint">
        Auto-saved as you type. We never see your bill.
      </p>
    </div>
  );
}

function SubmitBar({ runningMonthly }: { runningMonthly: number }) {
  return (
    <div className="card-shadow flex items-center justify-between rounded-3xl border border-rule bg-surface p-5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          Running total
        </p>
        <p className="mt-1 font-money text-2xl font-semibold tracking-tight text-ink">
          ${runningMonthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          <span className="font-sans text-sm text-ink-muted">/mo</span>
        </p>
      </div>
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-full bg-cta-bg px-5 text-sm font-medium text-cta-ink transition hover:-translate-y-px hover:bg-[#1a1a1c]"
      >
        Run audit →
      </button>
    </div>
  );
}
