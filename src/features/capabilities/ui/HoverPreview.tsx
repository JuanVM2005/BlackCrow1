// src/features/capabilities/ui/HoverPreview.tsx
"use client";

import * as React from "react";
import Image from "next/image";

type Point = { x: number; y: number };

export type HoverPreviewProps = {
  /** Índice activo (0..n) del ítem sobre el que se hace hover. */
  activeIndex: number | null;
  /** Lista de imágenes a mostrar. Se indexan por `activeIndex`. */
  images: string[];
  /** Posición del puntero (clientX/clientY) provista por el padre. */
  point: Point | null;
  /** Tamaño del contenedor cuadrado (px). */
  size?: number;
  /** Factor de suavizado (0..1). Mayor = más suave/lento. */
  easing?: number;
  /** Forzar habilitado/deshabilitado (por defecto autodetecta pointer fine y motion). */
  enabled?: boolean;
  /** Clases extra opcionales. */
  className?: string;
};

/**
 * Contenedor flotante que sigue al puntero con movimiento suave
 * y muestra una imagen según el índice activo.
 * - No captura eventos.
 * - Incluye “swing” tipo cordel (columpio) basado en la velocidad del mouse.
 *
 * ✅ Fix hard:
 * - Evita crashes si refs son null (hot reload / transitions)
 * - Cancela RAFs correctamente
 * - No deja “colgado” el ángulo al ocultar
 */
export default function HoverPreview({
  activeIndex,
  images,
  point,
  size = 180,
  easing = 0.18,
  enabled,
  className = "",
}: HoverPreviewProps) {
  const canRender = useCanRender(enabled);
  const [visible, setVisible] = React.useState(false);

  // refs de estado interno (no causan renders)
  const posRef = React.useRef<Point>({ x: 0, y: 0 });
  const targetRef = React.useRef<Point | null>(null);
  const lastRef = React.useRef<Point>({ x: 0, y: 0 });
  const swingRef = React.useRef({ rotZ: 0, rotX: 0 });

  const rafMoveRef = React.useRef<number | null>(null);
  const rafRenderRef = React.useRef<number | null>(null);

  // DOM refs
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const boxRef = React.useRef<HTMLDivElement | null>(null);

  // Actualiza target + visibilidad
  React.useEffect(() => {
    targetRef.current = point;

    const ok =
      Boolean(point) &&
      canRender &&
      activeIndex !== null &&
      !!images[activeIndex ?? -1];

    setVisible(ok);
  }, [point, canRender, activeIndex, images]);

  // Smooth move loop (lerp hacia el cursor)
  React.useEffect(() => {
    if (!visible) {
      if (rafMoveRef.current) cancelAnimationFrame(rafMoveRef.current);
      rafMoveRef.current = null;
      return;
    }

    const tick = () => {
      const t = targetRef.current;
      if (t) {
        const c = posRef.current;
        posRef.current = {
          x: lerp(c.x, t.x, easing),
          y: lerp(c.y, t.y, easing),
        };
      }
      rafMoveRef.current = requestAnimationFrame(tick);
    };

    rafMoveRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafMoveRef.current) cancelAnimationFrame(rafMoveRef.current);
      rafMoveRef.current = null;
    };
  }, [visible, easing]);

  // Render loop: translate + swing
  React.useEffect(() => {
    if (!visible) {
      if (rafRenderRef.current) cancelAnimationFrame(rafRenderRef.current);
      rafRenderRef.current = null;
      return;
    }

    // Ajustes “un poquito menos” (como lo tenías)
    const MAX_ROT_Z = 36;
    const MAX_ROT_X = 22;
    const ROT_Z_MULT = 0.48;
    const ROT_X_MULT = 0.24;
    const SWING_EASE = 0.34;
    const DAMP = 1.35;

    const render = () => {
      const wrap = wrapperRef.current;
      const box = boxRef.current;

      // ✅ Si se desmontó entre frames, paramos limpio
      if (!wrap || !box) {
        if (rafRenderRef.current) cancelAnimationFrame(rafRenderRef.current);
        rafRenderRef.current = null;
        return;
      }

      const { x, y } = posRef.current;

      // translate (centrado al cursor)
      const tx = x - size / 2;
      const ty = y - size / 2;
      wrap.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;

      // velocidad estimada (delta por frame)
      const dx = (x - lastRef.current.x) * DAMP;
      const dy = (y - lastRef.current.y) * DAMP;
      lastRef.current = { x, y };

      // objetivo de rotación
      const targetRotZ = clamp(dx * ROT_Z_MULT, -MAX_ROT_Z, MAX_ROT_Z);
      const targetRotX = clamp(-dy * ROT_X_MULT, -MAX_ROT_X, MAX_ROT_X);

      // suavizado tipo cordel
      swingRef.current.rotZ = lerp(swingRef.current.rotZ, targetRotZ, SWING_EASE);
      swingRef.current.rotX = lerp(swingRef.current.rotX, targetRotX, SWING_EASE);

      // aplica rotación
      box.style.transform = `rotateZ(${swingRef.current.rotZ}deg) rotateX(${swingRef.current.rotX}deg)`;

      rafRenderRef.current = requestAnimationFrame(render);
    };

    rafRenderRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRenderRef.current) cancelAnimationFrame(rafRenderRef.current);
      rafRenderRef.current = null;
    };
  }, [visible, size]);

  // Reset cuando se oculta (evita quedarse inclinado)
  React.useEffect(() => {
    if (visible) return;

    lastRef.current = posRef.current;
    swingRef.current = { rotZ: 0, rotX: 0 };

    const box = boxRef.current;
    if (box) box.style.transform = "rotateZ(0deg) rotateX(0deg)";
  }, [visible]);

  // Limpieza general por si unmount con RAF vivo
  React.useEffect(() => {
    return () => {
      if (rafMoveRef.current) cancelAnimationFrame(rafMoveRef.current);
      if (rafRenderRef.current) cancelAnimationFrame(rafRenderRef.current);
      rafMoveRef.current = null;
      rafRenderRef.current = null;
    };
  }, []);

  const src = activeIndex !== null ? images[activeIndex] : undefined;

  return (
    <div
      aria-hidden="true"
      ref={wrapperRef}
      className={[
        "pointer-events-none fixed top-0 left-0 z-40",
        "transition-opacity duration-200 ease-out will-change-transform",
        visible ? "opacity-100" : "opacity-0",
        className,
      ].join(" ")}
      style={{ width: size, height: size }}
    >
      <div
        ref={boxRef}
        className={[
          "relative w-full h-full overflow-hidden",
          "rounded-xl bg-background shadow-lg",
        ].join(" ")}
        style={{
          transformOrigin: "50% 0%",
          willChange: "transform",
        }}
      >
        {src ? (
          <Image
            src={src}
            alt=""
            role="presentation"
            fill
            sizes={`${size}px`}
            priority={false}
            style={{ objectFit: "cover" }}
          />
        ) : null}
      </div>
    </div>
  );
}

