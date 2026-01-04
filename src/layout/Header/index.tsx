// src/layout/Header/index.tsx
"use client";

import * as React from "react";

import TopBar from "./TopBar";
import BottomDock from "./BottomDock";
import MobileMenu from "./MobileMenu.client";
import { useHeaderTone } from "./useHeaderTone";

type HeaderProps = {
  locale?: string;
  /** Texto i18n para el CTA (viene de home.json vía layout) */
  ctaLabel?: string;
};

export default function Header({ locale, ctaLabel }: HeaderProps) {
  const tone = useHeaderTone();

  return (
    <>
      <TopBar locale={locale} ctaLabel={ctaLabel} tone={tone} />

      <div className="hidden md:block">
        {/* ✅ CLAVE: pasar tone al dock */}
        <BottomDock tone={tone} />
      </div>

      <div className="block md:hidden">
        <MobileMenu locale={locale} ctaLabel={ctaLabel} />
      </div>
    </>
  );
}
