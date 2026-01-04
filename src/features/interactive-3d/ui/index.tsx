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

// ✅ Anchor para el iPhone (start)
import { usePhoneAnchors } from "@/features/value-grid/ui/usePhoneAnchors";

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

/**
 * ✅ Pausa extra si la pestaña no está visible (reduce context lost).
 */
function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const onVis = () => setVisible(document.visibilityState === "visible");
    onVis();

    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return visible;
}

export default function Interactive3D({
  eyebrow,
  headline,
  ariaLabel = eyebrow,
}: Interactive3DUiProps): ReactElement {
  /**
   * ✅ inView “real” para activar render loop y anims
   */
  const { ref, inView } = useSectionInView({
    rootMargin: "0px 0px -20% 0px",
    threshold: 0.12,
    once: false,
  });

  // ✅ Anchor start para PhoneOverlay (fin de Interactive3D)
  const { startRef } = usePhoneAnchors();

  const isMobile = useIsMobile();
  const isLowResMobile = useIsLowResMobile(isMobile);
  const reducedMotion = usePrefersReducedMotionLocal();
  const pageVisible = usePageVisible();

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

  /**
   * ✅ qualityToken seguro para landing
   * - Desktop/Tablet: medium (sweet spot)
   * - Mobile: low
   */
  const qualityToken = useMemo<"low" | "medium" | "high">(() => {
    if (isMobile) return "low";
    return "medium";
  }, [isMobile]);

  /**
   * ✅ Active real del shader:
   * - Solo si está en viewport
   * - Solo si la pestaña está visible
   */
  const shaderActive = inView && pageVisible;

  /**
   * ✅ “Predicción”: montamos el Canvas ANTES de entrar (pero sin animar)
   * - nearInView se activa con rootMargin grande
   * - Así el primer frame no “pega”
   */
  const [nearInView, setNearInView] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const el = (ref as any)?.current as HTMLElement | null;
    // Si tu hook entrega callback-ref, este bloque no se usa.
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => setNearInView(!!entry?.isIntersecting),
      {
        root: null,
        rootMargin: "900px 0px 900px 0px",
        threshold: 0.01,
      },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  /**
   * ✅ Gate de montaje del Canvas (CRÍTICO para que no compita con Hero/Phone)
   * - Monta cuando está “cerca” o “activo”
   * - Desmonta con delay corto para evitar overlap al scrollear
   */
  const [mountShader, setMountShader] = useState(false);

  useEffect(() => {
    if (nearInView || shaderActive) {
      setMountShader(true);
      return;
    }
    const t = window.setTimeout(() => setMountShader(false), 220);
    return () => window.clearTimeout(t);
  }, [nearInView, shaderActive]);

  // Entrada UI (barra + headline)
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
          {/* ✅ Canvas solo si corresponde (evita saturar GPU junto al Hero/Phone) */}
          {mountShader ? (
            <ShaderCanvas
              ariaLabel={ariaLabel}
              qualityToken={qualityToken}
              className="absolute inset-0 h-full w-full"
              active={shaderActive}
            />
          ) : null}
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
                border: "calc(var(--header-h) * 0.0003) solid var(--neutral-800)",
                paddingBlock: s.barPadBlock,
                paddingInline: s.barPadInline,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: s.barGap,

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

        {/* ✅ ANCHOR: fin de Interactive3D (donde “nace” el iPhone) */}
        <div
          ref={startRef}
          aria-hidden="true"
          style={{ position: "relative", width: 1, height: 1 }}
        />
      </div>
    </Section>
  );
}
