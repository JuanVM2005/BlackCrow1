// src/content/schemas/hero.schema.ts
import { z } from "zod";

/**
 * Schema para el bloque Hero (Zod v4).
 * Mantiene compatibilidad con contenido antiguo vía `theme.align`.
 * Se eliminan por completo las `decorativeLines`.
 */

export const heroDataSchema = z.object({
  // Textos — el mapper sanitiza y aplica fallbacks
  kicker: z.string(),
  headline: z.string(),
  tagline: z.string(),

  // Media — el mapper valida kind y rutas públicas + poster/priority
  media: z.object({
    kind: z.string(),          // "image" | "model" (validado en el mapper)
    src: z.string(),           // el mapper valida que sea ruta pública
    alt: z.string(),
    priority: z.boolean().optional(),
    poster: z.string().optional(),
  }),

  // Alineación a nivel raíz (contenido nuevo)
  align: z.string().optional(), // "start" | "center" (normalizado por el mapper)

  // Compatibilidad con contenido antiguo: `theme.align`
  theme: z
    .object({
      align: z.string().optional(),
    })
    .optional(),
});

// Sección "hero" (sin z.literal para evitar TS2554 en toolchains estrictos)
export const heroSectionSchema = z.object({
  kind: z.string(),
  data: heroDataSchema,
});

// Tipos derivados (útiles en el mapper y en la UI)
export type HeroSectionData = z.infer<typeof heroDataSchema>;

export default heroDataSchema;
