// src/ui/Cursor/index.tsx
"use client";

import * as React from "react";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

/**
 * Cursor doble (dot + follower con delay).
 * Opción A: mix-blend-mode: difference (invierte según fondo).
 * Importante: el “ink” base debe ser CLARO (blanco) para que la inversión sea correcta.
 * Usamos el token `var(--text-inverse)` como tinta por defecto.
 *
 * Tokens ajustables en globals.css:
 * --cursor-size        (px)   [def 6px]
 * --cursor-follower    (px)   [def 18px]
 * --cursor-opacity           [def .28]
 * --cursor-ink              [opcional, def var(--text-inverse)]
 */

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], [data-cursor="interactive"], input[type="submit"], summary, label';

type Props = {
  /** Habilita/Deshabilita el cursor custom (desktop) */
  enabled?: boolean;
  /** Suavidad del follower (0–1); mayor = más delay */
  lerp?: number;
};

export default function Cursor({ enabled = true, lerp = 0.15 }: Props) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const dotRef = React.useRef<HTMLDivElement | null>(null);
  const followerRef = React.useRef<HTMLDivElement | null>(null);
  const pointer = React.useRef({ x: 0, y: 0 });
  const trail = React.useRef({ x: 0, y: 0 });
  const rafId = React.useRef<number | null>(null);

  const [mounted, setMounted] = React.useState(false);
  const [canCustomCursor, setCanCustomCursor] = React.useState(false);

  const [visible, setVisible] = React.useState(false);
  const [isPointerDown, setPointerDown] = React.useState(false);
  const [isInteractive, setInteractive] = React.useState(false);

  // Montaje
  React.useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const ok = window.matchMedia("(hover: hover) and (pointer: fine)").matches && enabled;
      setCanCustomCursor(ok);
    }
  }, [enabled]);

  // Aplica/retira cursor-none (solo en puntero fino via CSS global)
  React.useEffect(() => {
    if (!mounted) return;
    if (canCustomCursor) {
      document.body.classList.add("cursor-none");
    } else {
      document.body.classList.remove("cursor-none");
    }
    return () => {
      document.body.classList.remove("cursor-none");
    };
  }, [mounted, canCustomCursor]);

  // Listeners de puntero
  React.useEffect(() => {
    if (!mounted || !canCustomCursor) return;

    const onMove = (e: MouseEvent) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
      setVisible(true);

      // Detecta si el target es interactivo (para agrandar follower)
      const t = e.target as HTMLElement | null;
      if (t) {
        const isFormControl =
          t instanceof HTMLInputElement ||
          t instanceof HTMLTextAreaElement ||
          t instanceof HTMLSelectElement ||
          t.closest("input, textarea, select") !== null;
        setInteractive(!isFormControl && Boolean(t.closest(INTERACTIVE_SELECTOR)));
      }

      if (prefersReducedMotion) {
        // Fijamos ambos al puntero
        const base = `translate3d(${pointer.current.x}px, ${pointer.current.y}px, 0) translate(-50%, -50%)`;
        if (dotRef.current) dotRef.current.style.transform = `${base} scale(var(--cursor-scale,1))`;
        if (followerRef.current)
          followerRef.current.style.transform = `${base} scale(var(--cursor-scale,1))`;
      } else {
        // Dot instantáneo
        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${pointer.current.x}px, ${pointer.current.y}px, 0) translate(-50%, -50%) scale(var(--cursor-scale,1))`;
        }
      }
    };

    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);
    const onDown = () => setPointerDown(true);
    const onUp = () => setPointerDown(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseenter", onEnter);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [mounted, canCustomCursor, prefersReducedMotion]);

  // Lerp del follower (solo sin reduced-motion)
  React.useEffect(() => {
    if (!mounted || !canCustomCursor || prefersReducedMotion) return;

    const LERP = Math.min(Math.max(lerp, 0.01), 0.5); // clamp
    const loop = () => {
      trail.current.x += (pointer.current.x - trail.current.x) * LERP;
      trail.current.y += (pointer.current.y - trail.current.y) * LERP;
      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${trail.current.x}px, ${trail.current.y}px, 0) translate(-50%, -50%) scale(var(--cursor-scale,1))`;
      }
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [mounted, canCustomCursor, prefersReducedMotion, lerp]);

  if (!mounted || !canCustomCursor) return null;

  // Escalas por estado (con CSS vars, sin tocar transform en cada frame)
  const dotScale = isPointerDown ? 0.85 : isInteractive ? 1.15 : 1;
  const followerScale = isPointerDown ? 0.9 : isInteractive ? 1.3 : 1;

  const baseOpacity = visible ? 1 : 0;
  const followerOpacity = visible ? 1 : 0;

  return (
    <>
      {/* Dot - tinta clara para correcto 'difference' */}
      <div
        ref={dotRef}
        aria-hidden
        style={
          {
            position: "fixed",
            left: 0,
            top: 0,
            width: "var(--cursor-size, 6px)",
            height: "var(--cursor-size, 6px)",
            borderRadius: "var(--radius-full)",
            background: "var(--cursor-ink, var(--text-inverse))",
            transform:
              "translate3d(-100px, -100px, 0) translate(-50%, -50%) scale(var(--cursor-scale,1))",
            opacity: baseOpacity,
            transition: "opacity 150ms ease",
            transformOrigin: "center",
            pointerEvents: "none",
            zIndex: 9999,
            willChange: "transform, opacity",
            mixBlendMode: "difference",
            ["--cursor-scale" as any]: dotScale,
          } as React.CSSProperties
        }
      />

      {/* Follower - misma tinta clara, opacidad menor */}
      <div
        ref={followerRef}
        aria-hidden
        style={
          {
            position: "fixed",
            left: 0,
            top: 0,
            width: "var(--cursor-follower, 18px)",
            height: "var(--cursor-follower, 18px)",
            borderRadius: "var(--radius-full)",
            background: "var(--cursor-ink, var(--text-inverse))",
            opacity: `calc(var(--cursor-opacity, .28) * ${followerOpacity})`,
            transform:
              "translate3d(-100px, -100px, 0) translate(-50%, -50%) scale(var(--cursor-scale,1))",
            transition: "opacity 180ms ease",
            pointerEvents: "none",
            zIndex: 9998,
            willChange: "transform, opacity",
            mixBlendMode: "difference",
            ["--cursor-scale" as any]: followerScale,
          } as React.CSSProperties
        }
      />
    </>
  );
}
