// src/features/interactive-3d/ui/index.tsx
"use client";

import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import ShaderCanvas from "./ShaderCanvas.client";
import type { Interactive3DUiProps } from "@/features/interactive-3d/content/interactive-3d.mapper";

// Primitivas
import Section from "@/ui/Section";
import Container from "@/ui/Container";
import { Heading, Text } from "@/ui/Typography";

// Hook para detectar si la sección está en viewport
import { useSectionInView } from "@/hooks/useSectionInView";

/**
 * Detecta Mobile (pantalla chica + sin hover/coarse pointer).
 * - No afecta Windows/desktop.
 */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia(
      "(max-width: 639px) and (hover: none), (max-width: 639px) and (pointer: coarse)",
    );

    const update = () => setIsMobile(!!mq.matches);
    update();

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }

    // Safari legacy
    // eslint-disable-next-line deprecation/deprecation
    mq.addListener(update);
    // eslint-disable-next-line deprecation/deprecation
    return () => mq.removeListener(update);
  }, []);

  return isMobile;
}

/**
 * Detecta “mobile de baja resolución” (ej: 320–360px de ancho real).
 * - Solo se usa si ya es mobile.
 * - No afecta desktop.
 */
function useIsLowResMobile(enabled: boolean): boolean {
  const [low, setLow] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setLow(false);
      return;
    }
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(max-width: 360px)");

    const update = () => setLow(!!mq.matches);
    update();

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }

    // Safari legacy
    // eslint-disable-next-line deprecation/deprecation
    mq.addListener(update);
    // eslint-disable-next-line deprecation/deprecation
    return () => mq.removeListener(update);
  }, [enabled]);

  return low;
}

/**
 * Respeta prefers-reduced-motion sin depender de librerías extra.
 */
function usePrefersReducedMotionLocal(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(!!mq.matches);
    update();

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }

    // Safari legacy
    // eslint-disable-next-line deprecation/deprecation
    mq.addListener(update);
    // eslint-disable-next-line deprecation/deprecation
    return () => mq.removeListener(update);
  }, []);

  return reduced;
}

