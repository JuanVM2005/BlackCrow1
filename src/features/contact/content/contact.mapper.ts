// src/features/contact/content/contact.mapper.ts
import {
  parseContactSection,
  type ContactSectionJSON,
} from "@/content/schemas/contact.schema";

export type ContactProps = ContactSectionJSON;

export type ContactLocale = "es" | "en";

const loaders: Record<ContactLocale, () => Promise<{ default: unknown }>> = {
  es: () => import("@/content/locales/es/sections/contact.json"),
  en: () => import("@/content/locales/en/sections/contact.json"),
};

/**
 * Carga el JSON i18n de Contact (sin dynamic import por template string).
 * Esto evita errores raros con Turbopack en dev.
 */
export async function loadContact(locale: ContactLocale): Promise<ContactProps> {
  const mod = await loaders[locale]();
  return parseContactSection(mod.default);
}
