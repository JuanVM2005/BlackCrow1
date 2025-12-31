// src/app/[locale]/(marketing)/servicios/layout.tsx
import type { ReactNode } from "react";
import { CornerCut } from "@/ui/effects";
import Footer from "@/layout/Footer";
import { normalizeLocale } from "@/i18n/locales";

type LayoutParams = {
  locale?: string;
};

/**
 * Layout oscuro para toda la sección /servicios:
 * - Fondo surface-inverse (tema negro)
 * - Compensa la altura del header fijo
 * - Incluye Footer en modo inverse
 *
 * Además:
 * - Forzamos que cualquier <main> interno NO pinte background sólido (para no tapar el arte).
 * - Ajustamos CornerCut SOLO en mobile SIN tocar globals.css, vía CSS vars “scoped” a este layout.
 */
export default async function ServiciosLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<LayoutParams>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale ?? "es");

  return (
    <div
      data-surface="inverse"
      className={[
        // base layout
        "surface-inverse relative -mt-(--header-h) pt-(--header-h) min-h-screen",

        // evita el “bloque” que a veces viene en <main ... bg-...>
        "[&_main]:bg-transparent",

        // ===== CornerCut tuning (scoped) =====
        // Desktop/tablet (default)
        "[--fx-cut-size:calc(var(--header-h)*9)]",
        "[--fx-cut-res:0.8]",
        "[--fx-cut-clip:polygon(14%_0,100%_0,100%_74%)]",

        // Mobile: más pequeño + menos “fill-rate”
        "max-sm:[--fx-cut-size:calc(var(--header-h)*5.7)]",
        "max-sm:[--fx-cut-res:0.58]",
        "max-sm:[--fx-cut-clip:polygon(20%_0,100%_0,100%_66%)]",
      ].join(" ")}
    >
      {/* Corte anclado arriba del todo (por detrás del contenido) */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 z-0"
        style={{ top: "calc(-1 * var(--header-h))" }}
      >
        <CornerCut strategy="absolute" align="top-right" />
      </div>

      {/* Contenido */}
      <div className="relative z-1">{children}</div>

      {/* Footer en tema inverse */}
      <Footer locale={locale} surface="inverse" />
    </div>
  );
}