export default function Interactive3D({
  eyebrow,
  headline,
  ariaLabel = eyebrow,
}: Interactive3DUiProps): ReactElement {
  const { ref, inView } = useSectionInView();
  const isMobile = useIsMobile();
  const isLowResMobile = useIsLowResMobile(isMobile);
  const reducedMotion = usePrefersReducedMotionLocal();

  // ✅ Desktop/Windows: EXACTO como lo tenías
  const desktop = {
    padYTop: "calc(var(--header-h) * 1.2)",
    padYBottom: "calc(var(--header-h) * 1.2)",
    bubbleH: "calc(var(--header-h) * 9)",
    innerMinH: "calc(var(--header-h) * 6.4)",
    barTop: "calc(var(--header-h) * -2.0)",
    headlineSize: "calc(var(--header-h) * 1.26)",
    headlineTrack: "calc(var(--header-h) * -0.022)",
    barPadBlock: "calc(var(--header-h) * 0.10)",
    barPadInline: "calc(var(--header-h) * 0.56)",
    barGap: "calc(var(--header-h) * 0.28)",
  } as const;

  // ✅ SOLO mobile
  const mobile = {
    padYTop: "calc(var(--header-h) * 0.72)",
    padYBottom: "calc(var(--header-h) * 0.72)",
    bubbleH: "calc(var(--header-h) * 5.6)",
    innerMinH: "calc(var(--header-h) * 4.6)",
    barTop: "calc(var(--header-h) * -1.28)",
    headlineSize: "calc(var(--header-h) * 0.56)",
    headlineTrack: "calc(var(--header-h) * -0.012)",
    barPadBlock: "calc(var(--header-h) * 0.075)",
    barPadInline: "calc(var(--header-h) * 0.36)",
    barGap: "calc(var(--header-h) * 0.18)",
  } as const;

  // ✅ SOLO low-res mobile (320–360)
  const lowResMobile = {
    padYTop: "calc(var(--header-h) * 0.62)",
    padYBottom: "calc(var(--header-h) * 0.62)",
    bubbleH: "calc(var(--header-h) * 5.0)",
    innerMinH: "calc(var(--header-h) * 4.1)",
    barTop: "calc(var(--header-h) * -1.12)",
    headlineSize: "calc(var(--header-h) * 0.40)",
    headlineTrack: "calc(var(--header-h) * -0.011)",
    barPadBlock: "calc(var(--header-h) * 0.070)",
    barPadInline: "calc(var(--header-h) * 0.32)",
    barGap: "calc(var(--header-h) * 0.16)",
  } as const;

  const s = isMobile ? (isLowResMobile ? lowResMobile : mobile) : desktop;

  // Entrada UI (barra + headline) — sin zoom, con blur suave y delay real
  const anim = useMemo(() => {
    if (reducedMotion) {
      return {
        dur: "1ms",
        ease: "linear",
        barDelay: "0ms",
        headDelay: "0ms",
      };
    }
    return {
      dur: "760ms",
      ease: "cubic-bezier(0.22, 1, 0.36, 1)",
      barDelay: "170ms",
      headDelay: "290ms",
    };
  }, [reducedMotion]);

  const barStyle = useMemo(() => {
    const base = {
      transitionProperty: "opacity, transform, filter",
      transitionDuration: anim.dur,
      transitionTimingFunction: anim.ease,
      transitionDelay: anim.barDelay,
      willChange: "opacity, transform, filter",
    } as const;

    if (inView) {
      return {
        ...base,
        opacity: 1,
        transform: "translateY(0px)",
        filter: "blur(0px)",
      };
    }
    return {
      ...base,
      opacity: 0,
      transform: "translateY(10px)",
      filter: "blur(10px)",
    };
  }, [inView, anim]);

  const headlineWrapStyle = useMemo(() => {
    const base = {
      transitionProperty: "opacity, transform, filter, clip-path",
      transitionDuration: anim.dur,
      transitionTimingFunction: anim.ease,
      transitionDelay: anim.headDelay,
      willChange: "opacity, transform, filter, clip-path",
    } as const;

    if (inView) {
      return {
        ...base,
        opacity: 1,
        transform: "translateY(0px)",
        filter: "blur(0px)",
        clipPath: "inset(0 0 0% 0)",
      };
    }
    return {
      ...base,
      opacity: 0,
      transform: "translateY(14px)",
      filter: "blur(12px)",
      clipPath: "inset(0 0 34% 0)",
    };
  }, [inView, anim]);

  return (
    <Section
      as="section"
      spacing="xl"
      aria-label={ariaLabel}
      id="interactive-3d"
      ref={ref}
    >
      <div
        className="relative"
        style={{
          paddingTop: s.padYTop,
          paddingBottom: s.padYBottom,
        }}
      >
        {/* Fondo: burbuja fija y centrada */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            height: s.bubbleH,
          }}
        >
          <ShaderCanvas
            ariaLabel={ariaLabel}
            qualityToken="high"
            className="absolute inset-0 h-full w-full"
            // ✅ activa reveal y loop solo cuando entra al viewport
            active={inView}
          />
        </div>

        {/* Frente */}
        <Container>
          <div
            className="relative z-10 pointer-events-none"
            style={{
              minHeight: s.innerMinH,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Barra superior */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: s.barTop,
                background: "transparent",
                color: "var(--text-inverse)",
                borderRadius: "var(--radius-sm)",
                border:
                  "calc(var(--header-h) * 0.0003) solid var(--neutral-800)",
                paddingBlock: s.barPadBlock,
                paddingInline: s.barPadInline,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: s.barGap,

                // anim
                ...barStyle,
              }}
            >
              <Text as="p">{eyebrow}</Text>
            </div>

            {/* Titular */}
            <div
              className="pointer-events-none"
              style={{
                textAlign: "center",
                marginInline: "auto",
                borderRadius: "var(--radius-lg)",

                // anim
                ...headlineWrapStyle,
              }}
            >
              <Heading
                as="h1"
                style={{
                  margin: 0,
                  fontSize: s.headlineSize,
                  fontWeight: 300,
                  fontVariationSettings: "'wght' 320",
                  letterSpacing: s.headlineTrack,
                  lineHeight: 1,
                }}
              >
                {headline}
              </Heading>
            </div>
          </div>
        </Container>
      </div>
    </Section>
  );
}
