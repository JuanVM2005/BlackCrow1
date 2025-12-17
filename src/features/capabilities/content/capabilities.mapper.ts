// src/features/capabilities/content/capabilities.mapper.ts
import {
    CapabilitiesSectionSchema,
    type CapabilitiesSection,
  } from "@/content/schemas/capabilities.schema";
  
  /**
   * Props esperados por el componente UI de Capabilities.
   * (La numeración 01/02/... se puede calcular en el UI con el índice del array.)
   */
  export type CapabilitiesProps = {
    header: {
      headline: string;
      aside: string;
    };
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  
  /**
   * Valida el contenido contra el schema y lo adapta a props de UI.
   */
  export function mapCapabilitiesSection(input: unknown): CapabilitiesProps {
    const section: CapabilitiesSection = CapabilitiesSectionSchema.parse(input);
  
    return {
      header: {
        headline: section.header.headline,
        aside: section.header.aside,
      },
      items: section.items.map((it) => ({
        title: it.title,
        description: it.description,
      })),
    };
  }
  