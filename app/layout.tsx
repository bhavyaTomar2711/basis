import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Inter — the workhorse. Variable, both italic + roman, tight tracking on big sizes.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

// JetBrains Mono — tabular figures, audit rows, citations.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

// Fraunces — money serif. Variable font, only used for the savings figure.
// In Day 4 polish, scope to results route only via per-route font config.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Basis - The basis for your AI spend",
  description:
    "A free 2-minute audit of your team's AI tool spend. See where you're overspending, what to switch to, and how much you'd save in a year.",
  metadataBase: new URL("https://basis.credex.rocks"),
  openGraph: {
    title: "Basis - The basis for your AI spend",
    description:
      "An itemized audit of your team's AI tool spend. Built for Credex.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Basis - The basis for your AI spend",
    description:
      "An itemized audit of your team's AI tool spend. Built for Credex.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Pre-warm the TLS handshake to Supabase — the first DB read on
            /audit/[id] is on the critical path for that route. */}
        <link
          rel="preconnect"
          href="https://weggevbqnteajhnxdkcu.supabase.co"
          crossOrigin="anonymous"
        />
      </head>
      <body className="relative min-h-screen overflow-x-clip text-ink">
        {/* Grid lives on <body> via globals.css — see .bg-grid in app/globals.css */}
        {children}
      </body>
    </html>
  );
}
