// src/content/schemas/servicesIndex.schema.ts
import { z } from "zod";

/**
 * Índice de Servicios (/servicios | /services)
 * Minimal y estricto: sin estilos, todo texto desde JSON.
 * href permite URL absolutas, relativas, anclas, mailto y tel.
 */

/* =========================
   Helpers
   ========================= */
const nonEmptyTrimmed = z
  .string()
  .transform((s) => s.trim())
  .refine((s) => s.length > 0, { message: "Campo requerido" });

/* https://..., //cdn..., /ruta, ./ruta, ../ruta, #ancla, mailto:, tel: */
export const hrefSchema = z
  .string()
  .transform((s) => s.trim())
  .refine(
    (v) =>
      /^(https?:)?\/\/[^\s]+$/.test(v) || // absoluta (con o sin protocolo)
      /^(\.\/|\.\.\/|\/)[^\s]*$/.test(v) || // relativa
      /^#[A-Za-z][\w\-:.]*$/.test(v) || // ancla
      /^(mailto|tel):[^\s]+$/.test(v), // esquemas útiles para CTA
    { message: "href inválido (usa URL, ruta relativa, #ancla, mailto: o tel:)" }
  );

/* =========================
   Tipos base
   ========================= */
export const serviceKeyEnum = z.enum(["landing", "website", "ecommerce", "custom"]);
export type ServiceKey = z.infer<typeof serviceKeyEnum>;

export const linkSchema = z
  .object({
    label: nonEmptyTrimmed,
    href: hrefSchema.optional(),
    external: z.boolean().optional(),
  })
  .strict();
export type Link = z.infer<typeof linkSchema>;

export const servicesIndexItemSchema = z
  .object({
    key: serviceKeyEnum,
    title: nonEmptyTrimmed,
    summary: z.string().transform((s) => s.trim()).optional(),
    // CTA opcional (label requerido si existe)
    cta: linkSchema.optional(),
  })
  .strict();
export type ServicesIndexItem = z.infer<typeof servicesIndexItemSchema>;

export const servicesIndexSeoSchema = z
  .object({
    title: nonEmptyTrimmed.optional(),
    description: nonEmptyTrimmed.optional(),
  })
  .strict()
  .optional();

export const servicesIndexSchema = z
  .object({
    header: z
      .object({
        title: nonEmptyTrimmed,
        subtitle: z.string().transform((s) => s.trim()).optional(),
      })
      .strict()
      .optional(),
    items: z.array(servicesIndexItemSchema).default([]),
    seo: servicesIndexSeoSchema,
  })
  .strict()
  // Claves únicas por item.key
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    data.items.forEach((it, idx) => {
      if (seen.has(it.key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", idx, "key"],
          message: `Clave duplicada: "${it.key}"`,
        });
      } else {
        seen.add(it.key);
      }
    });
  });

export type ServicesIndexJSON = z.infer<typeof servicesIndexSchema>;

/** Helper para validar en runtime */
export function parseServicesIndex(input: unknown): ServicesIndexJSON {
  return servicesIndexSchema.parse(input);
}
