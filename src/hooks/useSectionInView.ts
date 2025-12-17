// src/hooks/useSectionInView.ts
import * as React from "react";

export type UseSectionInViewOptions = {
  /** Margen del viewport para disparar antes/después de entrar (ej: "0px 0px -40% 0px") */
  rootMargin?: string;
  /** Umbral de visibilidad (0–1 o array). Por defecto 0.25 = 25% visible. */
  threshold?: number | number[];
  /**
   * Si es true, cuando la sección entra por primera vez en el viewport
   * se queda en `true` aunque luego salga.
   */
  once?: boolean;
  /** Estado inicial en SSR / antes de que cargue el observer */
  initialInView?: boolean;
};

export type UseSectionInViewResult<T extends HTMLElement = HTMLElement> = {
  /** Ref que debes asignar al `<section>` o contenedor que quieras observar */
  ref: React.RefObject<T | null>;
  /** `true` si la sección está (o ha estado) visible según la config */
  inView: boolean;
  /** Último IntersectionObserverEntry recibido (por si necesitas más datos) */
  entry: IntersectionObserverEntry | null;
};

/**
 * Hook pequeño para saber si una sección está visible en viewport.
 *
 * Ejemplo:
 *   const { ref, inView } = useSectionInView<HTMLDivElement>();
 *   <section ref={ref}>...</section>
 */
export function useSectionInView<T extends HTMLElement = HTMLElement>(
  {
    rootMargin = "0px 0px -40% 0px",
    threshold = 0.25,
    once = false,
    initialInView = false,
  }: UseSectionInViewOptions = {},
): UseSectionInViewResult<T> {
  const targetRef = React.useRef<T | null>(null);
  const [inView, setInView] = React.useState<boolean>(initialInView);
  const [entry, setEntry] = React.useState<IntersectionObserverEntry | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      // Sin soporte: no hacemos nada; dejamos el estado inicial.
      return;
    }

    const node = targetRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [first] = entries;
        if (!first) return;

        setEntry(first);

        if (first.isIntersecting) {
          setInView(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setInView(false);
        }
      },
      {
        root: null,
        rootMargin,
        threshold,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, once, JSON.stringify(threshold)]);

  return { ref: targetRef, inView, entry };
}

export default useSectionInView;
