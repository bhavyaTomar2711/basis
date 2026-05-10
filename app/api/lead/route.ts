import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { getSupabaseServer } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { buildLeadEmail } from "@/lib/email/lead-email";
import type { AuditResult } from "@/lib/audit/types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// RFC 5321/5322 is genuinely complex; this is a deliberately conservative
// "looks like an email" check that catches typos without rejecting valid
// addresses. Final validation is Resend's job at send time.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = new Set(["founder_ceo", "eng_manager", "cto_vp", "ic", "other"]);

interface LeadPostBody {
  auditId?: string;
  email?: string;
  company?: string | null;
  role?: string | null;
  teamSize?: number | null;
  /** honeypot — bots fill this, humans don't see it. */
  website?: string;
}

export async function POST(request: NextRequest) {
  let body: LeadPostBody;
  try {
    body = (await request.json()) as LeadPostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot first — pretend success so the bot moves on, never persist.
  if (typeof body.website === "string" && body.website !== "") {
    return NextResponse.json({ ok: true });
  }

  // Field validation
  if (!body.auditId || !UUID_RE.test(body.auditId)) {
    return NextResponse.json({ error: "Invalid auditId" }, { status: 400 });
  }
  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const company = sanitizeText(body.company, 200);
  const role =
    body.role && VALID_ROLES.has(body.role) ? body.role : null;
  const teamSize =
    typeof body.teamSize === "number" && body.teamSize >= 1 && body.teamSize <= 100_000
      ? Math.floor(body.teamSize)
      : null;

  // brain.md §12.4 — 3 emails / hour / ip
  const rl = await checkRateLimit("lead", request);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in an hour." },
      { status: 429 },
    );
  }

  const supabase = getSupabaseServer();
  const { data: audit, error: auditErr } = await supabase
    .from("audits")
    .select("id, slug, result")
    .eq("id", body.auditId)
    .maybeSingle();

  if (auditErr) {
    console.error("Audit lookup failed:", auditErr);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
  if (!audit) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  // Insert lead first. The unique (audit_id) constraint dedupes — a second
  // submit returns 23505 which we map to a friendly "already on file".
  const { data: lead, error: insertErr } = await supabase
    .from("leads")
    .insert({
      audit_id: audit.id,
      email,
      company,
      role,
      team_size: teamSize,
      consultation_requested: (audit.result as AuditResult).tier === "high",
    })
    .select("id")
    .single();

  if (insertErr) {
    if (insertErr.code === "23505") {
      // Duplicate — treat as success so users don't get a scary error if
      // they double-submit.
      return NextResponse.json({ ok: true, duplicate: true });
    }
    console.error("Lead insert failed:", insertErr);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }

  // Send the email. brain.md §12.3 — awaited before responding so we can
  // record email_sent_at on success.
  const appUrl = resolveAppUrl(request);
  const { subject, text, html } = buildLeadEmail({
    result: audit.result as AuditResult,
    slug: audit.slug,
    appUrl,
  });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  let emailSent = false;
  if (!apiKey || !from) {
    console.warn(
      "[/api/lead] RESEND_API_KEY or RESEND_FROM_EMAIL unset — skipping send.",
    );
  } else {
    try {
      const resend = new Resend(apiKey);
      const { error: sendErr } = await resend.emails.send({
        from,
        to: email,
        subject,
        text,
        html,
      });
      if (sendErr) {
        // brain.md notes: Resend sandbox only delivers to the registered
        // address — non-fatal here so the lead still gets captured.
        console.warn("Resend send returned error:", sendErr);
      } else {
        emailSent = true;
      }
    } catch (err) {
      console.warn("Resend send threw:", err);
    }
  }

  if (emailSent) {
    const { error: updateErr } = await supabase
      .from("leads")
      .update({ email_sent_at: new Date().toISOString() })
      .eq("id", lead.id);
    if (updateErr) {
      console.warn("email_sent_at update failed:", updateErr);
    }
  }

  return NextResponse.json({
    ok: true,
    emailSent,
    shareUrl: `${appUrl.replace(/\/+$/, "")}/a/${audit.slug}`,
    // When delivery fails (sandbox restriction without a verified domain),
    // return the rendered email so the client can preview it inline. This
    // way reviewers can still see exactly what we would have sent without
    // having to trust an invisible send.
    emailPreview: emailSent ? null : { subject, html },
  });
}

function sanitizeText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function resolveAppUrl(request: NextRequest): string {
  // Prefer an explicit env (set on Vercel) so the URL in the email matches
  // the user-visible canonical domain rather than the preview deploy host.
  const envUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl;
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host = request.headers.get("host") ?? "basis.credex.rocks";
  return `${proto}://${host}`;
}
