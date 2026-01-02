// src/ui/Modal/index.tsx
"use client";

import * as React from "react";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import { cn } from "@/utils/cn";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

export type ModalProps = {
  open: boolean;
  onOpenChangeAction: (next: boolean) => void;
  titleId?: string;
  descId?: string;
  initialFocusRef?: React.RefObject<HTMLElement>;
  className?: string;
  overlayClassName?: string;
  children: React.ReactNode;
};

export default function Modal({
  open,
  onOpenChangeAction,
  titleId,
  descId,
  initialFocusRef,
  className,
  overlayClassName,
  children,
}: ModalProps) {
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const dialogRef = React.useRef<HTMLDivElement | null>(null);

  useLockBodyScroll(open);

  /* =========================================================
     Escape → cerrar
     ========================================================= */
  React.useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onOpenChangeAction(false);
      }
    };

    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, onOpenChangeAction]);

  /* =========================================================
     Focus trap
     ========================================================= */
  React.useEffect(() => {
    if (!open) return;

    const root = dialogRef.current;
    if (!root) return;

    const focusTarget =
      initialFocusRef?.current ??
      root.querySelector<HTMLElement>("[data-autofocus]") ??
      root;

    const raf = requestAnimationFrame(() => focusTarget?.focus?.());

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusables = root.querySelectorAll<HTMLElement>(
        [
          "a[href]",
          "button:not([disabled])",
          "input:not([disabled]):not([type='hidden'])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          "[tabindex]:not([tabindex='-1'])",
        ].join(","),
      );

      if (!focusables.length) {
        e.preventDefault();
        root.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !root.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !root.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, initialFocusRef]);

  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onOpenChangeAction(false);
  };

  const overlayTransition: Transition = {
    duration: 0.2,
    ease: [0.22, 1, 0.36, 1],
  };

  const dialogTransition: Transition = {
    type: "spring",
    stiffness: 220,
    damping: 24,
    mass: 0.8,
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
          onMouseDown={onOverlayClick}
          aria-hidden="true"
          className={cn(
            "fixed inset-0 z-(--z-overlay)",
            "flex items-center justify-center",
            "bg-(--scrim) backdrop-blur-md",
            "p-(--space-6)",
            overlayClassName,
          )}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            tabIndex={-1}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={dialogTransition}
            className={cn(
              "relative outline-none",
              "w-full max-w-2xl",
              "rounded-2xl",
              "border border-(--border-card)",
              "bg-(--surface-card) text-(--text)",
              "shadow-xl",
              "focus-visible:ring-2 focus-visible:ring-(--ring)",
              className,
            )}
          >
            {children}

            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => onOpenChangeAction(false)}
              className={cn(
                "absolute right-(--space-3) top-(--space-3)",
                "inline-flex h-9 w-9 items-center justify-center",
                "rounded-full border border-(--border-card)",
                "bg-transparent",
                "transition-[opacity,transform]",
                "hover:opacity-90 active:scale-95",
              )}
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =========================================================
   Subcomponentes
   ========================================================= */

export function ModalHeader({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      id={id}
      className={cn(
        "p-(--space-6) pb-(--space-4)",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ModalBody({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      id={id}
      className={cn(
        "px-(--space-6) pb-(--space-6)",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-(--space-6) pb-(--space-6)",
        className,
      )}
    >
      {children}
    </div>
  );
}
