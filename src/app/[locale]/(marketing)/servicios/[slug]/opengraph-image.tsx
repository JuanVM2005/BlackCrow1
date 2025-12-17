// src/app/[locale]/(marketing)/servicios/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { normalizeLocale } from "@/i18n/locales";
import {
  resolveServiceKeyFromSlug,
  serviceSlugByLocale,
  type ServiceKey,
} from "@/i18n/routing/static";
import { site } from "@/config/site";

import type { ServiceDetailJSON } from "@/content/schemas/serviceDetail.schema";
import { parseServiceDetail } from "@/content/schemas/serviceDetail.schema";

export const runtime = "edge";
export const revalidate = 3600;
export const alt = "Open Graph image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* =========================
   Carga de contenido i18n (con validación)
   ========================= */
async function loadDetailContent(
  locale: "es" | "en",
  key: ServiceKey
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
    return parseServiceDetail(raw);
  } catch {
    return null;
  }
}

/* =========================
   OG image
   ========================= */
export default async function Image({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const l = normalizeLocale(params?.locale);
  const key = resolveServiceKeyFromSlug(l, params.slug);
  const domain =
    site?.url?.replace(/^https?:\/\//, "").replace(/\/$/, "") ??
    "blackcrow.studio";

  // Fallback para índice si el slug no es válido
  if (!key) {
    const title =
      l === "es"
        ? `Servicios — ${site?.name ?? "Black Crow"}`
        : `Services — ${site?.name ?? "Black Crow"}`;
    const subtitle =
      l === "es"
        ? "Landing · Website · E-Commerce · Personalizado"
        : "Landing · Website · E-Commerce · Custom";

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
      { ...size }
    );
  }

  const data = await loadDetailContent(l, key);

  // Si no se encuentra contenido válido, usa fallback del índice
  if (!data) {
    const title =
      l === "es"
        ? `Servicios — ${site?.name ?? "Black Crow"}`
        : `Services — ${site?.name ?? "Black Crow"}`;
    const subtitle =
      l === "es"
        ? "Landing · Website · E-Commerce · Personalizado"
        : "Landing · Website · E-Commerce · Custom";

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
      { ...size }
    );
  }

  const canonicalSlug = serviceSlugByLocale[l][key];
  const title = data.header?.title ?? canonicalSlug;
  const subtitle =
    data.header?.subtitle ??
    (l === "es"
      ? "Servicio a medida, claro y escalable"
      : "Clear, scalable service");
  const badge = data.header?.badge;
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
        {/* Badge opcional ("Servicio") */}
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

        {/* Título grande + precio (si existe) */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
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
          <div
            style={{ marginTop: 12, fontSize: 28, opacity: 0.9 }}
          >
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
            {site?.name ?? "Black Crow"}
          </div>
          <div style={{ opacity: 0.8 }}>{domain}</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
