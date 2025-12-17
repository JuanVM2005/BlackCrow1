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
 *    - kind: 'static' → la imagen vive en /public/og/<route>-<locale>.png
 *    - kind: 'dynamic' → la imagen la genera opengraph-image.tsx de la ruta correspondiente
 *
 * Ejemplos:
 *   Home (indexable) → OG estática:
 *     /og/home-en.png
 *     /og/home-es.png
 *
 *   Rutas de sistema (NO indexables):
 *     /health, /api/revalidate, /api/webhooks/*
 */

// Locales soportados (solo para tipado local, sin depender de otros módulos)
export type Locale = 'en' | 'es';

export type OgKind = 'static' | 'dynamic';

export interface SeoRoute {
  /** Path canónico SIN prefijo de locale. Ej.: '/', '/pricing', '/about' */
  path: string;
  /** Si la ruta debe aparecer en sitemap/ser indexable por buscadores */
  indexable: boolean;
  /** Locales en los que existe esta ruta */
  locales: Locale[];
  /** Tipo de OpenGraph para esta ruta */
  og: {
    kind: OgKind;
    /**
     * Map opcional de assets OG por locale cuando kind = 'static'.
     * Usar rutas absolutas desde /public (p. ej., '/og/home-en.png').
     */
    assets?: Partial<Record<Locale, string>>;
    /** Nota opcional para indicar dónde vive la OG dinámica (si aplica). */
    dynamicNote?: string;
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
    path: '/', // Home de marketing
    indexable: true,
    locales: ['en', 'es'],
    og: {
      kind: 'static',
      assets: {
        en: '/og/home-en.png',
        es: '/og/home-es.png',
      },
    },
    owner: 'features/landing',
    notes: 'Landing principal; OG estática por locale.',
  },

  // Ejemplo de futura ruta indexable con OG dinámica
  // {
  //   path: '/about',
  //   indexable: true,
  //   locales: ['en', 'es'],
  //   og: {
  //     kind: 'dynamic',
  //     dynamicNote:
  //       'Generada por src/app/[locale]/(marketing)/opengraph-image.tsx (o el opengraph-image.tsx correspondiente a la ruta).',
  //   },
  //   owner: 'features/about',
  //   notes: 'OG dinámica; no requiere assets en /public/og.',
  // },
];

/**
 * Rutas NO indexables (DECLARATIVAS)
 * - Útiles para robots/sitemap para excluir explícitamente.
 */
export const NON_INDEXABLE_PATHS: string[] = [
  '/health',
  '/api/revalidate',
  // '/api/webhooks/<provider>' // descomentar/añadir según se creen webhooks
];

/**
 * 🗒️ Guía rápida:
 * - Para añadir una nueva ruta indexable:
 *    1) Agrega un objeto en SEO_ROUTES con `path`, `locales` y `og.kind`.
 *    2) Si `og.kind = 'static'`, crea los assets en /public/og/<route>-<locale>.png.
 *    3) Si `og.kind = 'dynamic'`, confirma que exista el opengraph-image.tsx de esa ruta.
 * - Para excluir una ruta de indexado, añádela a NON_INDEXABLE_PATHS.
 */
