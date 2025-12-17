'use client';

import { useEffect, useRef } from 'react';

type Options = {
  /** Si es true, compensa el ancho de la barra de scroll con padding-right en el body */
  reserveScrollbarGap?: boolean;
  /** Elemento a bloquear; por defecto document.body */
  lockTarget?: HTMLElement | null;
};

/**
 * Bloquea el scroll del body cuando `active` es true.
 * Reestablece el estilo original al desactivarse o desmontarse.
 */
export function useLockBodyScroll(active: boolean, options: Options = {}): void {
  const { reserveScrollbarGap = true, lockTarget } = options;
  const originalOverflowRef = useRef<string | null>(null);
  const originalPaddingRightRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const target = lockTarget ?? document.body;
    if (!target) return;

    if (active) {
      // Guardar estilos originales solo la primera vez
      if (originalOverflowRef.current === null) {
        originalOverflowRef.current = target.style.overflow;
      }
      if (reserveScrollbarGap && originalPaddingRightRef.current === null) {
        originalPaddingRightRef.current = target.style.paddingRight;
      }

      const scrollBarGap =
        reserveScrollbarGap
          ? window.innerWidth - document.documentElement.clientWidth
          : 0;

      target.style.overflow = 'hidden';
      if (reserveScrollbarGap && scrollBarGap > 0) {
        target.style.paddingRight = `${scrollBarGap}px`;
      }
    } else {
      // Restaurar
      if (originalOverflowRef.current !== null) {
        target.style.overflow = originalOverflowRef.current;
        originalOverflowRef.current = null;
      }
      if (reserveScrollbarGap && originalPaddingRightRef.current !== null) {
        target.style.paddingRight = originalPaddingRightRef.current;
        originalPaddingRightRef.current = null;
      }
    }

    return () => {
      // Cleanup al desmontar
      if (originalOverflowRef.current !== null) {
        target.style.overflow = originalOverflowRef.current;
        originalOverflowRef.current = null;
      }
      if (reserveScrollbarGap && originalPaddingRightRef.current !== null) {
        target.style.paddingRight = originalPaddingRightRef.current;
        originalPaddingRightRef.current = null;
      }
    };
  }, [active, reserveScrollbarGap, lockTarget]);
}
