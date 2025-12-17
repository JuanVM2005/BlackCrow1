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
  ogImage: "/images/og-default.png",

  // Defaults SEO
  seo: {
    defaultTitle: "Black Crow – Agencia web",
    defaultDescription:
      "Creamos experiencias web profesionales, rápidas y escalables para tu marca.",
    titleTemplate: "%s – Black Crow",
  },

  // Config del Web App Manifest (tokens mapeados desde CSS global)
  manifest: {
    // Rutas base
    startUrl: "/",
    scope: "/",
    display: "standalone" as const,

    // Colores: alineados con los tokens de globals.css
    // background_color ≈ --surface (blanco)
    backgroundColor: "#FFFFFF",
    // theme_color ≈ texto/neutro oscuro (--neutral-1000 / negro)
    themeColor: "#000000",

    // Iconos: asegúrate de que existan en public/favicons
    icons: [
      {
        src: "/favicons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/favicons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/favicons/maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  },

  // Redes (no i18n)
  socials: {
    x: "https://x.com/blackcrow",
    twitter: "https://x.com/blackcrow",
    github: "https://github.com/blackcrow",
    linkedin: "https://linkedin.com/company/blackcrow",
    instagram: "https://instagram.com/blackcrow",
  } as const,

  /**
   * Fallback nav — solo ES.
   * No se usa para i18n real (usar buildNav(locale)).
   * id opcional para compatibilidad.
   */
  nav: [
    { id: "home", label: "Home", href: "/es" },
    { id: "pricing", label: "Precios", href: "/es" },
    { id: "contact", label: "Contacto", href: "/es/servicios/personalizado" },
  ] as NavItem[],
} as const;

export type SiteConfig = typeof site;

/* =========================================================
   I18N LABELS
   ========================================================= */

const labelsByLocale = {
  es: {
    features: "Home",
    pricing: "Precios",
    contact: "Contacto",
    services: "Servicios",
    privacy: "Privacidad",
    terms: "Términos",
    support: "Soporte",
  },
  en: {
    features: "Home",
    pricing: "Pricing",
    contact: "Contact",
    services: "Services",
    privacy: "Privacy",
    terms: "Terms",
    support: "Support",
  },
} as const;

const anchorsByLocale = {
  es: { features: "#features", pricing: "#precios", contact: "#contacto" },
  en: { features: "#features", pricing: "#pricing", contact: "#contact" },
} as const;

/* =========================================================
   MENU PRINCIPAL i18n
   ========================================================= */

export function buildNav(localeInput?: string): NavItem[] {
  const l = normalizeLocale(localeInput);
  const base = localeBasePath(l); // "/es" | "/en"
  const labels = labelsByLocale[l];

  const contactHref =
    l === "es" ? `${base}/servicios/personalizado` : `${base}/services/custom`;

  return [
    {
      id: "home",
      label: labels.features, // Home
      href: base,
    },
    {
      id: "pricing",
      label: labels.pricing, // Precios / Pricing
      href: base,
    },
    {
      id: "contact",
      label: labels.contact, // Contacto / Contact
      href: contactHref,
    },
  ];
}

/* =========================================================
   FOOTER LINKS i18n
   ========================================================= */

export function buildFooterLinks(localeInput?: string): FooterLink[] {
  const l = normalizeLocale(localeInput);
  const labels = labelsByLocale[l];
  const base = localeBasePath(l);
  const legalBase = `${base}/legal`;

  return [
    {
      label: labels.privacy,
      href: `${legalBase}/${l === "es" ? "privacidad" : "privacy"}`,
    },
    {
      label: labels.terms,
      href: `${legalBase}/${l === "es" ? "terminos" : "terms"}`,
    },
    {
      label: labels.support,
      href: `${base}${anchorsByLocale[l].contact}`,
    },
  ];
}

/* =========================================================
   COPYRIGHT
   ========================================================= */

export function copyrightLine() {
  return `© ${new Date().getFullYear()} ${site.name}. Todos los derechos reservados.`;
}
