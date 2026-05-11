"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TOOLS } from "@/lib/pricing/data";
import type { ToolId } from "@/lib/pricing/types";
import type { AuditInput, ToolEntry, UseCase } from "@/lib/audit/types";
import { TOOL_MARKS } from "@/lib/brand-marks";

const STORAGE_KEY = "basis.audit-form.v1";
const TOOL_IDS: ToolId[] = [
  "cursor", "copilot", "claude", "chatgpt",
  "anthropic_api", "openai_api", "gemini", "windsurf",
];
const USE_CASES: { id: UseCase; label: string }[] = [
  { id: "coding",   label: "Coding"   },
  { id: "writing",  label: "Writing"  },
  { id: "data",     label: "Data"     },
  { id: "research", label: "Research" },
  { id: "mixed",    label: "Mixed"    },
];

const DEFAULT_INPUT: AuditInput = {
  tools: [{ tool: "cursor", plan: "pro", monthlySpendUsd: 20, seats: 1 }],
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
  } catch { return DEFAULT_INPUT; }
}

function defaultEntryForTool(toolId: ToolId): ToolEntry {
  const firstPaidPlan =
    TOOLS[toolId].plans.find((p) => (p.monthlyUsd ?? 0) > 0) ?? TOOLS[toolId].plans[0];
  return {
    tool: toolId,
    plan: firstPaidPlan.id,
    monthlySpendUsd: firstPaidPlan.billing === "usage" ? 0 : (firstPaidPlan.monthlyUsd ?? 0),
    seats: 1,
  };
}

