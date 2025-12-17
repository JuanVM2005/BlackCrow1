'use client';

import type { RefObject } from 'react';
import { useEffect } from 'react';

type MaybeRef = RefObject<HTMLElement | null> | HTMLElement | null | undefined;

type Options = {
  /** Habilita/deshabilita el hook (default: true) */
  enabled?: boolean;
  /** Eventos a escuchar (default: ['mousedown', 'touchstart']) */
  events?: Array<'mousedown' | 'mouseup' | 'click' | 'touchstart' | 'touchend'>;
  /** Elementos que se consideran “dentro” aunque estén fuera del ref principal */
  excludeRefs?: MaybeRef[];
};

/** Type guard: ¿es un RefObject<HTMLElement | null>? */
function isRef(el: MaybeRef): el is RefObject<HTMLElement | null> {
  return !!el && typeof el === 'object' && 'current' in el;
}

/** Normaliza a HTMLElement | null */
function toNode(el: MaybeRef): HTMLElement | null {
  if (!el) return null;
  return isRef(el) ? el.current : el;
}

/**
 * Ejecuta `handler` cuando se hace click/touch fuera del elemento `ref`.
 */
export function useOnClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
  options: Options = {}
): void {
  const {
    enabled = true,
    events = ['mousedown', 'touchstart'],
    excludeRefs = [],
  } = options;

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const root = ref.current;

    const isInside = (target: EventTarget | null) => {
      if (!target || !(target instanceof Node)) return false;

      // 1) Dentro del elemento principal
      if (root && root.contains(target)) return true;

      // 2) Dentro de alguna exclusión
      for (const ex of excludeRefs) {
        const node = toNode(ex);
        if (node && node.contains(target)) return true;
      }

      return false;
    };

    const listener = (event: MouseEvent | TouchEvent) => {
      if (isInside(event.target)) return;
      handler(event);
    };

    events.forEach((evt) =>
      document.addEventListener(evt, listener as EventListener, { passive: true }),
    );

    return () => {
      events.forEach((evt) =>
        document.removeEventListener(evt, listener as EventListener),
      );
    };
  }, [enabled, events, excludeRefs, handler, ref]);
}
