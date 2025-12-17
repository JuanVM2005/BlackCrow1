// src/ui/effects/Tilt3D.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/utils/cn";

type Tilt3DProps = {
  children: React.ReactNode;
  className?: string;
  /** ° máximos en eje X (vertical) */
  maxRotateX?: number;
  /** ° máximos en eje Y (horizontal) */
  maxRotateY?: number;
  /** Escala al hacer hover/move */
  scale?: number;
  /** Profundidad de perspectiva en px */
  perspective?: number;
  /** Desactivar el efecto (ej. en listas enormes) */
  disabled?: boolean;
};

export default function Tilt3D({
  children,
  className,
  maxRotateX = 8,
  maxRotateY = 12,
  scale = 1.015,
  perspective = 1000,
  disabled,
}: Tilt3DProps) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef<{ rx: number; ry: number; s: number }>({
    rx: 0,
    ry: 0,
    s: 1,
  });
  const currentRef = useRef<{ rx: number; ry: number; s: number }>({
    rx: 0,
    ry: 0,
    s: 1,
  });

  const prefersReduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const isDisabled = disabled || prefersReduced;

  const animate = () => {
    const inner = innerRef.current;
    if (!inner) return;

    // Lerp/spring ligero
    const stiffness = 0.14;
    const damping = 0.9;

    const dx = targetRef.current.rx - currentRef.current.rx;
    const dy = targetRef.current.ry - currentRef.current.ry;
    const ds = targetRef.current.s - currentRef.current.s;

    currentRef.current.rx += dx * stiffness;
    currentRef.current.ry += dy * stiffness;
    currentRef.current.s += ds * stiffness;

    // Frenado pequeño
    currentRef.current.rx *= damping;
    currentRef.current.ry *= damping;

    inner.style.transform = `rotateX(${currentRef.current.rx.toFixed(
      3
    )}deg) rotateY(${currentRef.current.ry.toFixed(3)}deg) scale(${
      currentRef.current.s
    })`;

    rafRef.current = requestAnimationFrame(animate);
  };

  const setTarget = (rx: number, ry: number, s: number) => {
    targetRef.current.rx = rx;
    targetRef.current.ry = ry;
    targetRef.current.s = s;
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const onPointerEnter: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (isDisabled) return;
    if (e.pointerType !== "mouse") return;
    setTarget(0, 0, scale);
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (isDisabled) return;
    if (e.pointerType !== "mouse") return;
    const el = outerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const px = (e.clientX - cx) / (rect.width / 2); // -1 .. 1
    const py = (e.clientY - cy) / (rect.height / 2); // -1 .. 1

    const ry = px * maxRotateY; // horizontal → Y
    const rx = -py * maxRotateX; // vertical → X

    setTarget(rx, ry, scale);
  };

  const onPointerLeave: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.pointerType !== "mouse") return;
    setTarget(0, 0, 1);
    const stopWhenSettled = () => {
      const { rx, ry, s } = currentRef.current;
      if (
        Math.abs(rx) < 0.02 &&
        Math.abs(ry) < 0.02 &&
        Math.abs(s - 1) < 0.002
      ) {
        if (rafRef.current != null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        return;
      }
      rafRef.current = requestAnimationFrame(stopWhenSettled);
    };
    if (rafRef.current == null)
      rafRef.current = requestAnimationFrame(stopWhenSettled);
  };

  return (
    <div
      ref={outerRef}
      className={cn("relative", "will-change-transform", className)}
      style={{ perspective: `${perspective}px` }}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div
        ref={innerRef}
        className={cn(
          "transform-gpu will-change-transform",
          isDisabled && "transition-transform duration-200 ease-out hover:scale-[1.01]"
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </div>
    </div>
  );
}
