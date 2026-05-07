import type { Metadata } from "next";
import Link from "next/link";
import { AuditForm } from "./audit-form";

export const metadata: Metadata = {
  title: "Run your audit · Basis",
  description:
    "List the AI tools you pay for, tell us your team size and use case. Get an itemized audit in 2 minutes.",
};

export default function NewAuditPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-4 z-30 mx-auto w-full max-w-6xl px-4 sm:top-6 sm:px-6">
        <div className="card-shadow flex items-center justify-between rounded-full bg-surface px-4 py-2.5 sm:px-5 sm:py-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-2 text-lg font-bold tracking-tight text-ink"
          >
            <span aria-hidden className="size-2 rounded-full bg-green" />
            <span>Basis</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-ink-muted transition hover:text-ink"
          >
            ← Back home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
            Step 1 of 1
          </p>
          <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Tell us what you pay for.
          </h1>
          <p className="mt-4 text-pretty text-lg text-ink-muted">
            We&rsquo;ll itemize your spend and surface savings. No login.
            Auto-saved as you type.
          </p>
        </div>

        <AuditForm />
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-center text-sm text-ink-faint">
          Pricing data verified 2026-05-07. See{" "}
          <a
            className="underline-offset-4 hover:underline"
            href="/methodology"
          >
            methodology
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
