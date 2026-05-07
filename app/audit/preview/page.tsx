import type { Metadata } from "next";
import Link from "next/link";
import { ResultsView } from "./results-view";

export const metadata: Metadata = {
  title: "Your audit · Basis",
  description: "Itemized findings and savings for your AI tool stack.",
};

export default function PreviewPage() {
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
          <div className="flex items-center gap-2">
            <Link
              href="/audit/new"
              className="hidden text-sm text-ink-muted transition hover:text-ink sm:inline"
            >
              Edit inputs
            </Link>
            <Link
              href="/audit/new"
              className="inline-flex h-9 items-center justify-center rounded-full border border-rule bg-bg px-4 text-sm font-medium text-ink transition hover:border-ink-faint sm:hidden"
            >
              Edit
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-12 sm:px-6 sm:pt-16">
        <ResultsView />
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-center text-sm text-ink-faint">
          Pricing data verified 2026-05-07 · Sources cited per finding
        </p>
      </footer>
    </div>
  );
}
