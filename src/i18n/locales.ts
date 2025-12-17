// src/i18n/locales.ts
/**
 * ÚNICA fuente de verdad de locales soportados.
 * - Define locales disponibles y el default
 * - Normaliza (es-PE → es, en-US → en)
 * - Negocia un locale a partir de cadena o lista (útil para middleware/SSR)
 */

export type Locale = "es" | "en";

/** Locales soportados (orden importa para negociación) */
export const locales = ["es", "en"] as const satisfies readonly Locale[];

/** Locale por defecto (debe existir en `locales`) */
export const defaultLocale: Locale = "es";

/** Locales con escritura RTL (no usamos ninguna por ahora) */
export const rtlLocales: readonly Locale[] = [];

/** Mapa opcional de etiquetas legibles (para selects, etc.) */
export const localeLabels: Record<Locale, string> = {
  es: "Español",
  en: "English",
};

/** Normaliza BCP-47 → base (ej: en-US → en, es-PE → es) */
export function normalizeLocale(input?: string): Locale {
  const base = (input ?? defaultLocale).toLowerCase().split("-")[0];
  return (locales as readonly string[]).includes(base) ? (base as Locale) : defaultLocale;
}

/** Valida si una cadena corresponde a un locale soportado (tras normalizar) */
export function isLocale(value?: string): value is Locale {
  return (locales as readonly string[]).includes(normalizeLocale(value));
}

/**
 * Negocia el mejor locale dado:
 * - una cadena (ej. "en-US,en;q=0.9") o
 * - una lista (ej. ["en-US","es-PE"])
 * Retorna siempre un `Locale` soportado.
 */
export function negotiateLocale(
  preferred: string | string[] | undefined,
  fallback: Locale = defaultLocale
): Locale {
  if (!preferred) return fallback;

  const items = Array.isArray(preferred)
    ? preferred
    : String(preferred)
        .split(",")
        .map((p) => p.trim().split(";")[0]);

  for (const item of items) {
    const norm = normalizeLocale(item);
    if (isLocale(norm)) return norm;
  }
  return fallback;
}

/** Alternativas al locale actual (útil para links hreflang, switchers, etc.) */
export function alternateLocales(current?: string): Locale[] {
  const curr = normalizeLocale(current);
  return (locales as readonly Locale[]).filter((l) => l !== curr);
}
