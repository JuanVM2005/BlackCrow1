// src/core/validation/contactForm.schema.ts
import { z } from "zod";

/**
 * Normaliza valores típicos de checkboxes:
 * - "on", "true", "1", 1 → true
 * - "off", "false", "0", 0 → false
 * - cualquier otra cosa → false
 */
const checkboxToBool = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const v = value.toLowerCase().trim();
    if (v === "true" || v === "on" || v === "1") return true;
    if (v === "false" || v === "off" || v === "0") return false;
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  return false;
};

/**
 * Campos principales del formulario de contacto,
 * alineados con los JSON de formularios de servicios:
 *   - p.ej. src/content/locales/[locale]/services/forms/landing.json
 */
const ContactFormBaseSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, { message: "contact.firstName.minLength" }),
  lastName: z
    .string()
    .trim()
    .min(2, { message: "contact.lastName.minLength" }),
  email: z
    .string()
    .trim()
    .email({ message: "contact.email.invalid" }),

  /**
   * Mensaje libre del usuario.
   * Sin mínimo de longitud: solo se requiere que exista como string.
   */
  message: z.string().trim(),

  /**
   * Checkbox opcional "Recibir boletín mensual de Black Crow".
   * En JSON vendrá como boolean, pero soportamos también valores tipo
   * "on"/"true"/"1" por si en algún momento se envía desde FormData.
   */
  newsletter: z
    .preprocess(checkboxToBool, z.boolean())
    .optional()
    .default(false),

  /**
   * Checkbox obligatorio "Acepto la política de privacidad".
   * Debe ser true, si no → error.
   */
  acceptPrivacy: z
    .preprocess(checkboxToBool, z.boolean())
    .refine((value) => value === true, {
      message: "contact.acceptPrivacy.required",
    }),
});

/**
 * Campos técnicos que el backend necesita para enrutado / i18n.
 * - serviceKey: identifica el tipo de servicio (ej: "landing")
 * - locale: idioma del contenido que vio el usuario
 */
export const ContactFormSchema = ContactFormBaseSchema.extend({
  serviceKey: z
    .string()
    .trim()
    .min(1, { message: "contact.serviceKey.required" }),

  locale: z.union([z.literal("es"), z.literal("en")]).default("es"),
});

export type ContactFormInput = z.infer<typeof ContactFormSchema>;
