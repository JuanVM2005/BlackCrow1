// src/features/landing/ui/HomeSectionJump.client.tsx
"use client";

import * as React from "react";

const TARGET_KEY = "bc_target_section";

/**
 * Intenta posicionar instantáneamente (sin animación) en el primer id existente.
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
 * Componente cliente que se monta solo en la Home.
 *
 * Caso típico:
 * - Estabas en /es/servicios/personalizado
 * - Pulsas "Precios" en el dock
 * - BottomDock guarda bc_target_section = "pricing" y navega a /es
 * - Al montar la home, este componente:
 *    - lee la clave
 *    - ✅ la consume (la borra) inmediatamente para evitar saltos en recargas
 *    - espera a que el layout esté listo
 *    - reintenta varias veces hasta encontrar la sección
 *    - salta directo a ella (sin scroll suave)
 */
export default function HomeSectionJump() {
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const target = window.sessionStorage.getItem(TARGET_KEY);
    if (!target) return;

    // ✅ Consumimos la intención apenas se lee (evita “saltos fantasmas” al recargar)
    try {
      window.sessionStorage.removeItem(TARGET_KEY);
    } catch {
      // ignoramos errores de storage
    }

    let cancelled = false;

    const resolveIdsForTarget = (t: string): string[] => {
      if (t === "pricing") {
        // Compatibilidad ES/EN
        return ["pricing", "precios"];
      }
      if (t === "hero") {
        // Hero puede estar marcado como hero o features
        return ["hero", "features"];
      }
      // Fallback genérico
      return [t];
    };

    const ids = resolveIdsForTarget(target);

    // Esperamos un poco para dejar que el layout del home se monte
    const initialDelay = 300; // ms
    const intervalDelay = 120; // ms entre intentos
    const maxAttempts = 20; // ~2.4s máximo de reintentos

    let attempts = 0;
    let intervalId: number | null = null;

    const startInterval = () => {
      if (cancelled) return;

      intervalId = window.setInterval(() => {
        if (cancelled) return;

        attempts += 1;

        const jumped = jumpToFirstExistingId(ids);

        if (jumped) {
          if (intervalId !== null) {
            window.clearInterval(intervalId);
            intervalId = null;
          }
        } else if (attempts >= maxAttempts) {
          if (intervalId !== null) {
            window.clearInterval(intervalId);
            intervalId = null;
          }
        }
      }, intervalDelay);
    };

    const timeoutId = window.setTimeout(startInterval, initialDelay);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  return null;
}
