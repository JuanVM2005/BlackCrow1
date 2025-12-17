// src/ui/ScrollRail/aria.ts
import type React from "react";
import type { HTMLAttributes } from "react";

export function getAriaScrollbarProps(args: {
  now: number;
  max: number;
  label?: string;
  controlsId?: string;
}): HTMLAttributes<HTMLDivElement> {
  const { now, max, label, controlsId } = args;
  return {
    role: "scrollbar",
    "aria-orientation": "vertical",
    "aria-valuemin": 0,
    "aria-valuemax": Math.max(0, Math.floor(max)),
    "aria-valuenow": Math.max(0, Math.floor(now)),
    ...(label ? { "aria-label": label } : {}),
    ...(controlsId ? { "aria-controls": controlsId } : {}),
    tabIndex: 0,
  } as HTMLAttributes<HTMLDivElement>;
}

/** Soporte de teclado para el scrollbar overlay */
export function onScrollbarKeyDown(
  e: React.KeyboardEvent<HTMLDivElement>,
  opts?: { step?: number; pageFactor?: number }
) {
  const step = opts?.step ?? 40; // px por flecha
  const pageFactor = opts?.pageFactor ?? 0.9; // % de viewport para PageUp/Down
  const doc = document.scrollingElement as HTMLElement | null;
  const scroller = doc ?? document.documentElement;
  const viewport = window.innerHeight;
  const max = scroller.scrollHeight - viewport;
  const top = scroller.scrollTop;

  switch (e.key) {
    case "ArrowUp":
      e.preventDefault();
      window.scrollTo({ top: Math.max(0, top - step), behavior: "auto" });
      break;
    case "ArrowDown":
      e.preventDefault();
      window.scrollTo({ top: Math.min(max, top + step), behavior: "auto" });
      break;
    case "PageUp":
      e.preventDefault();
      window.scrollTo({ top: Math.max(0, top - viewport * pageFactor), behavior: "auto" });
      break;
    case "PageDown":
      e.preventDefault();
      window.scrollTo({ top: Math.min(max, top + viewport * pageFactor), behavior: "auto" });
      break;
    case "Home":
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "auto" });
      break;
    case "End":
      e.preventDefault();
      window.scrollTo({ top: max, behavior: "auto" });
      break;
  }
}