/* ── Glassy custom Select ── */
function Select({
  value, onChange, options, icon, "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`flex h-11 w-full items-center gap-2 rounded-xl border bg-surface px-3 text-left text-[14px] font-medium text-ink transition-all duration-150 focus:outline-none ${
          open ? "border-green shadow-[0_0_0_3px_rgba(14,171,111,0.12)]" : "border-rule hover:border-ink-faint"
        }`}
      >
        {icon && <span className="flex-shrink-0 text-ink-muted">{icon}</span>}
        <span className="flex-1 truncate">{selectedLabel}</span>
        <span className={`flex-shrink-0 text-ink-faint transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      <div className={`absolute left-0 right-0 top-[calc(100%+4px)] z-[100] rounded-2xl border border-white/50 bg-white/90 shadow-[0_16px_48px_-8px_rgba(10,10,11,0.20),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl backdrop-saturate-150 transition-all duration-200 ease-out ${
        open ? "pointer-events-auto translate-y-0 opacity-100 scale-100" : "pointer-events-none -translate-y-1 opacity-0 scale-[0.98]"
      }`}>
        <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-green/40 to-transparent" />
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/50 to-transparent" />
        <div className="relative max-h-56 overflow-y-auto p-1.5">
          {options.map((o) => {
            const sel = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={sel}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-medium transition-all duration-100 ${
                  sel ? "bg-green-tint text-green-deep" : "text-ink hover:bg-surface-2"
                }`}
              >
                <svg className={`size-3.5 flex-shrink-0 transition-opacity ${sel ? "text-green opacity-100" : "opacity-0"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {o.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Main form ── */
export function AuditForm() {
  const [input, setInput] = useState<AuditInput>(DEFAULT_INPUT);
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { setInput(loadInitial()); setHydrated(true); }, []);
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
  }, [input, hydrated]);

  const runningMonthly = useMemo(
    () => input.tools.reduce((sum, t) => sum + (t.monthlySpendUsd || 0), 0),
    [input.tools],
  );
  const totalSeats = useMemo(
    () => input.tools.reduce((sum, t) => sum + (t.seats || 1), 0),
    [input.tools],
  );

  const addTool = () => {
    const used = new Set(input.tools.map((t) => t.tool));
    const next = TOOL_IDS.find((id) => !used.has(id)) ?? "cursor";
    setInput((s) => ({ ...s, tools: [...s.tools, defaultEntryForTool(next)] }));
  };
  const removeTool = (idx: number) =>
    setInput((s) => ({ ...s, tools: s.tools.filter((_, i) => i !== idx) }));
  const updateTool = (idx: number, partial: Partial<ToolEntry>) =>
    setInput((s) => ({ ...s, tools: s.tools.map((t, i) => i === idx ? { ...t, ...partial } : t) }));
  const onToolChange = (idx: number, newTool: ToolId) =>
    setInput((s) => ({ ...s, tools: s.tools.map((t, i) => i === idx ? defaultEntryForTool(newTool) : t) }));
  const onPlanChange = (idx: number, newPlan: string) => {
    const tool = input.tools[idx].tool;
    const plan = TOOLS[tool].plans.find((p) => p.id === newPlan);
    setInput((s) => ({
      ...s,
      tools: s.tools.map((t, i) =>
        i === idx ? {
          ...t, plan: newPlan,
          monthlySpendUsd: plan?.billing === "usage" || plan?.monthlyUsd === null
            ? t.monthlySpendUsd : (plan?.monthlyUsd ?? 0) * t.seats,
        } : t,
      ),
    }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const honeypot = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value;
    if (honeypot) return;
    if (input.tools.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error(`Submit failed: ${res.status}`);
      const { id } = (await res.json()) as { id: string };
      window.location.href = `/audit/${id}`;
    } catch (err) {
      console.error(err);
      window.sessionStorage.setItem("basis.audit-pending", JSON.stringify(input));
      window.location.href = "/audit/preview";
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-10 grid w-full max-w-[1300px] gap-5 lg:mt-14 lg:grid-cols-[1fr_360px] lg:items-stretch lg:gap-8"
    >
      {/* ── Left column ── */}
      <div className="flex flex-col gap-5">

        {/* ══════ SECTION A — Tools ══════ */}
        <section
          className="rounded-3xl border border-rule bg-surface shadow-[0_2px_20px_-4px_rgba(10,10,11,0.07)]"
          style={{ borderLeftWidth: "3px", borderLeftColor: "var(--green)" }}
        >
          {/* Card header */}
          <div className="flex items-start gap-4 px-6 py-6">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-green-tint">
              <svg className="size-5 text-green" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-xl font-extrabold text-green">A</span>
                <h2 className="text-[1.4rem] font-bold tracking-[-0.02em] text-ink sm:text-[1.5rem]">Tools you pay for</h2>
              </div>
              <p className="mt-1 text-[13px] text-ink-muted">Add a row for each AI tool on your team&rsquo;s bill.</p>
            </div>
          </div>

          {/* Column headers — plain, no bg */}
          <div className="hidden border-t border-rule px-6 pb-2 pt-3 sm:grid sm:grid-cols-[1.6fr_1.4fr_1fr_0.75fr_2.5rem] sm:items-center sm:gap-4">
            {["Tool", "Plan", "Spend / mo", "Seats"].map((h) => (
              <span key={h} className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">{h}</span>
            ))}
            <span />
          </div>

          {/* Tool rows */}
          <ul className="border-t border-rule">
            {input.tools.map((entry, idx) => {
              const subtotal = entry.monthlySpendUsd || 0;
              const Mark = TOOL_MARKS[entry.tool];
              const toolOptions = TOOL_IDS.map((id) => ({ value: id, label: TOOLS[id].label }));
              const planOptions = TOOLS[entry.tool].plans.map((p) => ({ value: p.id, label: p.name }));

              return (
                <li key={idx} className={`relative px-6 py-5 ${idx < input.tools.length - 1 ? "border-b border-rule" : ""}`}>

                  {/* Mobile layout */}
                  <div className="sm:hidden">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-ink">{TOOLS[entry.tool].label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-ink">
                          ${subtotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}<span className="text-xs text-ink-faint">/mo</span>
                        </span>
                        {input.tools.length > 1 && (
                          <button type="button" onClick={() => removeTool(idx)}
                            className="flex size-7 items-center justify-center rounded-full text-ink-faint transition hover:bg-red-50 hover:text-red-400"
                            aria-label="Remove tool">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-3.5">
                              <path d="M6 6l12 12M6 18L18 6" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">Tool</span>
                        <Select value={entry.tool} onChange={(v) => onToolChange(idx, v as ToolId)} options={toolOptions} icon={<Mark className="size-4" />} aria-label="Tool" />
                      </div>
                      <div>
                        <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">Plan</span>
                        <Select value={entry.plan} onChange={(v) => onPlanChange(idx, v)} options={planOptions} aria-label="Plan" />
                      </div>
                      <div>
                        <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">Spend / mo</span>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-faint">$</span>
                          <input type="number" min={0} step={1} value={entry.monthlySpendUsd || ""} onChange={(e) => updateTool(idx, { monthlySpendUsd: Number(e.target.value) || 0 })}
                            className="block h-11 w-full rounded-xl border border-rule bg-surface pl-7 pr-3 font-mono text-[14px] text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            aria-label="Monthly spend" />
                        </div>
                      </div>
                      <div>
                        <span className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted">Seats</span>
                        <input type="number" min={1} max={500} value={entry.seats} onChange={(e) => updateTool(idx, { seats: Math.max(1, Number(e.target.value) || 1) })}
                          className="block h-11 w-full rounded-xl border border-rule bg-surface px-3 font-mono text-[14px] text-ink outline-none"
                          aria-label="Seats" />
                      </div>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden sm:grid sm:grid-cols-[1.6fr_1.4fr_1fr_0.75fr_2.5rem] sm:items-center sm:gap-4">
                    <Select value={entry.tool} onChange={(v) => onToolChange(idx, v as ToolId)} options={toolOptions} icon={<Mark className="size-4" />} aria-label="Tool" />
                    <Select value={entry.plan} onChange={(v) => onPlanChange(idx, v)} options={planOptions} aria-label="Plan" />
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-faint">$</span>
                      <input type="number" min={0} step={1} value={entry.monthlySpendUsd || ""} onChange={(e) => updateTool(idx, { monthlySpendUsd: Number(e.target.value) || 0 })}
                        className="block h-11 w-full rounded-xl border border-rule bg-surface pl-7 pr-3 font-mono text-[14px] text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        aria-label="Monthly spend" />
                    </div>
                    <input type="number" min={1} max={500} value={entry.seats} onChange={(e) => updateTool(idx, { seats: Math.max(1, Number(e.target.value) || 1) })}
                      className="block h-11 w-full rounded-xl border border-rule bg-surface px-3 text-center font-mono text-[14px] text-ink outline-none"
                      aria-label="Seats" />
                    {input.tools.length > 1 ? (
                      <button type="button" onClick={() => removeTool(idx)}
                        className="flex size-8 items-center justify-center rounded-full text-ink-faint transition hover:bg-red-50 hover:text-red-400"
                        aria-label="Remove tool">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-3.5">
                          <path d="M6 6l12 12M6 18L18 6" />
                        </svg>
                      </button>
                    ) : <span />}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Total row */}
          {input.tools.length > 1 && (
            <div className="flex items-center justify-between border-t border-rule px-6 py-3.5">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{input.tools.length} tools</span>
              <span className="font-mono text-sm font-semibold text-ink">
                ${runningMonthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}<span className="text-xs font-normal text-ink-faint">/mo</span>
              </span>
            </div>
          )}

          {/* Add tool — full-width dashed */}
          <div className="border-t border-rule px-6 py-5">
            <button type="button" onClick={addTool} disabled={input.tools.length >= TOOL_IDS.length}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-ink-faint/40 py-3.5 text-[13px] font-medium transition hover:border-green/60 disabled:cursor-not-allowed disabled:opacity-40">
              <span className="flex size-5 items-center justify-center rounded-full border border-green text-green">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
              <span className="font-medium text-green">Add another tool</span>
            </button>
          </div>
        </section>

        {/* ══════ SECTION B — Team ══════ */}
        <section
          className="rounded-3xl border border-rule bg-surface shadow-[0_2px_20px_-4px_rgba(10,10,11,0.07)]"
          style={{ borderLeftWidth: "3px", borderLeftColor: "var(--green)" }}
        >
          {/* Card header */}
          <div className="flex items-start gap-4 px-6 py-6">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-green-tint">
              <svg className="size-5 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-xl font-extrabold text-green">B</span>
                <h2 className="text-[1.4rem] font-bold tracking-[-0.02em] text-ink sm:text-[1.5rem]">Your team</h2>
              </div>
              <p className="mt-1 text-[13px] text-ink-muted">Two more inputs and we&rsquo;re done.</p>
            </div>
          </div>

          {/* Team size + use case */}
          <div className="border-t border-rule px-6 py-6 sm:flex sm:items-start sm:gap-10">
            {/* Team size */}
            <div className="sm:w-44 sm:shrink-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">Team size</p>
              <div className="relative mt-2.5">
                <input
                  type="number" min={1} max={500} value={input.teamSize}
                  onChange={(e) => setInput(s => ({ ...s, teamSize: Math.max(1, Number(e.target.value) || 1) }))}
                  className="h-11 w-full rounded-xl border border-rule bg-surface pl-4 pr-10 font-mono text-[15px] font-medium text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Use case */}
            <div className="mt-5 flex-1 sm:mt-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">Primary use case</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {USE_CASES.map((u) => {
                  const selected = input.useCase === u.id;
                  return (
                    <button
                      key={u.id} type="button"
                      onClick={() => setInput(s => ({ ...s, useCase: u.id }))}
                      aria-pressed={selected}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-[13px] font-medium transition-all duration-150 ${
                        selected
                          ? "border-transparent bg-ink text-white shadow-sm"
                          : "border-rule bg-surface text-ink hover:border-ink-faint"
                      }`}
                    >
                      {selected && (
                        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                      {u.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* honeypot */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] size-0 opacity-0" />

        {/* Mobile CTA */}
        <div className="lg:hidden">
          <SubmitBar
            runningMonthly={runningMonthly}
            toolCount={input.tools.length}
            totalSeats={totalSeats}
            submitting={submitting}
          />
        </div>
      </div>

      {/* ── Right rail — stretches to match A + B height ── */}
      <aside className="hidden lg:flex lg:flex-col">
        <SidebarTotal
          runningMonthly={runningMonthly}
          toolCount={input.tools.length}
          totalSeats={totalSeats}
          submitting={submitting}
        />
      </aside>
    </form>
  );
}

/* ── Sidebar ── */
function SidebarTotal({ runningMonthly, toolCount, totalSeats, submitting }: {
  runningMonthly: number;
  toolCount: number;
  totalSeats: number;
  submitting: boolean;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-rule bg-surface shadow-[0_4px_24px_-6px_rgba(10,10,11,0.10)]">
      {/* Green top accent */}
      <div className="h-[3px] w-full bg-green" />

      <div className="flex flex-1 flex-col px-7 py-7">

        {/* Chart icon */}
        <div className="flex size-11 items-center justify-center rounded-2xl bg-green-tint">
          <svg className="size-5 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>

        {/* Running total */}
        <p className="mt-6 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-faint">Running total</p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-money text-[3rem] font-bold leading-none tracking-tight text-ink">
            ${runningMonthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </span>
          <span className="font-sans text-[1.1rem] font-medium text-ink-muted">/mo</span>
        </div>
        <p className="mt-1.5 text-[13px] text-ink-faint">
          ${(runningMonthly * 12).toLocaleString("en-US", { maximumFractionDigits: 0 })} / yr
          {" · "}{toolCount} tool{toolCount === 1 ? "" : "s"}
          {" · "}{totalSeats} seat{totalSeats === 1 ? "" : "s"}
        </p>

        {/* Divider */}
        <div className="my-5 h-px bg-rule" />

        {/* Ready to run card */}
        <div className="flex items-start gap-3 rounded-2xl bg-green-tint px-4 py-4">
          <span className="mt-0.5 shrink-0">
            {/* 4-pointed sparkle */}
            <svg className="size-4 text-green" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C12 2 13.5 8.5 20 10C13.5 11.5 12 18 12 18C12 18 10.5 11.5 4 10C10.5 8.5 12 2 12 2Z" />
            </svg>
          </span>
          <div>
            <p className="text-[13px] font-semibold leading-snug text-green-deep">Ready to run your audit</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">We&rsquo;ll analyze your stack and show you where you can save.</p>
          </div>
        </div>

        {/* Spacer pushes button down */}
        <div className="flex-1" />

        <button
          type="submit"
          className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-cta-bg px-6 text-[15px] font-semibold text-cta-ink shadow-sm transition hover:-translate-y-px hover:bg-[#1a1a1c] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={toolCount === 0 || submitting}
        >
          {submitting ? "Running…" : <>Run my audit <span aria-hidden>→</span></>}
        </button>
        <p className="mt-3 text-center text-[12px] leading-relaxed text-ink-faint">
          Auto-saved as you type.<br />We never see your bill.
        </p>
      </div>
    </div>
  );
}

/* ── Mobile submit bar ── */
function SubmitBar({
  runningMonthly, toolCount, totalSeats, submitting,
}: {
  runningMonthly: number;
  toolCount: number;
  totalSeats: number;
  submitting: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-rule bg-surface/95 shadow-[0_8px_40px_-8px_rgba(10,10,11,0.25)] backdrop-blur-xl">
      {/* Green top accent — matches desktop sidebar */}
      <div className="h-[3px] w-full bg-green" />

      <div className="px-6 py-7">
        {/* Total row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="flex size-11 items-center justify-center rounded-2xl bg-green-tint">
              <svg className="size-5 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">Running total</p>
              <div className="flex items-baseline gap-1">
                <span className="font-money text-[2rem] font-bold leading-none tracking-tight text-ink">
                  ${runningMonthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </span>
                <span className="font-sans text-base font-medium text-ink-muted">/mo</span>
              </div>
            </div>
          </div>
          <p className="text-right text-[12px] text-ink-faint">
            ${(runningMonthly * 12).toLocaleString("en-US", { maximumFractionDigits: 0 })}/yr<br />
            {toolCount} tool{toolCount === 1 ? "" : "s"} · {totalSeats} seat{totalSeats === 1 ? "" : "s"}
          </p>
        </div>

        {/* Divider */}
        <div className="my-5 h-px bg-rule" />

        {/* Ready to run card */}
        <div className="flex items-start gap-3 rounded-2xl bg-green-tint px-4 py-4">
          <svg className="mt-0.5 size-4 shrink-0 text-green" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C12 2 13.5 8.5 20 10C13.5 11.5 12 18 12 18C12 18 10.5 11.5 4 10C10.5 8.5 12 2 12 2Z" />
          </svg>
          <div>
            <p className="text-[13px] font-semibold text-green-deep">Ready to run your audit</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">We&rsquo;ll analyze your stack and show you where you can save.</p>
          </div>
        </div>

        {/* Button */}
        <button
          type="submit"
          className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-cta-bg text-[15px] font-semibold text-cta-ink shadow-sm transition hover:bg-[#1a1a1c] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={toolCount === 0 || submitting}
        >
          {submitting ? "Running…" : <>Run my audit <span aria-hidden>→</span></>}
        </button>

        <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-faint">Auto-saved as you type. · We never see your bill.</p>
      </div>
    </div>
  );
}
