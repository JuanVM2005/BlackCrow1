'use client';

import { useEffect, useMemo, useRef } from 'react';

type Target = Document | Window | HTMLElement;

type Options = {
  /** 'keydown' (default) o 'keyup' */
  eventType?: 'keydown' | 'keyup';
  /** Documento/ventana/elemento destino (default: document) */
  target?: Target | null;
  /** Habilitar/deshabilitar (default: true) */
  enabled?: boolean;
  /** Si es true, llama preventDefault cuando el atajo coincida (default: false) */
  preventDefault?: boolean;
  /** Si es true, detiene propagación cuando coincida (default: false) */
  stopPropagation?: boolean;
};

type KeyCombo = string | string[];

/**
 * Registra un atajo de teclado (e.g. 'Escape', 'ctrl+k', 'mod+/' )
 *  - 'mod' = meta (mac) o ctrl (win/linux)
 *  - Soporta múltiples combinaciones: ['ctrl+k', 'Escape']
 */
export function useKeyboardShortcut(
  combo: KeyCombo,
  handler: (event: KeyboardEvent) => void,
  options: Options = {}
): void {
  const {
    eventType = 'keydown',
    target = typeof document !== 'undefined' ? document : null,
    enabled = true,
    preventDefault = false,
    stopPropagation = false,
  } = options;

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const isMac = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
  }, []);

  // Normaliza combinaciones a una estructura comparable
  const combos = useMemo(() => {
    const list = Array.isArray(combo) ? combo : [combo];

    const normalize = (c: string) => {
      const parts = c.trim().toLowerCase().split('+').map((p) => p.trim());
      const mods = {
        ctrl: parts.includes('ctrl'),
        alt: parts.includes('alt'),
        shift: parts.includes('shift'),
        meta: parts.includes('meta'),
        mod: parts.includes('mod'),
      };
      const key = parts.find(
        (p) => !['ctrl', 'alt', 'shift', 'meta', 'mod'].includes(p)
      ) ?? '';

      return { key, mods };
    };

    return list.map(normalize);
  }, [combo]);

  useEffect(() => {
    if (!enabled || !target) return;
    if (typeof target.addEventListener !== 'function') return;

    const matchCombo = (event: KeyboardEvent) => {
      const eventKey = (event.key || '').toLowerCase();

      // Intenta matchear con alguna de las combinaciones
      return combos.some(({ key, mods }) => {
        const wantCtrl = mods.ctrl || (mods.mod && !isMac);
        const wantMeta = mods.meta || (mods.mod && isMac);
        const wantAlt = mods.alt;
        const wantShift = mods.shift;

        const modsOk =
          event.ctrlKey === !!wantCtrl &&
          event.metaKey === !!wantMeta &&
          event.altKey === !!wantAlt &&
          event.shiftKey === !!wantShift;

        // Si key está vacío, aceptar solo por modifiers (raro, pero posible)
        const keyOk = key ? eventKey === key : true;

        return modsOk && keyOk;
      });
    };

    const listener = (e: KeyboardEvent) => {
      if (!matchCombo(e)) return;

      if (preventDefault) e.preventDefault();
      if (stopPropagation) e.stopPropagation();

      handlerRef.current?.(e);
    };

    target.addEventListener(eventType, listener as EventListener);

    return () => {
      target.removeEventListener(eventType, listener as EventListener);
    };
  }, [enabled, target, eventType, combos, isMac, preventDefault, stopPropagation]);
}
