// src/features/hero/ui/index.tsx
"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { HeroProps } from "@/features/hero/content/hero.mapper";
import useSectionInView from "@/hooks/useSectionInView";

/** Debe coincidir con las props exportadas por Model3D.client */
type Model3DProps = {
  src: string;
  poster?: string;
  alt: string;
  className?: string;
  eventSource?: RefObject<HTMLElement>;
  /** Controla si los efectos (nebulosa, humo…) están activos o en modo mínimo */
  effectsActive?: boolean;
  /** ✅ Pausa total del render loop cuando es false */
  renderActive?: boolean;
};

// Import dinámico tipado
const Model3D = dynamic<Model3DProps>(
  () => import("./Model3D.client").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-64 md:h-full w-full animate-pulse bg-surface-muted"
        aria-hidden="true"
      />
    ),
  },
);

export default function Hero(props: HeroProps) {
  const { kicker, headline, tagline, media } = props;

  const isModel = media.type !== "image";

  // ✅ Visibilidad “real” (para FX)
  const { ref: heroRef, inView: isHeroVisible } = useSectionInView<HTMLElement>({
    // más rango para que no se apague tan rápido
    rootMargin: "10% 0px -20% 0px",
    threshold: 0.18,
    once: false,
  });

  /**
   * ✅ Near-inView (pre-warm) SIN tocar tu hook:
   * - Observamos el mismo heroRef.current con un rootMargin grande
   */
  const [nearInView, setNearInView] = useState(false);

  useEffect(() => {
    if (!isModel) return;
    const el = heroRef?.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => setNearInView(!!entry?.isIntersecting),
      {
        root: null,
        // “predicción” (monta antes de llegar)
        rootMargin: "900px 0px 900px 0px",
        threshold: 0.01,
      },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [isModel, heroRef]);

  // Ref del contenedor del modelo (eventSource para el Canvas)
  const eventSourceRef = useRef<HTMLDivElement | null>(null);

  // ✅ Gate de montaje del 3D: cuando estás cerca o visible, o por idle.
  const [mount3D, setMount3D] = useState(false);

  useEffect(() => {
    if (!isModel) return;
    if (mount3D) return;

    if (nearInView || isHeroVisible) {
      setMount3D(true);
      return;
    }

    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      setMount3D(true);
    };

    const ric =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? (window.requestIdleCallback as unknown as (
            cb: () => void,
            opts?: { timeout: number },
          ) => number)
        : null;

    let id: number | null = null;

    if (ric) {
      id = ric(run, { timeout: 700 });
      return () => {
        cancelled = true;
        try {
          if (id !== null) window.cancelIdleCallback?.(id);
        } catch {
          /* noop */
        }
      };
    }

    const t = window.setTimeout(run, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [isModel, nearInView, isHeroVisible, mount3D]);

  // ✅ FX solo si está visible + solo si 3D montado
  const effectsActive = mount3D && isHeroVisible;

  // ✅ Pausa total del loop cuando no está visible (pero mantiene “pre-warm”)
  const renderActive = mount3D && isHeroVisible;

  const sectionClasses = useMemo(
    () => ["relative overflow-hidden", "bg-surface text-text"].join(" "),
    [],
  );

  const containerClasses =
    "relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-6 py-10 md:py-16";

  // Layout base
  const rowClasses =
    "flex flex-col md:flex-row md:items-center md:justify-center md:gap-0 lg:gap-0 md:min-h-[70vh]";

  // Media empujada hacia el centro (desktop)
  const mediaColClasses =
    "order-2 md:order-1 md:basis-[52%] md:max-w-[52%] md:translate-x-6 lg:translate-x-10";

  // Copy empujado hacia la izquierda, montándose un poco sobre el modelo (desktop)
  const copyColClasses = [
    "order-1 md:order-2 md:basis-[52%] md:max-w-[52%]",
    "md:-translate-x-10 lg:-translate-x-14",
    "flex flex-col gap-4 items-end text-right",
  ].join(" ");

  const mediaWrapperBase = "relative w-full";
  const imageFrame =
    "aspect-[4/3] rounded-2xl overflow-hidden shadow-xl ring-1 ring-border bg-surface-raised";
  const mediaWrapperClasses =
    media.type === "image" ? `${mediaWrapperBase} ${imageFrame}` : mediaWrapperBase;

  // Escalonamos por palabra
  const words = headline.trim().split(/\s+/);

  const renderCopy = (extraClasses?: string) => (
    <div className={[copyColClasses, extraClasses].filter(Boolean).join(" ")}>
      {kicker && (
        <span className="uppercase tracking-[0.2em] text-xs md:text-sm text-text-muted">
          {kicker}
        </span>
      )}

      <h1 className="w-full font-semibold leading-[0.95] tracking-tight text-6xl md:text-8xl lg:text-9xl text-right">
        {words.map((word, index) => {
          const indentLevel = words.length - index - 1;
          return (
            <span
              key={index}
              className="block"
              style={{
                paddingLeft: `${indentLevel * 0.8}em`,
                textAlign: "right",
              }}
            >
              {word}
            </span>
          );
        })}
      </h1>

      {tagline && <p className="mt-3 text-base md:text-xl text-text-muted">{tagline}</p>}
    </div>
  );

  return (
    <section ref={heroRef} className={sectionClasses}>
      <div className={containerClasses}>
        {/* ===== Variante modelo 3D ===== */}
        {isModel ? (
          <div
            ref={eventSourceRef}
            className={[
              "relative min-h-[70vh] md:min-h-[70vh]",
              "md:flex md:flex-row md:items-center md:justify-center md:gap-0",
              "-mx-4 sm:mx-0",
              "contain-[layout]",
            ].join(" ")}
          >
            {/* Modelo: fondo en mobile, columna izquierda en desktop */}
            <div
              className={[
                "pointer-events-none absolute inset-0",
                "md:static md:pointer-events-auto",
                "md:order-1 md:basis-[52%] md:max-w-[52%] md:translate-x-6 lg:translate-x-10",
              ].join(" ")}
              aria-hidden="true"
            >
              <div className="w-full h-full md:h-[64vh] lg:h-[70vh] md:-ml-4 lg:-ml-6">
                {/* Poster rápido mientras no montamos el 3D */}
                {!mount3D && media.poster ? (
                  <img
                    src={media.poster}
                    alt={media.alt}
                    className="block w-full h-full object-cover"
                    loading="eager"
                  />
                ) : null}

                {/* Montaje real del 3D */}
                {mount3D ? (
                  <Model3D
                    src={media.src}
                    poster={media.poster}
                    alt={media.alt}
                    className="h-full w-full"
                    eventSource={eventSourceRef as unknown as RefObject<HTMLElement>}
                    effectsActive={effectsActive}
                    renderActive={renderActive}
                  />
                ) : null}
              </div>
            </div>

            {/* Copy: sobre el fondo, ligeramente hacia la derecha en mobile */}
            {renderCopy(
              [
                "relative z-[1]",
                "min-h-[70vh] justify-center pr-4",
                "w-full",
                "md:min-h-0 md:justify-start md:pr-0",
              ].join(" "),
            )}
          </div>
        ) : (
          /* ===== Variante imagen ===== */
          <div className={rowClasses}>
            <div className={mediaColClasses}>
              <div ref={eventSourceRef} className={`${mediaWrapperClasses} pointer-events-auto`}>
                <Image
                  src={media.src}
                  alt={media.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 58vw"
                  priority={media.priority}
                  className="object-cover object-center"
                />
              </div>
            </div>

            {renderCopy()}
          </div>
        )}
      </div>
    </section>
  );
}