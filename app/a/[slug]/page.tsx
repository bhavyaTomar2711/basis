import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { AuditResult } from "@/lib/audit/types";
import { ResultsContent } from "../../audit/preview/results-view";

interface Params {
  params: Promise<{ slug: string }>;
}

const SLUG_RE = /^[A-Za-z0-9_-]{6,16}$/;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  if (!SLUG_RE.test(slug)) return { title: "Audit not found · Basis" };

  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("audits")
    .select("total_monthly_savings_usd")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return { title: "Audit not found · Basis" };

  const monthly = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(data.total_monthly_savings_usd) || 0);

  const title = `${monthly}/mo of savings · Basis audit`;
  const description = `An itemized AI-spend audit with citations. Run your own at basis.credex.rocks.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PublicSharePage({ params }: Params) {
  const { slug } = await params;
  if (!SLUG_RE.test(slug)) notFound();

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("audits")
    .select("id, slug, result, ai_summary")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Public audit fetch failed:", error);
    notFound();
  }
  if (!data) notFound();

  const result = data.result as AuditResult;

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
            href="/audit/new"
            className="inline-flex h-9 items-center justify-center rounded-full bg-cta-bg px-4 text-sm font-medium text-cta-ink transition hover:-translate-y-px hover:bg-[#1a1a1c]"
          >
            Run your own audit
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-12 sm:px-6 sm:pt-16">
        {/* Per brain.md §5.4 — "Run your own audit" CTA at top for share viewers. */}
        <div className="mx-auto mb-8 max-w-3xl">
          <div className="card-shadow flex flex-col items-start gap-3 rounded-3xl border border-rule bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Shared report
              </p>
              <p className="mt-1 text-base text-ink-muted">
                Someone shared this audit with you. Run your own in two minutes.
              </p>
            </div>
            <Link
              href="/audit/new"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-cta-bg px-5 text-sm font-medium text-cta-ink transition hover:-translate-y-px hover:bg-[#1a1a1c]"
            >
              Start →
            </Link>
          </div>
        </div>

        <ResultsContent
          result={result}
          persistedAuditId={data.id}
          initialAiSummary={data.ai_summary}
          shareSlug={data.slug}
          publicShare
        />
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-center text-sm text-ink-faint">
          Pricing data verified per source · basis.credex.rocks
        </p>
      </footer>
    </div>
  );
}
