// src/content/schemas/messageBar.schema.ts
import { z } from "zod";

const nonEmptyTrimmed = (min = 1, max = 240) =>
  z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v.length >= min, `debe tener al menos ${min} caracteres`)
    .refine((v) => v.length <= max, `debe tener como máximo ${max} caracteres`);

export const MessageBarTextPartSchema = z.object({
  text: nonEmptyTrimmed(1, 160),
  /** Si true, el UI aplicará el color/acento de marca (desde tokens CSS). */
  highlight: z.boolean().optional().default(false),
});

export const messageBarSchema = z.object({
  textParts: z.array(MessageBarTextPartSchema).min(1, "debe incluir al menos 1 fragmento"),
  /** Separador entre partes. Ej: " • " */
  separator: z.string().default(" • "),
  /** Alineación del texto en el UI (opcional). */
  align: z.enum(["left", "center", "right"]).optional().default("center"),
});

export type MessageBarContent = z.infer<typeof messageBarSchema>;
export type MessageBarTextPart = z.infer<typeof MessageBarTextPartSchema>;
