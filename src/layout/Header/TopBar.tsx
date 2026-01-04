// src/layout/Header/TopBar.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Container from "@/ui/Container";
import Button, { ButtonArrow } from "@/ui/Button";
import { site } from "@/config/site";
import { normalizeLocale } from "@/i18n/locales";
import LanguageSwitch from "./LanguageSwitch";
import { cn } from "@/utils/cn";
import { startTransitionOverlay } from "@/layout/RootProviders/TransitionOverlay.client";

type HeaderTone = "base" | "inverse";

type TopBarProps = {
  locale?: string;
  ctaLabel?: string;
  /** Controlado por el Header (por sección). Si no llega, cae a lógica por ruta. */
  tone?: HeaderTone;
};

/** TopBar transparente: sin blur ni borde; tinta adaptable por sección/ruta */
export default function TopBar({
  locale: localeProp,
  ctaLabel: ctaLabelProp,
  tone,
}: TopBarProps) {
  const brand = site?.name ?? "Black Crow";

  const pathname = usePathname() || "/es";
  const firstSeg = pathname.split("/").filter(Boolean)[0] || "es";
  const inferredLocale = normalizeLocale(firstSeg);
  const locale = normalizeLocale(localeProp ?? inferredLocale);

  // Fallback por ruta (servicios suele ir sobre surface-inverse)
  const onServicesDark =
    pathname.startsWith(`/${locale}/servicios`) ||
    pathname.startsWith(`/${locale}/services`);

  const resolvedTone: HeaderTone =
    onServicesDark ? "inverse" : (tone ?? "base");

  const homeHref = `/${locale}`;

  const ctaHref =
    locale === "es"
      ? `/${locale}/servicios/personalizado`
      : `/${locale}/services/custom`;

  const ctaLabel =
    ctaLabelProp ??
    (locale === "es" ? "Empieza tu proyecto" : "Start your project");

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
      const w = window as Window & {
        dataLayer?: Array<Record<string, unknown>>;
      };
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

  const markSrc =
    resolvedTone === "inverse"
      ? "/logos/brand-mark-light.svg"
      : "/logos/brand-mark.svg";

  // Tamaño controlado por spacing (sin hardcodear px)
  const markSizeClass =
    "h-[calc(var(--spacing)*20)] w-[calc(var(--spacing)*20)]";

  // ✅ “Más abajo” sin romper el layout: solo movemos el SVG dentro del Link
  // Ajusta el factor si lo quieres aún más abajo.
  const markOffsetYClass = "translate-y-[calc(var(--spacing)*1.25)]";

  return (
    <div
      className={cn(
        "sticky top-0 z-(--z-header)",
        resolvedTone === "inverse" ? "text-(--text-inverse)" : "text-(--text)",
      )}
      data-header-tone={resolvedTone}
    >
      <Container className="flex items-center justify-between gap-3 h-(--header-h)">
        {/* LOGO (Mark) */}
        <Link
          href={homeHref}
          aria-label={brand}
          className={cn(
            "inline-flex items-center gap-2 transition-colors duration-200",
            "hover:text-(--pink-500)",
          )}
        >
          <Image
            src={markSrc}
            alt={brand}
            width={160}
            height={160}
            priority
            className={cn(markSizeClass, "shrink-0", markOffsetYClass)}
          />
          <span className="sr-only">{brand}</span>
        </Link>

        {/* ACCIONES: SOLO DESDE md */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitch />

          {/* CTA: tokens (sin hardcodear colores) */}
          <Button
            asChild
            variant="solid"
            size="md"
            className={cn(
              "border shadow-none transition-[background-color,border-color,transform,opacity] duration-200",
              "bg-(--btn-bg) text-(--btn-fg)",
              "border-[color-mix(in_oklab,var(--btn-border)_70%,transparent)]",
              "hover:bg-(--pink-500) hover:border-[color-mix(in_oklab,var(--btn-border)_85%,transparent)]",
              "active:scale-[0.98]",
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
