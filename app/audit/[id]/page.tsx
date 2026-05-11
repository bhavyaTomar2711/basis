import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteNav } from "@/app/_components/site-nav";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { AuditResult } from "@/lib/audit/types";
import { ResultsContent } from "../preview/results-view";

export const metadata: Metadata = {
  title: "Your audit · Basis",
  description: "Itemized findings and savings for your AI tool stack.",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AuditByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // sanity check before hitting the DB
  if (!UUID_RE.test(id)) notFound();

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("audits")
    .select("id, slug, result, ai_summary")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Audit fetch failed:", error);
    notFound();
  }
  if (!data) notFound();

  const result = data.result as AuditResult;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-12 sm:px-6 sm:pt-16">
        <ResultsContent
          result={result}
          persistedAuditId={data.id}
          initialAiSummary={data.ai_summary}
          shareSlug={data.slug}
        />
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-center text-sm text-ink-faint">
          Pricing data verified 2026-05-07 · Sources cited per finding
        </p>
      </footer>
    </div>
  );
}
