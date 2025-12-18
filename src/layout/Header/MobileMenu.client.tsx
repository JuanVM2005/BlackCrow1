// src/layout/Header/MobileMenu.client.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import Container from "@/ui/Container";
import Button, { ButtonArrow } from "@/ui/Button";
import { Text } from "@/ui/Typography";

import { cn } from "@/utils/cn";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

import LanguageSwitch from "./LanguageSwitch";
import Social from "./Social";

import { buildNav, type NavItem } from "@/config/site";
import { startTransitionOverlay } from "@/layout/RootProviders/TransitionOverlay.client";

type Props = {
  locale?: string;
  ctaLabel?: string;
};

function normalizeLocale(locale?: string) {
  return (locale || "es").toLowerCase().startsWith("en") ? "en" : "es";
}

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

function IconMenu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClose(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function MobileMenu({ locale: rawLocale, ctaLabel }: Props) {
  const pathname = usePathname();

  const inferredLocale = React.useMemo<"es" | "en">(() => {
    const p = pathname || "/es";
    const [, first] = p.split("/");
    return first === "en" ? "en" : "es";
  }, [pathname]);

  const locale = normalizeLocale(rawLocale ?? inferredLocale) as "es" | "en";

  const [open, setOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  useLockBodyScroll(open);
  useOnClickOutside(panelRef, () => setOpen(false));
  useKeyboardShortcut("Escape", () => setOpen(false));

  const close = React.useCallback(() => setOpen(false), []);
  const toggle = React.useCallback(() => setOpen((v) => !v), []);

  const basePath = `/${locale}`;
  const nav: NavItem[] = React.useMemo(() => buildNav(locale), [locale]);

  // ✅ CTA EXACTAMENTE IGUAL que TopBar
  const ctaHref =
    locale === "es"
      ? `/${locale}/servicios/personalizado`
      : `/${locale}/services/custom`;

  const ctaText =
    ctaLabel ?? (locale === "en" ? "Start your project" : "Empieza tu proyecto");

  // ✅ Misma lógica del BottomDock (idéntica intención/UX)
  const handleNavClick = React.useCallback(
    (
      event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
      item: NavItem,
    ) => {
      if (isModifiedClick(event)) return;

      const id = item.id;
      const currentPath = pathname || basePath;

      // HOME
      if (id === "home") {
        startTransitionOverlay({ target: "hero", locale, durationMs: 1200 });

        if (currentPath === basePath) {
          event.preventDefault();

          window.setTimeout(() => {
            const jumped = jumpToFirstExistingId(["hero", "features"]);
            if (!jumped) window.scrollTo({ top: 0, behavior: "auto" });
          }, 150);
        }
        return;
      }

      // PRICING
      if (id === "pricing") {
        startTransitionOverlay({ target: "pricing", locale, durationMs: 1200 });

        if (currentPath === basePath) {
          event.preventDefault();

          const idsToTry =
            locale === "en" ? ["pricing", "precios"] : ["precios", "pricing"];

          window.setTimeout(() => {
            jumpToFirstExistingId(idsToTry);
          }, 150);

          return;
        }

        try {
          window.sessionStorage.setItem("bc_target_section", "pricing");
        } catch {}

        return; // deja navegar a /{locale}
      }

      // CONTACT
      if (id === "contact") {
        startTransitionOverlay({ target: "contact", locale, durationMs: 1200 });
        return;
      }
    },
    [basePath, locale, pathname],
  );

  // ✅ Transición para CTA (igual idea que “contact” del dock: overlay + navegación normal)
  const handleCtaClick = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      if (isModifiedClick(event)) return;
      startTransitionOverlay({ target: "contact", locale, durationMs: 1200 });
    },
    [locale],
  );

  const a11y = React.useMemo(() => {
    return locale === "en"
      ? { open: "Open menu", close: "Close menu", title: "Main menu" }
      : { open: "Abrir menú", close: "Cerrar menú", title: "Menú principal" };
  }, [locale]);

  return (
    <>
      {/* Trigger fijo arriba (solo mobile) */}
      <div className="fixed left-0 right-0 top-0 z-(--z-header) pointer-events-none">
        <Container>
          <div className="flex items-center justify-end py-3 pointer-events-auto">
            <button
              type="button"
              onClick={toggle}
              aria-label={open ? a11y.close : a11y.open}
              aria-expanded={open}
              aria-controls="mobile-menu-sheet"
              className={cn(
                "inline-flex items-center justify-center",
                "rounded-(--radius-full)",
                "border border-(--border)",
                "bg-(--surface) text-(--text)",
                "shadow-(--shadow-sm)",
                "h-11 w-11",
              )}
            >
              {open ? (
                <IconClose className="h-5 w-5" />
              ) : (
                <IconMenu className="h-5 w-5" />
              )}
            </button>
          </div>
        </Container>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-(--z-overlay)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "color-mix(in oklab, var(--surface-inverse) 22%, transparent)",
              }}
              onClick={close}
              aria-hidden="true"
            />

            {/* Sheet/Card flotante */}
            <div className="absolute inset-0 pointer-events-none">
              <Container>
                <motion.div
                  ref={panelRef}
                  id="mobile-menu-sheet"
                  role="dialog"
                  aria-modal="true"
                  className={cn(
                    "pointer-events-auto",
                    "mt-3",
                    "rounded-(--radius-2xl)",
                    "border border-(--border)",
                    "bg-(--surface) text-(--text)",
                    "shadow-(--shadow-xl)",
                    "overflow-hidden",
                  )}
                  initial={{ y: -10, opacity: 0, scale: 0.985 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -10, opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <div className="px-5 pt-5 pb-6">
                    {/* Header interno */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Text as="p" size="sm" className="text-(--text-muted)">
                          {a11y.title}
                        </Text>
                      </div>

                      <button
                        type="button"
                        onClick={close}
                        aria-label={a11y.close}
                        className={cn(
                          "inline-flex items-center justify-center",
                          "rounded-(--radius-full)",
                          "border border-(--border)",
                          "bg-(--surface) text-(--text)",
                          "shadow-(--shadow-xs)",
                          "h-12 w-12",
                        )}
                      >
                        <IconClose className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Idioma */}
                    <div className="mt-4">
                      <LanguageSwitch />
                    </div>

                    {/* Links: MISMA nav + MISMA lógica del Dock */}
                    <nav className="mt-4" aria-label={a11y.title}>
                      <ul className="grid gap-4">
                        {nav.map((item) => (
                          <li key={item.id ?? `${item.label}-${item.href}`}>
                            <Link
                              href={item.href}
                              onClick={(e) => {
                                handleNavClick(e, item);
                                if (!isModifiedClick(e)) close();
                              }}
                              className={cn(
                                "block",
                                "rounded-(--radius-lg)",
                                "px-1 py-1",
                                "transition-colors duration-200",
                                "hover:text-(--pink-500)",
                                "focus-visible:outline-none focus-visible:ring-2",
                                "focus-visible:ring-(--ring) focus-visible:ring-offset-2",
                              )}
                            >
                              <span className="text-3xl leading-[1.08] font-medium">
                                {item.label}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </nav>

                    {/* CTA: ahora EXACTAMENTE igual que TopBar */}
                    <div className="mt-6">
                      <Button
                        asChild
                        variant="solid"
                        size="lg"
                        className="w-full rounded-full"
                      >
                        <Link
                          href={ctaHref}
                          onClick={(e) => {
                            handleCtaClick(e);
                            if (!isModifiedClick(e)) close();
                          }}
                          className="inline-flex w-full justify-between"
                          aria-label={ctaText}
                        >
                          <span>{ctaText}</span>
                          <ButtonArrow />
                        </Link>
                      </Button>
                    </div>

                    {/* Social */}
                    <div className="mt-5">
                      <Social />
                    </div>
                  </div>
                </motion.div>
              </Container>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
