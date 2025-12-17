// src/content/schemas/stack-grid.schema.ts
import { z } from "zod";

/** Ruta pública: debe iniciar con "/" */
const publicPathRegex = /^\/(?!\/)[^\s]*$/;
const publicPath = z
  .string()
  .regex(publicPathRegex, 'debe ser una ruta pública que empiece por "/"');

const nonEmpty = z.string().trim().min(1, "campo requerido");

/** Item (tarjeta) — sin href, solo título + icono + descripción opcional */
export const stackGridItemSchema = z
  .object({
    label: nonEmpty,
    icon: publicPath,
    alt: nonEmpty,
    description: z.string().trim().min(1, "campo requerido").optional(),
  })
  .strict();

/** Grupo (título opcional + items) */
export const stackGridGroupSchema = z
  .object({
    title: z.string().trim().min(1, "campo requerido").optional(),
    items: z.array(stackGridItemSchema).min(1, "debe tener al menos 1 item"),
  })
  .strict();

/** Sección completa de stack-grid */
export const stackGridSchema = z.object({
  groups: z.array(stackGridGroupSchema).min(1, "debe tener al menos 1 grupo"),
});

export type StackGridItem = z.infer<typeof stackGridItemSchema>;
export type StackGridGroup = z.infer<typeof stackGridGroupSchema>;
export type StackGridContent = z.infer<typeof stackGridSchema>;
