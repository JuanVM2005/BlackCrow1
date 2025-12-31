// src/content/schemas/contact.schema.ts
import { z } from "zod";

/**
 * Contact section content (i18n).
 * Solo estructura + textos (nada de estilos / colores).
 */
export const contactSchema = z.object({
  id: z.string().default("contact"),

  // Left column (brand mark area)
  mark: z.object({
    /** Path a tu SVG/imagen (relativo a /public). */
    src: z.string().min(1),
    /** Texto accesible para lectores de pantalla. */
    alt: z.string().min(1),
  }),

  // Right column (content + form)
  heading: z.string().min(1),
  description: z.string().optional(),

  form: z.object({
    action: z
      .object({
        /** Endpoint de envío (tu API). */
        url: z.string().min(1),
        /** Método HTTP. */
        method: z.enum(["POST"]).default("POST"),
      })
      .default({ url: "/api/contact", method: "POST" }),

    fields: z.object({
      firstName: z.object({
        label: z.string().min(1),
        placeholder: z.string().optional(),
      }),
      lastName: z.object({
        label: z.string().min(1),
        placeholder: z.string().optional(),
      }),
      email: z.object({
        label: z.string().min(1),
        placeholder: z.string().optional(),
      }),
      message: z.object({
        label: z.string().min(1),
        placeholder: z.string().optional(),
      }),
    }),

    consent: z.object({
      newsletter: z.object({
        label: z.string().min(1),
        defaultChecked: z.boolean().default(false),
      }),
      privacy: z.object({
        label: z.string().min(1),
        /** Si quieres linkear a una página de privacidad. */
        href: z.string().optional(),
        defaultChecked: z.boolean().default(false),
        required: z.boolean().default(true),
      }),
    }),

    submitLabel: z.string().min(1),

    feedback: z
      .object({
        successTitle: z.string().min(1),
        successMessage: z.string().min(1),
        errorTitle: z.string().min(1),
        errorMessage: z.string().min(1),
      })
      .optional(),
  }),
});

export type ContactSectionJSON = z.infer<typeof contactSchema>;

export function parseContactSection(input: unknown): ContactSectionJSON {
  return contactSchema.parse(input);
}
