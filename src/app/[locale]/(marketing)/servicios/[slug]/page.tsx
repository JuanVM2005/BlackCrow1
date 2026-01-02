// src/app/[locale]/(marketing)/servicios/[slug]/page.tsx
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { z } from "zod";

import { site } from "@/config/site";
import { normalizeLocale, locales } from "@/i18n/locales";
import {
  resolveServiceKeyFromSlug,
  serviceSlugByLocale,
  serviceSlugsByLocale,
  servicesSegmentByLocale,
  type ServiceKey,
} from "@/i18n/routing/static";

import type { ServiceDetailJSON } from "@/content/schemas/serviceDetail.schema";
import { parseServiceDetail } from "@/content/schemas/serviceDetail.schema";
import { getServiceTemplate } from "@/features/services/ui/templates/templateMap";

/** Revalidación diaria (SSG + ISR) */
export const revalidate = 86400;

/* =========================================================
   Sanitizador (legacy → minimal):
   - Elimina por completo `overview` (centralizamos el copy en _common.json).
   - Remapea pricing.note → priceRange y elimina pricing.
   - Elimina FAQ legacy.
   - Limpia `details`/`detalles` si reapareciera.
   - Permite solo el superset mínimo aceptado por el schema.
   ========================================================= */
function sanitizeLegacyServiceDetail(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const obj: any = JSON.parse(JSON.stringify(raw)); // deep clone defensivo

  // --- remover cualquier overview legacy (ya no se usa en el schema)
  if ("overview" in obj) delete obj.overview;

  // --- eliminar restos de "details"/"detalles" si existen
  if ("details" in obj) delete obj.details;
  if ("detalles" in obj) delete obj.detalles;

  // --- pricing.note → priceRange (y elimina pricing)
  if (obj.pricing && typeof obj.pricing === "object") {
    const note = String(obj.pricing.note ?? "").trim();
    if (note) {
      const cleaned = note.replace(/^(precio|price)\s+[^:]*:\s*/i, "").trim();
      obj.priceRange = cleaned || note;
    }
    delete obj.pricing;
  }

  // --- eliminar FAQ legacy
  if ("faq" in obj) delete obj.faq;

  // --- whitelisting de top-level keys (sin overview)
  const allowedTop = new Set([
    "kind",
    "key",
    "header",
    "priceRange",
    "featuresLeft",
    "featuresRight",
    "tags",
    "seo",
  ]);
  for (const k of Object.keys(obj)) {
    if (!allowedTop.has(k)) delete obj[k];
  }

  // --- limpieza básica de arrays string
  const sanitizeStringArray = (a: any) =>
    Array.isArray(a)
      ? a
          .filter((s) => typeof s === "string" && s.trim())
          .map((s) => s.trim())
      : undefined;

  if (obj.featuresLeft) obj.featuresLeft = sanitizeStringArray(obj.featuresLeft);
  if (obj.featuresRight)
    obj.featuresRight = sanitizeStringArray(obj.featuresRight);
  if (obj.tags) obj.tags = sanitizeStringArray(obj.tags);

  // --- header trims
  if (obj.header && typeof obj.header === "object") {
    if (typeof obj.header.title === "string")
      obj.header.title = obj.header.title.trim();
    if (typeof obj.header.subtitle === "string")
      obj.header.subtitle = obj.header.subtitle.trim();
    if (typeof obj.header.badge === "string")
      obj.header.badge = obj.header.badge.trim();
  }

  return obj;
}

/* =========================
   Carga de contenido i18n (con validación + saneo)
   ========================= */
async function loadDetailContent(
  locale: "es" | "en",
  key: ServiceKey,
): Promise<ServiceDetailJSON | null> {
  try {
    const mapES: Record<ServiceKey, () => Promise<{ default: unknown }>> = {
      landing: () => import("@/content/locales/es/services/landing.json"),
      website: () => import("@/content/locales/es/services/website.json"),
      ecommerce: () => import("@/content/locales/es/services/ecommerce.json"),
      custom: () => import("@/content/locales/es/services/personalizado.json"),
    };
    const mapEN: Record<ServiceKey, () => Promise<{ default: unknown }>> = {
      landing: () => import("@/content/locales/en/services/landing.json"),
      website: () => import("@/content/locales/en/services/website.json"),
      ecommerce: () => import("@/content/locales/en/services/ecommerce.json"),
      custom: () => import("@/content/locales/en/services/custom.json"),
    };

    const raw = (await (locale === "es" ? mapES[key]() : mapEN[key]())).default;

    // 1) Intento estricto primero
    try {
      return parseServiceDetail(raw);
    } catch (err) {
      if (err instanceof z.ZodError) {
        // 2) Saneo + re-parseo
        console.warn("[services] schema mismatch, trying to sanitize:", err.issues);
        const cleaned = sanitizeLegacyServiceDetail(raw);
        try {
          const parsed = parseServiceDetail(cleaned);
          console.warn("[services] sanitized OK:", { key, locale });
          return parsed;
        } catch {
          console.error("[services] sanitization failed, returning null:", {
            key,
            locale,
          });
          return null;
        }
      }
      throw err;
    }
  } catch {
    return null;
  }
}

