// src/config/site.ts
import { normalizeLocale } from "@/i18n/locales";
import { localeBasePath } from "@/i18n/routing/static";

/**
 * NavItem original del proyecto (con id opcional para no romper nada existente)
 */
export type NavItem = {
  id?: string;
  label: string;
  href: string;
  external?: boolean;
};

export type FooterLink = { label: string; href: string; external?: boolean };

export const site = {
  // Identidad de marca
  name: "Black Crow",
  shortName: "Black Crow",
  tagline: "Agencia web",
  url: "https://blackcrow.agency",
  description:
    "Creamos experiencias web profesionales, rápidas y escalables para tu marca.",

  /**
   * ✅ En tu estructura real existe: public/og/default.png
   * (NO existe /images/og-default.png)
   */
  ogImage: "/og/default.png",

  // Defaults SEO
  seo: {
    defaultTitle: "Black Crow – Agencia web",
    defaultDescription:
      "Creamos experiencias web profesionales, rápidas y escalables para tu marca.",
    titleTemplate: "%s – Black Crow",
  },

  // Config del Web App Manifest (tokens mapeados desde CSS global)
  manifest: {
    startUrl: "/",
    scope: "/",
    display: "standalone" as const,

    // Colores base (alineados a tokens)
    backgroundColor: "#FFFFFF",
    themeColor: "#000000",

    /**
     * ✅ En tu estructura real existen:
     * public/favicons/icon-192.png
     * public/favicons/icon-512.png
     * public/favicons/maskable-192.png
     * public/favicons/maskable-512.png
     */
    icons: [
      {
        src: "/favicons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/favicons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/favicons/maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  },

  // Redes (no i18n)
  socials: {
    x: "https://x.com/blackcrow",
    github: "https://github.com/blackcrow",
    linkedin: "https://linkedin.com/company/blackcrow",
    instagram: "https://instagram.com/blackcrow",
  } as const,

  /**
   * Fallback nav — solo ES.
   * No se usa para i18n real (usar buildNav(locale)).
   */
  nav: [
    { id: "home", label: "Home", href: "/es" },
    { id: "services", label: "Servicios", href: "/es/servicios" },
    { id: "contact", label: "Contacto", href: "/es/contacto" },
  ] as NavItem[],
} as const;

export type SiteConfig = typeof site;

/* =========================================================
   I18N LABELS
   ========================================================= */

const labelsByLocale = {
  es: {
    home: "Home",
    services: "Servicios",
    pricing: "Precios",
    contact: "Contacto",
    privacy: "Privacidad",
    terms: "Términos",
    support: "Soporte",
  },
  en: {
    home: "Home",
    services: "Services",
    pricing: "Pricing",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
    support: "Support",
  },
} as const;

/**
 * Anchors para navegación por secciones en home.
 * (No rompen aunque la sección no exista; solo no hace scroll.)
 */
const anchorsByLocale = {
  es: { pricing: "#precios", contact: "#contacto" },
  en: { pricing: "#pricing", contact: "#contact" },
} as const;

/* =========================================================
   MENU PRINCIPAL i18n
   - Home: ruta base
   - Servicios: página /services o /servicios (existe en tu estructura)
   - Precios: sección en home (hash)
   - Contacto: página /contact o /contacto (existe en tu estructura)
   ========================================================= */

export function buildNav(localeInput?: string): NavItem[] {
  const l = normalizeLocale(localeInput);
  const base = localeBasePath(l); // "/es" | "/en"
  const labels = labelsByLocale[l];

  const servicesHref = l === "es" ? `${base}/servicios` : `${base}/services`;
  const contactHref = l === "es" ? `${base}/contacto` : `${base}/contact`;
  const pricingHref = `${base}${anchorsByLocale[l].pricing}`;

  return [
    { id: "home", label: labels.home, href: base },
    { id: "services", label: labels.services, href: servicesHref },
    { id: "pricing", label: labels.pricing, href: pricingHref },
    { id: "contact", label: labels.contact, href: contactHref },
  ];
}

/* =========================================================
   FOOTER LINKS i18n
   - Privacy/Terms: hoy NO hay rutas /legal en tu app → evitamos links rotos.
   - Support: manda a contacto (página real).
   ========================================================= */

export function buildFooterLinks(localeInput?: string): FooterLink[] {
  const l = normalizeLocale(localeInput);
  const labels = labelsByLocale[l];
  const base = localeBasePath(l);

  const contactHref = l === "es" ? `${base}/contacto` : `${base}/contact`;

  return [
    /**
     * ✅ Sin rutas legales aún: apúntalo al home para no 404.
     * Cuando crees páginas legales, cambia a:
     * - `${base}/legal/privacidad` / `${base}/legal/terms` etc.
     */
    { label: labels.privacy, href: base },
    { label: labels.terms, href: base },
    { label: labels.support, href: contactHref },
  ];
}

/* =========================================================
   COPYRIGHT
   ========================================================= */

export function copyrightLine() {
  return `© ${new Date().getFullYear()} ${site.name}. Todos los derechos reservados.`;
}
