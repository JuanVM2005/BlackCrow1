// src/features/landing/content/landing.composition.ts
import {
  mapHeroContent,
  isHeroSection,
  type HeroProps,
} from "@/features/hero/content/hero.mapper";
import {
  mapStudioIntro,
  isStudioIntro,
  type StudioIntroProps,
} from "@/features/studio/content/studio.mapper";
import {
  mapCapabilitiesSection,
  type CapabilitiesProps,
} from "@/features/capabilities/content/capabilities.mapper";
import { mapBigStatement } from "@/features/big-statement/content/big-statement.mapper";
import type { BigStatementProps } from "@/features/big-statement/ui";

// value-grid
import {
  mapValueGrid,
  isValueGridSection,
  type ValueGridProps,
} from "@/features/value-grid/content/value-grid.mapper";

// stack-grid
import {
  mapStackGrid,
  isStackGrid as isStackGridSection,
  type StackGridProps,
} from "@/features/stack-grid/content/stack-grid.mapper";

// message-bar
import {
  mapMessageBar,
  isMessageBar as isMessageBarSection,
  type MessageBarProps,
} from "@/features/message-bar/content/message-bar.mapper";

// pricing
import {
  mapPricingSection,
  isPricingSection,
  type PricingProps,
} from "@/features/pricing/content/pricing.mapper";

// cta-minimal
import {
  mapCtaMinimal,
  isCtaMinimal,
} from "@/features/cta-minimal/content/cta-minimal.mapper";
import type { CtaMinimalProps } from "@/features/cta-minimal/ui";

// faq
import {
  mapFaq,
  isFaqSection,
  type FaqProps,
} from "@/features/faq/content/faq.mapper";

// ✅ interactive-3d
import {
  mapInteractive3D,
  type Interactive3DUiProps,
} from "@/features/interactive-3d/content/interactive-3d.mapper";

// ✅ wordmark-offset (decorativo)
import {
  mapWordmarkOffset,
  type WordmarkOffsetProps,
} from "@/features/wordmark-offset/content/wordmark-offset.mapper";

// Fallbacks por locale
import esCapabilities from "@/content/locales/es/sections/capabilities.json";
import enCapabilities from "@/content/locales/en/sections/capabilities.json";
import esBigStatement from "@/content/locales/es/sections/bigStatement.json";
import enBigStatement from "@/content/locales/en/sections/bigStatement.json";
// fallbacks value-grid
import esValueGrid from "@/content/locales/es/sections/value-grid.json";
import enValueGrid from "@/content/locales/en/sections/value-grid.json";
// fallbacks stack-grid
import esStackGrid from "@/content/locales/es/sections/stack-grid.json";
import enStackGrid from "@/content/locales/en/sections/stack-grid.json";
// fallbacks message-bar
import esMessageBar from "@/content/locales/es/sections/messageBar.json";
import enMessageBar from "@/content/locales/en/sections/messageBar.json";
// fallbacks pricing
import esPricing from "@/content/locales/es/sections/pricing.json";
import enPricing from "@/content/locales/en/sections/pricing.json";
// fallbacks cta-minimal
import esCtaMinimal from "@/content/locales/es/sections/cta-minimal.json";
import enCtaMinimal from "@/content/locales/en/sections/cta-minimal.json";
// fallbacks faq
import esFaq from "@/content/locales/es/sections/faq.json";
import enFaq from "@/content/locales/en/sections/faq.json";
// ✅ fallbacks interactive-3d
import esInteractive3D from "@/content/locales/es/sections/interactive-3d.json";
import enInteractive3D from "@/content/locales/en/sections/interactive-3d.json";
// ✅ fallbacks wordmark-offset
import esWordmarkOffset from "@/content/locales/es/sections/wordmarkOffset.json";
import enWordmarkOffset from "@/content/locales/en/sections/wordmarkOffset.json";

/** Sección mínima de contenido (como viene del JSON) */
export type ContentSection = { kind: string; data?: unknown };

/** Página mínima de contenido (como vienen los home.json) */
export type ContentPage = {
  kind: "page";
  sections: ContentSection[];
  meta?: { title?: string; description?: string; ogImage?: string };
};

/**
 * Tipo de bloque de la landing. Extiende con cada sección soportada.
 */
export type LandingBlock =
  | { kind: "hero"; props: HeroProps }
  | { kind: "studioIntro"; props: StudioIntroProps }
  | { kind: "capabilities"; props: CapabilitiesProps }
  | { kind: "wordmarkOffset"; props: WordmarkOffsetProps } // ✅ sección decorativa
  | { kind: "bigStatement"; props: BigStatementProps }
  | { kind: "value-grid"; props: ValueGridProps }
  | { kind: "stack-grid"; props: StackGridProps }
  | { kind: "message-bar"; props: MessageBarProps }
  | { kind: "pricing"; props: PricingProps }
  | { kind: "cta-minimal"; props: CtaMinimalProps }
  | { kind: "faq"; props: FaqProps }
  | { kind: "interactive-3d"; props: Interactive3DUiProps } // ✅ sección
  | { kind: "generic"; kindName: string; data: unknown };

/** Type guard para páginas de contenido */
function isContentPage(input: unknown): input is ContentPage {
  if (!input || typeof input !== "object") return false;
  const p = input as Partial<ContentPage>;
  return p.kind === "page" && Array.isArray(p.sections);
}

/** Type guard básico para sección de capacidades */
function isCapabilitiesSection(input: unknown): input is { kind: "capabilities"; data?: unknown } {
  return !!input && typeof input === "object" && (input as any).kind === "capabilities";
}

