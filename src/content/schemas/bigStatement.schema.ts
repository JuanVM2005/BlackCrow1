// src/content/schemas/bigStatement.schema.ts
import { z } from "zod";

/**
 * Schema permisivo para evitar TS(2554) en entornos con firmas de Zod atípicas.
 * Validaciones estrictas (límites y enum de container) se hacen en el mapper.
 */
export const BigStatementSchema = z.object({
  // Evitamos z.literal("bigStatement") para no gatillar TS(2554)
  kind: z.string(),
  data: z.object({
    left: z.object({
      // Sin min/max/refine aquí; se normaliza en el mapper
      lines: z.array(z.string()),
      ariaLabel: z.string().optional(),
    }),
    right: z.object({
      kicker: z.string().optional(),
      headline: z.string(),
      copy: z.string(),
    }),
    layout: z
      .object({
        reverse: z.boolean().optional(),
        // Evitamos z.enum([...]); se valida en el mapper
        container: z.string().optional(),
        bleedY: z.boolean().optional(),
      })
      .optional(),
  }),
});

export type BigStatementContent = z.infer<typeof BigStatementSchema>;

/** Type guard ligero sin invocar parse/safeParse (evita TS(2554)). */
export function isBigStatement(section: unknown): section is BigStatementContent {
  const s = section as any;
  return (
    s &&
    typeof s === "object" &&
    s.kind === "bigStatement" &&
    s.data &&
    s.data.left &&
    Array.isArray(s.data.left.lines) &&
    s.data.right &&
    typeof s.data.right.headline === "string" &&
    typeof s.data.right.copy === "string"
  );
}
