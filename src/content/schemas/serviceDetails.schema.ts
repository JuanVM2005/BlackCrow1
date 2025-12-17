// src/content/schemas/serviceDetails.schema.ts
import { z } from "zod";

/**
 * Schema ESTRICTO para los “detalles” de un servicio.
 * - Sin claves extra (object.strict()).
 * - Strings recortados (trim) y no vacíos.
 * - Al menos 1 sección y cada sección con al menos 1 ítem.
 */

const nonEmptyTrimmed = z
  .string()
  .transform((s) => s.trim())
  .refine((s) => s.length > 0, { message: "String must not be empty" });

export const serviceDetailsSectionSchema = z
  .object({
    /** Título opcional de la sección */
    title: nonEmptyTrimmed.optional(),
    /** Lista de bullets (obligatoria, mínimo 1) */
    items: z.array(nonEmptyTrimmed).min(1, { message: "At least 1 item is required" }),
  })
  .strict();

export const serviceDetailsSchema = z
  .object({
    /** Título general opcional */
    title: nonEmptyTrimmed.optional(),
    /** Intro/descripcion opcional */
    intro: nonEmptyTrimmed.optional(),
    /** Secciones (obligatorio, mínimo 1) */
    sections: z.array(serviceDetailsSectionSchema).min(1, { message: "At least 1 section is required" }),
    /** Notas al pie opcionales */
    footnotes: z.array(nonEmptyTrimmed).optional(),
  })
  .strict();

export type ServiceDetailsSectionJSON = z.infer<typeof serviceDetailsSectionSchema>;
export type ServiceDetailsJSON = z.infer<typeof serviceDetailsSchema>;

/** Helper de parseo tipado (lanza si no cumple el schema) */
export function parseServiceDetails(raw: unknown): ServiceDetailsJSON {
  return serviceDetailsSchema.parse(raw);
}

export default serviceDetailsSchema;
