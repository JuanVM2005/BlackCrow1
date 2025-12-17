// src/app/[locale]/layout.tsx
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  // En Next 16, params es una Promise también en layouts
  params: Promise<{ locale: string }>;
};

// Locales RTL (por si en el futuro agregas alguno)
const RTL_LOCALES = new Set(["ar", "he", "fa", "ur"]);

export default async function LocaleLayout({ children, params }: Props) {
  // 👈 importante: await params (Next 16: params es Promise)
  const { locale: rawLocale } = await params;

  // base: "es-PE" → "es"
  const base = (rawLocale ?? "es").split("-")[0];
  const isRTL = RTL_LOCALES.has(base);

  // Wrapper por-locale (no modifica <html>/<body>)
  return (
    <div data-locale={base} dir={isRTL ? "rtl" : "ltr"}>
      {children}
    </div>
  );
}
