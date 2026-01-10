// src/hooks/useIntersectionObserver.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  /** Elemento raíz para el IO (default: viewport) */
  root?: Element | null;
  /** Root margin, ej. '0px 0px -10% 0px' */
  rootMargin?: string;
  /** Umbral(es) de intersección */
  threshold?: number | number[];
  /** Si es true, una vez visible deja de observar (default: true) */
  once?: boolean;
  /**
   * Estado inicial para SSR o navegadores sin IO.
   * ✅ Default ahora es false para evitar “aparece antes de tiempo”.
   */
  initialInView?: boolean;
};

type UseIOResult<T extends Element> = {
  /** Ref a asignar al elemento observado */
  ref: (node: T | null) => void;
  /** Está en viewport según el threshold */
  inView: boolean;
  /** Última entrada del observer */
  entry: IntersectionObserverEntry | null;
};

/**
 * Observa si un elemento entra al viewport y expone `inView`.
 * Uso:
 *   const { ref, inView } = useIntersectionObserver<HTMLDivElement>({ threshold: 0.15 });
 *   return <div ref={ref} className={inView ? 'opacity-100' : 'opacity-0'} />;
 */
export function useIntersectionObserver<T extends Element = Element>(
  {
    root = null,
    rootMargin,
    threshold,
    once = true,
    initialInView = false, // ✅ antes era true
  }: Options = {},
): UseIOResult<T> {
  const [inView, setInView] = useState<boolean>(initialInView);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const nodeRef = useRef<T | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const cleanup = useCallback(() => {
    if (observerRef.current && nodeRef.current) {
      try {
        observerRef.current.unobserve(nodeRef.current);
      } catch {
        // noop
      }
    }
    observerRef.current?.disconnect();
    observerRef.current = null;
  }, []);

  const ref = useCallback(
    (node: T | null) => {
      // Detach de anterior
      cleanup();
      nodeRef.current = node;

      if (!node) return;

      if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
        // Sin soporte: deja visible por defecto para no bloquear contenido
        setInView(true);
        setEntry(null);
        return;
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const first = entries[0];
          setEntry(first);

          const isVisible =
            Boolean(first?.isIntersecting) && (first?.intersectionRatio ?? 0) > 0;

          setInView(isVisible);

          if (isVisible && once && observerRef.current && nodeRef.current) {
            try {
              observerRef.current.unobserve(nodeRef.current);
            } catch {
              // noop
            }
          }
        },
        { root: root ?? null, rootMargin, threshold },
      );

      try {
        observerRef.current.observe(node);
      } catch {
        // Si falla por algún motivo, no rompemos la UI
        setInView(true);
      }
    },
    [cleanup, root, rootMargin, threshold, once],
  );

  useEffect(() => cleanup, [cleanup]);

  return { ref, inView, entry };
}
