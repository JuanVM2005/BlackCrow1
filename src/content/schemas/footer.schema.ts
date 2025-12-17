import { z } from "zod";

/** Ruta pública: debe iniciar con "/" (permite "/" y anchors tipo "/#id") */
const publicPathRegex = /^\/(?!\/)[^\s]*$/;
export const publicPath = z
  .string()
  .regex(publicPathRegex, 'debe ser una ruta pública que empiece por "/"');

const nonEmpty = z.string().trim().min(1, "campo requerido");

/** mailto:hello@dominio.com */
const mailtoRegex = /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const mailto = z.string().regex(mailtoRegex, "mailto inválido");

const url = z.string().url();

/** Ítem de enlace */
export const footerItemSchema = z.object({
  label: nonEmpty,
  href: z.union([url, publicPath, mailto]),
});

/** Columna del footer */
export const footerColumnSchema = z.object({
  title: nonEmpty,
  items: z.array(footerItemSchema).min(1),
});

/** Marca (para logo/nombre en el pie) */
export const footerBrandSchema = z.object({
  name: nonEmpty,
  logo: publicPath,
  tagline: z.string().trim().optional().nullable(),
});

/** (Opcional futuro) bloque legal */
const legalSchema = z
  .object({
    copyright: nonEmpty,
    links: z
      .array(
        z.object({
          label: nonEmpty,
          href: z.union([url, publicPath]),
        })
      )
      .optional(),
  })
  .optional();

/** Schema principal */
export const footerSchema = z.object({
  ariaLabel: nonEmpty,
  brand: footerBrandSchema,
  divider: z.boolean().default(false),
  columns: z.array(footerColumnSchema).min(1),
  legal: legalSchema,
});

export type FooterContent = z.infer<typeof footerSchema>;
export type FooterColumn = z.infer<typeof footerColumnSchema>;
export type FooterItem = z.infer<typeof footerItemSchema>;
