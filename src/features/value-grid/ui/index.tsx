// src/features/value-grid/ui/index.tsx
"use client";

import Image from "next/image";
import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  cubicBezier,
  type Variants,
} from "framer-motion";
import type { ValueGridProps } from "../content/value-grid.mapper";

/**
 * ValueGrid (v10)
 * - Mantiene layout + scroll-title.
 * - Entrada al “pasar por la sección”: cards aparecen 1 por 1 (stagger) con delay notorio.
 * - Fix TS: evita ease: number[] (usa cubicBezier()) + variants tipados.
 */
export default function ValueGrid({ titleLines, cards }: ValueGridProps) {
  const [idea, uiux, responsive, optimization] = cards;
  const titleId = "value-grid-heading";

  const prefersReducedMotion = useReducedMotion();
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Detecta mobile
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Efecto scroll: activación un poco antes
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 8%", "end 12%"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.1, 1], [1, 1, 0.7]);
  const y = useTransform(scrollYProgress, [0, 0.1, 1], [0, 0, 64]);
  const opacity = useTransform(scrollYProgress, [0, 0.55, 0.82], [1, 1, 0]);

  const h3Rect =
    "font-semibold text-[clamp(1.5rem,2.6vw,2rem)] text-[var(--text)]";
  const h3Square =
    "font-semibold text-[clamp(1.5rem,2.6vw,2rem)] text-[var(--text)] text-center";

  const body =
    "text-[var(--text)] whitespace-pre-line text-[clamp(1rem,1.8vw,1.1rem)]";

  const cmsData =
    uiux.cms ??
    (uiux.chipItems && uiux.chipItems.length
      ? {
          title: uiux.chipTitle ?? "CMS",
          items: uiux.chipItems.map((label, i) => ({
            label,
            icon: uiux.chipIcons?.[i],
          })),
        }
      : undefined);

  // ===== Entrada 1x1 (stagger) con delay más notorio =====
  const EASE = React.useMemo(() => cubicBezier(0.2, 0.8, 0.2, 1), []);

  const gridContainerVariants = React.useMemo<Variants>(() => {
    if (prefersReducedMotion) {
      return {
        hidden: {},
        show: { transition: { delayChildren: 0.06, staggerChildren: 0.08 } },
      };
    }
    return {
      hidden: {},
      show: {
        transition: {
          delayChildren: 0.28, // más delay general
          staggerChildren: 0.16, // más separación entre cards
        },
      },
    };
  }, [prefersReducedMotion]);

  const gridItemVariants = React.useMemo<Variants>(() => {
    if (prefersReducedMotion) {
      return {
        hidden: { opacity: 0, y: 0, scale: 1, filter: "blur(0px)" },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: { duration: 0.2, ease: "linear" },
        },
      };
    }

    return {
      hidden: { opacity: 0, y: 22, scale: 0.985, filter: "blur(7px)" },
      show: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: { duration: 0.62, ease: EASE },
      },
    };
  }, [EASE, prefersReducedMotion]);

  // Dispara cuando ya está más dentro de viewport (se nota más el delay)
  const viewport = React.useMemo(() => ({ once: true, amount: 0.34 }), []);

  return (
    <section aria-labelledby={titleId} className="relative">
      <div
        ref={containerRef}
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10"
      >
        {/* Título principal — detrás del grid */}
        <header className="mb-4 md:mb-6 sticky top-10 md:top-12 z-0">
          {isMobile ? (
            <motion.h2
              id={titleId}
              className="tracking-tight leading-[0.92] pointer-events-none"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={
                prefersReducedMotion
                  ? undefined
                  : { delay: 0.22, duration: 0.65, ease: EASE }
              }
            >
              {titleLines.map((line, i) => (
                <span
                  key={i}
                  className="block font-light text-[clamp(3.9rem,15.5vw,5.6rem)]"
                >
                  {line}
                </span>
              ))}
            </motion.h2>
          ) : (
            <motion.h2
              id={titleId}
              className="tracking-tight leading-[0.86] pointer-events-none"
              style={prefersReducedMotion ? undefined : { scale, y, opacity }}
            >
              {titleLines.map((line, i) => (
                <span
                  key={i}
                  className="block font-light text-[clamp(3.9rem,9.6vw,8.6rem)]"
                >
                  {line}
                </span>
              ))}
            </motion.h2>
          )}
        </header>

        {/* GRID por encima del título */}
        <div className="relative z-1">
          {/* ===== MOBILE ===== */}
          <motion.div
            className="md:hidden grid gap-3 sm:grid-cols-2 sm:auto-rows-fr"
            variants={gridContainerVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
          >
            {/* 1) RECTÁNGULO en sm+ (full width), en XS sigue cuadrado */}
            <motion.div
              variants={gridItemVariants}
              className="aspect-square sm:col-span-2 sm:aspect-video"
            >
              <Card
                ariaLabel={idea.title}
                className="h-full"
                glows={[
                  {
                    at: "0% 100%",
                    size: "460px 280px",
                    color: "var(--primary-700)",
                    intensity: 40,
                    fade: 60,
                  },
                  {
                    at: "100% 100%",
                    size: "260px 170px",
                    color: "var(--accent-500)",
                    intensity: 34,
                    fade: 58,
                  },
                ]}
              >
                <div className="flex h-full flex-col px-2">
                  <h3 className={h3Square}>{idea.title}</h3>
                  {idea.body ? (
                    <div className="mt-auto w-full pb-1.5">
                      <p className={`text-left ${body}`}>{idea.body}</p>
                    </div>
                  ) : null}
                </div>
              </Card>
            </motion.div>

            {/* 2) CUADRADO */}
            <motion.div variants={gridItemVariants} className="aspect-square">
              <Card
                ariaLabel={uiux.title}
                className="relative h-full"
                glows={[
                  {
                    at: "100% 0%",
                    size: "520px 320px",
                    color: "var(--primary-600)",
                    intensity: 42,
                    fade: 58,
                  },
                  {
                    at: "100% 50%",
                    size: "300px 240px",
                    color: "var(--accent-500)",
                    intensity: 36,
                    fade: 56,
                  },
                ]}
              >
                <div className="flex h-full flex-col px-2">
                  <h3 className={h3Square}>{uiux.title}</h3>

                  {uiux.body ? (
                    <div className="mt-auto pb-1.5">
                      <p className={`text-left ${body}`}>{uiux.body}</p>
                    </div>
                  ) : null}

                  {cmsData ? (
                    <div className="mt-2">
                      <CMSWidgetInline cms={cmsData} />
                    </div>
                  ) : null}
                </div>
              </Card>
            </motion.div>

            {/* 3) CUADRADO */}
            <motion.div variants={gridItemVariants} className="aspect-square">
              <Card
                ariaLabel={responsive.title}
                className="h-full"
                glows={[
                  {
                    at: "0% 50%",
                    size: "520px 340px",
                    color: "var(--primary-600)",
                    intensity: 38,
                    fade: 60,
                  },
                  {
                    at: "50% 100%",
                    size: "280px 180px",
                    color: "var(--accent-500)",
                    intensity: 30,
                    fade: 58,
                  },
                ]}
              >
                <div className="flex h-full flex-col px-2">
                  <h3 className={h3Square}>{responsive.title}</h3>

                  {responsive.image ? (
                    <div className="relative mt-2 w-full flex-1">
                      <div className="relative h-full w-full">
                        <Image
                          src={responsive.image.src}
                          alt={responsive.image.alt}
                          fill
                          sizes="(min-width:640px) 44vw, 92vw"
                          className="object-contain"
                          priority={false}
                        />
                      </div>
                    </div>
                  ) : null}

                  {responsive.body ? (
                    <div className="mt-auto pb-1.5">
                      <p className={`text-left ${body}`}>{responsive.body}</p>
                    </div>
                  ) : null}
                </div>
              </Card>
            </motion.div>

            {/* 4) RECTÁNGULO en sm+ (full width), en XS sigue cuadrado */}
            <motion.div
              variants={gridItemVariants}
              className="aspect-square sm:col-span-2 sm:aspect-video"
            >
              <Card
                ariaLabel={optimization.title}
                className="relative h-full overflow-hidden"
                glows={[
                  {
                    at: "100% 100%",
                    size: "300px 190px",
                    color: "var(--primary-600)",
                    intensity: 30,
                    fade: 56,
                  },
                  {
                    at: "100% 100%",
                    size: "260px 170px",
                    color: "var(--accent-500)",
                    intensity: 36,
                    fade: 54,
                  },
                ]}
              >
                <div className="flex h-full flex-col px-2">
                  <h3 className={h3Square}>{optimization.title}</h3>

                  {optimization.image ? (
                    <div className="pointer-events-none relative mt-2 w-full flex-1">
                      <div className="relative h-full w-full">
                        <Image
                          src={optimization.image.src}
                          alt=""
                          fill
                          sizes="(min-width:640px) 92vw, 92vw"
                          className="object-contain opacity-95"
                          priority={false}
                        />
                      </div>
                    </div>
                  ) : null}

                  {optimization.body ? (
                    <div className="mt-auto pb-1.5">
                      <p className={`text-left ${body}`}>{optimization.body}</p>
                    </div>
                  ) : null}
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* ===== DESKTOP/TABLET ===== */}
          <motion.div
            className="hidden md:block"
            variants={gridContainerVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
          >
            {/* === FILA SUPERIOR === */}
            <div className="grid gap-3 md:gap-4 md:grid-cols-[minmax(80px,0.7fr)_minmax(280px,1.6fr)] lg:grid-cols-[minmax(100px,0.7fr)_minmax(400px,1.7fr)]">
              <motion.div variants={gridItemVariants} className="md:aspect-square">
                <Card
                  ariaLabel={idea.title}
                  className="h-full"
                  glows={[
                    {
                      at: "0% 100%",
                      size: "460px 280px",
                      color: "var(--primary-700)",
                      intensity: 40,
                      fade: 60,
                    },
                    {
                      at: "100% 100%",
                      size: "260px 170px",
                      color: "var(--accent-500)",
                      intensity: 34,
                      fade: 58,
                    },
                  ]}
                >
                  <div className="flex h-full flex-col px-2 md:px-3">
                    <h3 className={h3Square}>{idea.title}</h3>
                    {idea.body && (
                      <div className="mt-auto w-full flex justify-center pb-1.5 md:pb-2">
                        <div className="w-[88%] sm:w-[84%] md:w-[78%]">
                          <p className={`text-left ${body}`}>{idea.body}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={gridItemVariants} className="md:h-full">
                <Card
                  ariaLabel={uiux.title}
                  className="relative h-full"
                  glows={[
                    {
                      at: "100% 0%",
                      size: "520px 320px",
                      color: "var(--primary-600)",
                      intensity: 42,
                      fade: 58,
                    },
                    {
                      at: "100% 50%",
                      size: "300px 240px",
                      color: "var(--accent-500)",
                      intensity: 36,
                      fade: 56,
                    },
                  ]}
                >
                  <div className="flex h-full flex-col pl-2 md:pl-3 pr-32 md:pr-40">
                    <h3 className={h3Rect}>{uiux.title}</h3>
                    {uiux.body && (
                      <div className="mt-auto pb-1.5 md:pb-2">
                        <p className={`text-left ${body}`}>{uiux.body}</p>
                      </div>
                    )}
                  </div>
                  {cmsData ? <CMSWidget cms={cmsData} /> : null}
                </Card>
              </motion.div>
            </div>

            {/* === FILA INFERIOR (invertida) === */}
            <div className="mt-3 md:mt-4 grid gap-3 md:gap-4 md:grid-cols-[minmax(280px,1.6fr)_minmax(80px,0.7fr)] lg:grid-cols-[minmax(400px,1.7fr)_minmax(100px,0.7fr)]">
              <motion.div variants={gridItemVariants} className="md:h-full">
                <Card
                  ariaLabel={responsive.title}
                  className="h-full"
                  glows={[
                    {
                      at: "0% 50%",
                      size: "520px 340px",
                      color: "var(--primary-600)",
                      intensity: 38,
                      fade: 60,
                    },
                    {
                      at: "50% 100%",
                      size: "280px 180px",
                      color: "var(--accent-500)",
                      intensity: 30,
                      fade: 58,
                    },
                  ]}
                >
                  <div className="grid h-full gap-2 md:gap-3 lg:grid-cols-2 items-stretch">
                    <div className="flex h-full flex-col justify-between px-2 md:px-3">
                      <h3 className={h3Rect}>{responsive.title}</h3>
                      {responsive.body && (
                        <div className="pb-1.5 md:pb-2">
                          <p className={`text-left ${body}`}>{responsive.body}</p>
                        </div>
                      )}
                    </div>

                    {responsive.image && (
                      <div className="relative grid place-items-end">
                        <div className="relative w-full md:w-[72%] aspect-video">
                          <Image
                            src={responsive.image.src}
                            alt={responsive.image.alt}
                            fill
                            sizes="(min-width:1024px) 42vw, (min-width:768px) 52vw, 92vw"
                            className="object-contain"
                            priority={false}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={gridItemVariants} className="md:aspect-square">
                <Card
                  ariaLabel={optimization.title}
                  className="relative h-full overflow-hidden"
                  glows={[
                    {
                      at: "100% 100%",
                      size: "300px 190px",
                      color: "var(--primary-600)",
                      intensity: 30,
                      fade: 56,
                    },
                    {
                      at: "100% 100%",
                      size: "260px 170px",
                      color: "var(--accent-500)",
                      intensity: 36,
                      fade: 54,
                    },
                  ]}
                >
                  <div className="flex h-full flex-col px-2 md:px-3">
                    <h3 className={h3Square}>{optimization.title}</h3>
                    {optimization.body && (
                      <div className="mt-auto w-full flex justify-center pb-1.5 md:pb-2">
                        <div className="w-[88%] sm:w-[84%] md:w-[78%]">
                          <p className={`text-left ${body}`}>{optimization.body}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {optimization.image && (
                    <div className="pointer-events-none absolute bottom-2 right-2 w-[42%] max-w-[220px] aspect-square">
                      <Image
                        src={optimization.image.src}
                        alt=""
                        fill
                        sizes="(min-width:1024px) 20vw, (min-width:768px) 24vw, 40vw"
                        className="object-contain opacity-95"
                        priority={false}
                      />
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------- CMS widget (desktop absolute) ---------- */
function CMSWidget({
  cms,
}: {
  cms: { title: string; items: { label: string; icon?: string }[] };
}) {
  return (
    <aside
      className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-36 sm:w-44 rounded-2xl border border-(--border) bg-(--surface-muted) p-2.5"
      style={{ boxShadow: "var(--shadow-xs)" }}
      role="note"
      aria-label={cms.title}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-(--text)">{cms.title}</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {cms.items.slice(0, 4).map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className="flex flex-col items-center text-center"
          >
            {item.icon ? <img src={item.icon} alt="" className="mb-1 h-5 w-5" /> : null}
            <span className="text-[0.72rem] leading-4 text-(--text)">{item.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ---------- CMS widget (mobile inline) ---------- */
function CMSWidgetInline({
  cms,
}: {
  cms: { title: string; items: { label: string; icon?: string }[] };
}) {
  return (
    <div
      className="w-full rounded-2xl border border-(--border) bg-(--surface-muted) p-2"
      style={{ boxShadow: "var(--shadow-xs)" }}
      role="note"
      aria-label={cms.title}
    >
      <div className="mb-2 text-sm font-semibold text-(--text)">{cms.title}</div>
      <div className="grid grid-cols-2 gap-2">
        {cms.items.slice(0, 4).map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className="flex flex-col items-center text-center"
          >
            {item.icon ? <img src={item.icon} alt="" className="mb-1 h-5 w-5" /> : null}
            <span className="text-[0.72rem] leading-4 text-(--text)">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- UI primitive local + multi-glow overlays ---------- */
type GlowSpec = {
  at: string;
  size: string;
  color: string;
  intensity: number;
  fade?: number;
};

type CardProps = React.PropsWithChildren<{
  className?: string;
  as?: "div" | "article" | "section";
  ariaLabel?: string;
  glows?: GlowSpec[];
}>;

function Card({
  className,
  as: Tag = "article",
  ariaLabel,
  glows,
  children,
}: CardProps) {
  return (
    <Tag
      aria-label={ariaLabel}
      className={[
        "group relative overflow-hidden isolate",
        "rounded-4xl",
        "border border-(--border)",
        "bg-(--surface-raised)",
        "text-(--text)",
        "p-3 md:p-4",
        "w-full h-full",
        className || "",
      ].join(" ")}
      style={{ boxShadow: "var(--shadow-xs)" }}
    >
      <div className="relative z-2">{children}</div>
      {Array.isArray(glows) && glows.map((g, i) => <GlowOverlay key={i} spec={g} />)}
    </Tag>
  );
}

function GlowOverlay({ spec }: { spec: GlowSpec }) {
  const fade = spec.fade ?? 70;
  const backgroundImage = `
    radial-gradient(
      ${spec.size} at ${spec.at},
      color-mix(in oklab, ${spec.color} ${spec.intensity}%, transparent) 0%,
      transparent ${fade}%
    )
  `;

  return (
    <span
      aria-hidden="true"
      className="
        pointer-events-none absolute inset-0 z-1
        opacity-0 group-hover:opacity-95
        transition-opacity duration-250 ease-out
        will-change-opacity
        motion-reduce:transition-none
      "
      style={{ backgroundImage }}
    />
  );
}
