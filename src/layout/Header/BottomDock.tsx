// src/layout/Header/BottomDock.tsx
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import Container from "@/ui/Container";
import NavLink from "./NavLink";
import Social from "./Social";
import { buildNav, type NavItem } from "@/config/site";
import { startTransitionOverlay } from "@/layout/RootProviders/TransitionOverlay.client";
import { cn } from "@/utils/cn";

type HeaderTone = "base" | "inverse";

type Props = {
  /** Controlado por Header según la sección dominante (data-surface). */
  tone?: HeaderTone;
};

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

export default function BottomDock({ tone = "base" }: Props) {
  const pathname = usePathname();

  const locale = React.useMemo<"es" | "en" | undefined>(() => {
    if (!pathname) return undefined;
    const [, first] = pathname.split("/");
    if (first === "es" || first === "en") return first;
    return undefined;
  }, [pathname]);

  const basePath = `/${locale ?? "es"}`;
  const nav: NavItem[] = buildNav(locale);

  const handleClick = React.useCallback(
    (
      event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
      item: NavItem,
    ) => {
      if (isModifiedClick(event)) return;

      const id = item.id;

      if (id === "home") {
        startTransitionOverlay({ target: "hero", locale, durationMs: 1200 });

        if (pathname === basePath) {
          event.preventDefault();
          window.setTimeout(() => {
            const jumped = jumpToFirstExistingId(["hero", "features"]);
            if (!jumped && typeof window !== "undefined") {
              window.scrollTo({ top: 0, behavior: "auto" });
            }
          }, 150);
        }
        return;
      }

      if (id === "pricing") {
        startTransitionOverlay({ target: "pricing", locale, durationMs: 1200 });

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

        if (typeof window !== "undefined") {
          try {
            window.sessionStorage.setItem("bc_target_section", "pricing");
          } catch {}
        }

        return;
      }

      if (id === "contact") {
        startTransitionOverlay({ target: "contact", locale, durationMs: 1200 });
        return;
      }
    },
    [basePath, locale, pathname],
  );

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-(--z-header)",
        // ✅ un poco más arriba
        "bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] md:bottom-[calc(env(safe-area-inset-bottom)+1.4rem)]",
        "pointer-events-none",
      )}
      aria-label="Dock de navegación"
      data-header-tone={tone}
    >
      <Container className="relative flex items-end justify-center">
        <div className={glassPillClassName()}>
          <nav aria-label="Principal">
            {/* ✅ más separación entre items + padding moderado (no tan ancho) */}
            <ul className="flex items-center justify-center gap-2.5 md:gap-3 px-3.5 py-1.5 md:px-4 md:py-2">
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

        <div
          className={cn(
            "pointer-events-auto absolute right-4 md:right-6",
            "top-1/2 -translate-y-1/2",
            tone === "inverse" ? "text-(--text-inverse)" : "text-(--text)",
          )}
        >
          <Social bare size="md" />
        </div>
      </Container>
    </div>
  );
}

function glassPillClassName(): string {
  return [
    "pointer-events-auto rounded-full",
    "backdrop-blur-[0.75rem]",
    "bg-[color:color-mix(in_srgb,white_70%,transparent)]",
    "border border-[color:color-mix(in_srgb,var(--border)_80%,transparent)]",
    "shadow-[0_0.375rem_1.5625rem_rgba(0,0,0,0.08)]",
    // ✅ menos ancho que antes, pero consistente
    "min-w-[15.5rem] md:min-w-[18rem]",
  ].join(" ");
}
