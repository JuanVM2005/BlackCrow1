// src/seo/defaults.ts

/**
 * Configuración SEO por defecto de Black Crow con soporte EN / ES.
 *
 * - Principalmente CONFIG (datos).
 * - Sin dependencias de otros módulos.
 */

export type Locale = "en" | "es";

export type SeoLocaleDefaults = {
  /** Título base por locale (cuando una página no define uno propio) */
  title: string;
  /** Descripción base por locale */
  description: string;
  /**
   * Imagen OG por defecto para este locale.
   * Si no se define, se usa DEFAULT_OG_IMAGE.
   */
  ogImage?: string;
};

export type SeoDefaults = {
  /** Nombre del sitio / marca (común a todos los locales) */
  siteName: string;
  /** Locale por defecto del sitio */
  defaultLocale: Locale;
  /** Configuración base por locale */
  locales: Record<Locale, SeoLocaleDefaults>;
  /** Imagen OG global de fallback */
  fallbackOgImage: string;
  /** Handle de Twitter/X opcional, si se quiere usar en tarjetas */
  twitterHandle?: string;
  /** Reglas robots por defecto */
  robots: {
    index: boolean;
    follow: boolean;
  };
};

/**
 * Nombre canónico del sitio.
 * Úsalo para `og:site_name`, etc.
 */
export const DEFAULT_SITE_NAME = "Black Crow — Creative & Tech Agency";

/**
 * Imagen OG global por defecto (neutral, válida para EN/ES).
 *
 * Archivo físico: public/og/default.png
 * Ruta pública:   /og/default.png
 */
export const DEFAULT_OG_IMAGE = "/og/default.png";

/**
 * Configuración SEO por defecto con soporte por locale.
 *
 * OJO:
 * - Home EN/ES ya definen su propia `meta.ogImage` (home-en.png / home-es.png),
 *   así que estos valores son solo fallback cuando una página no tiene nada.
 */
export const SEO_DEFAULTS: SeoDefaults = {
  siteName: DEFAULT_SITE_NAME,
  defaultLocale: "es",
  fallbackOgImage: DEFAULT_OG_IMAGE,
  twitterHandle: undefined,
  robots: {
    index: true,
    follow: true,
  },
  locales: {
    en: {
      title: "Black Crow — Creative & Tech Agency",
      description:
        "High-impact UX/UI design, branding, and web development.",
      ogImage: DEFAULT_OG_IMAGE,
    },
    es: {
      title: "Black Crow — Agencia Creativa & Tech",
      description:
        "Diseño UX/UI, branding y desarrollo web de alto impacto.",
      ogImage: DEFAULT_OG_IMAGE,
    },
  },
};

/**
 * Helper pequeño para obtener defaults por locale
 * sin repetir lógica en otros módulos.
 */
export function getSeoLocaleDefaults(locale: Locale): SeoLocaleDefaults {
  return SEO_DEFAULTS.locales[locale] ?? SEO_DEFAULTS.locales[SEO_DEFAULTS.defaultLocale];
}
