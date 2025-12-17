// src/ui/effects/RailTracer.tsx
"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * RailTracer — traza un tramo animado sobre el perímetro interno (rounded-rect)
 * usando solo tokens CSS. Se activa con `active`.
 *
 * Tokens usados (globals.css):
 *  - Color:            var(--rail)
 *  - Grosor:           var(--rail-width)
 *  - Duración:         --rail-anim-duration
 *  - Easing:           --rail-anim-ease
 *  - Segmento visible: --rail-trace-segment   (%, ej. "18%")
 *  - Inset base:       --rail-trace-inset     (px)
 *  - GAP carril:       --rail-trace-gap       (px)
 */

type Bezier = [number, number, number, number];

export type RailTracerProps = {
  /** Ref del elemento objetivo (article). */
  targetRef: React.RefObject<HTMLElement>;
  /** Activa la animación (si false, queda estático). */
  active?: boolean;
  /** Variable CSS para el color del trazo. */
  colorVar?: string;
  /** Variable CSS para el grosor del trazo. */
  strokeWidthVar?: string;
  className?: string;
};

function parsePx(value?: string | null) {
  if (!value) return 0;
  const m = value.trim().match(/^([\d.]+)px$/i);
  return m ? parseFloat(m[1]) : 0;
}

function parsePercentToUnit(value?: string | null, fallback = 0.18) {
  if (!value) return fallback;
  const mPct = value.trim().match(/^([\d.]+)\s*%$/);
  if (mPct) return Math.max(0, Math.min(1, parseFloat(mPct[1]) / 100));
  const asNum = Number(value);
  if (!Number.isNaN(asNum)) return Math.max(0, Math.min(1, asNum <= 1 ? asNum : asNum / 100));
  return fallback;
}

function readAnimTokens() {
  const root = getComputedStyle(document.documentElement);

  const durRaw = root.getPropertyValue("--rail-anim-duration").trim() || "8000ms";
  const dm = durRaw.match(/^([\d.]+)\s*(ms|s)?$/i);
  const duration = dm ? (dm[2]?.toLowerCase() === "s" ? parseFloat(dm[1]) : parseFloat(dm[1]) / 1000) : 8;

  const easeRaw = root.getPropertyValue("--rail-anim-ease").trim() || "cubic-bezier(0.22, 1, 0.36, 1)";
  const em = easeRaw.match(/cubic-bezier\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/i);
  const ease: Bezier = em ? [parseFloat(em[1]), parseFloat(em[2]), parseFloat(em[3]), parseFloat(em[4])] : [0.22, 1, 0.36, 1];

  const segRaw = root.getPropertyValue("--rail-trace-segment").trim() || "18%";
  const segment = parsePercentToUnit(segRaw, 0.18);

  const insetRaw = root.getPropertyValue("--rail-trace-inset").trim() || "1px";
  const gapRaw   = root.getPropertyValue("--rail-trace-gap").trim()   || "0px";
  const insetPx = parsePx(insetRaw);
  const gapPx   = parsePx(gapRaw);

  return { duration, ease, segment, insetPx, gapPx };
}

type Size = { w: number; h: number };
type Radii = { tl: number; tr: number; br: number; bl: number };

function readRadii(el: Element): Radii {
  const cs = getComputedStyle(el);
  const pick = (p: string) => parsePx(cs.getPropertyValue(p).trim().split("/")[0]?.trim().split(" ")[0]);
  return {
    tl: pick("border-top-left-radius"),
    tr: pick("border-top-right-radius"),
    br: pick("border-bottom-right-radius"),
    bl: pick("border-bottom-left-radius"),
  };
}

/** Rect redondeado que arranca a mitad del lado izquierdo, sube y rodea horario. */
function roundedRectPathStartingAtLeftMid(
  x: number, y: number, w: number, h: number, r: Radii
) {
  const clamp = (v: number) => Math.max(0, Math.min(v, Math.min(w, h) / 2));
  const tl = clamp(r.tl), tr = clamp(r.tr), br = clamp(r.br), bl = clamp(r.bl);
  const x0 = x, y0 = y + h / 2;
  return [
    `M ${x0} ${y0}`,
    `L ${x} ${y + tl}`,
    `A ${tl} ${tl} 0 0 1 ${x + tl} ${y}`,
    `L ${x + w - tr} ${y}`,
    `A ${tr} ${tr} 0 0 1 ${x + w} ${y + tr}`,
    `L ${x + w} ${y + h - br}`,
    `A ${br} ${br} 0 0 1 ${x + w - br} ${y + h}`,
    `L ${x + bl} ${y + h}`,
    `A ${bl} ${bl} 0 0 1 ${x} ${y + h - bl}`,
    `L ${x} ${y + h / 2}`,
    "Z",
  ].join(" ");
}

export default function RailTracer({
  targetRef,
  active = false,
  colorVar = "var(--rail)",
  strokeWidthVar = "var(--rail-width)",
  className,
}: RailTracerProps) {
  const reduce = useReducedMotion();
  const [anim, setAnim] = React.useState(() => ({
    duration: 8,
    ease: [0.22, 1, 0.36, 1] as Bezier,
    segment: 0.18,
    insetPx: 1,
    gapPx: 0,
  }));
  const [{ w, h }, setSize] = React.useState<Size>({ w: 0, h: 0 });
  const [radii, setRadii] = React.useState<Radii>({ tl: 0, tr: 0, br: 0, bl: 0 });

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const tick = () => setAnim(readAnimTokens());
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, []);

  React.useEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
      setRadii(readRadii(el));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [targetRef]);

  const insetTotal = anim.insetPx + anim.gapPx;
  const ix = insetTotal, iy = insetTotal;
  const iw = Math.max(0, w - insetTotal * 2);
  const ih = Math.max(0, h - insetTotal * 2);

  const rAdj: Radii = {
    tl: Math.max(0, radii.tl - insetTotal),
    tr: Math.max(0, radii.tr - insetTotal),
    br: Math.max(0, radii.br - insetTotal),
    bl: Math.max(0, radii.bl - insetTotal),
  };

  const d = React.useMemo(
    () => (iw > 0 && ih > 0 ? roundedRectPathStartingAtLeftMid(ix, iy, iw, ih, rAdj) : ""),
    [ix, iy, iw, ih, rAdj.tl, rAdj.tr, rAdj.br, rAdj.bl]
  );

  const dashArray = `${anim.segment} 1`;
  if (iw <= 0 || ih <= 0 || !d) return null;

  const shouldAnimate = active && !reduce;

  return (
    <svg
      aria-hidden
      className={["pointer-events-none absolute inset-0", className].filter(Boolean).join(" ")}
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      style={{ overflow: "visible" }}
    >
      <motion.path
        d={d}
        fill="none"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        strokeLinecap="butt"
        strokeLinejoin="round"
        style={{
          stroke: colorVar,
          strokeWidth: strokeWidthVar,
          strokeDasharray: dashArray,
        } as React.CSSProperties}
        initial={{ strokeDashoffset: 0 }}
        animate={shouldAnimate ? { strokeDashoffset: [0, -1] } : { strokeDashoffset: 0 }}
        transition={
          shouldAnimate
            ? { strokeDashoffset: { duration: anim.duration, ease: anim.ease as any, repeat: Infinity, repeatType: "loop" } }
            : undefined
        }
      />
    </svg>
  );
}
