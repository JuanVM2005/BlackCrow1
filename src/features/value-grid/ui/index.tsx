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
import { IoLanguageSharp } from "react-icons/io5";

// ✅ Anchor destino (Card 3)
import { usePhoneAnchors } from "./usePhoneAnchors";

/**
 * ValueGrid (v31)
 * - Card 3 (penúltimo): reemplaza imagen por SLOT (anchor) para iPhone 3D (PhoneOverlay).
 * - El anchor se registra SOLO en el layout activo (mobile o desktop) para evitar rects 0.
 * - Card 4 (último): mantiene imagen centrada.
 */
export default function ValueGrid({ titleLines, cards }: ValueGridProps) {
  const [idea, uiux, responsive, optimization] = cards;
  const titleId = "value-grid-heading";

  const prefersReducedMotion = useReducedMotion();
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // ✅ Anchor destino del iPhone
  const { targetRef } = usePhoneAnchors();

  // Detecta mobile
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // ✅ Registramos el target SOLO en el layout visible
  const targetRefMobile = React.useCallback(
    (el: HTMLElement | null) => {
      if (!isMobile) return;
      targetRef(el);
    },
    [isMobile, targetRef],
  );

  const targetRefDesktop = React.useCallback(
    (el: HTMLElement | null) => {
      if (isMobile) return;
      targetRef(el);
    },
    [isMobile, targetRef],
  );

  // Scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 8%", "end 12%"],
  });

  // Desktop: desaparece antes
  const scale = useTransform(scrollYProgress, [0, 0.1, 0.42], [1, 1, 0.72]);
  const y = useTransform(scrollYProgress, [0, 0.1, 0.42], [0, 0, 72]);
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.38], [1, 1, 0]);

  // Mobile: también desaparece antes
  const mScale = useTransform(scrollYProgress, [0, 0.14, 0.44], [1, 1, 0.92]);
  const mY = useTransform(scrollYProgress, [0, 0.14, 0.44], [0, 0, 18]);
  const mOpacity = useTransform(scrollYProgress, [0, 0.16, 0.36], [1, 1, 0]);

  const h3Rect =
    "font-semibold text-[clamp(1.5rem,2.6vw,2rem)] text-[var(--text)]";
  const h3Square =
    "font-semibold text-[clamp(1.5rem,2.6vw,2rem)] text-[var(--text)] text-center";

  // Body grande (cards 2 y 3)
  const bodyBig =
    "text-[var(--text)] whitespace-pre-line font-medium text-[clamp(1.75rem,3.2vw,2.55rem)] leading-[1.05]";

  // Body párrafo (cards 1 y 4)
  const bodyJustify =
    "text-[var(--text)] text-[clamp(1rem,1.8vw,1.1rem)] leading-[1.35] text-justify [text-wrap:pretty] [hyphens:auto]";

  // CMS data (tipado seguro con el VM actual)
  const cmsData =
    uiux.cms ??
    (uiux.chipItems && uiux.chipItems.length
      ? {
          title: uiux.chipTitle ?? "CMS",
          items: uiux.chipItems.map((label) => ({ label })),
        }
      : undefined);

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
      show: { transition: { delayChildren: 0.28, staggerChildren: 0.16 } },
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

  const viewport = React.useMemo(() => ({ once: true, amount: 0.34 }), []);

  return (
    <section aria-labelledby={titleId} className="relative">
      <div
        ref={containerRef}
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10"
      >
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
              style={
                prefersReducedMotion
                  ? undefined
                  : { opacity: mOpacity, y: mY, scale: mScale }
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

        <div className="relative z-1">
          {/* ===== MOBILE ===== */}
          <motion.div
            className="md:hidden grid gap-3 sm:grid-cols-2 sm:auto-rows-fr"
            variants={gridContainerVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
          >
            {/* 1 */}
            <motion.div
              variants={gridItemVariants}
              className="aspect-square sm:col-span-2 sm:aspect-video"
            >
              <Card
                ariaLabel={idea.title}
                className="h-full"
                glows={buildPastelGlows("a")}
              >
                <div className="flex h-full flex-col px-2">
                  <h3 className={h3Square}>{idea.title}</h3>

                  {idea.body ? (
                    <div className="mt-auto w-full pb-1.5">
                      <p className={bodyJustify}>{toJustifyText(idea.body)}</p>
                    </div>
                  ) : null}
                </div>
              </Card>
            </motion.div>

            {/* 2 */}
            <motion.div variants={gridItemVariants} className="aspect-square">
              <Card
                ariaLabel={uiux.title}
                className="relative h-full"
                glows={buildPastelGlows("b")}
              >
                <div className="flex h-full flex-col px-2">
                  <h3 className={h3Square}>{uiux.title}</h3>

                  {cmsData ? (
                    <div className="mt-2">
                      <CMSWidgetInline cms={cmsData} />
                    </div>
                  ) : null}

                  <div className="flex-1" />

                  {uiux.body ? (
                    <div className="mt-auto pb-0">
                      <p className={`text-left ${bodyBig}`}>{uiux.body}</p>
                    </div>
                  ) : null}
                </div>
              </Card>
            </motion.div>

            {/* 3 (SLOT 3D) */}
            <motion.div variants={gridItemVariants} className="aspect-square">
              <Card
                ariaLabel={responsive.title}
                className="h-full"
                glows={buildPastelGlows("c")}
              >
                <div className="flex h-full flex-col px-2">
                  <h3 className={h3Square}>{responsive.title}</h3>

                  {/* ✅ Slot destino para el iPhone 3D (PhoneOverlay) */}
                  <div className="relative mt-2 w-full flex-1">
                    <div
                      ref={targetRefMobile}
                      aria-hidden="true"
                      className="absolute inset-0"
                    />
                  </div>

                  {responsive.body ? (
                    <div className="mt-auto pb-0">
                      <p className={`text-left ${bodyBig}`}>{responsive.body}</p>
                    </div>
                  ) : null}
                </div>
              </Card>
            </motion.div>

            {/* 4 */}
            <motion.div
              variants={gridItemVariants}
              className="aspect-square sm:col-span-2 sm:aspect-video"
            >
              <Card
                ariaLabel={optimization.title}
                className="relative h-full overflow-hidden"
                glows={buildPastelGlows("d")}
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
                      <p className={bodyJustify}>
                        {toJustifyText(optimization.body)}
                      </p>
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
              <motion.div
                variants={gridItemVariants}
                className="md:aspect-square"
              >
                <Card
                  ariaLabel={idea.title}
                  className="h-full"
                  glows={buildPastelGlows("a")}
                >
                  <div className="flex h-full flex-col px-2 md:px-3">
                    <h3 className={h3Square}>{idea.title}</h3>
                    <div className="flex-1" />
                    <div className="pb-2 md:pb-3">
                      {idea.body && (
                        <div className="w-full flex justify-center">
                          <div className="w-[88%] sm:w-[84%] md:w-[78%]">
                            <p className={bodyJustify}>
                              {toJustifyText(idea.body)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={gridItemVariants} className="md:h-full">
                <Card
                  ariaLabel={uiux.title}
                  className="relative h-full"
                  glows={buildPastelGlows("b")}
                >
                  <div className="flex h-full flex-col pl-2 md:pl-3 pr-32 md:pr-40">
                    <h3 className={h3Rect}>{uiux.title}</h3>
                    <div className="flex-1" />
                    <div className="pb-2 md:pb-3">
                      {uiux.body && (
                        <p className={`text-left ${bodyBig}`}>{uiux.body}</p>
                      )}
                    </div>
                  </div>

                  {cmsData ? <CMSWidget cms={cmsData} /> : null}
                </Card>
              </motion.div>
            </div>

            {/* === FILA INFERIOR (invertida) === */}
            <div className="mt-3 md:mt-4 grid gap-3 md:gap-4 md:grid-cols-[minmax(280px,1.6fr)_minmax(80px,0.7fr)] lg:grid-cols-[minmax(400px,1.7fr)_minmax(100px,0.7fr)]">
              {/* 3 (penúltimo) */}
              <motion.div variants={gridItemVariants} className="md:h-full">
                <Card
                  ariaLabel={responsive.title}
                  className="h-full"
                  glows={buildPastelGlows("c")}
                >
                  <div className="grid h-full gap-2 md:gap-3 lg:grid-cols-2 items-stretch">
                    <div className="flex h-full flex-col px-2 md:px-3">
                      <h3 className={h3Rect}>{responsive.title}</h3>
                      <div className="flex-1" />
                      <div className="pb-2 md:pb-3">
                        {responsive.body && (
                          <p className={`text-left ${bodyBig}`}>
                            {responsive.body}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ✅ Slot destino para el iPhone 3D (PhoneOverlay) */}
                    <div className="relative grid place-items-center">
                      <div
                        className="relative w-[92%] md:w-[88%] lg:w-[96%] aspect-4/3"
                        aria-hidden="true"
                      >
                        <div
                          ref={targetRefDesktop}
                          aria-hidden="true"
                          className="absolute inset-0"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* 4 (último) */}
              <motion.div variants={gridItemVariants} className="md:aspect-square">
                <Card
                  ariaLabel={optimization.title}
                  className="relative h-full overflow-hidden"
                  glows={buildPastelGlows("d")}
                >
                  <div className="flex h-full flex-col px-2 md:px-3">
                    <h3 className={h3Square}>{optimization.title}</h3>
                    <div className="flex-1" />
                    <div className="pb-2 md:pb-3">
                      {optimization.body && (
                        <div className="w-full flex justify-center">
                          <div className="w-[88%] sm:w-[84%] md:w-[78%]">
                            <p className={bodyJustify}>
                              {toJustifyText(optimization.body)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {optimization.image && (
                    <div className="pointer-events-none absolute inset-0 grid place-items-center">
                      <div className="relative w-[62%] max-w-[320px] aspect-square">
                        <Image
                          src={optimization.image.src}
                          alt=""
                          fill
                          sizes="(min-width:1024px) 20vw, (min-width:768px) 24vw, 40vw"
                          className="object-contain opacity-95"
                          priority={false}
                        />
                      </div>
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

function toJustifyText(text: string) {
  return text.replace(/\s*\n+\s*/g, " ").trim();
}

/* ------------------------------------------------------------------ */
/* CMS widget (desktop) */
/* ------------------------------------------------------------------ */
function CMSWidget({
  cms,
}: {
  cms: { title: string; items: { label: string }[] };
}) {
  const items = cms.items.slice(0, 2);

  return (
    <>
      <aside
        className="valuegrid-cms-widget absolute right-2 sm:right-3 w-40 sm:w-44 rounded-2xl border border-(--border) bg-(--surface-muted) p-3"
        style={{ boxShadow: "var(--shadow-xs)" }}
        role="note"
        aria-label={cms.title}
      >
        <div className="flex h-full flex-col">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-(--text)">CMS</div>
            <IoLanguageSharp className="h-10 w-10 text-(--text)" />
          </div>

          <div className="mt-auto">
            <div className="grid grid-cols-2 gap-[0.15rem]">
              {items.map((item, i) => (
                <div
                  key={`${item.label}-${i}`}
                  className="text-[0.75rem] leading-4 text-(--text)"
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <style jsx>{`
        .valuegrid-cms-widget {
          bottom: calc(var(--spacing) * 2);
        }
      `}</style>
    </>
  );
}

/* ------------------------ */
/* CMS widget (mobile inline) */
/* ------------------------ */
function CMSWidgetInline({
  cms,
}: {
  cms: { title: string; items: { label: string }[] };
}) {
  const items = cms.items.slice(0, 2);

  return (
    <div
      className="w-full rounded-2xl border border-(--border) bg-(--surface-muted) p-3"
      style={{ boxShadow: "var(--shadow-xs)" }}
      role="note"
      aria-label={cms.title}
    >
      <div className="flex flex-col">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-semibold text-(--text)">CMS</div>
          <IoLanguageSharp className="h-10 w-10 text-(--text)" />
        </div>

        <div className="mt-auto">
          <div className="grid grid-cols-2 gap-[0.15rem]">
            {items.map((item, i) => (
              <div
                key={`${item.label}-${i}`}
                className="text-[0.75rem] leading-4 text-(--text)"
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* Glows: pastel — SOLO hover */
/* -------------------------------------------------- */
type GlowSpec = {
  at: string;
  size: string;
  color: string;
  intensity: number;
  fade?: number;
};

function buildPastelGlows(seed: "a" | "b" | "c" | "d"): GlowSpec[] {
  const presets: Record<typeof seed, GlowSpec[]> = {
    a: [
      { at: "20% 88%", size: "760px 560px", color: "#B56BFF", intensity: 40, fade: 72 },
      { at: "92% 82%", size: "720px 540px", color: "#FF6FA0", intensity: 38, fade: 74 },
      { at: "60% 12%", size: "760px 560px", color: "#FF8A66", intensity: 30, fade: 76 },
    ],
    b: [
      { at: "92% 14%", size: "760px 560px", color: "#FF6FA0", intensity: 40, fade: 72 },
      { at: "12% 62%", size: "720px 540px", color: "#B56BFF", intensity: 38, fade: 74 },
      { at: "56% 100%", size: "760px 560px", color: "#FF8A66", intensity: 30, fade: 76 },
    ],
    c: [
      { at: "12% 45%", size: "760px 560px", color: "#B56BFF", intensity: 38, fade: 74 },
      { at: "78% 100%", size: "720px 540px", color: "#FF6FA0", intensity: 38, fade: 74 },
      { at: "95% 14%", size: "760px 560px", color: "#FF8A66", intensity: 30, fade: 78 },
    ],
    d: [
      { at: "88% 90%", size: "760px 560px", color: "#FF6FA0", intensity: 38, fade: 74 },
      { at: "14% 86%", size: "720px 540px", color: "#B56BFF", intensity: 34, fade: 76 },
      { at: "92% 14%", size: "760px 560px", color: "#FF8A66", intensity: 30, fade: 78 },
    ],
  };
  return presets[seed];
}

/* ---------- Card ---------- */
type CardProps = React.PropsWithChildren<{
  className?: string;
  ariaLabel?: string;
  glows?: GlowSpec[];
}>;

function Card({ className, ariaLabel, glows, children }: CardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.article
      aria-label={ariaLabel}
      initial="rest"
      animate="rest"
      whileHover={prefersReducedMotion ? undefined : "hover"}
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
      <div className="relative z-2 h-full">{children}</div>
      {Array.isArray(glows) &&
        glows.map((g, i) => <GlowOverlay key={i} spec={g} />)}
    </motion.article>
  );
}

function GlowOverlay({ spec }: { spec: GlowSpec }) {
  const fade = spec.fade ?? 76;

  const backgroundImage = `
    radial-gradient(
      ${spec.size} at ${spec.at},
      color-mix(in oklab, ${spec.color} ${spec.intensity}%, transparent) 0%,
      transparent ${fade}%
    )
  `;

  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute z-1 inset-[-22%] will-change-opacity"
      style={{ backgroundImage }}
      variants={{
        rest: { opacity: 0 },
        hover: {
          opacity: 0.85,
          transition: { duration: 0.18, ease: "easeOut" },
        },
      }}
    />
  );
}
