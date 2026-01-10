// src/app/layout.tsx
import type { Metadata } from "next";
import { site } from "@/config/site";
import { Manrope, Rethink_Sans } from "next/font/google";
import type { CSSProperties } from "react";
import RootProviders from "@/layout/RootProviders";
import Cursor from "@/ui/Cursor";
import ScrollRail from "@/ui/ScrollRail";
import "@/styles/globals.css";

// ✅ Vercel Analytics
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const rethinkSans = Rethink_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.seo.defaultTitle,
  description: site.seo.defaultDescription,

  // ❌ Quitamos applicationName para evitar señales innecesarias de "app"
  // applicationName: site.name,

  openGraph: {
    title: site.seo.defaultTitle,
    description: site.seo.defaultDescription,
    url: site.url,
    siteName: site.name,
    images: [site.ogImage],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.seo.defaultTitle,
    description: site.seo.defaultDescription,
    images: [site.ogImage],
  },
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${rethinkSans.variable} antialiased min-h-dvh`}
        style={{ ["--font-mono" as any]: "var(--font-sans)" } as CSSProperties}
      >
        {/* Skip link */}
        <a
          href="#main-content"
          className="
            fixed left-4 -top-24 z-50
            px-3 py-2 rounded-lg shadow border
            bg-(--surface) text-(--text)
            border-(--border)
            transition-[top] duration-300
            focus-visible:top-4
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)
          "
        >
          Saltar al contenido
        </a>

        <RootProviders>
          <Cursor />
          {children}
        </RootProviders>

        {/* Overlay scrollbar — thumb rosa más ALTO (fijo en px) */}
        <ScrollRail
          position="right"
          thickness={12}
          radius={0}
          offsetTop={0}
          offsetBottom={0}
          autoHide={false}
          idleDelay={900}
          thumbFixedPx={120}
          ariaLabel="Barra de desplazamiento"
        />

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
