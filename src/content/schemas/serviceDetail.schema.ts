// src/content/schemas/serviceDetail.schema.ts
import { z } from "zod";
import { serviceKeyEnum } from "./servicesIndex.schema";

/**
 * Esquema MINIMAL para páginas de servicio (info + formulario):
 * - Header (title/subtitle/badge opcional)
 * - priceRange (píldora de precio aproximado, string libre)
 * - featuresLeft / featuresRight (listas en 2 columnas)
 * - tags (chips)
 * - overview.cta (link con label requerido; href/external opcionales)
 * - SEO opcional
 * Sin FAQ ni pricing/tiers.
 *
 * Nota: definimos el CTA inline (no reutilizamos linkSchema) para
 * evitar desajustes de claves durante la migración.
 */

// CTA minimal: label requerido; href/external opcionales
const ctaLinkSchema = z
  .object({
    label: z.string().min(1),
    // No forzamos URL; basta string opcional para permitir anchors (#id) o paths relativos
    href: z.string().min(1).optional(),
    external: z.boolean().optional(),
  })
  .strict();

export const headerSchema = z
  .object({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    badge: z.string().optional(), // insignia pequeña sobre el H1
  })
  .strict();

// Solo mantenemos CTA superior (sin description/bullets)
export const overviewSchema = z
  .object({
    cta: ctaLinkSchema.optional(),
  })
  .strict()
  .optional();

export const detailSeoSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
  })
  .strict()
  .optional();

export const serviceDetailSchema = z
  .object({
    kind: z.literal("service").optional(),
    key: serviceKeyEnum.optional(),

    header: headerSchema,

    // 🔹 Campos usados por el template minimal
    priceRange: z.string().min(1).optional(),
    featuresLeft: z.array(z.string().min(1)).optional(),
    featuresRight: z.array(z.string().min(1)).optional(),
    tags: z.array(z.string().min(1)).optional(),

    overview: overviewSchema, // CTA superior opcional
    seo: detailSeoSchema,
  })
  .strict();

export type ServiceDetailJSON = z.infer<typeof serviceDetailSchema>;

/** Helper para validar en runtime */
export function parseServiceDetail(input: unknown): ServiceDetailJSON {
  return serviceDetailSchema.parse(input);
}
