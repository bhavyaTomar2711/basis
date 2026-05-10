import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { generateExecutiveSummary } from "@/lib/ai/gemini-summary";
import { templateSummary } from "@/lib/audit/summary-template";
import type { AuditResult } from "@/lib/audit/types";
import { checkRateLimit } from "@/lib/rate-limit";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface SummaryPostBody {
  auditId?: string;
}

/**
 * A summary "looks complete" if it ends with sentence-terminating
 * punctuation. Catches the cache-poisoning case where a prior request
 * stored a truncated Gemini response.
 */
function isLikelyComplete(s: string): boolean {
  return /[.!?"'”’]\s*$/.test(s.trim());
}

export async function POST(request: NextRequest) {
  let body: SummaryPostBody;
  try {
    body = (await request.json()) as SummaryPostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const auditId = body.auditId;
  if (!auditId || typeof auditId !== "string" || !UUID_RE.test(auditId)) {
    return NextResponse.json({ error: "Invalid auditId" }, { status: 400 });
  }

  // brain.md §11.2 — 1 summary / 60s / ip. Guards the Gemini free tier.
  const rl = await checkRateLimit("summary", request);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in a minute." },
      { status: 429 },
    );
  }

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("audits")
    .select("id, ai_summary, result")
    .eq("id", auditId)
    .maybeSingle();

  if (error) {
    console.error("Supabase fetch failed:", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  // Idempotent: if a summary is already cached AND looks complete, serve it
  // without re-calling Gemini. A truncated cache entry (e.g. from a prior
  // MAX_TOKENS response that slipped through) gets discarded and regenerated.
  if (data.ai_summary && isLikelyComplete(data.ai_summary)) {
    return NextResponse.json({ summary: data.ai_summary, source: "cached" });
  }
  if (data.ai_summary) {
    // Bad cache — null it so the conditional UPDATE later can write a fresh
    // one. Logged so we can spot patterns if this fires often.
    console.warn("Discarding truncated cached summary for audit", auditId);
    await supabase
      .from("audits")
      .update({ ai_summary: null })
      .eq("id", auditId);
  }

  const result = data.result as AuditResult;

  let summary: string;
  let source: "ai" | "template";
  try {
    summary = await generateExecutiveSummary(result);
    source = "ai";
  } catch (err) {
    // brain.md §11.5 — fall back to deterministic template on any Gemini failure.
    console.warn("Gemini fallback to template:", err);
    summary = templateSummary(result);
    source = "template";
  }

  // Persist only AI-generated summaries; templates can be regenerated cheaply
  // and we don't want a transient Gemini outage to lock in a template forever.
  if (source === "ai") {
    // Conditional update: only set ai_summary if it's still NULL. If a
    // concurrent request already wrote one, ours is a no-op — preventing
    // two parallel Gemini calls from racing and stomping each other.
    const { error: updateError } = await supabase
      .from("audits")
      .update({ ai_summary: summary })
      .eq("id", auditId)
      .is("ai_summary", null);
    if (updateError) {
      console.error("Supabase update failed:", updateError);
      // Non-fatal — fall through and return whatever's canonical in the row.
    }

    // Re-fetch the canonical summary. If we lost the race, we'll return the
    // winner's text instead of our own — keeping the client and DB in sync.
    const { data: refetch } = await supabase
      .from("audits")
      .select("ai_summary")
      .eq("id", auditId)
      .maybeSingle();
    if (refetch?.ai_summary) {
      summary = refetch.ai_summary;
    }
  }

  return NextResponse.json({ summary, source });
}
