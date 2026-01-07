/**
 * src/seo/routes.registry.ts
 *
 * Registro DECLARATIVO de rutas SEO.
 * - Fuente de verdad para: qué rutas son indexables y qué tipo de OG usan.
 * - SIN lógica ni imports: solo datos estructurales.
 *
 * Convenciones:
 * - `path` es el path CANÓNICO sin prefijo de locale (el locale lo gestiona el App Router).
 * - OG:
 *    - kind: 'static' → imagen OG estática global (public/og/default.png)
 *
 * ⚠️ Decisión de arquitectura:
 * - El proyecto usa **UN SOLO Open Graph estático global** para todas las rutas.
 * - NO existen OG dinámicos ni assets por-locale.
 */

// Locales soportados (solo para tipado local)
export type Locale = "en" | "es";

// OG dinámico eliminado del sistema
export type OgKind = "static";

export interface SeoRoute {
  /** Path canónico SIN prefijo de locale. Ej.: '/', '/pricing', '/about' */
  path: string;
  /** Si la ruta debe aparecer en sitemap/ser indexable por buscadores */
  indexable: boolean;
  /** Locales en los que existe esta ruta */
  locales: Locale[];
  /** Configuración OpenGraph de la ruta */
  og: {
    kind: OgKind;
    /**
     * Asset OG estático.
     * Siempre el mismo para todas las rutas y locales.
     */
    asset: "/og/default.png";
  };
  /** Equipo/feature owner de la ruta (documental) */
  owner: string;
  /** Notas adicionales (documental) */
  notes?: string;
}

/**
 * Rutas indexables (DECLARATIVAS)
 *
 * ⚠️ Solo datos. No agregar lógica aquí.
 */
export const SEO_ROUTES: SeoRoute[] = [
  {
    path: "/", // Home de marketing
    indexable: true,
    locales: ["en", "es"],
    og: {
      kind: "static",
      asset: "/og/default.png",
    },
    owner: "features/landing",
    notes:
      "Landing principal; usa Open Graph global estático (una sola imagen para todo el site).",
  },
];

/**
 * Rutas NO indexables (DECLARATIVAS)
 * - Útiles para robots/sitemap para excluir explícitamente.
 */
export const NON_INDEXABLE_PATHS: string[] = [
  "/health",
  "/api/revalidate",
  // "/api/webhooks/<provider>" // añadir según se creen webhooks
];

/**
 * 🗒️ Guía rápida:
 * - Todas las rutas usan el MISMO OG:
 *    public/og/default.png
 * - El OG real se define en:
 *    - src/app/layout.tsx
 *    - src/app/[locale]/(marketing)/metadata.ts
 */
