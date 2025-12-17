// src/content/schemas/capabilities.schema.ts
import { z } from "zod";

/**
 * Identificador lógico de la sección. La validación estricta del valor
 * se hace en el mapper para evitar incompatibilidades de tipos/overloads.
 */
export const CAPABILITIES_KIND = "capabilities" as const;

/** Header (título grande izquierda + texto pequeño derecha). */
export const CapabilitiesHeaderSchema = z.object({
  headline: z.string(),
  aside: z.string(),
});

/** Ítem de capacidad/servicio. */
export const CapabilitiesItemSchema = z.object({
  title: z.string(),
  description: z.string(),
});

/**
 * Sección completa (validación suave aquí para máxima compatibilidad
 * con versiones de Zod/TS que disparan TS2554 al usar .min(), .literal(), etc.).
 */
export const CapabilitiesSectionSchema = z.object({
  kind: z.string(),
  header: CapabilitiesHeaderSchema,
  items: z.array(CapabilitiesItemSchema),
});

export type CapabilitiesHeader = z.infer<typeof CapabilitiesHeaderSchema>;
export type CapabilitiesItem = z.infer<typeof CapabilitiesItemSchema>;
export type CapabilitiesSection = z.infer<typeof CapabilitiesSectionSchema>;
