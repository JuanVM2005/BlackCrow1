// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/**
 * Genera /sitemap.xml con páginas i18n:
 * - /[locale]
 * - /[locale]/servicios|services
 * - /[locale]/servicios|services/[slug]
 * - /[locale]/contacto | /[locale]/contact
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const envBase = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const baseUrl = (envBase || site.url).replace(/\/$/, "");
  const now = new Date();

  // Locales (con fallback si aún no existen los exports)
  const { locales = ["es", "en"], defaultLocale = "es" } = await import(
    "@/i18n/locales"
  ).catch(() => ({
    locales: ["es", "en"],
    defaultLocale: "es",
  }));

  // Segmento y slugs por locale (se intenta leer de routing estático; si no, se usan fallbacks)
  const routing: any = await import("@/i18n/routing/static").catch(() => ({}));

  const servicesSegmentByLocale: Record<string, string> = {
    es: "servicios",
    en: "services",
    ...(routing?.servicesSegmentByLocale ??
      routing?.routeSegments?.services ??
      {}),
  };

  const serviceSlugsByLocale: Record<string, string[]> = {
    es: ["landing", "website", "ecommerce", "personalizado"],
    en: ["landing", "website", "ecommerce", "custom"],
    ...(routing?.serviceSlugsByLocale ?? {}),
  };

  const contactPathByLocale: Record<string, string> = {
    es: "contacto",
    en: "contact",
  };

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales as string[]) {
    const home = `${baseUrl}/${locale}`;

    const servicesSegment =
      servicesSegmentByLocale[locale] ??
      (locale.startsWith("es") ? "servicios" : "services");

    const slugs =
      serviceSlugsByLocale[locale] ??
      (locale.startsWith("es")
        ? ["landing", "website", "ecommerce", "personalizado"]
        : ["landing", "website", "ecommerce", "custom"]);

    // Home por locale
    entries.push({
      url: home,
      lastModified: now,
      changeFrequency: "daily",
      priority: locale === defaultLocale ? 1 : 0.9,
    });

    // Índice de servicios
    entries.push({
      url: `${home}/${servicesSegment}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });

    // Detalles de servicios
    for (const slug of slugs) {
      entries.push({
        url: `${home}/${servicesSegment}/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }

    // Contacto (página real)
    entries.push({
      url: `${home}/${contactPathByLocale[locale] ?? (locale.startsWith("es") ? "contacto" : "contact")}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  // Nota: si / redirige a /[defaultLocale], no la listamos para evitar duplicados.
  return entries;
}