/* Utils */

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * clamp01(t);
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

/**
 * Determina si debemos renderizar el overlay:
 * - Si `enabled` está definido, respeta ese valor.
 * - Si no, requiere pointer:fine y no prefers-reduced-motion.
 *
 * ✅ Incluye fallback Safari legacy.
 */
function useCanRender(enabled?: boolean) {
  const [ok, setOk] = React.useState(false);

  React.useEffect(() => {
    if (typeof enabled === "boolean") {
      setOk(enabled);
      return;
    }
    if (typeof window === "undefined") {
      setOk(false);
      return;
    }

    const mqPointer = window.matchMedia("(pointer: fine)");
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const compute = () => setOk(mqPointer.matches && !mqMotion.matches);
    compute();

    const add = (mq: MediaQueryList, fn: () => void) => {
      if (typeof mq.addEventListener === "function") mq.addEventListener("change", fn);
      // eslint-disable-next-line deprecation/deprecation
      else mq.addListener(fn);
    };
    const remove = (mq: MediaQueryList, fn: () => void) => {
      if (typeof mq.removeEventListener === "function") mq.removeEventListener("change", fn);
      // eslint-disable-next-line deprecation/deprecation
      else mq.removeListener(fn);
    };

    add(mqPointer, compute);
    add(mqMotion, compute);

    return () => {
      remove(mqPointer, compute);
      remove(mqMotion, compute);
    };
  }, [enabled]);

  return ok;
}
