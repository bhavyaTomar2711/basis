import { getSupabaseServer } from "@/lib/supabase/server";
import type { AuditResult } from "@/lib/audit/types";
import { OG_SIZE, OG_CONTENT_TYPE, renderOgImage } from "@/lib/og/render";

export const alt = "Basis — AI spend audit";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return fallback();

  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("audits")
    .select("slug, result")
    .eq("id", id)
    .maybeSingle();

  if (!data) return fallback();

  return renderOgImage({
    result: data.result as AuditResult,
    slug: data.slug,
  });
}

function fallback() {
  // Empty 1x1 PNG so meta tags still validate even if the row is missing.
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
