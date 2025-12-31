// src/layout/Footer/footer.mapper.ts
import { footerSchema, type FooterContent } from "@/content/schemas/footer.schema";

/** Helpers de enlace */
type Href = string;
const LOCALE_PREFIX_RE = /^\/[a-z]{2}(\/|$)/i;
const isHttp = (href: Href) => /^https?:\/\//i.test(href);
const isMailto = (href: Href) => /^mailto:/i.test(href);
const isTel = (href: Href) => /^tel:/i.test(href);
const isExternal = (href: Href) => isHttp(href);

/** Prefija rutas internas con el locale activo; respeta http(s), mailto, tel y rutas ya localizadas */
function localizeHref(href: Href, locale: string): Href {
  if (isHttp(href) || isMailto(href) || isTel(href)) return href;
  if (LOCALE_PREFIX_RE.test(href)) return href;
  return `/${locale}${href.startsWith("/") ? href : `/${href}`}`;
}

/** Link normalizado para UI */
export type FooterLink = {
  label: string;
  href: string;
  isExternal: boolean;
  target?: "_blank";
  rel?: "noopener noreferrer";
};

/** Props finales para el componente de UI */
export type FooterProps = {
  ariaLabel: string;
  brand: FooterContent["brand"];
  divider: boolean;
  columns: { title: string; items: FooterLink[] }[];
  legal?: FooterContent["legal"];
};

/** Helper: construye FooterLink con tipos EXACTOS (target="_blank") */
function toFooterLink(item: { label: string; href: string }, locale: string): FooterLink {
  const href = localizeHref(item.href, locale);
  const external = isExternal(href);

  if (!external) {
    return {
      label: item.label,
      href,
      isExternal: false,
    };
  }

  return {
    label: item.label,
    href,
    isExternal: true,
    target: "_blank",
    rel: "noopener noreferrer",
  };
}

/** Valida y normaliza el JSON crudo del footer */
export function mapFooter(raw: unknown, locale: string): FooterProps {
  const parsed = footerSchema.parse(raw);

  return {
    ariaLabel: parsed.ariaLabel,
    brand: parsed.brand,
    divider: parsed.divider ?? false,
    columns: parsed.columns.map((col) => ({
      title: col.title,
      items: col.items.map((item) => toFooterLink(item, locale)),
    })),
    // dejamos legal tal cual (si luego quieres, lo tipamos/normalizamos también)
    legal: parsed.legal,
  };
}

/**
 * Loader conveniente.
 * Si ya usas un loader centralizado de contenido, reemplázalo allí y conserva `mapFooter`.
 * (Requiere `paths` alias "@/*" y `resolveJsonModule` en tsconfig para importar JSON).
 */
export async function loadFooter(locale: string): Promise<FooterProps> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = await import(`@/content/locales/${locale}/sections/footer.json`);
  const data = (mod as any).default ?? mod;
  return mapFooter(data, locale);
}
