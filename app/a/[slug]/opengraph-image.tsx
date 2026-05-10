import { getSupabaseServer } from "@/lib/supabase/server";
import type { AuditResult } from "@/lib/audit/types";
import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og/render";

export const alt = "Basis — AI spend audit";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const SLUG_RE = /^[A-Za-z0-9_-]{6,16}$/;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!SLUG_RE.test(slug)) return fallback();

  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("audits")
    .select("slug, result")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return fallback();

  return renderOgImage({
    result: data.result as AuditResult,
    slug: data.slug,
  });
}

function fallback() {
  return new Response(
    Uint8Array.from(
      atob(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAfbLI3wAAAABJRU5ErkJggg==",
      ),
      (c) => c.charCodeAt(0),
    ),
    { headers: { "content-type": "image/png" } },
  );
}
