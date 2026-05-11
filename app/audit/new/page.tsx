import type { Metadata } from "next";
import { SiteNav } from "@/app/_components/site-nav";
import { AuditForm } from "./audit-form";

export const metadata: Metadata = {
  title: "Run your audit · Basis",
  description:
    "List the AI tools you pay for, tell us your team size and use case. Get an itemized audit in 2 minutes.",
};

export default function NewAuditPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pt-14 sm:px-8 sm:pt-20">
        {/* ── Page hero ── */}
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge — matches homepage style */}
          <span className="inline-flex items-center gap-2 rounded-full border border-rule bg-surface px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink shadow-sm">
            <span className="size-1.5 rounded-full bg-green" />
            Step 1 of 1 · 2 minutes
          </span>

          <h1 className="mt-5 text-balance text-[clamp(3.2rem,8vw,4.25rem)] font-extrabold leading-[0.97] tracking-[-0.03em]">
            Tell us what you{" "}
            <span className="text-green">pay for.</span>
          </h1>

          <p className="mt-5 text-pretty text-lg leading-relaxed text-ink-muted sm:text-xl">
            We&rsquo;ll itemize your spend and surface savings with the math
            shown. No login. Auto-saved as you type.
          </p>

          {/* Trust signals */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-ink-muted">
            {["No login", "No credit card", "Sources cited per finding"].map(
              (item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <span className="inline-flex size-4 items-center justify-center rounded-full bg-green-tint text-green-deep">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-2.5">
                      <path d="M3.5 8.5l3 3 6-7" />
                    </svg>
                  </span>
                  {item}
                </span>
              )
            )}
          </div>
        </div>

        <AuditForm />
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-center text-sm text-ink-faint">
          Pricing data verified 2026-05-11. See{" "}
          <a className="underline-offset-4 hover:underline" href="/methodology">
            methodology
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
