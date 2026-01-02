// src/app/opengraph-image.tsx
import { ImageResponse } from "next/og";

// Next necesita leer estos exports directamente aquí
// ✅ Cambiado a Node.js para evitar el límite 1MB de Edge Functions
export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Locale = "es" | "en";

/**
 * ✅ Mantener bundle chico:
 * - Sin imports internos (i18n/locales, home.json, ogTheme).
 * - Copy mínimo inline.
 * - Theme inline.
 */

function normalizeLocale(raw?: string): Locale {
  const v = (raw ?? "").toLowerCase();
  if (v.startsWith("en")) return "en";
  return "es";
}

// Snapshot mínimo de theme (la imagen no lee globals.css)
const THEME = {
  surface: "#FCFCFC",
  text: "#0B0F10",
  textMuted: "#6A6F78",
  brand: "#FF2D8A",
  brandMuted: "#FFE0EF",
  border: "#EAEAEA",
} as const;

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

// Copy mínimo para OG
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

export default async function OpengraphImage({
  params,
}: {
  params?: Promise<{ locale?: string }>;
}) {
  const resolvedParams = params ? await params : {};
  const locale = normalizeLocale(resolvedParams?.locale);

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
        {/* Gradientes decorativos */}
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
                0.1,
              )}, transparent),
              radial-gradient(700px 300px at 0% 50%, ${rgba(
                THEME.brandMuted,
                0.35,
              )}, transparent)
            `,
          }}
        />

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

          <div
            style={{
              fontSize: 96,
              lineHeight: 1.02,
              fontWeight: 900,
            }}
          >
            {headline}
          </div>

          <div
            style={{
              fontSize: 28,
              marginTop: 8,
              color: THEME.textMuted,
            }}
          >
            {tagline}
          </div>

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
