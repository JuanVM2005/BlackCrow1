// src/content/schemas/pricing.schema.ts
import { z } from "zod";

/** =========================================================
 *  Tipos enriquecidos (inline) para textos del aside
 *  - Retrocompatible: también aceptamos string plano.
 * ========================================================= */
export const pricingRichInlineSchema = z.object({
  text: z.string().min(1),
  /** Marcar énfasis en negrita cuando sea true */
  strong: z.boolean().optional(),
});

export const pricingRichParagraphSchema = z.object({
  type: z.literal("p"),
  children: z.array(pricingRichInlineSchema).min(1),
});

/** price puede ser string o { amount, period } */
export const pricingPriceSchema = z.union([
  z.string().min(1),
  z.object({
    amount: z.string().min(1),
    period: z.string().min(1).optional(),
  }),
]);

/** href seguro: /ruta, http(s), mailto, tel o #anchor */
const hrefSchema = z
  .string()
  .min(1)
  .refine(
    (v) => /^(\/|https?:\/\/|mailto:|tel:|#)/.test(v),
    "href debe ser una ruta pública o URL válida"
  );

export const pricingPlanSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: pricingPriceSchema,
  features: z.array(z.string().min(1)).min(1),
  cta: z.object({
    label: z.string().min(1),
    href: hrefSchema,
  }),
  badge: z.string().optional(),
  featured: z.boolean().optional(),
});

export const pricingDataSchema = z.object({
  heading: z.object({
    titleLines: z.array(z.string().min(1)).min(1),
  }),
  /**
   * Aside enriquecido:
   * - Acepta string plano (retrocompatible)
   * - O bloques { type:"p", children:[ { text, strong? } ] }
   */
  aside: z
    .array(z.union([z.string().min(1), pricingRichParagraphSchema]))
    .min(1),
  plans: z.array(pricingPlanSchema).min(1),
  disclaimer: z.string().min(1).optional(),
});

/** Bloque completo para composition { kind: "pricing", data } */
export const pricingSectionSchema = z.object({
  kind: z.literal("pricing"),
  data: pricingDataSchema,
});

export type PricingRichInline = z.infer<typeof pricingRichInlineSchema>;
export type PricingRichParagraph = z.infer<typeof pricingRichParagraphSchema>;
export type PricingPrice = z.infer<typeof pricingPriceSchema>;
export type PricingPlan = z.infer<typeof pricingPlanSchema>;
export type PricingData = z.infer<typeof pricingDataSchema>;
export type PricingSection = z.infer<typeof pricingSectionSchema>;
