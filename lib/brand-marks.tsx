/* eslint-disable @next/next/no-img-element */

import type { ToolId } from "@/lib/pricing/types";

/**
 * Real brand SVGs served from /public. We use plain <img> here (not
 * next/image) because:
 *  - These are static SVGs, no optimization to do.
 *  - next/image would route SVGs through /_next/image, which by default
 *    rejects them for security; we'd have to set dangerouslyAllowSVG.
 *  - <img> respects className for sizing and gives 0 client JS overhead.
 *
 * The eslint rule @next/next/no-img-element is disabled per-file: it
 * exists to push devs toward next/image for raster images, not SVGs.
 *
 * GitHub Copilot doesn't ship in /public — we keep an inline custom mark
 * for it below.
 */

type MarkProps = { className?: string; title?: string };

function svgImg(src: string) {
  function Mark({ className, title }: MarkProps) {
    return (
      <img
        src={src}
        alt={title ?? ""}
        className={className}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    );
  }
  Mark.displayName = `Mark(${src})`;
  return Mark;
}

/* ---------- Real brand SVGs ---------- */
export const CursorMark = svgImg("/cursor.svg");
export const OpenAiMark = svgImg("/chatgpt-icon.svg");
export const ChatgptMark = svgImg("/chatgpt-icon.svg");
export const AnthropicMark = svgImg("/claude-ai-icon.svg");
export const ClaudeMark = svgImg("/claude-ai-icon.svg");
export const GeminiMark = svgImg("/google-gemini-icon.svg");
export const WindsurfMark = svgImg("/windsurf-icon.svg");
export const LovableMark = svgImg("/lovable-ai-icon.svg");

/* ---------- GitHub Copilot — inline (no /public asset provided) ---------- */
export function CopilotMark({
  className,
  title = "GitHub Copilot",
}: MarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label={title}
      fill="none"
      stroke="#0A0A0B"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>{title}</title>
      <path d="M12 4c-3 0-5 1.5-5 4v1H5a2 2 0 0 0-2 2v3a3 3 0 0 0 1.5 2.6c1.7 1 4.4 1.4 7.5 1.4s5.8-.4 7.5-1.4A3 3 0 0 0 21 14v-3a2 2 0 0 0-2-2h-2V8c0-2.5-2-4-5-4z" />
      <circle cx="9" cy="13" r="0.9" fill="#0A0A0B" stroke="none" />
      <circle cx="15" cy="13" r="0.9" fill="#0A0A0B" stroke="none" />
    </svg>
  );
}

export const TOOL_MARKS: Record<
  ToolId,
  (props: MarkProps) => React.ReactElement
> = {
  cursor: CursorMark,
  copilot: CopilotMark,
  claude: ClaudeMark,
  chatgpt: ChatgptMark,
  anthropic_api: AnthropicMark,
  openai_api: OpenAiMark,
  gemini: GeminiMark,
  windsurf: WindsurfMark,
};
