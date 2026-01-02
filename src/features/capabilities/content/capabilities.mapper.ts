// src/features/capabilities/content/capabilities.mapper.ts
import {
  CAPABILITIES_KIND,
  CapabilitiesSectionSchema,
  type CapabilitiesSection,
} from "@/content/schemas/capabilities.schema";

/**
 * Props esperados por el componente UI de Capabilities.
 * - La numeración 01/02/... se calcula en UI con el índice.
 * - `image` es opcional para mantener compatibilidad con contenido viejo.
 */
export type CapabilitiesProps = {
  header: {
    headline: string;
    aside: string;
  };
  items: Array<{
    title: string;
    description: string;
    image?: {
      src: string;
      alt?: string;
    };
  }>;
};

/**
 * Valida el contenido contra el schema y lo adapta a props de UI.
 */
export function mapCapabilitiesSection(input: unknown): CapabilitiesProps {
  const section: CapabilitiesSection = CapabilitiesSectionSchema.parse(input);

  // Validación "lógica" del kind sin forzar literal en Zod
  if (section.kind !== CAPABILITIES_KIND) {
    throw new Error(
      `Invalid section kind: expected "${CAPABILITIES_KIND}", got "${section.kind}"`,
    );
  }

  return {
    header: {
      headline: section.header.headline,
      aside: section.header.aside,
    },
    items: section.items.map((it) => ({
      title: it.title,
      description: it.description,
      image: it.image
        ? {
            src: it.image.src,
            alt: it.image.alt,
          }
        : undefined,
    })),
  };
}
