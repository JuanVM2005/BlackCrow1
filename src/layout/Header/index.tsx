// src/layout/Header/index.tsx
"use client";

import * as React from "react";
import TopBar from "./TopBar";
import BottomDock from "./BottomDock";

type HeaderProps = {
  locale?: string;
  /** Texto i18n para el CTA (viene de home.json vía layout) */
  ctaLabel?: string;
};

/** Header compuesto: barra superior + dock inferior fijo */
export default function Header({ locale, ctaLabel }: HeaderProps) {
  return (
    <>
      <TopBar locale={locale} ctaLabel={ctaLabel} />
      <BottomDock />
    </>
  );
}
