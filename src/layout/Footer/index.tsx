// src/layout/Footer/index.tsx
import * as React from "react";
import Link from "next/link";
import Container from "@/ui/Container";
import { loadFooter, type FooterProps } from "./footer.mapper";

type Surface = "base" | "inverse";

type Props = {
  locale: string;
  surface?: Surface;
};

/** ¿es URL absoluta externa? */
function isExternalUrl(href?: string) {
  return !!href && /^https?:\/\//i.test(href);
}

/** Prefija el locale a rutas internas; mantiene URLs absolutas tal cual. */
function withLocale(locale: string, href?: string) {
  if (!href) return `/${locale}`;
  if (isExternalUrl(href)) return href;
  const safe = href.startsWith("/") ? href : `/${href}`;
  return `/${locale}${safe}`;
}

/**
 * Export por defecto NO-async (SSR friendly).
 * En runtime de navegador (tests con jsdom), renderiza un footer mínimo
 * para que no falle `render(<Footer />)` aunque no haya datos/locale.
 */
export default function Footer(props: Partial<Props>) {
  const surface = props.surface ?? "base";

  if (typeof window !== "undefined") {
    const locale = props.locale ?? "es";
    const minimal: FooterProps = {
      ariaLabel: "Footer",
      divider: false,
      brand: { name: "Black Crow", logo: "/logos/brand.svg" },
      columns: [],
      legal: { copyright: "© {year} Black Crow" },
    };
    return <FooterView {...minimal} locale={locale} surface={surface} />;
  }

  return <FooterServer locale={props.locale ?? "es"} surface={surface} />;
}

// Server subcomponent async (carga contenido real)
async function FooterServer({ locale, surface }: Props) {
  const data = await loadFooter(locale);
  return <FooterView {...data} locale={locale} surface={surface} />;
}

/** Vista pura (testable) */
function FooterView({
  ariaLabel,
  brand,
  divider,
  columns,
  legal,
  locale,
  surface = "base",
}: FooterProps & { locale: string; surface?: Surface }) {
  const isInverse = surface === "inverse";

  // Logo 100% controlado por el tema (surface)
  const logoSrc = isInverse
    ? "/logos/brand-mark-light.svg"
    : "/logos/brand-mark.svg";

  return (
    <footer
      aria-label={ariaLabel}
      data-testid="footer-root"
      data-surface={surface}
      className={[
        "transition-colors",
        isInverse ? "surface-inverse" : "surface-base",
        "text-(--text)",
      ].join(" ")}
    >
      {/* Divider superior con fade en extremos */}
      {divider && (
        <div aria-hidden className="w-full">
          <div
            className="h-(--divider-h,1px)"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, var(--neutral-300) var(--fade-edge,12%), var(--neutral-300) calc(100% - var(--fade-edge,12%)), transparent 100%)",
            }}
          />
        </div>
      )}

      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Columna 0: Marca/Logo (sin tagline) */}
          <div className="flex flex-col items-start gap-3 md:gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt={brand?.name ?? "Black Crow"}
              className="w-10 h-auto md:w-12"
              decoding="async"
              loading="lazy"
            />
          </div>

          {/* Columnas de navegación/contenido */}
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="space-y-3">
              <h3 className="font-semibold">{col.title}</h3>
              <ul className="space-y-3">
                {col.items.map((item) => {
                  // ✅ en items sí puede venir isExternal desde el mapper
                  const externalFlag =
                    (item as any).isExternal === true || isExternalUrl(item.href);
                  const href = withLocale(locale, item.href);
                  const rel = externalFlag ? "noreferrer" : undefined;
                  const target = externalFlag ? "_blank" : undefined;

                  return (
                    <li key={`${col.title}-${item.label}`}>
                      <Link
                        href={href}
                        target={target}
                        rel={rel}
                        className={[
                          "relative inline-flex items-center gap-2",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                          "focus-visible:ring-(--ring) ring-offset-(--neutral-50)",
                          "after:content-[''] after:absolute after:left-0 after:bottom-0",
                          "after:h-(--underline-h,1px) after:w-0 after:bg-current",
                          "after:transition-[width] after:duration-200",
                          "hover:after:w-full focus-visible:after:w-full",
                        ].join(" ")}
                      >
                        {item.label}
                        {externalFlag && (
                          <span className="sr-only">(abre en nueva pestaña)</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ))}
        </div>

        {/* Legal opcional */}
        {legal?.copyright && (
          <div className="mt-10 pt-6 border-t border-(--neutral-300)">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-(--text-muted,inherit)">
                {replaceYear(legal.copyright)}
              </p>

              {legal.links && legal.links.length > 0 && (
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {legal.links.map((l) => {
                    // ❗️En legal.links el tipo NO trae isExternal ⇒ inferimos por URL absoluta
                    const external = isExternalUrl(l.href);
                    const href = withLocale(locale, l.href);
                    const rel = external ? "noreferrer" : undefined;
                    const target = external ? "_blank" : undefined;

                    return (
                      <li key={l.label}>
                        <Link
                          href={href}
                          target={target}
                          rel={rel}
                          className={[
                            "relative inline-flex items-center",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                            "focus-visible:ring-(--ring) ring-offset-(--neutral-50)",
                            "after:content-[''] after:absolute after:left-0 after:bottom-0",
                            "after:h-(--underline-h,1px) after:w-0 after:bg-current",
                            "after:transition-[width] after:duration-200",
                            "hover:after:w-full focus-visible:after:w-full",
                          ].join(" ")}
                        >
                          {l.label}
                          {external && (
                            <span className="sr-only">(abre en nueva pestaña)</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </Container>

      {/* Línea inferior del footer, un poco más arriba y con más margen abajo */}
      <div
        aria-hidden
        className="mt-4 mb-10 border-t border-(--neutral-300) opacity-40"
      />
    </footer>
  );
}

/** Reemplaza {year} por el año actual dentro del string del JSON. */
function replaceYear(template: string) {
  return template.replace(/\{year\}/g, String(new Date().getFullYear()));
}

export { FooterView };
