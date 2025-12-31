// src/layout/Footer/index.tsx
import * as React from "react";
import Container from "@/ui/Container";
import { loadFooter, type FooterProps } from "./footer.mapper";
import FooterLinkClient, { type FooterLinkIntent } from "./FooterLink.client";

type Surface = "base" | "inverse";

type Props = {
  locale: string;
  surface?: Surface;
};

function isExternalUrl(href?: string) {
  return !!href && /^https?:\/\//i.test(href);
}

/**
 * Export por defecto NO-async (SSR friendly).
 * En runtime de navegador (tests con jsdom), renderiza un footer mínimo
 * para que no falle `render(<Footer />)` aunque no haya datos/locale.
 */
export default function Footer(props: Partial<Props>) {
  const surface = props.surface ?? "base";

  if (typeof window !== "undefined") {
    const locale = (props.locale ?? "es") as "es" | "en";
    const minimal: FooterProps = {
      ariaLabel: "Footer",
      divider: false,
      brand: { name: "Black Crow", logo: "/logos/brand.svg" },
      columns: [],
      legal: { copyright: "© {year} Black Crow" },
    };
    return <FooterView {...minimal} locale={locale} surface={surface} />;
  }

  return <FooterServer locale={(props.locale ?? "es") as "es" | "en"} surface={surface} />;
}

// Server subcomponent async (carga contenido real)
async function FooterServer({ locale, surface }: { locale: "es" | "en"; surface: Surface }) {
  const data = await loadFooter(locale);
  return <FooterView {...data} locale={locale} surface={surface} />;
}

function intentFromMenuItem(label: string): FooterLinkIntent {
  const v = label.trim().toLowerCase();

  if (v === "home" || v === "inicio") return "home";
  if (v === "pricing" || v === "precios") return "pricing";
  if (v === "contact" || v === "contacto") return "contact";

  return "none";
}

/** Vista pura (testable) */
function FooterView({
  ariaLabel,
  divider,
  columns,
  legal,
  locale,
  surface = "base",
}: FooterProps & { locale: "es" | "en"; surface?: Surface }) {
  const isInverse = surface === "inverse";

  const logoSrc = isInverse ? "/logos/brand-mark-light.svg" : "/logos/brand-mark.svg";

  const ringOffset = isInverse ? "ring-offset-(--neutral-1000)" : "ring-offset-(--neutral-50)";

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
          <div className="flex flex-col items-start gap-3 md:gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt=""
              className="h-auto w-24 sm:w-28 md:w-28 lg:w-32"
              decoding="async"
              loading="lazy"
            />
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="space-y-3">
              <h3 className="font-semibold">{col.title}</h3>

              <ul className="space-y-3">
                {col.items.map((item) => {
                  const externalFlag =
                    (item as any).isExternal === true || isExternalUrl(item.href);

                  // ✅ YA VIENE LOCALIZADO DESDE mapFooter()
                  const href = item.href;

                  // Solo aplicamos “intents” en el bloque Menu
                  const isMenu = col.title.trim().toLowerCase() === "menu" || col.title.trim().toLowerCase() === "menú";
                  const intent: FooterLinkIntent = isMenu ? intentFromMenuItem(item.label) : "none";

                  return (
                    <li key={`${col.title}-${item.label}`}>
                      <FooterLinkClient
                        href={href}
                        label={item.label}
                        locale={locale}
                        intent={intent}
                        external={externalFlag}
                        className={[
                          "relative inline-flex items-center gap-2",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                          "focus-visible:ring-(--ring)",
                          ringOffset,
                          "after:content-[''] after:absolute after:left-0 after:bottom-0",
                          "after:h-(--underline-h,1px) after:w-0 after:bg-current",
                          "after:transition-[width] after:duration-200",
                          "hover:after:w-full focus-visible:after:w-full",
                        ].join(" ")}
                      >
                        {item.label}
                        {externalFlag && <span className="sr-only">(abre en nueva pestaña)</span>}
                      </FooterLinkClient>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ))}
        </div>

        {legal?.copyright && (
          <div className="mt-10 pt-6 border-t border-(--neutral-300)">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-(--text-muted,inherit)">{replaceYear(legal.copyright)}</p>

              {legal.links && legal.links.length > 0 && (
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {legal.links.map((l) => {
                    const external = isExternalUrl(l.href);
                    const href = l.href;

                    return (
                      <li key={l.label}>
                        <FooterLinkClient
                          href={href}
                          label={l.label}
                          locale={locale}
                          external={external}
                          intent="none"
                          className={[
                            "relative inline-flex items-center",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                            "focus-visible:ring-(--ring)",
                            ringOffset,
                            "after:content-[''] after:absolute after:left-0 after:bottom-0",
                            "after:h-(--underline-h,1px) after:w-0 after:bg-current",
                            "after:transition-[width] after:duration-200",
                            "hover:after:w-full focus-visible:after:w-full",
                          ].join(" ")}
                        >
                          {l.label}
                          {external && <span className="sr-only">(abre en nueva pestaña)</span>}
                        </FooterLinkClient>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </Container>

      <div aria-hidden className="mt-4 mb-10 border-t border-(--neutral-300) opacity-40" />
    </footer>
  );
}

function replaceYear(template: string) {
  return template.replace(/\{year\}/g, String(new Date().getFullYear()));
}

export { FooterView };
