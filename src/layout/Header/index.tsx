"use client";

import * as React from "react";
import TopBar from "./TopBar";
import BottomDock from "./BottomDock";
import MobileMenu from "./MobileMenu.client";

type HeaderProps = {
  locale?: string;
  /** Texto i18n para el CTA (viene de home.json vía layout) */
  ctaLabel?: string;
};

/**
 * Header compuesto
 * - Desktop / Tablet: TopBar + BottomDock (como hasta ahora)
 * - Mobile: TopBar + MobileMenu (navbar oculta)
 */
export default function Header({ locale, ctaLabel }: HeaderProps) {
  return (
    <>
      {/* ===== HEADER SUPERIOR ===== */}
      <TopBar locale={locale} ctaLabel={ctaLabel} />

      {/* ===== DESKTOP / TABLET ===== */}
      <div className="hidden md:block">
        <BottomDock />
      </div>

      {/* ===== MOBILE ===== */}
      <div className="block md:hidden">
        <MobileMenu locale={locale} ctaLabel={ctaLabel} />
      </div>
    </>
  );
}
