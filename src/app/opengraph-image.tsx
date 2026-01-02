// src/app/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { normalizeLocale } from "@/i18n/locales";
import esHome from "@/content/locales/es/pages/home.json";
import enHome from "@/content/locales/en/pages/home.json";
import { OG_THEME, rgba } from "@/core/seo/ogTheme";

// Next necesita leer estos exports directamente aquí
export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Locale = "es" | "en";

type ContentPage = {
  sections: Array<{ kind: string; data: any }>;
};

function getHomeByLocale(locale: Locale): ContentPage {
  return (locale === "en" ? enHome : esHome) as ContentPage;
}

export default async function OpengraphImage({
  params,
}: {
  params?: Promise<{ locale?: string }>;
}) {
  const resolvedParams = params ? await params : {};
  const locale = normalizeLocale(resolvedParams?.locale) as Locale;

  const page = getHomeByLocale(locale);

  const hero = page.sections.find((s) => s.kind === "hero")?.data as
    | {
        kicker?: string;
        headline?: string;
        tagline?: string;
      }
    | undefined;

  const kicker =
    (hero?.kicker ??
      (locale === "en"
        ? "CREATIVE & TECH AGENCY"
        : "AGENCIA CREATIVA & TECH"))?.toUpperCase() ?? "";

  const headline = hero?.headline ?? (locale === "en" ? "Limits" : "Límites");

  const tagline =
    hero?.tagline ??
    (locale === "en"
      ? "UX/UI – Branding – Web Development"
      : "UX/UI – Branding – Desarrollo Web");

  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          display: "flex",
          position: "relative",
          background: OG_THEME.surface,
          color: OG_THEME.text,
        }}
      >
        {/* Gradientes decorativos */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(800px 400px at 100% 0%, ${rgba(
                OG_THEME.brand,
                0.12,
              )}, transparent),
              radial-gradient(800px 400px at 100% 100%, ${rgba(
                OG_THEME.brand,
                0.1,
              )}, transparent),
              radial-gradient(700px 300px at 0% 50%, ${rgba(
                OG_THEME.brandMuted,
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
              color: OG_THEME.textMuted,
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
              color: OG_THEME.textMuted,
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
                  OG_THEME.brand,
                  0.22,
                )}, ${rgba(OG_THEME.brand, 0.08)})`,
                boxShadow: `0 8px 16px -4px ${rgba(
                  OG_THEME.brand,
                  0.25,
                )}`,
                border: `1px solid ${OG_THEME.border}`,
              }}
            />
            <span style={{ fontSize: 28, fontWeight: 700 }}>
              Black Crow
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
