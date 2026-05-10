import { NextResponse, type NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { runAudit } from "@/lib/audit/engine";
import type { AuditInput } from "@/lib/audit/types";
import { getSupabaseServer } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

const VALID_USE_CASES = new Set([
  "coding",
  "writing",
  "data",
  "research",
  "mixed",
]);

interface AuditPostBody extends AuditInput {
  /** honeypot — bots fill this, humans don't see it */
  website?: string;
}

function validate(body: unknown): body is AuditPostBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (!Array.isArray(b.tools) || b.tools.length === 0) return false;
  if (typeof b.teamSize !== "number" || b.teamSize < 1) return false;
  if (typeof b.useCase !== "string" || !VALID_USE_CASES.has(b.useCase)) {
    return false;
  }
  return b.tools.every((t) => {
    if (!t || typeof t !== "object") return false;
    const e = t as Record<string, unknown>;
    return (
      typeof e.tool === "string" &&
      typeof e.plan === "string" &&
      typeof e.monthlySpendUsd === "number" &&
      e.monthlySpendUsd >= 0 &&
      typeof e.seats === "number" &&
      e.seats >= 1
    );
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot — bots fill this, humans never see it.
  if (
    body &&
    typeof body === "object" &&
    typeof (body as Record<string, unknown>).website === "string" &&
    (body as Record<string, unknown>).website !== ""
  ) {
    // Pretend success so the bot moves on; never persist.
    return NextResponse.json({ id: "00000000-0000-0000-0000-000000000000" });
  }

  if (!validate(body)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Strip the honeypot before running the engine — it doesn't know about it.
  const { website: _ignored, ...input } = body;
  void _ignored;

  // brain.md §12.4 — 5 audits / hour / ip. Done before running the engine so
  // a flooder can't burn CPU even if the engine is cheap.
  const rl = await checkRateLimit("audit", request);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in an hour." },
      { status: 429 },
    );
  }

  let result;
  try {
    result = runAudit(input);
  } catch (err) {
    console.error("Audit engine threw:", err);
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }

  const supabase = getSupabaseServer();
  const slug = nanoid(10);
  const { data, error } = await supabase
    .from("audits")
    .insert({
      slug,
      input,
      result,
      total_monthly_savings_usd: result.totalMonthlySavingsUsd,
      total_annual_savings_usd: result.totalAnnualSavingsUsd,
      user_agent: request.headers.get("user-agent"),
      ip_hash: rl.ipHash,
    })
    .select("id, slug")
    .single();

  if (error || !data) {
    console.error("Supabase insert failed:", error);
    return NextResponse.json({ error: "Persistence failed" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, slug: data.slug });
}
