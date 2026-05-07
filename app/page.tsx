/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Fragment } from "react";
import {
  AnthropicMark,
  CopilotMark,
  CursorMark,
  GeminiMark,
  LovableMark,
  OpenAiMark,
  WindsurfMark,
} from "@/lib/brand-marks";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <Showcase />
        <WhereTeamsOverspend />
        <HowItWorks />
        <Methodology />
      </main>
      <SiteFooter />
    </div>
  );
}

/* ============================================
   Nav — Apple/Stripe-style clean toolbar
   ============================================ */
function SiteNav() {
  return (
    <header className="sticky top-4 z-30 mx-auto w-full max-w-7xl px-4 sm:top-6 sm:px-6">
      {/* Refined nav: taller for presence, subtle shadow, glass effect. */}
      <div className="shadow-sm flex h-20 items-center justify-between rounded-full border border-rule/60 bg-surface/50 px-8 backdrop-blur-md backdrop-saturate-100 sm:h-20 sm:px-10">
        <Link href="/" className="transition hover:opacity-80">
          <img
            src="/logo.png"
            alt="Basis"
            className="h-16 w-auto"
            loading="eager"
            decoding="sync"
          />
        </Link>
        {/* Middle links — bigger, with subtle background on hover */}
        <nav className="hidden items-center gap-2 sm:flex">
          {[
            { href: "#sample", label: "Sample audit" },
            { href: "#how", label: "How it works" },
            { href: "https://credex.rocks", label: "Credex" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-4 py-2 text-[15px] font-medium text-ink-muted transition-all duration-150 hover:bg-surface-2 hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <Link
          href="/audit/new"
          className="inline-flex h-12 items-center justify-center rounded-full bg-cta-bg/90 px-7 text-[15px] font-semibold text-cta-ink shadow-sm backdrop-blur transition hover:-translate-y-px hover:bg-[#1a1a1c] sm:h-12 sm:px-8"
        >
          Run audit
        </Link>
      </div>
    </header>
  );
}

/* ============================================
   Hero — centered (Credex-grammar). Floating logo cards live
   in the wide gutter outside the centered content column.
   ============================================ */
function Hero() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6 sm:pt-32 lg:pt-36">
      {/* radial glow behind the hero */}
      <div
        aria-hidden
        className="hero-glow pointer-events-none absolute inset-x-0 top-0 h-[120%]"
      />

      {/* Floating logo cards — positioned in the wide outer gutter.
          Hidden below xl (1280px) where there isn't enough gutter. */}
      <FloatingLogoCards />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <Badge>
          <span className="inline-flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-green" />
            <span className="font-semibold tracking-[0.14em] text-ink">
              FREE · 2 MIN · NO LOGIN
            </span>
            <span className="text-ink-muted">Audit your AI spend</span>
          </span>
        </Badge>

        <h1 className="mt-7 text-balance text-[clamp(2.5rem,7vw,5rem)] font-extrabold leading-[0.98] tracking-[-0.025em]">
          <span className="text-green">See what</span>{" "}
          <span className="text-ink">your AI stack</span>{" "}
          <span className="text-ink">actually costs.</span>
        </h1>

        <p className="mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-ink-muted sm:text-xl">
          An itemized audit of what your team pays for Cursor, Copilot, Claude,
          ChatGPT and the rest. We surface where you&rsquo;re overspending,
          what to switch to, and how much you&rsquo;d save in a year &mdash;
          with the math shown.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/audit/new"
            className="group inline-flex h-12 items-center justify-center rounded-full bg-cta-bg px-7 text-base font-medium text-cta-ink shadow-sm transition hover:-translate-y-px hover:bg-[#1a1a1c]"
          >
            Run my audit
            <span
              aria-hidden
              className="ml-2 transition-transform duration-200 group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
          <a
            href="#sample"
            className="inline-flex h-12 items-center justify-center rounded-full border border-rule bg-surface px-6 text-base text-ink transition hover:border-ink-faint"
          >
            See a sample
          </a>
        </div>

        <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 text-[13px] text-ink-muted">
          {[
            "No login",
            "No credit card",
            "Pricing data verified weekly",
            "Sources cited per finding",
          ].map((item) => (
            <li key={item} className="inline-flex items-center gap-2">
              <Check />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="card-shadow inline-flex items-center gap-2 rounded-full border border-rule bg-surface px-3.5 py-1.5 text-[11px] uppercase">
      {children}
    </span>
  );
}

function Check() {
  return (
    <span
      aria-hidden
      className="inline-flex size-4 items-center justify-center rounded-full bg-green-tint text-green-deep"
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-2.5"
      >
        <path d="M3.5 8.5l3 3 6-7" />
      </svg>
    </span>
  );
}

/* ============================================
   Floating logo cards — Credex's signature ornament.
   Container extends with negative inset so cards live in the gutter
   outside the max-w-3xl content column. Hidden below xl: where
   there isn't enough viewport gutter for them.
   ============================================ */
function FloatingLogoCards() {
  type CardSpec = {
    mark: React.ReactNode;
    label: string;
    pos: string;
    rot: string;
    delay: string;
  };
  const cards: CardSpec[] = [
    {
      mark: <CursorMark className="size-13" />,
      label: "Cursor",
      pos: "left-[-2%] top-[8%]",
      rot: "-9deg",
      delay: "delay-1",
    },
    {
      mark: <OpenAiMark className="size-13" />,
      label: "OpenAI",
      pos: "right-[-2%] top-[6%]",
      rot: "7deg",
      delay: "delay-2",
    },
    {
      mark: <CopilotMark className="size-13" />,
      label: "Copilot",
      pos: "left-[0%] top-[38%]",
      rot: "5deg",
      delay: "delay-3",
    },
    {
      mark: <LovableMark className="size-13" />,
      label: "Lovable",
      pos: "right-[10%] top-[28%]",
      rot: "-6deg",
      delay: "delay-4",
    },
    {
      mark: <GeminiMark className="size-13" />,
      label: "Gemini",
      pos: "right-[-1%] top-[60%]",
      rot: "8deg",
      delay: "delay-5",
    },
    {
      mark: <AnthropicMark className="size-13" />,
      label: "Anthropic",
      pos: "left-[1%] top-[72%]",
      rot: "8deg",
      delay: "",
    },
    {
      mark: <WindsurfMark className="size-13" />,
      label: "Windsurf",
      pos: "right-[9%] top-[88%]",
      rot: "-5deg",
      delay: "delay-1",
    },
  ];

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 hidden xl:block"
    >
      {cards.map((c) => (
        <div
          key={c.label}
          className={`absolute ${c.pos} float-card ${c.delay}`}
          style={{ ["--r" as string]: c.rot }}
          aria-label={c.label}
        >
          <div className="card-shadow flex items-center justify-center rounded-2xl border border-rule bg-surface p-4">
            {c.mark}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================
   Showcase — the audit card preview as a standalone moment.
   ============================================ */
function Showcase() {
  const rows = [
    {
      mark: <CursorMark className="size-4" />,
      tool: "Cursor",
      plan: "Teams · 4 seats",
      math: "$40 × 4 = $160/mo · Pro × 4 = $80/mo",
      savings: "80",
    },
    {
      mark: <CopilotMark className="size-4" />,
      tool: "GitHub Copilot",
      plan: "Enterprise · 6 seats",
      math: "$39 × 6 = $234/mo · Business × 6 = $114/mo",
      savings: "120",
    },
    {
      mark: <AnthropicMark className="size-4" />,
      tool: "Claude",
      plan: "Max 20×",
      math: "$200/mo · Max 5× covers your usage at $100/mo",
      savings: "100",
    },
    {
      mark: <OpenAiMark className="size-4" />,
      tool: "OpenAI API",
      plan: "Retail spend · $1,800/mo",
      math: "Discounted credits at ~20% off list = $1,440/mo",
      savings: "360",
    },
    {
      mark: <GeminiMark className="size-4" />,
      tool: "Gemini Advanced",
      plan: "Business · 3 seats",
      math: "$30 × 3 = $90/mo · Standard × 3 = $60/mo",
      savings: "30",
    },
  ];

  return (
    <section
      id="sample"
      className="mx-auto mt-24 w-full max-w-7xl px-4 sm:mt-32 sm:px-6"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          What you get
        </p>
        <h2 className="mt-3 text-balance text-[2.6rem] font-extrabold leading-tight tracking-[-0.025em] sm:text-[3.4rem]">
          A <span className="text-green">finance-grade</span> audit,{" "}
          <span className="text-ink">on screen in 2 minutes.</span>
        </h2>
        <p className="mt-5 text-pretty text-lg text-ink-muted">
          Every recommendation traces back to vendor-pricing-page math. No
          vibes. No &ldquo;Cursor bad, Claude good.&rdquo;
        </p>
      </div>

      {/* Two-card layout: straight findings card + tilted summary card */}
      <div className="relative mx-auto mt-16 flex flex-col items-center gap-8 xl:flex-row xl:items-start xl:justify-center xl:gap-8">

        {/* Card 1 — straight: audit findings */}
        <article className="card-shadow-lift w-full max-w-[520px] shrink-0 overflow-hidden rounded-3xl border border-rule bg-surface">
          <header className="flex items-center justify-between border-b border-rule px-6 py-4 sm:px-8 sm:py-5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                AUDIT · #A1B2C3
              </span>
              <span className="rounded-md bg-green-tint px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-green-deep">
                Sample
              </span>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
              07 May 2026
            </span>
          </header>

          <div className="px-6 py-6 sm:px-8 sm:py-7">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              Findings · 5 tools
            </p>
            <ul className="mt-4 divide-y divide-rule">
              {rows.map((r, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-3.5"
                >
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-rule bg-bg">
                    {r.mark}
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold leading-tight text-ink">
                      {r.tool}{" "}
                      <span className="font-normal text-ink-muted">
                        · {r.plan}
                      </span>
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
                      {r.math}
                    </p>
                  </div>
                  <p className="font-money text-[18px] font-semibold tabular-nums text-green-deep">
                    −${r.savings}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </article>

        {/* Card 2 — tilted: savings summary */}
        <article
          className="card-shadow-lift w-full max-w-[340px] shrink-0 overflow-hidden rounded-3xl border border-rule bg-surface transition-transform duration-500 hover:rotate-0 xl:mt-12"
          style={{ transform: "rotate(10deg)" }}
        >
          <div className="bg-green-tint px-6 py-6 sm:px-7 sm:py-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-green-deep">
              Total saved / month
            </p>
            <p className="mt-2 font-money text-[52px] font-semibold leading-none tracking-tight tabular-nums text-green-deep sm:text-[60px]">
              $690
            </p>
            <p className="mt-1 font-mono text-xs text-green-deep">
              $8,280 saved / yr
            </p>
          </div>

          <div className="px-6 py-5 sm:px-7 sm:py-6">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              Top opportunity
            </p>
            <div className="mt-3 flex items-start gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-rule bg-bg">
                <OpenAiMark className="size-4" />
              </span>
              <div>
                <p className="text-[14px] font-semibold text-ink">OpenAI API</p>
                <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
                  Switch to discounted credits
                </p>
                <p className="mt-1 font-money text-[18px] font-semibold text-green-deep">
                  −$360/mo
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-rule pt-5">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Breakdown
              </p>
              {[
                { label: "Coding IDEs", amount: "$200" },
                { label: "AI Assistants", amount: "$130" },
                { label: "API spend", amount: "$360" },
              ].map((b) => (
                <div
                  key={b.label}
                  className="mt-2.5 flex items-center justify-between"
                >
                  <span className="text-[13px] text-ink-muted">{b.label}</span>
                  <span className="font-money text-[14px] font-semibold text-green-deep">
                    −{b.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

      <div className="mt-14 flex justify-center">
        <Link
          href="/audit/new"
          className="inline-flex h-12 items-center justify-center rounded-full bg-cta-bg px-8 text-[15px] font-semibold text-cta-ink transition hover:-translate-y-px hover:bg-[#1a1a1c]"
        >
          Run mine →
        </Link>
      </div>
    </section>
  );
}

/* ============================================
   Where teams overspend — editorial split with stat cards.
   Bridges the "what you get" showcase and the "how it works" steps
   by establishing the *why*: four overspend patterns we see every audit.
   ============================================ */
function WhereTeamsOverspend() {
  const findings: {
    stat: string;
    statLabel: string;
    statSub: string;
    pattern: string;
    iconPath: string;
    topGradient: string;
    bottomLight: string;
    bottomDark: string;
    topInk: string;
  }[] = [
    {
      stat: "~22%",
      statLabel: "Avg leak",
      statSub: "of paid seats",
      pattern: "Unused seats",
      iconPath:
        "M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 3a3 3 0 11-6 0 3 3 0 016 0z",
      topGradient: "linear-gradient(135deg, #fecdd3 0%, #fda4af 100%)",
      bottomLight: "#fb7185",
      bottomDark: "#be123c",
      topInk: "#9f1239",
    },
    {
      stat: "2 / 3",
      statLabel: "Pattern rate",
      statSub: "teams audited",
      pattern: "Duplicate IDEs",
      iconPath: "M4 6h16M4 12h16M4 18h10M4 6v12",
      topGradient: "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)",
      bottomLight: "#f97316",
      bottomDark: "#9a3412",
      topInk: "#9a3412",
    },
    {
      stat: "$1.4k",
      statLabel: "Monthly excess",
      statSub: "/mo average",
      pattern: "Wrong tier",
      iconPath:
        "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      topGradient: "linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)",
      bottomLight: "#3b82f6",
      bottomDark: "#1e40af",
      topInk: "#1e40af",
    },
    {
      stat: "+18%",
      statLabel: "Growth YoY",
      statSub: "API list pricing",
      pattern: "Retail rates",
      iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
      topGradient: "linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)",
      bottomLight: "#10b981",
      bottomDark: "#065f46",
      topInk: "#065f46",
    },
  ];

  return (
    <section className="relative mx-auto mt-24 w-full max-w-7xl px-4 sm:mt-32 sm:px-6">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 xl:gap-20">
        {/* Left: editorial heading column */}
        <div className="lg:sticky lg:top-32 lg:self-start lg:pt-4">
          <p className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-green-deep">
            <span className="size-1.5 rounded-full bg-green" />
            Audit insights
          </p>
          <h2 className="mt-5 text-balance text-[2.5rem] font-extrabold leading-[1.02] tracking-[-0.025em] sm:text-[3.25rem] xl:text-[3.6rem]">
            Where teams{" "}
            <span className="relative inline-block">
              <span className="text-green">quietly</span>
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-1 h-[6px] origin-left scale-x-100 rounded-full bg-green-tint"
                style={{ zIndex: -1 }}
              />
            </span>{" "}
            overspend.
          </h2>
          <p className="mt-6 max-w-md text-pretty text-[17px] leading-relaxed text-ink-muted sm:text-lg">
            Four patterns we see in nearly every audit. Each one comes
            with a line item, the math, and a citation &mdash; never
            guesswork, never &ldquo;Cursor bad, Claude good.&rdquo;
          </p>
          <div className="mt-9 flex items-center gap-5">
            <Link
              href="/audit/new"
              className="group inline-flex h-12 items-center justify-center rounded-full bg-cta-bg px-7 text-[15px] font-semibold text-cta-ink transition hover:-translate-y-px hover:bg-[#1a1a1c]"
            >
              Find yours
              <span
                aria-hidden
                className="ml-2 transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
            <a
              href="#how"
              className="text-[14px] font-medium text-ink-muted underline-offset-4 transition hover:text-ink hover:underline"
            >
              How we audit
            </a>
          </div>
        </div>

        {/* Right: 2x2 grid of two-tone gradient stat cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {findings.map((f, idx) => (
            <article
              key={f.pattern}
              className="group relative mx-auto w-4/5 overflow-hidden rounded-[2rem] shadow-2xl transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] sm:mx-0 sm:w-full"
              style={{ aspectRatio: "1 / 1" }}
            >
              {/* Top half: lighter gradient */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-[46%]"
                style={{ background: f.topGradient }}
              />

              {/* Bottom half: SVG with gradient fill, curved top edge, decorative waves */}
              <svg
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[60%] w-full"
                viewBox="0 0 200 240"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id={`overspend-bg-${idx}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={f.bottomLight} />
                    <stop offset="100%" stopColor={f.bottomDark} />
                  </linearGradient>
                </defs>
                {/* Curved top of bottom section */}
                <path
                  d="M 0 18 Q 50 6 100 14 T 200 12 L 200 240 L 0 240 Z"
                  fill={`url(#overspend-bg-${idx})`}
                />
                {/* Decorative wave lines for depth */}
                <path
                  d="M 0 90 Q 50 70 100 86 T 200 82"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  opacity="0.18"
                />
                <path
                  d="M 0 130 Q 50 110 100 124 T 200 120"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  opacity="0.11"
                />
              </svg>

              {/* Top content: glassy icon + pattern label */}
              <div className="relative z-10 flex items-center justify-between p-5">
                <span className="inline-flex size-14 items-center justify-center rounded-2xl border-[2.5px] border-white bg-white/85 shadow-sm backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
                  <svg
                    viewBox="0 0 24 24"
                    className="size-7"
                    fill="none"
                    stroke={f.topInk}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={f.iconPath} />
                  </svg>
                </span>
                <h3
                  className="pr-0.5 text-[18px] font-semibold tracking-tight"
                  style={{ color: f.topInk }}
                >
                  {f.pattern}
                </h3>
              </div>

              {/* Bottom content: vertically centered in the dark section */}
              <div className="absolute inset-x-0 bottom-0 top-[46%] z-10 flex items-center px-5">
                <div className="w-full">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                    {f.statLabel}
                  </p>
                  <p className="mt-1.5 font-money text-[42px] font-bold leading-[0.95] tracking-tight tabular-nums text-white sm:text-[48px]">
                    {f.stat}
                  </p>
                  <p className="mt-1.5 text-[12px] text-white/85">
                    {f.statSub}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   How it works — large square gradient cards in a horizontal zigzag.
   Cards fill available space; each heading uses a dark accent of the card hue.
   ============================================ */
function HowItWorks() {
  const steps: {
    n: string;
    label: string;
    desc: string;
    topGradient: string;
    bottomLight: string;
    bottomDark: string;
    topInk: string;
    iconPath: string;
  }[] = [
    {
      n: "01",
      label: "List your tools",
      desc: "Plan, seats, monthly spend.",
      topGradient: "linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)",
      bottomLight: "#3b82f6",
      bottomDark: "#1e40af",
      topInk: "#1e40af",
      iconPath:
        "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    },
    {
      n: "02",
      label: "Tell us your team",
      desc: "Headcount and budget.",
      topGradient: "linear-gradient(135deg, #fecdd3 0%, #fda4af 100%)",
      bottomLight: "#fb7185",
      bottomDark: "#be123c",
      topInk: "#9f1239",
      iconPath:
        "M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 3a3 3 0 11-6 0 3 3 0 016 0z",
    },
    {
      n: "03",
      label: "Run the engine",
      desc: "Fourteen rules, every tool.",
      topGradient: "linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)",
      bottomLight: "#10b981",
      bottomDark: "#065f46",
      topInk: "#065f46",
      iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
    },
    {
      n: "04",
      label: "Review findings",
      desc: "The math behind each one.",
      topGradient: "linear-gradient(135deg, #fef08a 0%, #fde047 100%)",
      bottomLight: "#eab308",
      bottomDark: "#713f12",
      topInk: "#713f12",
      iconPath: "M3 3v18h18M7 14l3-3 3 3 5-5",
    },
    {
      n: "05",
      label: "Get your report",
      desc: "Monthly + annual savings.",
      topGradient: "linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 100%)",
      bottomLight: "#ec4899",
      bottomDark: "#86198f",
      topInk: "#86198f",
      iconPath:
        "M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.4 0 4.59.94 6.21 2.46",
    },
  ];

  return (
    <section
      id="how"
      className="mx-auto mt-24 w-full max-w-[1500px] px-4 pb-24 sm:mt-32 sm:px-6"
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          How it works
        </p>
        <h2 className="mt-3 text-balance text-[2.25rem] font-extrabold leading-tight tracking-[-0.025em] sm:text-5xl">
          Five steps.{" "}
          <span className="text-green">Two minutes.</span>
        </h2>
      </div>

      {/* Mobile: vertical · xl+: horizontal zigzag with big spacious cards */}
      <div className="mt-14 flex flex-col items-center gap-0 xl:mt-24 xl:flex-row xl:items-center xl:justify-between xl:gap-2 xl:py-24">
        {steps.map((step, i) => {
          const isUp = i % 2 === 0;
          return (
            <Fragment key={step.n}>
              {/* Square card — same structure/dimensions as the overspend cards */}
              <article
                className={`group relative mx-auto w-4/5 flex-1 overflow-hidden rounded-[2rem] shadow-2xl transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] sm:mx-0 sm:w-full xl:max-w-[320px] 2xl:max-w-[360px] ${
                  isUp ? "xl:-translate-y-14" : "xl:translate-y-14"
                }`}
                style={{ aspectRatio: "1 / 1" }}
              >
                {/* Top half: lighter gradient */}
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[46%]"
                  style={{ background: step.topGradient }}
                />

                {/* Bottom half: SVG with gradient fill, curved top edge, decorative waves */}
                <svg
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[60%] w-full"
                  viewBox="0 0 200 240"
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient
                      id={`how-bg-${i}`}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor={step.bottomLight} />
                      <stop offset="100%" stopColor={step.bottomDark} />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 18 Q 50 6 100 14 T 200 12 L 200 240 L 0 240 Z"
                    fill={`url(#how-bg-${i})`}
                  />
                  <path
                    d="M 0 90 Q 50 70 100 86 T 200 82"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    opacity="0.18"
                  />
                  <path
                    d="M 0 130 Q 50 110 100 124 T 200 120"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    opacity="0.11"
                  />
                </svg>

                {/* Top content: glassy icon + step number */}
                <div className="relative z-10 flex items-center justify-between p-5">
                  <span className="inline-flex size-14 items-center justify-center rounded-2xl border-[2.5px] border-white bg-white/85 shadow-sm backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-7"
                      fill="none"
                      stroke={step.topInk}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={step.iconPath} />
                    </svg>
                  </span>
                  <span
                    className="font-mono text-[12px] font-bold tracking-[0.22em]"
                    style={{ color: step.topInk, opacity: 0.7 }}
                  >
                    {step.n}
                  </span>
                </div>

                {/* Bottom content: vertically centered in the dark section */}
                <div className="absolute inset-x-0 bottom-0 top-[46%] z-10 flex items-center px-5">
                  <div className="w-full">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                      Step {step.n}
                    </p>
                    <h3 className="mt-1.5 text-[20px] font-bold leading-[1.05] tracking-tight text-white sm:text-[22px]">
                      {step.label}
                    </h3>
                    <p className="mt-1.5 text-[12px] leading-snug text-white/85">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </article>

              {/* Connector — vertical on mobile, horizontal on xl+ */}
              {i < steps.length - 1 && (
                <div
                  aria-hidden
                  className="flex flex-shrink-0 items-center justify-center py-4 xl:py-0"
                >
                  {/* Mobile: down arrow */}
                  <svg
                    viewBox="0 0 20 72"
                    width="20"
                    height="72"
                    className="xl:hidden"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line
                      x1="10"
                      y1="2"
                      x2="10"
                      y2="58"
                      stroke="#3E7F63"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="6 5"
                    />
                    <polygon points="3,56 17,56 10,70" fill="#3E7F63" />
                  </svg>
                  {/* xl+: right arrow */}
                  <svg
                    viewBox="0 0 48 20"
                    width="48"
                    height="20"
                    className="hidden xl:block"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line
                      x1="2"
                      y1="10"
                      x2="34"
                      y2="10"
                      stroke="#3E7F63"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="5 5"
                    />
                    <polygon points="32,3 32,17 46,10" fill="#3E7F63" />
                  </svg>
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================
   Methodology + Final CTA — editorial section anchored by an
   auto-sliding white/green ticker of trust attributes.
   Reads like a financial data sheet, not another colorful card grid.
   ============================================ */
function Methodology() {
  const items: {
    n: string;
    label: string;
    title: string;
    detail: string;
  }[] = [
    {
      n: "01",
      label: "Pricing",
      title: "Verified weekly against vendor pricing pages.",
      detail: "OpenAI, Anthropic, Cursor, Lovable, Windsurf, GitHub, Google.",
    },
    {
      n: "02",
      label: "Sources",
      title: "Every finding cites the public page that supports it.",
      detail: "One-click access to the source URL — never “trust me.”",
    },
    {
      n: "03",
      label: "Privacy",
      title: "No login. No integrations. No PII.",
      detail: "Run the audit anonymously. Your numbers never leave the session.",
    },
    {
      n: "04",
      label: "Logic",
      title: "Fourteen audit rules, openly documented.",
      detail: "Every rule, threshold, and assumption is published and dated.",
    },
  ];

  return (
    <section className="mt-24 sm:mt-32">
      {/* Heading band */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-green-deep">
              <span className="size-1.5 rounded-full bg-green" />
              Methodology
            </p>
            <h2 className="mt-4 text-balance text-[2.25rem] font-extrabold leading-[1.02] tracking-[-0.025em] sm:text-[3rem] xl:text-[3.4rem]">
              What you can <span className="text-green">verify</span>.
            </h2>
            <p className="mt-5 max-w-xl text-pretty text-[17px] leading-relaxed text-ink-muted sm:text-[18px]">
              Basis is a finance tool, not a pitch deck. If we can&apos;t cite it, we don&apos;t claim it.
            </p>
          </div>
          <div className="flex flex-row items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint sm:flex-col sm:items-end sm:gap-1">
            <span>As of 2026-05-07</span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-green animate-pulse" />
              <span className="text-green-deep">Live</span>
            </span>
          </div>
        </div>
      </div>

      {/* Auto-sliding ticker of white/green cards.
          Each card carries mr-6 so a translate of -50% loops seamlessly. */}
      <div
        aria-label="Methodology details"
        className="relative mt-12 overflow-hidden sm:mt-14"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
        }}
      >
        <div className="marquee-track flex w-max py-2">
          {[...items, ...items].map((it, i) => (
            <article
              key={`${it.n}-${i}`}
              className="card-shadow group relative mr-5 flex h-[260px] w-[340px] shrink-0 flex-col overflow-hidden rounded-3xl border border-rule bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-12px_rgba(14,122,82,0.20)] sm:mr-6 sm:h-[300px] sm:w-[420px]"
            >
              {/* Very-light-green wavy bottom — green-only palette so we
                  don't introduce another colour. Soft enough to read as
                  a tinted base, not a coloured panel. */}
              <svg
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[50%] w-full"
                viewBox="0 0 200 120"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id={`methodology-bg-${i}`}
                    x1="0%"
                    y1="0%"
                    x2="50%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#f3fbf6" />
                    <stop offset="100%" stopColor="#dcf1e5" />
                  </linearGradient>
                </defs>
                {/* Curved top edge of the green section */}
                <path
                  d="M 0 14 Q 50 4 100 10 T 200 8 L 200 120 L 0 120 Z"
                  fill={`url(#methodology-bg-${i})`}
                />
                {/* Decorative wave lines — green-deep stroke at very low opacity */}
                <path
                  d="M 0 46 Q 50 34 100 42 T 200 40"
                  fill="none"
                  stroke="#0e7a52"
                  strokeWidth="1.2"
                  opacity="0.14"
                />
                <path
                  d="M 0 74 Q 50 62 100 70 T 200 68"
                  fill="none"
                  stroke="#0e7a52"
                  strokeWidth="1.2"
                  opacity="0.09"
                />
                <path
                  d="M 0 100 Q 50 88 100 96 T 200 94"
                  fill="none"
                  stroke="#0e7a52"
                  strokeWidth="1.2"
                  opacity="0.05"
                />
              </svg>

              {/* Top section: pill label + step counter */}
              <div className="relative z-10 flex items-center justify-between px-7 pt-7">
                <span className="inline-flex items-center gap-2 rounded-full border border-green/25 bg-green-tint/80 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-green-deep">
                  <span className="size-1.5 rounded-full bg-green" />
                  {it.label}
                </span>
                <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-ink-faint">
                  {it.n}
                  <span className="mx-1.5 text-ink-faint/50">/</span>
                  04
                </span>
              </div>

              {/* Title — anchored mid-card, sized to feel like the headline */}
              <div className="relative z-10 px-7 pt-5">
                <h3 className="text-balance text-[23px] font-bold leading-[1.16] tracking-[-0.01em] text-ink">
                  {it.title}
                </h3>
              </div>

              {/* Bottom section: detail text on the wavy area */}
              <div className="relative z-10 mt-auto px-7 pb-6">
                <p className="text-[15px] font-medium leading-relaxed text-green-deep/90">
                  {it.detail}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Closer — big Fraunces money figure + CTA */}
      <div className="mx-auto mt-20 w-full max-w-6xl border-t border-ink/15 px-4 pt-16 text-center sm:mt-24 sm:px-6 sm:pt-20">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          Median team-of-twelve audit
        </p>
        <p className="mt-5 font-money text-[clamp(3.5rem,9vw,6rem)] font-bold leading-none tracking-[-0.02em] tabular-nums text-ink">
          $8,280<span className="text-ink-faint">/yr</span>
        </p>
        <p className="mx-auto mt-6 max-w-md text-pretty text-[16px] leading-relaxed text-ink-muted sm:text-[17px]">
          That&apos;s the typical annual savings we surface. Yours could be higher &mdash; or lower. The audit takes two minutes and shows the math, line by line.
        </p>
        <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-7">
          <Link
            href="/audit/new"
            className="group inline-flex h-14 items-center justify-center rounded-full bg-cta-bg px-9 text-[16px] font-semibold text-cta-ink shadow-sm transition hover:-translate-y-px hover:bg-[#1a1a1c]"
          >
            Run my audit
            <span
              aria-hidden
              className="ml-2 transition-transform duration-200 group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            Free &middot; 2 min &middot; No login
          </p>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   Footer — full-width dark, brand block + 3 link columns + meta row.
   ============================================ */
function SiteFooter() {
  const columns: { heading: string; links: { href: string; label: string }[] }[] =
    [
      {
        heading: "Product",
        links: [
          { href: "#sample", label: "Sample audit" },
          { href: "#how", label: "How it works" },
          { href: "/audit/new", label: "Run audit" },
        ],
      },
      {
        heading: "Methodology",
        links: [
          { href: "#", label: "Audit rules" },
          { href: "#", label: "Pricing sources" },
          { href: "#", label: "Verified weekly" },
        ],
      },
      {
        heading: "Company",
        links: [
          { href: "https://credex.rocks", label: "Credex" },
          { href: "mailto:hello@basis.credex.rocks", label: "Contact" },
          { href: "#", label: "Privacy" },
        ],
      },
    ];

  return (
    <footer className="mt-24 bg-[#0a0a0b] sm:mt-32">
      <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-16 sm:px-6 sm:pb-12 sm:pt-20">
        {/* Top: brand block + link columns */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.15fr_2fr] lg:gap-16">
          {/* Brand block */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-4 transition hover:opacity-90"
            >
              <img
                src="/footer-logo.png"
                alt="Basis"
                className="h-14 w-auto"
                loading="lazy"
                decoding="async"
              />
              <span className="hidden h-7 w-px bg-white/20 sm:block" />
              <span className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-white/45 sm:block">
                The basis for your AI spend
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-pretty text-[15px] leading-relaxed text-white/55">
              A free 2-minute audit of your team&apos;s AI tool spend. Cited per finding, no login required.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
              <span className="size-1.5 rounded-full bg-green" />
              Pricing data verified 2026-05-07
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.heading}>
                <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
                  {col.heading}
                </h4>
                <ul className="mt-5 space-y-3.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-[14.5px] text-white/80 transition hover:text-white hover:underline underline-offset-4 decoration-green/60"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: thin rule + meta row */}
        <div className="mt-14 border-t border-white/10 pt-7 sm:mt-16">
          <div className="flex flex-col gap-3 text-[13px] sm:flex-row sm:items-center sm:justify-between">
            <span className="text-white/50">
              © 2026 <span className="font-semibold text-white">Basis</span> · A free tool built for{" "}
              <a
                href="https://credex.rocks"
                className="text-white underline-offset-4 hover:underline"
              >
                Credex
              </a>
              .
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
              v1.0 &middot; Last updated 2026-05-07
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
