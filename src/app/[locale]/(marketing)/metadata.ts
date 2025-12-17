// src/app/[locale]/(marketing)/metadata.ts
import type { Metadata } from "next";
import esHome from "@/content/locales/es/pages/home.json";
import enHome from "@/content/locales/en/pages/home.json";
import { normalizeLocale } from "@/i18n/locales";

type Locale = "es" | "en";

type ContentPage = {
  kind: "page";
  sections: Array<{ kind: string; data?: unknown }>;
  meta?: { title?: string; description?: string; ogImage?: string };
};

function getHomeByLocale(locale: Locale): ContentPage {
  return (locale === "en" ? enHome : esHome) as unknown as ContentPage;
}

// Next 16: params es Promise
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale) as Locale;

  const page = getHomeByLocale(locale);
  const meta = page.meta ?? {};

  const fallbackTitle =
    locale === "en"
      ? "Black Crow — Creative & Tech Agency"
      : "Black Crow — Agencia Creativa & Tech";

  const fallbackDescription =
    locale === "en"
      ? "High-impact UX/UI design, branding, and web development."
      : "Diseño UX/UI, branding y desarrollo web de alto impacto.";

  const title = meta.title ?? fallbackTitle;
  const description = meta.description ?? fallbackDescription;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale,
      images: meta.ogImage ? [{ url: meta.ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: meta.ogImage ? [meta.ogImage] : undefined,
    },
    alternates: {
      languages: {
        en: "/en",
        es: "/es",
      },
    },
  };
}
