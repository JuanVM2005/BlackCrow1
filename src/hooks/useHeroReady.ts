// src/hooks/useHeroReady.ts
"use client";

import * as React from "react";

export type HeroReadyState = {
  /** true cuando el Hero (incl. 3D) ya está listo para mostrarse */
  ready: boolean;
  /** marca el hero como listo */
  setReady: (value?: boolean) => void;
  /** vuelve a estado inicial (por ejemplo al cambiar de ruta) */
  reset: () => void;
};

const HeroReadyContext = React.createContext<HeroReadyState | null>(null);

type ProviderProps = { children: React.ReactNode };

export function HeroReadyProvider({ children }: ProviderProps) {
  // ✅ hooks SIEMPRE en el mismo orden, sin returns tempranos
  const [ready, setReadyState] = React.useState<boolean>(false);

  const setReady = React.useCallback((value: boolean = true) => {
    setReadyState(value);
  }, []);

  const reset = React.useCallback(() => {
    setReadyState(false);
  }, []);

  const value = React.useMemo<HeroReadyState>(
    () => ({ ready, setReady, reset }),
    [ready, setReady, reset],
  );

  // ✅ sin JSX (archivo .ts)
  return React.createElement(
    HeroReadyContext.Provider,
    { value },
    children,
  );
}

/**
 * Hook de lectura/escritura del estado "Hero listo".
 * Requiere envolver la app con <HeroReadyProvider />.
 */
export function useHeroReady(): HeroReadyState {
  const ctx = React.useContext(HeroReadyContext);
  if (!ctx) {
    throw new Error("useHeroReady debe usarse dentro de <HeroReadyProvider />");
  }
  return ctx;
}
