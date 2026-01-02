// src/app/[locale]/(marketing)/opengraph-image.tsx
import { ImageResponse } from "next/og";

// Ejecutar en Edge para menor TTFB
export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Locale = "es" | "en";

/**
 * ✅ Mantener bundle Edge < 1MB:
 * - Sin imports internos (home.json / i18n helpers).
 * - Copy mínimo inline para OG.
 */

/**
 * Snapshot mínimo de tokens para OG (la imagen no lee tu globals.css).
 * Proyecto mono-tema: LIGHT.
 */
const THEME = {
  surface: "#FCFCFC",
  text: "#0B0F10",
  textMuted: "#6A6F78",
  brand: "#FF2D8A",
  brandMuted: "#FFE0EF",
  border: "#EAEAEA",
} as const;

function normalizeLocale(raw?: string): Locale {
  const v = (raw ?? "").toLowerCase();
  if (v.startsWith("en")) return "en";
  return "es";
}

// Utilidad simple para RGBA desde hex
function rgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(
    clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean,
    16,
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Copy mínimo (solo lo necesario para OG) */
const OG_COPY: Record<
  Locale,
  { kicker: string; headline: string; tagline: string }
> = {
  es: {
    kicker: "AGENCIA CREATIVA & TECH",
    headline: "Límites",
    tagline: "UX/UI – Branding – Desarrollo Web",
  },
  en: {
    kicker: "CREATIVE & TECH AGENCY",
    headline: "Limits",
    tagline: "UX/UI – Branding – Web Development",
  },
};

export default async function Image({
  params,
}: {
  // Next 16: params puede ser Promise; lo tratamos así para ser compatibles
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);

  const { kicker, headline, tagline } = OG_COPY[locale];

  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          display: "flex",
          position: "relative",
          background: THEME.surface,
          color: THEME.text,
        }}
      >
        {/* Decoración con gradientes suaves (alineadas a tu brand) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(800px 400px at 100% 0%, ${rgba(
                THEME.brand,
                0.12,
              )}, transparent),
              radial-gradient(800px 400px at 100% 100%, ${rgba(
                THEME.brand,
                0.10,
              )}, transparent),
              radial-gradient(700px 300px at 0% 50%, ${rgba(
                THEME.brandMuted,
                0.35,
              )}, transparent)
            `,
          }}
        />

        {/* Contenido */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 80px",
            gap: 24,
            position: "relative",
          }}
        >
          {/* Kicker */}
          <div
            style={{
              letterSpacing: 6,
              fontSize: 20,
              textTransform: "uppercase",
              color: THEME.textMuted,
            }}
          >
            {kicker}
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 96,
              lineHeight: 1.02,
              fontWeight: 900,
              whiteSpace: "pre-wrap",
            }}
          >
            {headline}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 28,
              marginTop: 8,
              color: THEME.textMuted,
            }}
          >
            {tagline}
          </div>

          {/* Marca simple */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 32,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${rgba(
                  THEME.brand,
                  0.22,
                )}, ${rgba(THEME.brand, 0.08)})`,
                boxShadow: `0 8px 16px -4px ${rgba(THEME.brand, 0.25)}`,
                border: `1px solid ${THEME.border}`,
              }}
            />
            <span style={{ fontSize: 28, fontWeight: 700 }}>Black Crow</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
