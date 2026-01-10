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

  // Redes (no i18n)
  socials: {
    x: "https://x.com/blackcrow",
    github: "https://github.com/blackcrow",
    linkedin: "https://linkedin.com/company/blackcrow",
    instagram: "https://instagram.com/blackcrow",
  } as const,

  /**
   * Fallback nav — solo ES.
   * (No se usa para i18n real; usar buildNav(locale).)
   * ✅ Sin “Servicios” (solo Home / Precios / Contacto).
   */
  nav: [
    { id: "home", label: "Home", href: "/es" },
    { id: "pricing", label: "Precios", href: "/es" },
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
    pricing: "Precios",
    contact: "Contacto",
    privacy: "Privacidad",
    terms: "Términos",
    support: "Soporte",
  },
  en: {
    home: "Home",
    pricing: "Pricing",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
    support: "Support",
  },
} as const;

/**
 * MENU PRINCIPAL i18n
 * ✅ Sin “Servicios”.
 *
 * Nota sobre “#pricing / #precios”:
 * - Aquí NO usamos hashes, porque tú ya controlas el scroll + splash con `id: "pricing"`.
 * - El `href` para pricing apunta al HOME base (`/es` | `/en`).
 * - BottomDock/MobileMenu detectan `id === "pricing"` y hacen:
 *    - overlay + scroll a la sección (si estás en home)
 *    - o guardan intención en sessionStorage (si vienes desde otra ruta)
 */
export function buildNav(localeInput?: string): NavItem[] {
  const l = normalizeLocale(localeInput);
  const base = localeBasePath(l); // "/es" | "/en"
  const labels = labelsByLocale[l];

  const contactHref = l === "es" ? `${base}/contacto` : `${base}/contact`;

  return [
    { id: "home", label: labels.home, href: base },
    { id: "pricing", label: labels.pricing, href: base },
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
