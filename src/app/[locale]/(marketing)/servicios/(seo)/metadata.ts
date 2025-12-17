// src/app/[locale]/(marketing)/servicios/(seo)/metadata.ts
import type { Metadata } from "next";
import { site } from "@/config/site";
import { normalizeLocale } from "@/i18n/locales";
import { servicesSegmentByLocale } from "@/i18n/routing/static";

/** Forma mínima para leer SEO desde el JSON del índice */
type ServicesIndexJSON = {
  seo?: { title?: string; description?: string };
};

async function loadIndexSEO(
  locale: "es" | "en",
): Promise<ServicesIndexJSON["seo"] | null> {
  try {
    if (locale === "es") {
      const json = (
        await import("@/content/locales/es/pages/servicios.json")
      ).default as ServicesIndexJSON;
      return json.seo ?? null;
    }
    const json = (
      await import("@/content/locales/en/pages/services.json")
    ).default as ServicesIndexJSON;
    return json.seo ?? null;
  } catch {
    return null;
  }
}

/**
 * Metadata para el índice /servicios (por locale).
 * Usa metadataBase del root (no construimos URLs absolutas aquí).
 * Next 15/16: params es Promise.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const l = normalizeLocale(rawLocale);
  const seg = servicesSegmentByLocale[l];
  const url = `/${l}/${seg}`;

  // SEO desde contenido (fallback a strings)
  const contentSEO = await loadIndexSEO(l);
  const title =
    contentSEO?.title ??
    (l === "es"
      ? `Servicios — ${site?.name ?? "Black Crow"}`
      : `Services — ${site?.name ?? "Black Crow"}`);

  const description =
    contentSEO?.description ??
    (l === "es"
      ? "Webs de alto impacto: Landing, Website y E-Commerce. Precios claros, entregables y tiempos definidos."
      : "High-impact websites: Landing, Website, and E-Commerce. Clear pricing, deliverables, and timelines.");

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        es: `/es/${servicesSegmentByLocale.es}`,
        en: `/en/${servicesSegmentByLocale.en}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: site?.name ?? "Black Crow",
      type: "website",
      locale: l === "es" ? "es_PE" : "en_US",
      ...(site?.ogImage ? { images: [site.ogImage] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(site?.ogImage ? { images: [site.ogImage] } : {}),
    },
  };
}
