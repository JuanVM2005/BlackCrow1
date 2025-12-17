import { z } from "zod";

const nonEmpty = (field: string) =>
  z.string().refine((v) => typeof v === "string" && v.trim().length >= 1, {
    message: `${field} requerido`,
  });

export const studioIntroDataSchema = z.object({
  /** Opcional para alinear con el mapper (kicker?: string) */
  kicker: z.string().optional(),
  title: nonEmpty("title"),
  body: nonEmpty("body"),
  cta: z.object({
    label: nonEmpty("cta.label"),
    href: nonEmpty("cta.href"),
  }),
});

export const StudioIntroSchema = z.object({
  // Usamos refine en vez de z.literal para compatibilidad con tu setup
  kind: z.string().refine((v) => v === "studioIntro", {
    message: 'kind debe ser "studioIntro"',
  }),
  data: studioIntroDataSchema,
});

export type StudioIntro = z.infer<typeof StudioIntroSchema>;
