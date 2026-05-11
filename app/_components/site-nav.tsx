"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { hash: "#sample", label: "Sample audit" },
  { hash: "#how",    label: "How it works" },
  { hash: "https://credex.rocks", label: "Credex" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleLinkClick() {
    setOpen(false);
  }

  return (
    <header className="sticky top-3 z-30 mx-auto w-full max-w-7xl px-3 sm:top-6 sm:px-6">
      <div ref={menuRef} className="relative">

        {/* ── Main nav bar ── */}
        <div className="flex h-[72px] items-center justify-between rounded-[28px] border border-rule/50 bg-white/80 px-4 shadow-[0_2px_16px_-4px_rgba(10,10,11,0.10)] backdrop-blur-xl sm:h-20 sm:rounded-full sm:px-10">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 transition-opacity hover:opacity-75" onClick={handleLinkClick}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Basis"
              width={1557}
              height={652}
              className="h-[52px] w-auto sm:h-16"
              loading="eager"
              decoding="sync"
              fetchPriority="high"
            />
          </Link>

          {/* Desktop middle links */}
          <nav className="hidden items-center gap-2 sm:flex">
            {NAV_LINKS.map((l) => {
              const href = l.hash.startsWith("#") ? (isHome ? l.hash : `/${l.hash}`) : l.hash;
              return (
                <a
                  key={l.hash}
                  href={href}
                  className="rounded-lg px-4 py-2 text-[15px] font-medium text-ink-muted transition-all duration-150 hover:bg-surface-2 hover:text-ink"
                >
                  {l.label}
                </a>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            {/* Desktop CTA */}
            <Link
              href="/audit/new"
              className="hidden h-11 items-center justify-center rounded-full bg-cta-bg/90 px-7 text-[15px] font-semibold text-cta-ink shadow-sm transition hover:-translate-y-px hover:bg-[#1a1a1c] sm:inline-flex sm:h-12 sm:px-8"
            >
              Run audit
            </Link>

            {/* Mobile menu button — premium pill style */}
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-rule/70 bg-surface shadow-[0_1px_4px_rgba(10,10,11,0.08)] transition-all duration-200 hover:border-green/30 hover:bg-green-tint active:scale-95 sm:hidden"
            >
              {/* Stacked lines → morph to X */}
              <span className="flex flex-col items-center gap-[5px]">
                <span
                  className={`block h-[2px] w-[18px] rounded-full bg-green transition-all duration-300 origin-center ${
                    open ? "translate-y-[7px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-[2px] w-[18px] rounded-full bg-green transition-all duration-300 ${
                    open ? "opacity-0 scale-x-0" : ""
                  }`}
                />
                <span
                  className={`block h-[2px] w-[18px] rounded-full bg-green transition-all duration-300 origin-center ${
                    open ? "-translate-y-[7px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {/* ── Mobile dropdown ── */}
        <div
          className={`absolute left-0 right-0 top-[calc(100%+6px)] z-50 sm:hidden
            overflow-hidden rounded-[28px]
            border border-white/40
            bg-white/82
            shadow-[0_16px_48px_-8px_rgba(10,10,11,0.20),0_4px_12px_-4px_rgba(10,10,11,0.10),inset_0_1px_0_rgba(255,255,255,0.9)]
            backdrop-blur-2xl backdrop-saturate-200
            transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${open
              ? "pointer-events-auto opacity-100 translate-y-0 scale-100"
              : "pointer-events-none opacity-0 -translate-y-3 scale-[0.97]"
            }`}
        >
          {/* Top shimmer — green brand hairline */}
          <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-[#0eab6f]/50 to-transparent" />

          {/* Subtle inner light bloom */}
          <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-b from-white/70 via-white/10 to-transparent" />

          <div className="relative px-4 pt-4 pb-5">

            {/* Nav links */}
            <nav className="flex flex-col gap-0.5">
              {NAV_LINKS.map((l) => {
                const href = l.hash.startsWith("#") ? (isHome ? l.hash : `/${l.hash}`) : l.hash;
                return (
                <a
                  key={l.hash}
                  href={href}
                  onClick={handleLinkClick}
                  className="group flex items-center justify-between rounded-xl px-4 py-4 transition-all duration-150 hover:bg-green-tint active:scale-[0.99]"
                >
                  <span className="text-[16px] font-medium text-ink group-hover:text-green-deep">
                    {l.label}
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-ink-faint transition-all duration-150 group-hover:bg-green/10 group-hover:text-green">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </span>
                </a>
                );
              })}
            </nav>

            {/* Divider */}
            <div className="mx-2 my-3.5 h-px bg-gradient-to-r from-transparent via-rule/80 to-transparent" />

            {/* CTA — full width black pill */}
            <Link
              href="/audit/new"
              onClick={handleLinkClick}
              className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#0a0a0b] px-6 text-[15px] font-semibold tracking-[-0.01em] text-white shadow-[0_4px_16px_-4px_rgba(10,10,11,0.40)] transition-all duration-200 hover:-translate-y-px hover:bg-[#1a1a1c] hover:shadow-[0_8px_24px_-6px_rgba(10,10,11,0.35)] active:scale-[0.98] active:shadow-none"
            >
              Run audit
              <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Trust footnote */}
            <p className="mt-3.5 text-center text-[12px] tracking-wide text-ink-faint">
              Free · 2 minutes · No login required
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
