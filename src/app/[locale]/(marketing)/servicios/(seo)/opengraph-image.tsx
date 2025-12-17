// src/app/[locale]/(marketing)/servicios/(seo)/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { normalizeLocale } from "@/i18n/locales";

// Ejecutar en Edge para generar más rápido
export const runtime = "edge";

// Revalidación: regenerar cada hora
export const revalidate = 3600;

// Medidas OG estándar
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = Promise<{ locale: string }>;

export default async function OgImage({
  params,
}: {
  params: Params;
}) {
  const { locale: rawLocale } = await params;
  const l = normalizeLocale(rawLocale);

  const title =
    l === "es"
      ? `Servicios — ${site?.name ?? "Black Crow"}`
      : `Services — ${site?.name ?? "Black Crow"}`;

  const subtitle =
    l === "es"
      ? "Landing · Website · E-Commerce · Personalizado"
      : "Landing · Website · E-Commerce · Custom";

  const domain =
    site?.url?.replace(/^https?:\/\//, "") ?? "blackcrow.studio";

  // Diseño sobrio sin dependencias externas (no hereda tokens CSS)
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px",
          background: "#0B0B0B",
          color: "#FFFFFF",
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
        <div
          style={{
            marginTop: 12,
            fontSize: 28,
            opacity: 0.9,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 22,
            opacity: 0.8,
          }}
        >
          {domain}
        </div>
      </div>
    ),
    { ...size },
  );
}
