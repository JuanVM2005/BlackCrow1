// src/features/gallery/content/gallery.mapper.ts
import { z } from 'zod';
import type { GalleryItem } from '@/features/gallery/ui';
import { galleryItemSchema } from '@/content/schemas/gallery.schema';

/**
 * Data shape accepted for the gallery section when content viene embebido.
 * (En Home usamos `{ "kind": "gallery" }`, pero si llega `data`, validamos aquí.)
 */
const galleryDataSchema = z
  .object({
    items: z.array(galleryItemSchema).min(1, 'At least one image is required'),
  })
  .strict();

export type GalleryProps = {
  items: GalleryItem[];
};

/**
 * mapGalleryData
 * - Valida y normaliza el payload de la sección `gallery`.
 * - Deduplica por `src` y asegura `alt` no vacío.
 */
export function mapGalleryData(data: unknown): GalleryProps {
  const parsed = galleryDataSchema.safeParse(data);

  if (!parsed.success) {
    // Si no hay data embebida o es inválida, devolvemos lista vacía
    return { items: [] };
  }

  // Deduplicar por `src` manteniendo el orden
  const seen = new Set<string>();
  const items: GalleryItem[] = [];

  for (const it of parsed.data.items) {
    if (!seen.has(it.src)) {
      seen.add(it.src);
      items.push({
        src: it.src,
        alt: it.alt || 'Image', // alt ya es requerido por schema; fallback defensivo
        width: it.width,
        height: it.height,
      });
    }
  }

  return { items };
}

/**
 * resolveGalleryProps
 * - Azúcar: recibe una sección posiblemente con `{ data?: unknown }`.
 * - Útil si el compositor te pasa el objeto de sección completo.
 */
export function resolveGalleryProps(section?: { data?: unknown }): GalleryProps {
  return mapGalleryData(section?.data);
}

export default mapGalleryData;

/*
Dependencias:
- Requiere `galleryItemSchema` desde `@/content/schemas/gallery.schema`.
- Exporta tipos compatibles con `@/features/gallery/ui` (GalleryItem/GalleryProps).
*/