/* =========================
   SEO (dinámico por slug) – Next 16: params es Promise
   ========================= */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const l = normalizeLocale(rawLocale) as "es" | "en";
  const key = resolveServiceKeyFromSlug(l, slug);

  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || site.url
  ).replace(/\/$/, "");

  // Fallback de índice si el slug no es válido
  if (!key) {
    const seg = servicesSegmentByLocale[l];
    const url = `${baseUrl}/${l}/${seg}`;
    const title =
      l === "es"
        ? `Servicios — ${site?.name ?? "Black Crow"}`
        : `Services — ${site?.name ?? "Black Crow"}`;
    const description =
      l === "es"
        ? "Webs de alto impacto: Landing, Website y E-Commerce."
        : "High-impact websites: Landing, Website, and E-Commerce.";
    return {
      title,
      description,
      alternates: {
        canonical: url,
        languages: {
          es: `${baseUrl}/es/${servicesSegmentByLocale.es}`,
          en: `${baseUrl}/en/${servicesSegmentByLocale.en}`,
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
    };
  }

  const data = await loadDetailContent(l, key);
  const seg = servicesSegmentByLocale[l];
  const canonicalSlug = serviceSlugByLocale[l][key];
  const url = `${baseUrl}/${l}/${seg}/${canonicalSlug}`;

  const title =
    data?.seo?.title ??
    `${data?.header.title ?? key} — ${site?.name ?? "Black Crow"}`;
  const description =
    data?.seo?.description ??
    data?.header?.subtitle ??
    (l === "es"
      ? "Servicio web a medida, claro y escalable."
      : "Clear, scalable web service.");

  const altLocale = l === "es" ? "en" : "es";
  const altSeg = servicesSegmentByLocale[altLocale as "es" | "en"];
  const altSlug = serviceSlugByLocale[altLocale as "es" | "en"][key];

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        [l]: url,
        [altLocale]: `${baseUrl}/${altLocale}/${altSeg}/${altSlug}`,
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
  };
}

/* =========================
   JSON-LD minimal
   ========================= */
function buildServiceJsonLd(args: {
  locale: "es" | "en";
  url: string;
  data: ServiceDetailJSON;
}) {
  const { locale, url, data } = args;
  const name = data.header?.title || (locale === "es" ? "Servicio" : "Service");
  const description =
    data.seo?.description ||
    data.header?.subtitle ||
    (locale === "es" ? "Servicio web." : "Web service.");

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    inLanguage: locale,
    serviceType: name,
    url,
    provider: {
      "@type": "Organization",
      name: site?.name ?? "Black Crow",
      url: (site?.url ?? "").replace(/\/$/, "") || undefined,
    },
  };
}

function buildBreadcrumbJsonLd(args: {
  locale: "es" | "en";
  url: string;
  indexUrl: string;
  homeUrl: string;
  data: ServiceDetailJSON;
}) {
  const { locale, url, indexUrl, homeUrl, data } = args;
  const servicesLabel = locale === "es" ? "Servicios" : "Services";
  const name = data.header?.title || (locale === "es" ? "Servicio" : "Service");

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "es" ? "Inicio" : "Home",
        item: homeUrl,
      },
      { "@type": "ListItem", position: 2, name: servicesLabel, item: indexUrl },
      { "@type": "ListItem", position: 3, name, item: url },
    ],
  };
}

/* =========================
   Página (server) – Next 16: params es Promise
   ========================= */
export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = normalizeLocale(rawLocale) as "es" | "en";

  const allowedSlugs = serviceSlugsByLocale[locale];
  if (!allowedSlugs.includes(slug)) notFound();

  const key = resolveServiceKeyFromSlug(locale, slug);
  if (!key) notFound();

  // Canonicalización
  const canonicalSlug = serviceSlugByLocale[locale][key];
  if (slug !== canonicalSlug) {
    const segment = servicesSegmentByLocale[locale];
    redirect(`/${locale}/${segment}/${canonicalSlug}`);
  }

  const data = await loadDetailContent(locale, key);
  if (!data) notFound();

  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || site.url
  ).replace(/\/$/, "");

  // URLs para JSON-LD
  const seg = servicesSegmentByLocale[locale];
  const pageUrl = `${baseUrl}/${locale}/${seg}/${canonicalSlug}`;
  const homeUrl = `${baseUrl}/${locale}`;
  const indexUrl = `${baseUrl}/${locale}/${seg}`;

  const serviceLd = buildServiceJsonLd({ locale, url: pageUrl, data });
  const breadcrumbLd = buildBreadcrumbJsonLd({
    locale,
    url: pageUrl,
    indexUrl,
    homeUrl,
    data,
  });

  const Template = getServiceTemplate(key);

  return (
    <main
      data-surface="inverse"
      className="bg-(--surface-inverse) text-(--text-on-inverse)"
    >
      <script
        type="application/ld+json"
        suppressHydrationWarning
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {/* El formulario se añade desde el layout con ServicePageFrame */}
      <Template data={data} locale={locale} />
    </main>
  );
}

/* =========================
   SSG de slugs por locale
   ========================= */
export async function generateStaticParams() {
  const params: Array<{ locale: string; slug: string }> = [];
  for (const l of locales) {
    for (const slug of serviceSlugsByLocale[l]) {
      params.push({ locale: l, slug });
    }
  }
  return params;
}
