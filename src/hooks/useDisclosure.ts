"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Options = {
  initialOpen?: boolean;

  /**
   * Next exige que funciones pasadas como "props" en entry client
   * se llamen `action` o terminen en `Action`.
   */
  onOpenAction?: () => void;
  onCloseAction?: () => void;
  onToggleAction?: (open: boolean) => void;
};

type UseDisclosureReturn = {
  open: boolean;
  openPanel: () => void;
  closePanel: () => void;
  toggle: () => void;
  setOpen: (next: boolean) => void;
};

export function useDisclosure(options: Options = {}): UseDisclosureReturn {
  const {
    initialOpen = false,
    onOpenAction,
    onCloseAction,
    onToggleAction,
  } = options;

  const [open, setOpen] = useState<boolean>(initialOpen);

  const openPanel = useCallback(() => setOpen(true), []);
  const closePanel = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    if (open) onOpenAction?.();
    else onCloseAction?.();

    onToggleAction?.(open);
  }, [open, onOpenAction, onCloseAction, onToggleAction]);

  return useMemo(
    () => ({ open, openPanel, closePanel, toggle, setOpen }),
    [open, openPanel, closePanel, toggle],
  );
}
