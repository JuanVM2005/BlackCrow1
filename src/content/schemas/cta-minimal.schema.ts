import { z } from "zod";

const publicPathRegex = /^\/(?!\/)[^\s]*$/;

const hrefSchema = z
  .string()
  .refine(
    (v) => publicPathRegex.test(v) || /^https?:\/\//i.test(v),
    "href debe ser una ruta pública que empiece por '/' o una URL",
  );

export const CtaActionSchema = z.object({
  label: z.string().trim().min(1, "label es requerido"),
  href: hrefSchema,
});

export const CtaAlignSchema = z.enum(["center", "left", "right"]);

export const CtaMinimalDataSchema = z.object({
  title: z.string().trim().min(3, "title es requerido"),
  action: CtaActionSchema,
  align: CtaAlignSchema.optional(),
});

export const CtaMinimalSectionSchema = z.object({
  kind: z.literal("cta-minimal"),
  data: CtaMinimalDataSchema.optional(),
});

export type CtaMinimalData = z.infer<typeof CtaMinimalDataSchema>;
export type CtaMinimalSection = z.infer<typeof CtaMinimalSectionSchema>;
