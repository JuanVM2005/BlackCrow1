// src/app/[locale]/(marketing)/layout.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import Header from "@/layout/Header";
import { Container } from "@/ui";
import { normalizeLocale } from "@/i18n/locales";

import esHome from "@/content/locales/es/pages/home.json";
import enHome from "@/content/locales/en/pages/home.json";

// Tipado mínimo del JSON (solo referencia local)
type LinkItem = { label: string; href: string; external?: boolean };
type HomePageJSON = {
  announcement?: { enabled: boolean; text: string; href?: string };
  header?: {
    brand?: { label?: string; href?: string; logoSrc?: string };
    nav?: LinkItem[];
    cta?: LinkItem & {
      variant?: "primary" | "secondary" | "ghost" | "link";
    };
  };
  footer?: { legal?: LinkItem[]; social?: LinkItem[]; note?: string };
  messages?: { betaNote?: string; maintenance?: string };
};

// Selecciona JSON según locale (fallback a EN)
const selectHome = (locale: string): HomePageJSON => {
  const l = normalizeLocale(locale);
  return (l === "es" ? esHome : enHome) as HomePageJSON;
};

export default async function MarketingLayout({
  children,
  params,
}: {
  children: ReactNode;
  // Next 16: params es Promise
  params: Promise<{ locale?: string }>;
}) {
  // 👇 importante: await params
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale ?? "es");

  const home = selectHome(locale);
  const announcement = home.announcement;

  // CTA label i18n leído desde home.json (con fallback)
  const ctaLabel =
    home?.header?.cta?.label ??
    (locale === "es" ? "Empieza tu proyecto" : "Start your project");

  // Construye href i18n para el anuncio (prefija /{locale} salvo URLs absolutas)
  const buildAnnouncementHref = (href?: string) => {
    if (!href) return `/${locale}`;
    if (/^https?:\/\//i.test(href)) return href;
    const safe = href.startsWith("/") ? href : `/${href}`;
    return `/${locale}${safe}`;
  };

  return (
    <>
      {/* (Skip link está en src/app/layout.tsx como primer elemento del <body>) */}

      {announcement?.enabled ? (
        <div className="w-full border-b border-(--border) bg-(--brand) text-(--brand-foreground)">
          <Container className="flex items-center justify-center">
            <Link
              href={buildAnnouncementHref(announcement.href)}
              className="inline-block py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"
              aria-label="Announcement"
            >
              {announcement.text}
            </Link>
          </Container>
        </div>
      ) : null}

      {/* Header recibe locale + ctaLabel para armar navegación/CTA i18n */}
      <Header locale={locale} ctaLabel={ctaLabel} />

      {/* Layout de secciones (sin padding-bottom global) */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-col gap-16 sm:gap-24"
      >
        {children}
      </main>
    </>
  );
}
