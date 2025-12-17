// src/layout/Header/BottomDock.tsx
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import Container from "@/ui/Container";
import NavLink from "./NavLink";
import Social from "./Social";
import { buildNav, type NavItem } from "@/config/site";
import { startTransitionOverlay } from "@/layout/RootProviders/TransitionOverlay.client";

/**
 * Detecta clicks modificados (cmd, ctrl, middle-click, etc.)
 * para no interferir con el comportamiento nativo del navegador.
 */
function isModifiedClick(
  event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
): boolean {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

/**
 * Posiciona instantáneamente (sin animación) en el primer id que exista.
 */
function jumpToFirstExistingId(ids: string[]): boolean {
  if (typeof window === "undefined") return false;

  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "auto", block: "start" });
      return true;
    }
  }

  return false;
}

/**
 * BottomDock:
 * - Home:
 *    - En /{locale} → splash + salto instantáneo a hero/top.
 *    - Desde otra ruta → splash + navegación normal a /{locale}.
 * - Precios/Pricing:
 *    - En /{locale} → splash + salto instantáneo a sección pricing.
 *    - Desde otra ruta → guarda intención en sessionStorage, splash + navegación a /{locale}.
 * - Contacto/Contact:
 *    - Siempre lanza splash con fondo entrando de izquierda a derecha
 *      y deja que el Link navegue a /es/servicios/personalizado o /en/services/custom.
 */
export default function BottomDock() {
  const pathname = usePathname();

  // Inferimos el locale desde la URL: /es/... | /en/...
  const locale = React.useMemo<"es" | "en" | undefined>(() => {
    if (!pathname) return undefined;
    const [, first] = pathname.split("/");
    if (first === "es" || first === "en") return first;
    return undefined;
  }, [pathname]);

  const basePath = `/${locale ?? "es"}`;

  // Navegación i18n (Home / Precios / Contacto o Home / Pricing / Contact)
  const nav: NavItem[] = buildNav(locale);

  const handleClick = React.useCallback(
    (
      event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
      item: NavItem,
    ) => {
      if (isModifiedClick(event)) return; // respetar cmd+click, middle-click, etc.

      const id = item.id;

      // HOME
      if (id === "home") {
        // Siempre mostramos el overlay para la transición
        startTransitionOverlay({
          target: "hero",
          locale,
          durationMs: 1200,
        });

        // Si ya estamos en el home del locale → no navegamos, solo reposicionamos
        if (pathname === basePath) {
          event.preventDefault();

          window.setTimeout(() => {
            const jumped = jumpToFirstExistingId(["hero", "features"]);
            if (!jumped && typeof window !== "undefined") {
              window.scrollTo({ top: 0, behavior: "auto" });
            }
          }, 150);
        }
        // Si NO estamos en /{locale}, dejamos que el Link navegue normal
        return;
      }

      // PRICING
      if (id === "pricing") {
        // Siempre mostramos el overlay para la transición
        startTransitionOverlay({
          target: "pricing",
          locale,
          durationMs: 1200,
        });

        // Si ya estamos en el home del locale → posicionamos directamente
        if (pathname === basePath) {
          event.preventDefault();

          const idsToTry =
            locale === "en"
              ? ["pricing", "precios"]
              : ["precios", "pricing"];

          window.setTimeout(() => {
            jumpToFirstExistingId(idsToTry);
          }, 150);

          return;
        }

        // Si NO estamos en /{locale}, guardamos que el usuario quería ir a "pricing"
        // para que el home pueda reposicionarlo al montar.
        if (typeof window !== "undefined") {
          try {
            window.sessionStorage.setItem("bc_target_section", "pricing");
          } catch {
            // ignoramos errores de storage
          }
        }

        // No hacemos preventDefault -> dejamos que el Link lleve a /es o /en
        return;
      }

      // CONTACT → splash con animación izquierda→derecha + navegación normal
      if (id === "contact") {
        startTransitionOverlay({
          target: "contact",
          locale,
          durationMs: 1200,
        });
        // No hacemos preventDefault: dejamos que el Link navegue al detalle personalizado
        return;
      }

      // Otros posibles items → comportamiento normal
    },
    [basePath, locale, pathname],
  );

  return (
    <div
      className={[
        "fixed bottom-0 left-0 right-0 z-[var(--z-header)]",
        "pointer-events-none",
        "pb-[env(safe-area-inset-bottom)]",
      ].join(" ")}
      aria-label="Dock de navegación"
    >
      {/* Un poco menos alto en conjunto */}
      <Container className="relative flex items-end justify-center py-2 md:py-2.5">
        {/* CENTRO: Píldora tipo cristal (blur blanco suave + borde plomizo) */}
        <div className={glassPillClassName()}>
          <nav aria-label="Principal">
            <ul className="flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:px-3 md:py-1.5">
              {nav.map((item) => (
                <li key={item.id ?? `${item.label}-${item.href}`}>
                  <NavLink
                    href={item.href}
                    onClickAction={(event) => handleClick(event, item)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* DERECHA: Socials */}
        <div className="pointer-events-auto absolute right-4 md:right-6 bottom-3 md:bottom-3.5">
          <Social bare size="md" />
        </div>
      </Container>
    </div>
  );
}

/**
 * Píldora con efecto cristal:
 * - Blur suave
 * - Fondo translúcido tirando a blanco (no blanco sólido)
 * - Borde plomizo (gris derivado de var(--border))
 *
 * Visualmente se aproxima a:
 * background: #ffffffb3;
 * backdrop-filter: blur(.75rem);
 * box-shadow: 0 .375rem 1.5625rem #00000014;
 */
function glassPillClassName(): string {
  return [
    "pointer-events-auto rounded-full",
    // Blur tipo cristal
    "backdrop-blur-[0.75rem]",
    // Fondo claro translúcido (blanco suave)
    "bg-[color:color-mix(in_srgb,white_70%,transparent)]",
    // Borde plomizo derivado del token de borde
    "border border-[color:color-mix(in_srgb,var(--border)_80%,transparent)]",
    // Sombra suave similar a 0 .375rem 1.5625rem #00000014
    "shadow-[0_0.375rem_1.5625rem_rgba(0,0,0,0.08)]",
  ].join(" ");
}
