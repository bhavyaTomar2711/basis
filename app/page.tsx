export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-10 sm:py-8">
        <span className="font-display text-xl font-semibold tracking-tight">
          Basis
        </span>
        <nav className="hidden gap-8 text-sm text-ink-muted sm:flex">
          <a className="hover:text-ink" href="#how">
            How it works
          </a>
          <a className="hover:text-ink" href="#sample">
            Sample audit
          </a>
          <a className="hover:text-ink" href="#methodology">
            Methodology
          </a>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 sm:px-10">
        {/* HERO */}
        <section className="grid gap-12 pt-12 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-20 lg:pt-28">
          <div className="flex flex-col items-start">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-rule bg-paper-elev px-3 py-1 text-xs uppercase tracking-[0.14em] text-ink-muted">
              <span className="size-1.5 rounded-full bg-green" />
              <span>Free · 2 minutes · No login</span>
            </p>

            <h1 className="font-display text-[clamp(2.75rem,7vw,5.25rem)] font-semibold leading-[0.98] tracking-[-0.02em]">
              The basis for
              <br />
              your AI spend.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-muted sm:text-xl">
              An itemized audit of what your team pays for Cursor, Copilot,
              Claude, ChatGPT, Gemini and the rest. See where you&rsquo;re
              overspending, what to switch to, and how much you&rsquo;d save in
              a year.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="/audit/new"
                className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-7 text-base font-medium text-paper transition hover:-translate-y-px hover:bg-[#1a1a17]"
              >
                Run my audit
              </a>
              <a
                href="#sample"
                className="inline-flex h-12 items-center justify-center rounded-full border border-rule px-6 text-base text-ink transition hover:bg-paper-elev"
              >
                See a sample
              </a>
            </div>

            <p className="mt-10 max-w-md text-sm text-ink-faint">
              We don&rsquo;t store your bill. We don&rsquo;t need a login. The
              audit shows on screen first &mdash; you decide whether to email
              yourself a copy.
            </p>
          </div>

          {/* Hero "audit object" — live HTML, no asset */}
          <AuditCard />
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how"
          className="mt-32 border-t border-rule pt-16 sm:mt-44 sm:pt-24"
        >
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-ink-faint">
            How it works
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Three short steps. Two minutes.
          </h2>

          <ol className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-10">
            {[
              {
                n: "01",
                t: "List your tools",
                d: "Pick the AI tools you pay for, the plan, and how many seats. Auto-suggested prices.",
              },
              {
                n: "02",
                t: "Tell us your team",
                d: "Headcount and primary use case. That's all we need to size your stack.",
              },
              {
                n: "03",
                t: "Get your audit",
                d: "Per-tool recommendations with real math. Total monthly + annual savings. Shareable.",
              },
            ].map((s) => (
              <li key={s.n} className="border-t border-rule pt-5">
                <p className="font-mono text-xs tracking-widest text-ink-faint">
                  {s.n}
                </p>
                <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">
                  {s.t}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-ink-muted">
                  {s.d}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <div className="h-32" />
      </main>

      <footer className="mx-auto w-full max-w-6xl border-t border-rule px-6 py-8 sm:px-10">
        <div className="flex flex-col gap-3 text-sm text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span>
            <span className="font-display font-semibold text-ink">Basis</span>
            &nbsp; &middot; &nbsp; A free tool by Credex.
          </span>
          <span>Pricing data verified 2026-05-07.</span>
        </div>
      </footer>
    </div>
  );
}

/**
 * AuditCard — live HTML "audit document" used as the landing-hero product
 * object (brain.md §3.7). No image asset. Stylised to look like a torn-page
 * receipt with a savings total at the bottom.
 */
function AuditCard() {
  const rows = [
    { label: "Cursor Teams · 4 seats", current: "$160", recommended: "$80" },
    { label: "ChatGPT Business · 2 seats", current: "$50", recommended: "$40" },
    { label: "Claude Max 20×", current: "$200", recommended: "$100" },
    { label: "OpenAI API direct", current: "$1,800", recommended: "$1,440" },
  ];
  return (
    <aside
      aria-label="Sample audit report card"
      className="relative w-full self-start"
    >
      <div className="rotate-[1.5deg] rounded-2xl bg-paper-elev p-7 shadow-paper sm:p-9">
        <div className="flex items-baseline justify-between border-b border-rule pb-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            Audit · #A1B2C3
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            07 May 2026
          </p>
        </div>

        <p className="mt-6 text-xs uppercase tracking-[0.16em] text-ink-faint">
          Findings
        </p>
        <ul className="mt-3 space-y-2.5">
          {rows.map((r) => (
            <li
              key={r.label}
              className="grid grid-cols-[1fr_auto_auto] items-baseline gap-3 text-sm"
            >
              <span className="text-ink">{r.label}</span>
              <span className="font-mono text-ink-faint line-through">
                {r.current}
              </span>
              <span className="font-mono font-medium text-ink">
                {r.recommended}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t border-rule pt-5">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">
              Total saved / month
            </span>
            <span className="font-display text-3xl font-semibold tracking-tight text-green">
              $590
            </span>
          </div>
          <p className="mt-2 text-right font-mono text-xs text-ink-faint">
            $7,080 saved per year
          </p>
        </div>
      </div>
    </aside>
  );
}
