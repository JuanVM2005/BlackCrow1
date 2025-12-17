// src/ui/ScrollRail/index.tsx
"use client";

import * as React from "react";
import { useScrollRail } from "./useScrollRail";
import type { ScrollRailProps } from "./types";
import { getAriaScrollbarProps, onScrollbarKeyDown } from "./aria";

export default function ScrollRail({
  position = "right",
  offsetTop = 8,
  offsetBottom = 8,
  thickness = 10,
  radius = 0, // rectangular por defecto
  autoHide = true,
  idleDelay = 900,
  minThumbSize = 48,
  // NUEVO: control de altura
  thumbScale = 1,
  thumbFixedPx,
  className,
  trackClassName,
  thumbClassName,
  ariaLabel = "Barra de desplazamiento",
  ariaControlsId,
}: ScrollRailProps) {
  // Evita mismatch de hidratación: no renderizar hasta que monte en cliente
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Hooks siempre en el mismo orden
  const trackRef = React.useRef<HTMLDivElement | null>(null);

  const {
    visible,
    scrollTop,
    scrollMax,
    trackPixels,
    thumbPx,
    thumbOffset,
    isDragging,
    isHovering,
    isIdle,
    onThumbPointerDown,
    onTrackPointerDown,
    setHovering,
  } = useScrollRail<HTMLDivElement>(trackRef, {
    minThumbSize,
    autoHide,
    idleDelay,
    offsetTop,
    offsetBottom,
    thumbScale,
    thumbFixedPx,
  });

  if (!mounted || !visible) return null;

  const show = !autoHide || isDragging || isHovering || !isIdle;

  // Rail pegado al borde y con fondo negro (token)
  const railStyle: React.CSSProperties = {
    position: "fixed",
    top: offsetTop,
    bottom: offsetBottom,
    width: thickness,
    borderRadius: radius,
    zIndex: "var(--z-overlay)",
    background: "var(--neutral-1000)",
    opacity: show ? 1 : 0,
    transition: "opacity 160ms ease",
    pointerEvents: show ? "auto" : "none",
  };
  if (position === "right") {
    (railStyle as any).right = 0;
  } else {
    (railStyle as any).left = 0;
  }

  // Thumb rosa sin borde
  const thumbStyle: React.CSSProperties = {
    position: "absolute",
    insetInlineStart: 0,
    width: "100%",
    height: `${thumbPx}px`,
    transform: `translateY(${thumbOffset}px)`,
    borderRadius: radius,
    background: "var(--pink-500)", // o var(--primary)
    boxShadow: "var(--shadow-xs)",
    transition: isDragging ? "none" : "transform 80ms linear",
    touchAction: "none",
  };

  const ariaProps = getAriaScrollbarProps({
    now: scrollTop,
    max: scrollMax,
    label: ariaLabel,
    controlsId: ariaControlsId,
  });

  return (
    <div
      ref={trackRef}
      {...ariaProps}
      className={`select-none ${className ?? ""} ${trackClassName ?? ""}`}
      style={railStyle}
      onPointerDown={onTrackPointerDown}
      onKeyDown={(e) => onScrollbarKeyDown(e)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      aria-hidden={false}
    >
      <div
        role="presentation"
        className={thumbClassName}
        style={thumbStyle}
        onPointerDown={onThumbPointerDown}
      />
    </div>
  );
}
