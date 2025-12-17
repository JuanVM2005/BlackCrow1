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
      className="surface-inverse relative -mt-(--header-h) pt-(--header-h) min-h-screen"
    >
      {/* Corte anclado arriba del todo (por detrás del contenido) */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 z-0"
        style={{ top: "calc(-1 * var(--header-h))" }}
      >
        <CornerCut strategy="absolute" align="top-right" />
      </div>

      {/* Contenido de la página de servicios */}
      <div className="relative z-1">
        {children}
      </div>

      {/* Footer en tema negro (surface inverse) */}
      <Footer locale={locale} surface="inverse" />
    </div>
  );
}
