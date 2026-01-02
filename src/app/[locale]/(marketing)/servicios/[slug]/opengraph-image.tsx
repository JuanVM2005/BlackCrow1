// src/app/[locale]/(marketing)/servicios/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const revalidate = 3600;
export const alt = "Open Graph image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Locale = "es" | "en";

/**
 * ✅ Mantener bundle Edge < 1MB:
 * - Sin imports internos (i18n/config/schemas/zod).
 * - Sin parse/validación.
 * - Mapa mínimo de copy por servicio.
 */

function normalizeLocale(raw?: string): Locale {
  const v = (raw ?? "").toLowerCase();
  if (v.startsWith("en")) return "en";
  return "es";
}

function getSiteName(): string {
  return process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Black Crow";
}

function getDomain(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    "https://blackcrow.studio";
  return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

type ServiceKey = "landing" | "website" | "ecommerce" | "custom";

type OgServiceData = {
  title: { es: string; en: string };
  subtitle?: { es: string; en: string };
  badge?: { es: string; en: string };
  priceRange?: string;
};

/** Slugs canónicos por locale (para resolver key desde params.slug) */
const SLUG_TO_KEY: Record<Locale, Record<string, ServiceKey>> = {
  es: {
    landing: "landing",
    website: "website",
    ecommerce: "ecommerce",
    personalizado: "custom",
    // por si alguien entra con slug EN en /es
    custom: "custom",
  },
  en: {
    landing: "landing",
    website: "website",
    ecommerce: "ecommerce",
    custom: "custom",
    // por si alguien entra con slug ES en /en
    personalizado: "custom",
  },
};

/** Copy mínimo para OG (no dependemos de JSON + schemas) */
const OG_SERVICES: Record<ServiceKey, OgServiceData> = {
  landing: {
    title: { es: "Landing Page", en: "Landing Page" },
    subtitle: {
      es: "Alta conversión, rápida y lista para campañas",
      en: "High-converting, fast, campaign-ready",
    },
    badge: { es: "Servicio", en: "Service" },
    // Si quieres, puedes setear un rango fijo o dejarlo vacío
    // priceRange: "Desde $XXX",
  },
  website: {
    title: { es: "Sitio Web", en: "Website" },
    subtitle: {
      es: "Diseño premium, escalable y enfocado en marca",
      en: "Premium, scalable, brand-first design",
    },
    badge: { es: "Servicio", en: "Service" },
  },
  ecommerce: {
    title: { es: "E-Commerce", en: "E-Commerce" },
    subtitle: {
      es: "Tienda moderna con pagos, catálogo y analítica",
      en: "Modern store with payments, catalog & analytics",
    },
    badge: { es: "Servicio", en: "Service" },
  },
  custom: {
    title: { es: "Personalizado", en: "Custom" },
    subtitle: {
      es: "Soluciones a medida, claras y escalables",
      en: "Tailored solutions, clear and scalable",
    },
    badge: { es: "Servicio", en: "Service" },
  },
};

function getFallbackTitle(locale: Locale, siteName: string) {
  return locale === "es" ? `Servicios — ${siteName}` : `Services — ${siteName}`;
}

function getFallbackSubtitle(locale: Locale) {
  return locale === "es"
    ? "Landing · Website · E-Commerce · Personalizado"
    : "Landing · Website · E-Commerce · Custom";
}

export default async function Image({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const l = normalizeLocale(params?.locale);
  const siteName = getSiteName();
  const domain = getDomain();

  const slug = (params?.slug ?? "").toLowerCase();
  const key = SLUG_TO_KEY[l][slug];

  // Fallback para índice si el slug no es válido
  if (!key) {
    const title = getFallbackTitle(l, siteName);
    const subtitle = getFallbackSubtitle(l);

    return new ImageResponse(
      (
        <div
          style={{
            width: `${size.width}px`,
            height: `${size.height}px`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "64px",
            background: "#0B0B0B",
            color: "#FFFFFF",
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>
            {title}
          </div>
          <div style={{ marginTop: 12, fontSize: 28, opacity: 0.9 }}>
            {subtitle}
          </div>
          <div style={{ marginTop: 28, fontSize: 22, opacity: 0.8 }}>
            {domain}
          </div>
        </div>
      ),
      { ...size },
    );
  }

  const data = OG_SERVICES[key];

  const title = data.title[l];
  const subtitle =
    data.subtitle?.[l] ??
    (l === "es"
      ? "Servicio a medida, claro y escalable"
      : "Clear, scalable service");
  const badge = data.badge?.[l];
  const priceRange = data.priceRange;

  return new ImageResponse(
    (
      <div
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px",
          background: "#0B0B0B",
          color: "#FFFFFF",
        }}
      >
        {/* Badge opcional */}
        {badge ? (
          <div
            style={{
              alignSelf: "flex-start",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 9999,
              padding: "6px 12px",
              fontSize: 20,
              marginBottom: 16,
            }}
          >
            {badge}
          </div>
        ) : null}

        {/* Título + precio */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>
            {title}
          </div>

          {priceRange ? (
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 9999,
                padding: "8px 14px",
                fontSize: 22,
              }}
            >
              {priceRange}
            </div>
          ) : null}
        </div>

        {/* Subtítulo */}
        {subtitle ? (
          <div style={{ marginTop: 12, fontSize: 28, opacity: 0.9 }}>
            {subtitle}
          </div>
        ) : null}

        {/* Firma / dominio */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 28,
            fontSize: 22,
          }}
        >
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "6px 12px",
              borderRadius: 9999,
            }}
          >
            {siteName}
          </div>
          <div style={{ opacity: 0.8 }}>{domain}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
