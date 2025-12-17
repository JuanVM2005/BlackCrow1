// src/content/schemas/interactive-3d.schema.ts
import { z } from "zod";

/**
 * Schema estricto para la sección “Interactive 3D”.
 * - Strings recortados y no vacíos.
 * - No se permiten claves extra.
 */
const nonEmptyTrimmed = z
  .string()
  .transform((s) => s.trim())
  .refine((s) => s.length > 0, { message: "String must not be empty" });

export const interactive3DSchema = z
  .object({
    /** Etiqueta superior (eyebrow) */
    eyebrow: nonEmptyTrimmed,
    /** Titular principal */
    headline: nonEmptyTrimmed,
  })
  .strict();

export type Interactive3DContent = z.infer<typeof interactive3DSchema>;

/** Helper opcional para validar/parsear el JSON de contenido */
export function parseInteractive3D(data: unknown): Interactive3DContent {
  return interactive3DSchema.parse(data);
}
