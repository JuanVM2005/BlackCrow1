// src/layout/Header/LanguageSwitch.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  resolveServiceKeyFromSlug,
  serviceSlugByLocale,
  servicesSegmentByLocale,
  localeBasePath,
} from "@/i18n/routing/static";

type Locale = "es" | "en";

function detectLocaleFromPath(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  return (first === "en" ? "en" : "es") as Locale;
}

function mapHash(hash: string, from: Locale, to: Locale): string {
  if (!hash) return "";
  const map: Record<Locale, Record<string, string>> = {
    es: {
      "#contacto": "#contact",
      "#precios": "#pricing",
      "#features": "#features",
    },
    en: {
      "#contact": "#contacto",
      "#pricing": "#precios",
      "#features": "#features",
    },
  };
  const normalized = hash.toLowerCase();
  const mapped = map[from][normalized] ?? hash;
  return mapped;
}

function buildAltHref(
  pathname: string,
  search: string,
  hash: string,
): { href: string; current: Locale; alt: Locale } {
  const segs = pathname.split("/").filter(Boolean);
  const current = detectLocaleFromPath(pathname);
  const alt: Locale = current === "es" ? "en" : "es";

  const q = search ? `?${search}` : "";

  const svcSegCurrent = servicesSegmentByLocale[current];
  const svcSegAlt = servicesSegmentByLocale[alt];

  let destPath: string;

  if (segs[0] === current && segs[1] === svcSegCurrent) {
    // Índice /[locale]/servicios | /[locale]/services
    if (segs.length === 2) {
      destPath = `/${alt}/${svcSegAlt}`;
    } else {
      // Detalle /[locale]/servicios/[slug]
      const slug = segs[2];
      const key = resolveServiceKeyFromSlug(current, slug);
      if (key) {
        const altSlug = serviceSlugByLocale[alt][key];
        destPath = `/${alt}/${svcSegAlt}/${altSlug}`;
      } else {
        destPath = `/${alt}/${svcSegAlt}`;
      }
    }
  } else if (segs[0] === current) {
    // Cualquier ruta con prefijo locale → sólo cambiar el prefijo
    destPath = "/" + [alt, ...segs.slice(1)].join("/");
  } else {
    // Sin prefijo (no debería pasar por el middleware, pero por si acaso)
    destPath = localeBasePath(alt);
  }

  const mappedHash = mapHash(hash, current, alt);
  return { href: `${destPath}${q}${mappedHash}`, current, alt };
}

export default function LanguageSwitch({ className }: { className?: string }) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";

  const [hash, setHash] = React.useState<string>("");

  React.useEffect(() => {
    const read = () => setHash(window.location.hash || "");
    read();
    window.addEventListener("hashchange", read, { passive: true });
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const { href, current, alt } = React.useMemo(
    () => buildAltHref(pathname, search, hash),
    [pathname, search, hash],
  );

  return (
    <div
      className={[
        "inline-flex items-center rounded-[var(--radius-pill)] border border-[color:var(--border)]",
        "bg-[color:var(--surface)] text-[color:var(--text)] overflow-hidden",
        className ?? "",
      ].join(" ")}
      role="group"
      aria-label="Language switcher"
    >
      {/* Botón ES */}
      <span
        aria-current={current === "es" ? "true" : undefined}
        className={[
          "px-3 py-1 text-sm",
          current === "es"
            ? "bg-[color:var(--surface-raised)] font-semibold"
            : "opacity-80",
        ].join(" ")}
      >
        {current === "es" ? (
          "ES"
        ) : (
          <Link href={href} prefetch={false}>
            ES
          </Link>
        )}
      </span>

      {/* Separador fino */}
      <span
        aria-hidden
        className="w-px h-4 my-1 bg-[color:var(--border)]"
      />

      {/* Botón EN */}
      <span
        aria-current={current === "en" ? "true" : undefined}
        className={[
          "px-3 py-1 text-sm",
          current === "en"
            ? "bg-[color:var(--surface-raised)] font-semibold"
            : "opacity-80",
        ].join(" ")}
      >
        {current === "en" ? (
          "EN"
        ) : (
          <Link href={href} prefetch={false}>
            EN
          </Link>
        )}
      </span>
    </div>
  );
}
