// src/content/schemas/serviceForm.schema.ts
import { z } from "zod";

/**
 * Esquema MINIMAL y ESTRICTO del formulario.
 * Solo permite:
 * - title
 * - cta.label
 * - fields: [firstName, lastName, email, message, newsletter, acceptPrivacy] (en ese orden)
 * Nada más.
 */

// Campos concretos
const firstNameField = z.object({
  id: z.literal("firstName"),
  label: z.string().min(1),
  placeholder: z.string().min(1),
  type: z.literal("text"),
  required: z.literal(true),
});

const lastNameField = z.object({
  id: z.literal("lastName"),
  label: z.string().min(1),
  placeholder: z.string().min(1),
  type: z.literal("text"),
  required: z.literal(true),
});

const emailField = z.object({
  id: z.literal("email"),
  label: z.string().min(1),
  placeholder: z.string().min(1),
  type: z.literal("email"),
  required: z.literal(true),
});

const messageField = z.object({
  id: z.literal("message"),
  label: z.string().min(1),
  placeholder: z.string().min(1),
  type: z.literal("textarea"),
  rows: z.number().int().min(3).max(12).default(6),
  required: z.literal(true),
});

const newsletterField = z.object({
  id: z.literal("newsletter"),
  label: z.string().min(1),
  type: z.literal("checkbox"),
  required: z.literal(false),
});

const acceptPrivacyField = z.object({
  id: z.literal("acceptPrivacy"),
  label: z.string().min(1),
  type: z.literal("checkbox"),
  required: z.literal(true),
});

// Esquema raíz: SOLO lo listado arriba.
export const serviceFormSchema = z.object({
  title: z.string().min(1),
  cta: z.object({
    label: z.string().min(1),
  }),
  fields: z.tuple([
    firstNameField,
    lastNameField,
    emailField,
    messageField,
    newsletterField,
    acceptPrivacyField,
  ]),
});

export type ServiceFormJSON = z.infer<typeof serviceFormSchema>;
export default serviceFormSchema;
