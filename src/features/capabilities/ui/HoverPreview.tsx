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
 * y muestra una imagen según el índice activo. No captura eventos.
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
  const [visible, setVisible] = React.useState(false);

  // Autodetección: solo en punteros "fine" (mouse) y sin reduced motion.
  const canRender = useCanRender(enabled);

  // Posición actual (suavizada) del contenedor.
  const posRef = React.useRef<Point>({ x: 0, y: 0 });
  const targetRef = React.useRef<Point | null>(null);
  const rafRef = React.useRef<number | null>(null);

  // Actualiza el target cuando cambia el punto.
  React.useEffect(() => {
    targetRef.current = point;
    // Muestra/oculta según haya hover y condiciones
    setVisible(Boolean(point) && canRender && activeIndex !== null && !!images[activeIndex ?? -1]);
  }, [point, canRender, activeIndex, images]);

  // Animación con rAF + lerp
  React.useEffect(() => {
    if (!visible) {
      // Si se oculta, cancela cualquier rAF pendiente
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const tick = () => {
      const t = targetRef.current;
      if (t) {
        const c = posRef.current;
        const nx = lerp(c.x, t.x, easing);
        const ny = lerp(c.y, t.y, easing);
        posRef.current = { x: nx, y: ny };
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [visible, easing]);

  // Estilo transform en línea (evita re-render con uso de ref)
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!ref.current) return;

    let raf: number | null = null;
    const render = () => {
      if (!ref.current) return;
      const { x, y } = posRef.current;
      // Centra el cuadrado respecto al cursor
      const tx = x - size / 2;
      const ty = y - size / 2;
      ref.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [size]);

  const src = activeIndex !== null ? images[activeIndex] : undefined;

  return (
    <div
      aria-hidden="true"
      ref={ref}
      className={[
        "pointer-events-none fixed top-0 left-0 z-40",
        "transition-opacity duration-200 ease-out will-change-transform",
        visible ? "opacity-100" : "opacity-0",
        className,
      ].join(" ")}
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Caja visual */}
      <div
        className={[
          "relative w-full h-full overflow-hidden",
          // Bordes no tan redondos + borde según tokens
          "rounded-xl border border-border bg-background shadow-lg",
        ].join(" ")}
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

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

/**
 * Determina si debemos renderizar el overlay:
 * - Si `enabled` está definido, respeta ese valor.
 * - Si no, requiere pointer:fine y no prefers-reduced-motion.
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

    const onPointer = () => compute();
    const onMotion = () => compute();

    mqPointer.addEventListener?.("change", onPointer);
    mqMotion.addEventListener?.("change", onMotion);

    return () => {
      mqPointer.removeEventListener?.("change", onPointer);
      mqMotion.removeEventListener?.("change", onMotion);
    };
  }, [enabled]);

  return ok;
}
