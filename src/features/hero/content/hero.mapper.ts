// src/features/hero/content/hero.mapper.ts
import { heroDataSchema, type HeroSectionData } from "@/content/schemas/hero.schema";

/** Tipos de media soportados por la UI del Hero */
export type HeroMediaType = "image" | "model";

/** Props finales que consumirá la UI del Hero (SIN temas; proyecto mono-tema) */
export interface HeroProps {
  kicker: string;
  headline: string; // puede incluir \n
  tagline: string;
  media: {
    type: HeroMediaType;
    src: string;
    alt: string;
    poster?: string;     // recomendado para "model"
    priority?: boolean;  // para imagen (LCP)
  };
  /** Alineación visual del bloque de copy */
  align: "start" | "center";
}

/** Fallbacks seguros (textos) — sin `as const` para no fijar literales */
const TEXT_FALLBACKS = {
  kicker: "AGENCIA CREATIVA & TECH",
  headline: "Límites",
  tagline: "UX/UI – Branding – Desarrollo Web",
};

/** Defaults para robustez de UI (mono-tema) */
const DEFAULTS = {
  poster: "/images/landing/hero-desktop.webp",
  alt: "Hero visual",
  align: "start" as const,
};

const PUBLIC_PATH_RE = /^\/(?!\/)[^\s]*$/;

function isPublicPath(v?: string): v is string {
  return !!v && PUBLIC_PATH_RE.test(v);
}

function sanitizeText(input: unknown, fallback: string, min = 1, max = 200): string {
  if (typeof input !== "string") return fallback;
  const trimmed = input.trim();
  if (trimmed.length < min) return fallback;
  if (trimmed.length > max) return trimmed.slice(0, max);
  return trimmed;
}

/** Guarda de tipo útil cuando recorremos secciones heterogéneas. */
export function isHeroSection(section: unknown): section is { kind: "hero"; data: HeroSectionData } {
  return !!section && typeof section === "object" && (section as any).kind === "hero" && "data" in (section as any);
}

/**
 * Mapea el contenido crudo (JSON) validándolo con Zod v4
 * y aplicando defaults para garantizar una UI estable.
 * Compatibilidad:
 * - Si el contenido antiguo trae `theme.align`, lo respetamos.
 * - Si el contenido nuevo trae `align` al nivel raíz del data, también lo leemos.
 */
export function mapHeroContent(raw: unknown): HeroProps {
  const parsed = heroDataSchema.safeParse(raw);

  // Valores base (fallbacks) antes de validar
  let kicker = TEXT_FALLBACKS.kicker;
  let headline = TEXT_FALLBACKS.headline;
  let tagline = TEXT_FALLBACKS.tagline;
  let media: HeroProps["media"] = {
    type: "image",
    src: DEFAULTS.poster,
    alt: DEFAULTS.alt,
    priority: true,
  };
  let align: HeroProps["align"] = DEFAULTS.align;

  if (!parsed.success) {
    // Contenido inválido => devolvemos props seguras (fallbacks)
    return {
      kicker,
      headline,
      tagline,
      media,
      align,
    };
  }

  const data = parsed.data as any;

  // Textos
  kicker = sanitizeText(data.kicker, TEXT_FALLBACKS.kicker, 1, 60);
  headline = sanitizeText(data.headline, TEXT_FALLBACKS.headline, 1, 120);
  tagline = sanitizeText(data.tagline, TEXT_FALLBACKS.tagline, 1, 120);

  // Media
  const kind: HeroMediaType = data.media?.kind === "model" ? "model" : "image";
  const src = isPublicPath(data.media?.src) ? data.media.src : DEFAULTS.poster;
  const alt = sanitizeText(data.media?.alt, DEFAULTS.alt, 1, 140);
  const poster =
    kind === "model"
      ? (isPublicPath(data.media?.poster) ? data.media.poster : DEFAULTS.poster)
      : undefined;

  const priority = kind === "image" ? (data.media?.priority ?? true) : undefined;

  media = {
    type: kind,
    src,
    alt,
    poster,
    priority,
  };

  // Alineación (compatibilidad con contenido viejo y nuevo)
  // - Preferimos `data.align` si existe y es válido
  // - Si no, caemos a `data.theme?.align` (contenido antiguo)
  // - Fallback: DEFAULTS.align
  const alignFromRoot = data.align === "start" || data.align === "center" ? data.align : undefined;
  const alignFromTheme = data.theme?.align === "start" || data.theme?.align === "center" ? data.theme.align : undefined;
  align = alignFromRoot ?? alignFromTheme ?? DEFAULTS.align;

  return {
    kicker,
    headline,
    tagline,
    media,
    align,
  };
}
