// src/content/schemas/value-grid.schema.ts
import { z } from "zod";

/**
 * Schema v2 para el Value Grid
 * - Cada card: title (oblig.), body (oblig.), image? (opcional), widget? (opcional: CMS)
 * - Título principal del bloque en 1–3 líneas (string[]).
 */

/** Ruta pública: debe iniciar con "/" */
const publicPathRegex = /^\/(?!\/)[^\s]*$/;
const publicPath = z
  .string()
  .transform((v) => v.trim())
  .refine((v) => publicPathRegex.test(v), 'debe ser una ruta pública que empiece por "/"');

const nonEmpty = (min = 1, max = 200) =>
  z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length >= min, `debe tener al menos ${min} caracteres`)
    .refine((v) => v.length <= max, `debe tener como máximo ${max} caracteres`);

/** Imagen pública opcional por card */
export const ImageSchema = z
  .object({
    src: publicPath,
    alt: nonEmpty(3, 160),
  })
  .strict();

/**
 * Título del bloque (1+ líneas).
 * Acepta string con saltos de línea o string[], y normaliza a string[].
 * Limita a 3 líneas para evitar desbordes visuales.
 */
export const TitleLinesSchema = z.preprocess(
  (input) => {
    if (typeof input === "string") {
      return input
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (Array.isArray(input)) {
      return (input as unknown[])
        .map((s) => (typeof s === "string" ? s.trim() : s))
        .filter((s): s is string => typeof s === "string" && s.length > 0);
    }
    return input;
  },
  z.array(z.string().min(1).max(120)).min(1).max(3)
);

/** Widget opcional (CMS) para la card 2 del grid */
export const CmsWidgetSchema = z
  .object({
    kind: z.literal("cms"),
    title: nonEmpty(2, 24),
    items: z
      .array(
        z
          .object({
            label: nonEmpty(2, 40),
            icon: publicPath.optional(),
          })
          .strict()
      )
      .min(1)
      .max(4),
  })
  .strict();

/** Card v2: title/body obligatorios + image? + widget? */
export const ValueGridCardSchema = z
  .object({
    /** Título de la card (se usa como <h3> unificado en UI) */
    title: nonEmpty(3, 80).describe("Título visible de la tarjeta"),
    /**
     * Contenido de soporte.
     * Se recomienda respetar saltos de línea en UI (whitespace-pre-line).
     */
    body: nonEmpty(3, 400).describe("Texto descriptivo de la tarjeta"),
    /** Imagen opcional (por ejemplo, en cards 3 y 4) */
    image: ImageSchema.optional(),
    /** Widget opcional (solo usado actualmente en la card 2: CMS) */
    widget: CmsWidgetSchema.optional(),
  })
  .strict();

/** Bloque completo del Value Grid (exactamente 4 cards) */
export const ValueGridSchema = z
  .object({
    /** Título principal en 1–3 líneas */
    title: TitleLinesSchema,
    /** Cards en orden fijo (1..4) */
    cards: z.tuple([
      ValueGridCardSchema, // 1: De idea a realidad
      ValueGridCardSchema, // 2: Diseño UI/UX Intuitivo (puede traer widget CMS)
      ValueGridCardSchema, // 3: Responsivo
      ValueGridCardSchema, // 4: Optimización Total
    ]),
  })
  .strict();

export type ValueGridCard = z.infer<typeof ValueGridCardSchema>;
export type ValueGridContent = z.infer<typeof ValueGridSchema>;

/** Sección embebible dentro de pages (permite fallback por locale) */
export const ValueGridSectionSchema = z
  .object({
    kind: z.literal("value-grid"),
    data: ValueGridSchema.optional(),
  })
  .strict();

export type ValueGridSection = z.infer<typeof ValueGridSectionSchema>;
