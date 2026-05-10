import "server-only";
import { TOOLS } from "@/lib/pricing/data";
import type { AuditResult } from "@/lib/audit/types";

function fmtUsd(n: number, opts?: { withCents?: boolean }): string {
  const isWhole = Math.abs(n - Math.round(n)) < 0.005;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts?.withCents ? 2 : isWhole ? 0 : 2,
    maximumFractionDigits: opts?.withCents ? 2 : 2,
  }).format(Math.round(n * 100) / 100);
}

export interface LeadEmailInput {
  result: AuditResult;
  slug: string;
  appUrl: string;
}

export interface LeadEmail {
  subject: string;
  text: string;
  html: string;
}

/**
 * brain.md §12.3 — subject is the savings number, body recaps top-3 findings,
 * links to the share URL, and discloses Credex only for the high-savings tier.
 * No React Email yet (v1 keeps deps lean — Day 4 polish task).
 */
export function buildLeadEmail({
  result,
  slug,
  appUrl,
}: LeadEmailInput): LeadEmail {
  const monthly = fmtUsd(result.totalMonthlySavingsUsd);
  const annual = fmtUsd(result.totalAnnualSavingsUsd);
  const shareUrl = `${appUrl.replace(/\/+$/, "")}/a/${slug}`;

  const top = [...result.findings]
    .filter((f) => f.monthlySavingsUsd > 0)
    .sort((a, b) => b.monthlySavingsUsd - a.monthlySavingsUsd)
    .slice(0, 3);

  const subject =
    result.tier === "optimal"
      ? `Your AI spend audit — you're spending well`
      : `Your AI spend audit — ${monthly}/mo identified`;

  const textLines: string[] = [];
  if (result.tier === "optimal") {
    textLines.push(
      `We ran the numbers and your stack looks well-sized. No major changes recommended.`,
      ``,
      `Your full report: ${shareUrl}`,
    );
  } else {
    textLines.push(
      `We found ${monthly}/month (${annual}/year) of savings on your AI stack.`,
      ``,
      `Top findings:`,
    );
    top.forEach((f, i) => {
      const label = TOOLS[f.tool].label;
      textLines.push(
        `  ${i + 1}. ${label} — save ${fmtUsd(f.monthlySavingsUsd)}/mo. ${f.reason}`,
      );
    });
    textLines.push(``, `Full report with math + sources: ${shareUrl}`);
    if (result.tier === "high") {
      textLines.push(
        ``,
        `Most of these savings come from switching providers. Credex sells the same`,
        `AI credits at a discount, sourced from companies that overforecast. Reply`,
        `to this email if you'd like an intro.`,
      );
    }
  }
  textLines.push(``, `— Basis`, `basis.credex.rocks`);
  const text = textLines.join("\n");

  // Lean HTML — single column, max-width 560, no images, inline styles
  // because most email clients ignore <style> tags. Mirrors the brand
  // tokens by hand (cream / black / green) so we don't bundle CSS.
  const findingRows = top
    .map((f) => {
      const label = TOOLS[f.tool].label;
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #eaeaea;">
            <div style="font-size:15px;color:#0a0a0a;font-weight:600;">${escapeHtml(label)}</div>
            <div style="font-size:13px;color:#666;margin-top:2px;">${escapeHtml(f.reason)}</div>
          </td>
          <td style="padding:14px 0;border-bottom:1px solid #eaeaea;text-align:right;white-space:nowrap;">
            <span style="font-size:15px;color:#0E7A52;font-weight:600;">${fmtUsd(f.monthlySavingsUsd)}</span>
            <span style="font-size:12px;color:#0E7A52;">/mo</span>
          </td>
        </tr>`;
    })
    .join("");

  const heroBody =
    result.tier === "optimal"
      ? `<p style="margin:24px 0 0 0;font-size:16px;line-height:1.6;color:#333;">We ran the numbers and your stack looks well-sized. No major changes recommended — the plans you're on are appropriately scoped for your usage.</p>`
      : `<p style="margin:24px 0 0 0;font-size:16px;line-height:1.6;color:#333;">We found <strong style="color:#0E7A52;">${monthly}/month</strong> (${annual}/year) of savings on your AI stack. The top opportunities are below — your full report has the math, sources, and full list.</p>
         <table style="width:100%;margin-top:28px;border-collapse:collapse;" role="presentation">${findingRows}</table>`;

  const credexBlock =
    result.tier === "high"
      ? `<div style="margin-top:32px;padding:20px;background:#F1FAF5;border-radius:14px;">
           <div style="font-size:13px;color:#0E7A52;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Capture more</div>
           <p style="margin:8px 0 0 0;font-size:15px;line-height:1.55;color:#0a0a0a;">Most of these savings come from switching providers. <strong>Credex</strong> sells the same AI credits at a discount, sourced from companies that overforecast. Reply to this email if you'd like an intro.</p>
         </div>`
      : "";

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background:#FAFAFA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0a0a0a;">
    <table role="presentation" style="width:100%;max-width:560px;margin:0 auto;background:#ffffff;border-radius:18px;border:1px solid #eaeaea;">
      <tr>
        <td style="padding:36px 36px 8px 36px;">
          <div style="display:inline-block;vertical-align:middle;height:8px;width:8px;border-radius:9999px;background:#0EAB6F;margin-right:8px;"></div>
          <span style="font-size:17px;font-weight:700;letter-spacing:-0.01em;">Basis</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 36px 36px 36px;">
          <h1 style="margin:24px 0 0 0;font-size:24px;line-height:1.25;letter-spacing:-0.02em;color:#0a0a0a;">Your AI spend audit</h1>
          ${heroBody}
          <div style="margin-top:32px;">
            <a href="${escapeHtml(shareUrl)}" style="display:inline-block;background:#0a0a0a;color:#fff;text-decoration:none;font-size:14px;font-weight:500;padding:12px 22px;border-radius:9999px;">View full report →</a>
          </div>
          ${credexBlock}
          <p style="margin:36px 0 0 0;font-size:12px;color:#999;">Sent because you ran an audit at basis.credex.rocks. Pricing data verified per source — see the report footnotes.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
