// src/layout/Header/TopBar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "@/ui/Container";
import Button, { ButtonArrow } from "@/ui/Button";
import { site } from "@/config/site";
import { normalizeLocale } from "@/i18n/locales";
import LanguageSwitch from "./LanguageSwitch";
import { cn } from "@/utils/cn";
import { startTransitionOverlay } from "@/layout/RootProviders/TransitionOverlay.client";

type TopBarProps = {
  locale?: string;
  ctaLabel?: string;
};

/** TopBar transparente: sin blur ni borde; tinta adaptable por ruta */
export default function TopBar({
  locale: localeProp,
  ctaLabel: ctaLabelProp,
}: TopBarProps) {
  const brand = site?.name ?? "Agencia";

  const pathname = usePathname() || "/es";
  const firstSeg = pathname.split("/").filter(Boolean)[0] || "es";
  const inferredLocale = normalizeLocale(firstSeg);
  const locale = normalizeLocale(localeProp ?? inferredLocale);

  const onServicesDark =
    pathname.startsWith(`/${locale}/servicios`) ||
    pathname.startsWith(`/${locale}/services`);

  const homeHref = `/${locale}`;

  const ctaHref =
    locale === "es"
      ? `/${locale}/servicios/personalizado`
      : `/${locale}/services/custom`;

  const ctaLabel =
    ctaLabelProp ?? (locale === "es" ? "Empieza tu proyecto" : "Start your project");

  const trackCtaClick = React.useCallback(() => {
    const payload = {
      event: "cta_click",
      label: ctaLabel,
      locale,
      path: pathname,
      href: ctaHref,
      ts: Date.now(),
    };

    try {
      const w = window as Window & { dataLayer?: Array<Record<string, unknown>> };
      w.dataLayer?.push(payload);
    } catch {}

    try {
      const nav = navigator as Navigator & {
        sendBeacon?: (url: string | URL, data?: BodyInit | null) => boolean;
      };
      const json = JSON.stringify(payload);

      if (nav.sendBeacon) {
        const blob = new Blob([json], { type: "application/json" });
        nav.sendBeacon("/api/analytics", blob);
      } else {
        void fetch("/api/analytics", {
          method: "POST",
          body: json,
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          cache: "no-store",
        });
      }
    } catch {}
  }, [ctaLabel, locale, pathname, ctaHref]);

  const handleCtaClick = React.useCallback(() => {
    trackCtaClick();
    startTransitionOverlay({
      target: "pricing",
      locale: locale === "es" || locale === "en" ? locale : "es",
      durationMs: 1200,
    });
  }, [trackCtaClick, locale]);

  return (
    <div
      className={cn(
        "sticky top-0 z-[var(--z-header)]",
        onServicesDark
          ? "text-[color:var(--text-inverse)]"
          : "text-[color:var(--text)]",
      )}
    >
      <Container className="flex items-center justify-between gap-3 h-[var(--header-h)]">
        
        {/* LOGO */}
        <Link
          href={homeHref}
          aria-label={brand}
          className="inline-flex items-center gap-2 transition-colors duration-200 hover:text-[color:var(--pink-500)]"
        >
          <span className="text-lg md:text-xl font-semibold tracking-tight leading-none">
            {brand}
          </span>
        </Link>

        {/* ACCIONES */}
        <div className="flex items-center gap-3">
          <LanguageSwitch />

          {/* CTA SIN BORDE + HOVER ROSADO */}
          <Button
            asChild
            variant="solid"
            size="md"
            className={cn(
              "border-none shadow-none transition-colors duration-200",
              "hover:bg-[color:var(--pink-500)]"
            )}
          >
            <Link
              href={ctaHref}
              aria-label={ctaLabel}
              onClick={handleCtaClick}
              className="inline-flex items-center gap-2"
            >
              {ctaLabel}
              <ButtonArrow />
            </Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}
