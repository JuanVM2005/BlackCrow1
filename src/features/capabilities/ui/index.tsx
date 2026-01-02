// src/features/capabilities/ui/index.tsx
"use client";

import * as React from "react";
import Image from "next/image";
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
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
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
          setRunKey((k) => k + 1);
          io.disconnect();
        }

        wasIntersecting.current = isIntersecting;
        lastY.current = y;
      },
      { threshold: 0.35, rootMargin: "0px 0px -12% 0px", ...options },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [options]);

  return { ref, runKey, shouldAnimate } as const;
}

type TextTag = "span" | "h2" | "h3" | "p";

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
    const duration = readCssVarNumber("--cap-reveal-duration", 0.85);
    const stagger = readCssVarNumber("--cap-reveal-stagger", 0.014);
    const blur = readCssVarNumber("--cap-reveal-blur", 10);
    const y = readCssVarNumber("--cap-reveal-y", 10);

    const skew = readCssVarNumber("--cap-reveal-skew", 8) * 0.25;
    const rot = readCssVarNumber("--cap-reveal-rot", 2) * 0.25;

    return { duration, stagger, blur, y, skew, rot };
  }, []);

  React.useEffect(() => {
    if (play) controls.start("show");
    else controls.set("show");
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
    [params.stagger, play],
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
    [params.blur, params.duration, params.rot, params.skew, params.y, play],
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

  // Imágenes desde JSON (fallback a /01.webp...)
  const images = React.useMemo(() => {
    return items.map((it, i) => {
      const fromContent = it.image?.src?.trim();
      if (fromContent) return fromContent;
      return `/images/capabilities/${String(i + 1).padStart(2, "0")}.webp`;
    });
  }, [items]);

  const onListMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLOListElement>) => {
      const next = { x: e.clientX, y: e.clientY };
      const prev = lastPoint.current;
      if (prev && prev.x === next.x && prev.y === next.y) return;

      lastPoint.current = next;
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => setPoint(next));
    },
    [],
  );

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

  const { ref: sectionRef, runKey, shouldAnimate } =
    useEnterDownOnce<HTMLElement>();

  const baseY = readCssVarNumber("--cap-reveal-y", 10);
  const baseDuration = readCssVarNumber("--cap-reveal-duration", 0.85);
  const baseBlur = readCssVarNumber("--cap-reveal-blur", 10);
  const baseStagger = readCssVarNumber("--cap-reveal-stagger", 0.014);

  // ✅ Helpers: asegura point incluso si NO se mueve el mouse dentro del <ol>
  const setPointFromMouseEvent = React.useCallback(
    (e: React.MouseEvent) => {
      const next = { x: e.clientX, y: e.clientY };
      lastPoint.current = next;
      setPoint(next);
    },
    [],
  );

  const setPointFromElementCenter = React.useCallback((el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const next = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    lastPoint.current = next;
    setPoint(next);
  }, []);

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
            initial={
              shouldAnimate
                ? { opacity: 0, y: baseY, filter: `blur(${baseBlur}px)` }
                : false
            }
            animate={
              shouldAnimate
                ? {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: {
                      duration: baseDuration,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  }
                : {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 0 },
                  }
            }
            style={{
              willChange: "transform, opacity, filter",
              transform: "translateZ(0)",
            }}
          >
            {header.aside}
          </motion.p>
        </div>

        {/* List + Hover preview */}
        <div className="relative">
          {/* ✅ Desktop hover preview (forzado ON para evitar falsos negativos de MQ en Windows/trackpad) */}
          <HoverPreview
            enabled={true}
            activeIndex={hoveredIndex}
            images={images}
            point={point}
            size={350}
            easing={0.22}
            className="hidden md:block"
          />

          <ol
            className="group mt-16 md:mt-28 mb-16"
            onMouseMove={onListMouseMove}
            onMouseLeave={onListMouseLeave}
          >
            {items.map((item, idx) => {
              const imgSrc = images[idx];
              const imgAlt = item.image?.alt ?? item.title;

              return (
                <li
                  key={idx}
                  tabIndex={0}
                  onMouseEnter={(e) => {
                    setHoveredIndex((prev) => (prev === idx ? prev : idx));
                    // ✅ clave: setear point al entrar, aunque NO se mueva el mouse
                    setPointFromMouseEvent(e);
                  }}
                  onMouseMove={(e) => {
                    // ✅ mantiene fluidez aunque el cursor esté dentro del <li> sin disparar el <ol>
                    if (hoveredIndex === idx) setPointFromMouseEvent(e);
                  }}
                  onFocus={(e) => {
                    setHoveredIndex((prev) => (prev === idx ? prev : idx));
                    // ✅ teclado: posiciona preview en el centro del ítem
                    setPointFromElementCenter(e.currentTarget);
                  }}
                  onBlur={() => {
                    setHoveredIndex((prev) => (prev === null ? prev : null));
                    setPoint(null);
                    lastPoint.current = null;
                  }}
                  className={[
                    "py-10 md:py-14 border-t last:border-b border-border",
                    "transition-[opacity,transform,filter] duration-300 ease-out transform-gpu",
                    "opacity-100 group-hover:opacity-40 hover:opacity-100 focus-visible:opacity-100",
                    "hover:scale-[1.01]",
                  ].join(" ")}
                  aria-current={hoveredIndex === idx ? "true" : undefined}
                >
                  {/* ✅ Mobile: Título -> Imagen (sin borde, 8px radius) -> Contenido */}
                  <div className="md:hidden space-y-6">
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono tabular-nums text-sm text-text-muted">
                        {formatNumber(idx)}
                      </span>

                      <DistortLetters
                        key={`title-m-${idx}-${runKey}`}
                        as="h3"
                        text={item.title}
                        play={shouldAnimate}
                        ariaLabel={item.title}
                        className="text-2xl font-semibold leading-tight"
                      />
                    </div>

                    {imgSrc ? (
                      <div className="relative w-full">
                        <div
                          className="relative mx-auto w-[92%] sm:w-[88%] aspect-square overflow-hidden bg-background shadow-xl"
                          style={{ borderRadius: 8 }}
                        >
                          <Image
                            src={imgSrc}
                            alt={imgAlt}
                            fill
                            sizes="(max-width: 768px) 92vw, 520px"
                            priority={false}
                            style={{ objectFit: "cover" }}
                          />

                          {/* overlay suave (sin borde) */}
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0) 55%)",
                              borderRadius: 8,
                            }}
                          />
                        </div>
                      </div>
                    ) : null}

                    <motion.p
                      key={`desc-m-${idx}-${runKey}`}
                      className="text-left text-sm text-text-muted leading-relaxed"
                      initial={
                        shouldAnimate
                          ? { opacity: 0, y: baseY, filter: `blur(${baseBlur}px)` }
                          : false
                      }
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
                          : {
                              opacity: 1,
                              y: 0,
                              filter: "blur(0px)",
                              transition: { duration: 0 },
                            }
                      }
                      style={{
                        willChange: "transform, opacity, filter",
                        transform: "translateZ(0)",
                      }}
                    >
                      {item.description}
                    </motion.p>
                  </div>

                  {/* Desktop layout (igual que antes) */}
                  <div className="hidden md:grid grid-cols-1 gap-y-4 md:grid-cols-12 md:items-start md:gap-x-10 lg:gap-x-12">
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
                        initial={
                          shouldAnimate
                            ? { opacity: 0, y: baseY, filter: `blur(${baseBlur}px)` }
                            : false
                        }
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
                            : {
                                opacity: 1,
                                y: 0,
                                filter: "blur(0px)",
                                transition: { duration: 0 },
                              }
                        }
                        style={{
                          willChange: "transform, opacity, filter",
                          transform: "translateZ(0)",
                        }}
                      >
                        {item.description}
                      </motion.p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
