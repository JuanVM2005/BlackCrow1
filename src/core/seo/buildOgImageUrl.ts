// src/core/seo/buildOgImageUrl.ts
import { site } from "@/config/site";

type Locale = "es" | "en";

/**
 * ⚠️ Mantenemos el tipo por compatibilidad,
 * pero ya NO se usa ningún parámetro dinámico.
 */
export type BuildOgImageParams = {
  locale: Locale;
  slug?: string;
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

/**
 * ✅ Opción A — OG estático global
 *
 * - TODAS las rutas usan la misma imagen OG
 * - No existe más generación dinámica por ruta
 * - No se usan locale, slug ni overrides
 *
 * Fuente única:
 *   public/og/default.png
 */
export function buildOgImageUrl(_params?: BuildOgImageParams): string {
  return buildAbsoluteUrl(site.ogImage);
}
