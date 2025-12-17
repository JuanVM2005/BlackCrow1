// src/i18n/routing/static.ts
/**
 * Routing i18n estático para Black Crow.
 * - Segmento "servicios/services" por locale
 * - Slugs por oferta: landing | website | ecommerce | personalizado/custom
 * - Helpers para construir/resolver paths sin hardcodear en componentes
 */

import { normalizeLocale } from "@/i18n/locales";

/* =========================
   Tipos
   ========================= */
export type Locale = "es" | "en";
export const SERVICE_KEYS = ["landing", "website", "ecommerce", "custom"] as const;
export type ServiceKey = (typeof SERVICE_KEYS)[number];

/* =========================
   Segmentos por locale
   ========================= */
export const servicesSegmentByLocale: Record<Locale, string> = {
  es: "servicios",
  en: "services",
} as const;

/* =========================
   Slugs por locale y clave
   ========================= */
export const serviceSlugByLocale: Record<Locale, Record<ServiceKey, string>> = {
  es: {
    landing: "landing",
    website: "website",
    ecommerce: "ecommerce",
    custom: "personalizado",
  },
  en: {
    landing: "landing",
    website: "website",
    ecommerce: "ecommerce",
    custom: "custom",
  },
} as const;

/** Listado de slugs disponibles por locale (útil para sitemap/SSG) */
export const serviceSlugsByLocale: Record<Locale, string[]> = {
  es: Object.values(serviceSlugByLocale.es),
  en: Object.values(serviceSlugByLocale.en),
} as const;

/** Export compacto para compatibilidad (p.ej. import routeSegments.services) */
export const routeSegments = {
  services: servicesSegmentByLocale,
} as const;

/* =========================
   Builders
   ========================= */

/** /{locale} */
export function localeBasePath(locale?: string): string {
  const l = normalizeLocale(locale);
  return `/${l}`;
}

/** /{locale}/{servicios|services} */
export function servicesIndexPath(locale?: string): string {
  const l = normalizeLocale(locale);
  return `/${l}/${servicesSegmentByLocale[l]}`;
}

/** /{locale}/{servicios|services}/{slug} (por clave canónica) */
export function serviceDetailPath(locale: string | undefined, key: ServiceKey): string {
  const l = normalizeLocale(locale);
  const slug = serviceSlugByLocale[l][key];
  return `/${l}/${servicesSegmentByLocale[l]}/${slug}`;
}

/* =========================
   Resolvers
   ========================= */

/** Resuelve la clave canónica (ServiceKey) a partir de un slug local */
export function resolveServiceKeyFromSlug(locale: string | undefined, slug: string): ServiceKey | null {
  const l = normalizeLocale(locale);
  const table = serviceSlugByLocale[l];
  const match = (Object.keys(table) as ServiceKey[]).find((k) => table[k] === slug);
  return match ?? null;
}

/** Genera todas las rutas de detalle para un locale (útil para prebuild/sitemap) */
export function allServiceDetailPaths(locale?: string): string[] {
  const l = normalizeLocale(locale);
  const segment = servicesSegmentByLocale[l];
  return serviceSlugsByLocale[l].map((slug) => `/${l}/${segment}/${slug}`);
}
