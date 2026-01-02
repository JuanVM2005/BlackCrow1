// src/core/seo/buildOgImageUrl.ts
import { site } from "@/config/site";
import { servicesSegmentByLocale } from "@/i18n/routing/static";

type Locale = "es" | "en";

export type BuildOgImageParams = {
  locale: Locale;
  /** Si se pasa slug → OG del detalle; si no → OG del índice */
  slug?: string;
  /** Overrides opcionales para el renderer de la OG */
  titleOverride?: string;
  subtitle?: string;
  badge?: string;
};

/** Convierte una ruta relativa en URL absoluta usando NEXT_PUBLIC_SITE_URL (o site.url) */
export function buildAbsoluteUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || site.url).replace(
    /\/$/,
    "",
  );
  const rel = path.startsWith("/") ? path : `/${path}`;
  return `${base}${rel}`;
}

/** Devuelve la URL absoluta de la imagen OG (índice o detalle) de Servicios */
export function buildOgImageUrl(params: BuildOgImageParams): string {
  const { locale, slug, titleOverride, subtitle, badge } = params;
  const seg = servicesSegmentByLocale[locale];

  // Ruta a opengraph-image del índice o del detalle
  const pathname = slug
    ? `/${locale}/${seg}/${slug}/opengraph-image`
    : `/${locale}/${seg}/opengraph-image`;

  const qs = new URLSearchParams();
  if (titleOverride) qs.set("title", titleOverride);
  if (subtitle) qs.set("subtitle", subtitle);
  if (badge) qs.set("badge", badge);

  const query = qs.toString();
  return buildAbsoluteUrl(query ? `${pathname}?${query}` : pathname);
}
