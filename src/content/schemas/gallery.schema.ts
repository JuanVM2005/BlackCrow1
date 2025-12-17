// src/content/schemas/gallery.schema.ts
import { z } from 'zod';

/**
 * Galería sin textos (solo imágenes) — compatible con Zod v4
 * Evitamos llamadas con argumentos (p.ej. z.array(schema), z.literal('x'))
 */
export const galleryItemSchema = z
  .object({
    src: z.string(),
    alt: z.string(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
  })
  .strict();

export const gallerySchema = z
  .object({
    // No usamos z.literal('gallery') para evitar firma con argumentos
    kind: z.string(),
    // Usamos método de instancia .array() (0 argumentos) en vez de z.array(schema)
    items: galleryItemSchema.array(),
  })
  .strict();

export type GalleryItem = z.infer<typeof galleryItemSchema>;
export type GallerySection = z.infer<typeof gallerySchema>;
