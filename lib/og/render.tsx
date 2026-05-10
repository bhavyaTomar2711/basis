import { ImageResponse } from "next/og";
import type { AuditResult } from "@/lib/audit/types";
import { TOOLS } from "@/lib/pricing/data";

/**
 * OG image renderer for /audit/[id] and /a/[slug]. brain.md §3.9.
 *
 * Constraints: next/og runs on the Edge runtime via Satori, which only
 * supports a strict subset of CSS — every JSX node must have `display: flex`
 * or `display: none`, no `gap` on the parent without children, no
 * pseudo-elements, and font sizes/weights only render if the font is loaded.
 * We rely on the bundled system font here (v1); custom fonts are a Day 4
 * polish task once we settle on which face to load.
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

const fmtUsd = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

const fmtDate = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export function renderOgImage({
  result,
  slug,
}: {
  result: AuditResult;
  slug: string;
}) {
  const monthly = fmtUsd(result.totalMonthlySavingsUsd);
  const tools = result.input.tools
    .map((t) => TOOLS[t.tool]?.label ?? t.tool)
    .filter(Boolean);
  const summaryLine =
    tools.length === 0
      ? "AI spend audit"
      : `••••••• · ${tools.slice(0, 3).join(" + ")}${tools.length > 3 ? " +" : ""}`;
  const seatTotal = result.input.tools.reduce((sum, t) => sum + t.seats, 0);
  const seatsLine = `${seatTotal} seat${seatTotal === 1 ? "" : "s"} · ${result.input.useCase}`;
  const tierLabel =
    result.tier === "optimal" ? "Spending well" : "Saved";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(180deg, #FAFAFA 0%, #FAFAFA 100%)",
          backgroundImage:
            "linear-gradient(to right, #E8E8ED 1px, transparent 1px), linear-gradient(to bottom, #E8E8ED 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial",
          color: "#0a0a0a",
          padding: "56px 64px",
        }}
      >
        {/* Top row — wordmark + audit chip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 9999,
                background: "#0EAB6F",
                marginRight: 14,
              }}
            />
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>
              Basis
            </div>
          </div>
          <div
            style={{
              display: "flex",
              padding: "8px 16px",
              borderRadius: 9999,
              background: "#ffffff",
              border: "1px solid #E8E8ED",
              fontSize: 18,
              color: "#666",
              letterSpacing: 1.6,
            }}
          >
            AUDIT · {fmtDate()}
          </div>
        </div>

        {/* Middle — hero number + redacted summary card */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 24,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 720 }}>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                color: "#0E7A52",
                letterSpacing: 2,
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              {result.tier === "optimal"
                ? "You're spending well"
                : result.tier === "high"
                  ? "High-impact savings"
                  : "Straightforward savings"}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                marginTop: 12,
              }}
            >
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 800,
                  letterSpacing: -1,
                  color: "#0a0a0a",
                }}
              >
                {tierLabel}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                marginTop: 4,
              }}
            >
              <div
                style={{
                  fontSize: 140,
                  fontWeight: 800,
                  letterSpacing: -4,
                  color: "#0E7A52",
                  lineHeight: 1,
                }}
              >
                {monthly}
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  marginLeft: 14,
                  color: "#0a0a0a",
                }}
              >
                / month
              </div>
            </div>
          </div>

          {/* Angled redacted summary card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 340,
              padding: "24px 26px",
              background: "#ffffff",
              border: "1px solid #E8E8ED",
              borderRadius: 22,
              boxShadow: "0 14px 40px rgba(10,10,10,0.06)",
              transform: "rotate(3deg)",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 14,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: "#999",
                fontWeight: 600,
              }}
            >
              Subject
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 700,
                color: "#0a0a0a",
                marginTop: 8,
                lineHeight: 1.25,
              }}
            >
              {summaryLine}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 16,
                color: "#666",
                marginTop: 10,
              }}
            >
              {seatsLine}
            </div>
          </div>
        </div>

        {/* Footer line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 18,
            color: "#999",
            letterSpacing: 1.4,
          }}
        >
          <div style={{ display: "flex" }}>
            basis.credex.rocks/a/{slug}
          </div>
          <div style={{ display: "flex" }}>
            Itemized · Sourced · Defensible
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
