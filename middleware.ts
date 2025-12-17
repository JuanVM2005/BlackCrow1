// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * i18n strict:
 * - Sin prefijo de locale → redirige a HOME del preferido (/es|/en).
 * - Con /es|/en → deja pasar (normaliza mayúsculas y variantes /es-PE → /es).
 */

const LOCALES = new Set(["es", "en"]);
const DEFAULT_LOCALE = "es";

/** Determina si la ruta debe saltarse el middleware (estáticos, APIs, OG images, archivos con extensión, etc.) */
function shouldSkip(pathname: string): boolean {
  // 1) Prefijos técnicos
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_vercel")
  ) {
    return true;
  }

  // 2) Endpoints especiales sin extensión (OG/preview)
  if (
    pathname.endsWith("/opengraph-image") ||
    pathname.endsWith("/twitter-image")
  ) {
    return true;
  }

  // 3) Archivos con extensión (incluye .xml/.txt/.json/.png/.webp/.glb, etc.)
  if (/\.[a-z0-9]+$/i.test(pathname)) return true;

  // 4) Casos públicos comunes
  if (
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/icon.png" ||
    pathname === "/apple-icon.png"
  ) {
    return true;
  }

  return false;
}

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const { pathname, search } = url;

  // 0) Ignorar assets/rutas técnicas
  if (shouldSkip(pathname)) {
    return NextResponse.next();
  }

  // 1) Raíz: / → /<preferredLocale>
  if (pathname === "/") {
    const preferred = getPreferredLocale(req);
    url.pathname = `/${preferred}`;
    url.search = search; // conserva query
    const res = NextResponse.redirect(url, 308);
    // recordar preferencia
    res.cookies.set("NEXT_LOCALE", preferred, { path: "/" });
    res.headers.set("X-Redirect-By", "middleware");
    return res;
  }

  // 2) ¿Trae algo parecido a un locale?
  const segs = pathname.split("/").filter(Boolean);
  const firstRaw = segs[0] ?? "";
  const firstLower = firstRaw.toLowerCase();

  // 2a) /ES → /es (solo case)
  if (LOCALES.has(firstLower) && firstRaw !== firstLower) {
    segs[0] = firstLower;
    url.pathname = "/" + segs.join("/") + (pathname.endsWith("/") ? "/" : "");
    url.search = search;
    const res = NextResponse.redirect(url, 308);
    res.headers.set("X-Redirect-By", "middleware");
    return res;
  }

  // 2b) /es-PE o /en-US → normaliza a /es | /en
  const localeVariantMatch = /^([A-Za-z]{2})(-[A-Za-z]{2})?$/.test(firstRaw);
  if (!LOCALES.has(firstLower) && localeVariantMatch) {
    const base = firstLower.split("-")[0];
    const normalized = LOCALES.has(base) ? base : DEFAULT_LOCALE;
    segs[0] = normalized;
    url.pathname = "/" + segs.join("/") + (pathname.endsWith("/") ? "/" : "");
    url.search = search;
    const res = NextResponse.redirect(url, 308);
    res.cookies.set("NEXT_LOCALE", normalized, { path: "/" });
    res.headers.set("X-Redirect-By", "middleware");
    return res;
  }

  // 2c) Ya trae locale válido → dejar pasar sin alias legacy
  if (LOCALES.has(firstLower)) {
    return NextResponse.next();
  }

  // 3) Sin prefijo de locale → HOME del preferido (NO conserves path)
  const preferred = getPreferredLocale(req);
  url.pathname = `/${preferred}`;
  url.search = search; // conserva query por cortesía
  const res = NextResponse.redirect(url, 308);
  res.cookies.set("NEXT_LOCALE", preferred, { path: "/" });
  res.headers.set("X-Redirect-By", "middleware");
  return res;
}

/**
 * Locale preferido:
 * - Primero cookie NEXT_LOCALE.
 * - Si no hay, usa DEFAULT_LOCALE (es).
 *
 * Ignoramos Accept-Language para que el comportamiento sea determinista.
 */
function getPreferredLocale(req: NextRequest): "es" | "en" {
  const cookie = req.cookies.get("NEXT_LOCALE")?.value?.toLowerCase();
  if (cookie === "es" || cookie === "en") return cookie as "es" | "en";
  return DEFAULT_LOCALE as "es";
}

// Matcher: excluye assets/estáticos principales en el edge; el resto se filtra en runtime con `shouldSkip`.
export const config = {
  matcher: [
    // No ejecutar en API ni en estáticos de Next; tampoco en archivos bien conocidos.
    "/((?!api|_next/static|_next/image|_vercel|favicon.ico|robots.txt|sitemap.xml|manifest.json|icon.png|apple-icon.png|opengraph-image|twitter-image).*)",
  ],
};
