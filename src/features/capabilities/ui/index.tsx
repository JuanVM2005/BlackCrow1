// src/features/capabilities/ui/index.tsx
"use client";

import * as React from "react";
import { motion, useAnimationControls, type Variants } from "framer-motion";
import type { CapabilitiesProps } from "@/features/capabilities/content/capabilities.mapper";
import HoverPreview from "./HoverPreview";

type Point = { x: number; y: number };

function formatNumber(idx: number) {
  return `${String(idx + 1).padStart(2, "0")} /`;
}

/** Lee un número desde una CSS var (tokens). */
function readCssVarNumber(name: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Gate: anima SOLO 1 VEZ cuando la sección entra al viewport y vienes bajando.
 * - Si entras subiendo: no anima (y se ve normal).
 * - Si ya animó una vez: nunca más vuelve a animar.
 */
function useEnterDownOnce<T extends Element>(options?: IntersectionObserverInit) {
  const ref = React.useRef<T | null>(null);
  const [runKey, setRunKey] = React.useState(0);
  const [shouldAnimate, setShouldAnimate] = React.useState(false);

  const lastY = React.useRef(0);
  const wasIntersecting = React.useRef(false);
  const hasPlayed = React.useRef(false);

  React.useEffect(() => {
    lastY.current = window.scrollY;

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (hasPlayed.current) return;

        const y = window.scrollY;
        const scrollingDown = y > lastY.current;

        const isIntersecting = Boolean(entry?.isIntersecting);
        const entering = isIntersecting && !wasIntersecting.current;

        if (entering && scrollingDown) {
          hasPlayed.current = true;
          setShouldAnimate(true);
          setRunKey((k) => k + 1); // remount controlado para iniciar desde "hidden"
          io.disconnect();
        }

        wasIntersecting.current = isIntersecting;
        lastY.current = y;
      },
      { threshold: 0.35, rootMargin: "0px 0px -12% 0px", ...options }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [options]);

  return { ref, runKey, shouldAnimate } as const;
}

type TextTag = "span" | "h2" | "h3" | "p";

/**
 * Mantiene la animación que veníamos usando (soft + settle),
 * pero más suave y SIN “desordenar” el wrapping en mobile:
 * - Se anima letra-por-letra, pero cada palabra es un bloque nowrap.
 *
 * Importante: NO hay returns condicionales antes de hooks (evita el error interno de React).
 */
function DistortLetters({
  text,
  className,
  play,
  as = "span",
  ariaLabel,
}: {
  text: string;
  className?: string;
  play: boolean;
  as?: TextTag;
  ariaLabel?: string;
}) {
  const controls = useAnimationControls();

  const params = React.useMemo(() => {
    // defaults suaves (no bruscos)
    const duration = readCssVarNumber("--cap-reveal-duration", 0.85);
    const stagger = readCssVarNumber("--cap-reveal-stagger", 0.014);
    const blur = readCssVarNumber("--cap-reveal-blur", 10);
    const y = readCssVarNumber("--cap-reveal-y", 10);

    // glitch MUY sutil para que no se note “desorden”
    const skew = readCssVarNumber("--cap-reveal-skew", 8) * 0.25;
    const rot = readCssVarNumber("--cap-reveal-rot", 2) * 0.25;

    return { duration, stagger, blur, y, skew, rot };
  }, []);

  React.useEffect(() => {
    if (play) controls.start("show");
    else controls.set("show"); // cuando no hay animación, siempre visible
  }, [play, controls]);

  const words = React.useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

  const containerVariants: Variants = React.useMemo(
    () => ({
      show: {
        transition: play
          ? { staggerChildren: params.stagger, delayChildren: 0.03 }
          : undefined,
      },
    }),
    [params.stagger, play]
  );

  const letterVariants: Variants = React.useMemo(
    () => ({
      hidden: {
        opacity: 0,
        y: params.y,
        rotateZ: -params.rot,
        skewX: params.skew,
        filter: `blur(${params.blur}px)`,
      },
      show: {
        opacity: 1,
        y: 0,
        rotateZ: 0,
        skewX: 0,
        filter: "blur(0px)",
        transition: play
          ? { duration: params.duration, ease: [0.22, 1, 0.36, 1] }
          : { duration: 0 },
      },
    }),
    [params.blur, params.duration, params.rot, params.skew, params.y, play]
  );

  const commonStyle: React.CSSProperties = {
    willChange: "transform, filter, opacity",
    transform: "translateZ(0)",
  };

  const rendered = (
    <>
      {words.map((w, wi) => (
        <span key={`${w}-${wi}`} className="inline-flex whitespace-nowrap">
          {Array.from(w).map((ch, i) => (
            <motion.span
              key={`${w}-${wi}-${ch}-${i}`}
              aria-hidden="true"
              className="inline-block"
              variants={letterVariants}
              style={{ transformOrigin: "50% 70%" }}
            >
              {ch}
            </motion.span>
          ))}
          {wi < words.length - 1 ? <span aria-hidden="true">&nbsp;</span> : null}
        </span>
      ))}
    </>
  );

  const baseProps = {
    className,
    variants: containerVariants,
    "aria-label": ariaLabel ?? text,
    style: commonStyle,
    children: rendered,
  };

  // Si play=false, NO ocultamos nada: initial={false} y animate="show"
  if (as === "h2") {
    return (
      <motion.h2
        {...baseProps}
        initial={play ? "hidden" : false}
        animate={play ? controls : "show"}
      />
    );
  }
  if (as === "h3") {
    return (
      <motion.h3
        {...baseProps}
        initial={play ? "hidden" : false}
        animate={play ? controls : "show"}
      />
    );
  }
  if (as === "p") {
    return (
      <motion.p
        {...baseProps}
        initial={play ? "hidden" : false}
        animate={play ? controls : "show"}
      />
    );
  }
  return (
    <motion.span
      {...baseProps}
      initial={play ? "hidden" : false}
      animate={play ? controls : "show"}
    />
  );
}

export default function Capabilities({ header, items }: CapabilitiesProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [point, setPoint] = React.useState<Point | null>(null);

  const raf = React.useRef<number | null>(null);
  const lastPoint = React.useRef<Point | null>(null);

  const images = React.useMemo(
    () => items.map((_, i) => `/images/capabilities/${String(i + 1).padStart(2, "0")}.webp`),
    [items]
  );

  const onListMouseMove = React.useCallback((e: React.MouseEvent<HTMLOListElement>) => {
    const next = { x: e.clientX, y: e.clientY };
    const prev = lastPoint.current;
    if (prev && prev.x === next.x && prev.y === next.y) return;
    lastPoint.current = next;
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => setPoint(next));
  }, []);

  const onListMouseLeave = React.useCallback(() => {
    lastPoint.current = null;
    if (raf.current) cancelAnimationFrame(raf.current);
    setHoveredIndex(null);
    setPoint(null);
  }, []);

  React.useEffect(() => {
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  // ✅ Solo 1 vez, y solo cuando “pases por ahí” bajando
  const { ref: sectionRef, runKey, shouldAnimate } = useEnterDownOnce<HTMLElement>();

  const baseY = readCssVarNumber("--cap-reveal-y", 10);
  const baseDuration = readCssVarNumber("--cap-reveal-duration", 0.85);
  const baseBlur = readCssVarNumber("--cap-reveal-blur", 10);
  const baseStagger = readCssVarNumber("--cap-reveal-stagger", 0.014);

  return (
    <section id="capabilities" className="bg-surface text-text" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className="grid grid-cols-1 gap-y-8 md:grid-cols-12 md:gap-x-10 lg:gap-x-12"
          aria-labelledby="capabilities-heading"
        >
          <DistortLetters
            key={`headline-${runKey}`}
            as="h2"
            text={header.headline}
            play={shouldAnimate}
            ariaLabel={header.headline}
            className="md:col-span-7 lg:col-span-7 text-5xl sm:text-7xl lg:text-8xl font-semibold tracking-tight leading-none"
          />

          <motion.p
            key={`aside-${runKey}`}
            className="md:col-span-5 lg:col-span-5 md:self-center lg:mt-2 text-left text-sm sm:text-base leading-relaxed text-text-muted max-w-prose"
            initial={shouldAnimate ? { opacity: 0, y: baseY, filter: `blur(${baseBlur}px)` } : false}
            animate={
              shouldAnimate
                ? {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: baseDuration, ease: [0.22, 1, 0.36, 1] },
                  }
                : { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0 } }
            }
            style={{ willChange: "transform, opacity, filter", transform: "translateZ(0)" }}
          >
            {header.aside}
          </motion.p>
        </div>

        {/* List + Hover preview */}
        <div className="relative">
          <HoverPreview activeIndex={hoveredIndex} images={images} point={point} size={220} easing={0.22} />

          <ol className="group mt-20 md:mt-28 mb-16" onMouseMove={onListMouseMove} onMouseLeave={onListMouseLeave}>
            {items.map((item, idx) => (
              <li
                key={idx}
                tabIndex={0}
                onMouseEnter={() => setHoveredIndex((prev) => (prev === idx ? prev : idx))}
                onFocus={() => setHoveredIndex((prev) => (prev === idx ? prev : idx))}
                onBlur={() => setHoveredIndex((prev) => (prev === null ? prev : null))}
                className={[
                  "py-12 md:py-14 border-t last:border-b border-border",
                  "transition-[opacity,transform,filter] duration-300 ease-out transform-gpu",
                  "opacity-100 group-hover:opacity-40 hover:opacity-100 focus-visible:opacity-100",
                  "hover:scale-[1.01]",
                ].join(" ")}
                aria-current={hoveredIndex === idx ? "true" : undefined}
              >
                <div className="grid grid-cols-1 gap-y-4 md:grid-cols-12 md:items-start md:gap-x-10 lg:gap-x-12">
                  <div className="md:col-span-7 lg:col-span-7">
                    <div className="flex items-baseline gap-6">
                      <span className="font-mono tabular-nums text-sm sm:text-base text-text-muted">
                        {formatNumber(idx)}
                      </span>

                      <DistortLetters
                        key={`title-${idx}-${runKey}`}
                        as="h3"
                        text={item.title}
                        play={shouldAnimate}
                        ariaLabel={item.title}
                        className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-5 lg:col-span-5 md:-mt-2 lg:-mt-3">
                    <motion.p
                      key={`desc-${idx}-${runKey}`}
                      className="text-left text-sm sm:text-base text-text-muted"
                      initial={shouldAnimate ? { opacity: 0, y: baseY, filter: `blur(${baseBlur}px)` } : false}
                      animate={
                        shouldAnimate
                          ? {
                              opacity: 1,
                              y: 0,
                              filter: "blur(0px)",
                              transition: {
                                duration: baseDuration,
                                delay: 0.06 + idx * baseStagger,
                                ease: [0.22, 1, 0.36, 1],
                              },
                            }
                          : { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0 } }
                      }
                      style={{ willChange: "transform, opacity, filter", transform: "translateZ(0)" }}
                    >
                      {item.description}
                    </motion.p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
