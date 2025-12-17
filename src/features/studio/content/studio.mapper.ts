// src/features/studio/content/studio.mapper.ts
import type { StudioIntro } from "@/content/schemas/studioIntro.schema";

export type StudioIntroProps = {
  kicker?: string;
  title: string;
  body: string;
  cta: {
    label: string;
    href: string;
    /** true si el href es absoluto http(s) */
    isExternal: boolean;
  };
};

/** Type guard para secciones de tipo "studioIntro". */
export function isStudioIntro(section: unknown): section is StudioIntro {
  return (
    !!section &&
    typeof section === "object" &&
    (section as any).kind === "studioIntro" &&
    typeof (section as any).data === "object"
  );
}

function isExternalHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

/** Mapea el bloque de contenido a props de UI, sin estilos. */
export function mapStudioIntro(section: StudioIntro): StudioIntroProps {
  const { data } = section;

  const label = (data.cta?.label ?? "").trim();
  const href = (data.cta?.href ?? "").trim();

  return {
    kicker: data.kicker?.trim() || undefined,
    title: data.title.trim(),
    body: data.body.trim(),
    cta: {
      label,
      href,
      isExternal: isExternalHref(href),
    },
  };
}
