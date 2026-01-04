"use client";

import * as React from "react";

type AnchorEl = HTMLElement | null;

export type PhoneAnchorsCtx = {
  /** Fin de Interactive3D (donde “nace” el iPhone) */
  startEl: AnchorEl;
  /** Slot dentro de la Card 3 (destino) */
  targetEl: AnchorEl;

  setStartEl: (el: AnchorEl) => void;
  setTargetEl: (el: AnchorEl) => void;

  /** Callbacks listos para usar en refs */
  startRef: (el: AnchorEl) => void;
  targetRef: (el: AnchorEl) => void;
};

const PhoneAnchorsContext = React.createContext<PhoneAnchorsCtx | null>(null);

export function PhoneAnchorsProvider(props: { children: React.ReactNode }) {
  const [startEl, _setStartEl] = React.useState<AnchorEl>(null);
  const [targetEl, _setTargetEl] = React.useState<AnchorEl>(null);

  const setStartEl = React.useCallback((el: AnchorEl) => _setStartEl(el), []);
  const setTargetEl = React.useCallback((el: AnchorEl) => _setTargetEl(el), []);

  const startRef = React.useCallback((el: AnchorEl) => _setStartEl(el), []);
  const targetRef = React.useCallback((el: AnchorEl) => _setTargetEl(el), []);

  const value = React.useMemo<PhoneAnchorsCtx>(
    () => ({
      startEl,
      targetEl,
      setStartEl,
      setTargetEl,
      startRef,
      targetRef,
    }),
    [startEl, targetEl, setStartEl, setTargetEl, startRef, targetRef],
  );

  // ✅ Sin JSX, para poder mantener el archivo en .ts
  return React.createElement(
    PhoneAnchorsContext.Provider,
    { value },
    props.children,
  );
}

export function usePhoneAnchors(): PhoneAnchorsCtx {
  const ctx = React.useContext(PhoneAnchorsContext);
  if (!ctx) {
    throw new Error(
      "usePhoneAnchors must be used within <PhoneAnchorsProvider />",
    );
  }
  return ctx;
}

