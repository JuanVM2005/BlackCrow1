'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type Options = {
  initialOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onToggle?: (open: boolean) => void;
};

type UseDisclosureReturn = {
  open: boolean;
  openPanel: () => void;
  closePanel: () => void;
  toggle: () => void;
  setOpen: (next: boolean) => void;
};

export function useDisclosure(options: Options = {}): UseDisclosureReturn {
  const { initialOpen = false, onOpen, onClose, onToggle } = options;
  const [open, setOpen] = useState<boolean>(initialOpen);

  const openPanel = useCallback(() => setOpen(true), []);
  const closePanel = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  // Callbacks on state change
  useEffect(() => {
    if (open) onOpen?.();
    else onClose?.();
    onToggle?.(open);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return useMemo(
    () => ({ open, openPanel, closePanel, toggle, setOpen }),
    [open, openPanel, closePanel, toggle]
  );
}
