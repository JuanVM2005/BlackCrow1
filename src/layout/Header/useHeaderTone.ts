// src/layout/Header/useHeaderTone.ts
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

export type HeaderTone = "base" | "inverse";

type Options = {
  /**
   * Qué tan “pronto” cambia el tono al acercarse una sección.
   * - Valores típicos: "-10% 0px -70% 0px" (cambia antes)
   * - Si quieres más tarde: "0px 0px -70% 0px"
   */
  rootMargin?: string;
};

/**
 * Observa wrappers con `data-surface="base|inverse"` (landing)
 * y decide el tono del header según la sección dominante en viewport.
 *
 * - Si no hay elementos con data-surface, cae a "base".
 * - No rompe otras rutas.
 */
export function useHeaderTone(options?: Options): HeaderTone {
  const pathname = usePathname() || "/";
  const [tone, setTone] = React.useState<HeaderTone>("base");

  React.useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-surface]"),
    );

    if (els.length === 0) {
      setTone("base");
      return;
    }

    const ratios = new Map<Element, number>();

    const pickDominant = () => {
      let bestEl: Element | null = null;
      let best = 0;

      for (const [el, r] of ratios.entries()) {
        if (r > best) {
          best = r;
          bestEl = el;
        }
      }

      const s = (bestEl as HTMLElement | null)?.dataset?.surface;
      setTone(s === "inverse" ? "inverse" : "base");
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          ratios.set(e.target, e.isIntersecting ? e.intersectionRatio : 0);
        }
        pickDominant();
      },
      {
        root: null,
        rootMargin: options?.rootMargin ?? "-10% 0px -70% 0px",
        threshold: [0, 0.1, 0.25, 0.4, 0.6, 0.8, 1],
      },
    );

    for (const el of els) io.observe(el);

    // Inicial (por si recargas ya scrolleado)
    requestAnimationFrame(() => pickDominant());

    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, options?.rootMargin]);

  return tone;
}
