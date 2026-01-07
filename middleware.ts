// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * i18n strict + semantic slugs (OG estático global):
 * - /es/contact  -> /es/contacto
 * - /en/contacto -> /en/contact
 * - Sin prefijo de locale → redirige a HOME del preferido (/es|/en).
 *
 * ✅ OG/Twitter ahora son 100% estáticos (public/og/*),
 */

const LOCALES = new Set(["es", "en"]);
const DEFAULT_LOCALE = "es";

/** Determina si la ruta debe saltarse el middleware */
function shouldSkip(pathname: string): boolean {
  // Rutas internas de Next / Vercel
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_vercel")
  ) {
    return true;
  }

  // Assets estáticos (incluye /og/default.png, favicons, imágenes, etc.)
  if (/\.[a-z0-9]+$/i.test(pathname)) return true;

  // Rutas técnicas explícitas
  if (
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/icon.png" ||
    pathname === "/apple-icon.png"
  ) {
    return true;
  }

  return false;
}

export function middleware(req: NextRequest) {
  try {
    // Edge-safe
    const url = req.nextUrl.clone();
    const { pathname, search } = url;

    // 0) Ignorar assets/rutas técnicas
    if (shouldSkip(pathname)) {
      return NextResponse.next();
    }

    // 1) Raíz: / → /<preferredLocale>
    if (pathname === "/") {
      const preferred = getPreferredLocale(req);
      url.pathname = `/${preferred}`;
      url.search = search;

      const res = NextResponse.redirect(url, 308);
      res.cookies.set("NEXT_LOCALE", preferred, { path: "/" });
      res.headers.set("X-Redirect-By", "middleware");
      return res;
    }

    const segs = pathname.split("/").filter(Boolean);
    const firstRaw = segs[0] ?? "";
    const firstLower = firstRaw.toLowerCase();

    // 2a) /ES → /es
    if (LOCALES.has(firstLower) && firstRaw !== firstLower) {
      segs[0] = firstLower;
      url.pathname = "/" + segs.join("/");
      url.search = search;
      return NextResponse.redirect(url, 308);
    }

    // 2b) /es-PE o /en-US → /es | /en
    const localeVariantMatch = /^([A-Za-z]{2})(-[A-Za-z]{2})?$/.test(firstRaw);
    if (!LOCALES.has(firstLower) && localeVariantMatch) {
      const base = firstLower.split("-")[0];
      const normalized = LOCALES.has(base) ? base : DEFAULT_LOCALE;

      segs[0] = normalized;
      url.pathname = "/" + segs.join("/");
      url.search = search;

      const res = NextResponse.redirect(url, 308);
      res.cookies.set("NEXT_LOCALE", normalized, { path: "/" });
      return res;
    }

    // 2c) Ya trae locale válido → aplicar slugs semánticos
    if (LOCALES.has(firstLower)) {
      const locale = firstLower;
      const slug = segs[1];

      // ❌ /es/contact → /es/contacto
      if (locale === "es" && slug === "contact") {
        segs[1] = "contacto";
        url.pathname = "/" + segs.join("/");
        url.search = search;
        return NextResponse.redirect(url, 308);
      }

      // ❌ /en/contacto → /en/contact
      if (locale === "en" && slug === "contacto") {
        segs[1] = "contact";
        url.pathname = "/" + segs.join("/");
        url.search = search;
        return NextResponse.redirect(url, 308);
      }

      // ✅ locale válido + slug correcto
      return NextResponse.next();
    }

    // 3) Sin prefijo de locale → HOME del preferido
    const preferred = getPreferredLocale(req);
    url.pathname = `/${preferred}`;
    url.search = search;

    const res = NextResponse.redirect(url, 308);
    res.cookies.set("NEXT_LOCALE", preferred, { path: "/" });
    res.headers.set("X-Redirect-By", "middleware");
    return res;
  } catch (err) {
    // Evita 500 global por requests raras en Edge
    console.error("middleware_error", err);
    return NextResponse.next();
  }
}

function getPreferredLocale(req: NextRequest): "es" | "en" {
  const cookie = req.cookies.get("NEXT_LOCALE")?.value?.toLowerCase();
  if (cookie === "es" || cookie === "en") return cookie;
  return DEFAULT_LOCALE;
}

export const config = {
  matcher: ["/:path*"],
};