/** Type guard básico para sección big-statement */
function isBigStatementSection(input: unknown): input is { kind: "bigStatement"; data?: unknown } {
  return !!input && typeof input === "object" && (input as any).kind === "bigStatement";
}

/** ✅ Type guard básico para sección interactive-3d */
function isInteractive3DSection(
  input: unknown,
): input is { kind: "interactive-3d"; data?: unknown } {
  return !!input && typeof input === "object" && (input as any).kind === "interactive-3d";
}

/** ✅ Type guard básico para sección wordmarkOffset */
function isWordmarkOffsetSection(
  input: unknown,
): input is { kind: "wordmarkOffset"; data?: unknown } {
  return !!input && typeof input === "object" && (input as any).kind === "wordmarkOffset";
}

/**
 * Recibe el objeto "page" (contenido ya cargado) y devuelve un arreglo
 * de bloques de la landing listos para que la capa de UI los renderice.
 * Ahora recibe `locale` para poder aplicar fallbacks.
 */
export function composeLandingFromPage(page: unknown, locale: "es" | "en"): LandingBlock[] {
  if (!isContentPage(page)) return [];
  return composeLandingFromSections(page.sections, locale);
}

/**
 * Recibe un array de secciones crudas y lo mapea a bloques de landing.
 * Mantiene el orden en el que vienen y hace fallback de contenido por locale.
 */
export function composeLandingFromSections(
  sections: unknown,
  locale: "es" | "en",
): LandingBlock[] {
  if (!Array.isArray(sections)) return [];

  const blocks: LandingBlock[] = [];

  for (const section of sections) {
    // HERO
    if (isHeroSection(section)) {
      blocks.push({
        kind: "hero",
        props: mapHeroContent((section as any).data),
      });
      continue;
    }

    // STUDIO INTRO
    if (isStudioIntro(section)) {
      blocks.push({
        kind: "studioIntro",
        props: mapStudioIntro(section),
      });
      continue;
    }

    // ✅ WORDMARK-OFFSET (decorativo, usa solo fallback por locale)
    if (isWordmarkOffsetSection(section)) {
      const raw =
        (section as any).data ?? (locale === "en" ? (enWordmarkOffset as any) : (esWordmarkOffset as any));

      const props = mapWordmarkOffset(raw);
      blocks.push({ kind: "wordmarkOffset", props });
      continue;
    }

    // CAPABILITIES
    if (isCapabilitiesSection(section)) {
      const raw =
        (section as any).data && (section as any).data.kind === "capabilities"
          ? (section as any).data
          : locale === "en"
            ? (enCapabilities as any)
            : (esCapabilities as any);

      const props = mapCapabilitiesSection(raw);
      blocks.push({ kind: "capabilities", props });
      continue;
    }

    // BIG STATEMENT
    if (isBigStatementSection(section)) {
      const raw =
        (section as any).data && (section as any).data.kind === "bigStatement"
          ? (section as any).data
          : locale === "en"
            ? (enBigStatement as any)
            : (esBigStatement as any);

      const props = mapBigStatement(raw);
      blocks.push({ kind: "bigStatement", props });
      continue;
    }

    // VALUE-GRID
    if (isValueGridSection(section)) {
      const raw =
        (section as any).data
          ? (section as any).data
          : locale === "en"
            ? (enValueGrid as any)
            : (esValueGrid as any);

      const props = mapValueGrid(raw);
      blocks.push({ kind: "value-grid", props });
      continue;
    }

    // STACK-GRID
    if (isStackGridSection(section)) {
      const raw =
        (section as any).data ?? (locale === "en" ? (enStackGrid as any) : (esStackGrid as any));
      const props = mapStackGrid(raw);
      blocks.push({ kind: "stack-grid", props });
      continue;
    }

    // MESSAGE-BAR
    if (isMessageBarSection(section)) {
      const raw =
        (section as any).data ?? (locale === "en" ? (enMessageBar as any) : (esMessageBar as any));
      const props = mapMessageBar(raw);
      blocks.push({ kind: "message-bar", props });
      continue;
    }

    // PRICING
    if (isPricingSection(section)) {
      const raw =
        (section as any).data ?? (locale === "en" ? (enPricing as any) : (esPricing as any));
      const props = mapPricingSection(raw);
      blocks.push({ kind: "pricing", props });
      continue;
    }

    // CTA-MINIMAL
    if (isCtaMinimal(section)) {
      const props = mapCtaMinimal(
        section as any,
        (locale === "en"
          ? (enCtaMinimal as any).data
          : (esCtaMinimal as any).data) as any,
      );
      blocks.push({ kind: "cta-minimal", props });
      continue;
    }

    // FAQ
    if (isFaqSection(section)) {
      const raw = (section as any).data ?? (locale === "en" ? (enFaq as any) : (esFaq as any));
      const props = mapFaq(raw);
      blocks.push({ kind: "faq", props });
      continue;
    }

    // ✅ INTERACTIVE-3D
    if (isInteractive3DSection(section)) {
      const raw =
        (section as any).data ??
        (locale === "en" ? (enInteractive3D as any) : (esInteractive3D as any));

      // Nota: mapInteractive3D requiere `shader` no vacío.
      // Usamos un placeholder porque el shader real vive por defecto en ShaderCanvas.
      const props = mapInteractive3D(raw, {
        shader: "/* shader-unused: default handled inside ShaderCanvas */",
      });

      blocks.push({ kind: "interactive-3d", props });
      continue;
    }

    // Genérico
    const kindName =
      section && typeof section === "object" && "kind" in (section as any)
        ? String((section as any).kind)
        : "unknown";

    const data =
      section && typeof section === "object" && "data" in (section as any)
        ? (section as any).data
        : undefined;

    blocks.push({ kind: "generic", kindName, data });
  }

  return blocks;
}
