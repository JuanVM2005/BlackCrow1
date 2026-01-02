// src/app/[locale]/(marketing)/servicios/(seo)/opengraph-image.tsx
import { ImageResponse } from "next/og";

// Ejecutar en Edge para generar más rápido
export const runtime = "edge";

// Revalidación: regenerar cada hora
export const revalidate = 3600;

// Medidas OG estándar
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Locale = "es" | "en";
type Params = Promise<{ locale: string }>;

/**
 * ✅ Inline helpers para mantener el bundle de Edge < 1MB
 * (evita imports internos que arrastran dependencias grandes).
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

export default async function OgImage({ params }: { params: Params }) {
  const { locale: rawLocale } = await params;
  const l = normalizeLocale(rawLocale);

  const siteName = getSiteName();
  const domain = getDomain();

  const title = l === "es" ? `Servicios — ${siteName}` : `Services — ${siteName}`;

  const subtitle =
    l === "es"
      ? "Landing · Website · E-Commerce · Personalizado"
      : "Landing · Website · E-Commerce · Custom";

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
