"use client";

// src/hooks/usePrefersReducedMotion.ts
import { useSyncExternalStore } from "react";

/**
 * Detecta `prefers-reduced-motion: reduce` de forma SSR-safe y reactiva.
 */
export function usePrefersReducedMotion(options?: { defaultValue?: boolean }): boolean {
  const defaultValue = options?.defaultValue ?? false;
  const query = "(prefers-reduced-motion: reduce)";

  const subscribe = (onChange: () => void) => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return () => {};
    }
    const mql = window.matchMedia(query);
    const handler = () => onChange();
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    } else {
      // @ts-ignore legacy
      mql.addListener(handler);
      // @ts-ignore legacy
      return () => mql.removeListener(handler);
    }
  };

  const getSnapshot = () => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return defaultValue;
    }
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => defaultValue;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default usePrefersReducedMotion;
