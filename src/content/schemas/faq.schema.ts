import { z } from "zod";

/** Item individual del FAQ */
export const faqItemSchema = z.object({
  question: z
    .string()
    .min(3, "question: mínimo 3 caracteres")
    .max(240, "question: máximo 240 caracteres")
    .trim(),
  answer: z
    .string()
    .min(3, "answer: mínimo 3 caracteres")
    .max(2000, "answer: máximo 2000 caracteres")
    .trim(),
});

/** Sección FAQ completa */
export const FaqSchema = z.object({
  title: z
    .string()
    .min(2, "title: mínimo 2 caracteres")
    .max(120, "title: máximo 120 caracteres")
    .trim(),
  items: z.array(faqItemSchema).min(1, "debe incluir al menos 1 pregunta"),
});

export type FaqItem = z.infer<typeof faqItemSchema>;
export type FaqSection = z.infer<typeof FaqSchema>;
