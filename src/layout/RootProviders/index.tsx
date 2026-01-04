// src/layout/RootProviders/index.tsx
"use client";

import * as React from "react";
import Lenis from "lenis";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import InitialSplash from "./InitialSplash.client";
import TransitionOverlay from "./TransitionOverlay.client";

type Props = { children: React.ReactNode };

const LenisContext = React.createContext<Lenis | null>(null);
export const useLenis = () => React.useContext(LenisContext);

export default function RootProviders({ children }: Props) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [lenis, setLenis] = React.useState<Lenis | null>(null);
  const [isRevealed, setIsRevealed] = React.useState(false);
  const [scrollLocked, setScrollLocked] = React.useState(true); // ⬅️ empezamos bloqueando scroll

  const rafId = React.useRef<number | null>(null);
  const revealTimeoutRef = React.useRef<number | null>(null);
  const unlockTimeoutRef = React.useRef<number | null>(null);

  // Lenis: scroll suave global
  React.useEffect(() => {
    // Respeta accesibilidad / fallback nativo
    if (prefersReducedMotion || typeof window === "undefined") {
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      if (lenis) {
        if (rafId.current) cancelAnimationFrame(rafId.current);
        lenis.destroy();
        setLenis(null);
      }
      return;
    }

    // Inicializa Lenis (opciones compatibles con Lenis v1)
    const instance = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo-like
      smoothWheel: true,
      touchMultiplier: 1.1,
    });

    document.documentElement.classList.add("lenis", "lenis-smooth");

    const raf = (time: number) => {
      instance.raf(time);
      rafId.current = requestAnimationFrame(raf);
    };
    rafId.current = requestAnimationFrame(raf);

    // Reemite un evento por si necesitas sincronizar (GSAP, etc.)
    instance.on("scroll", (e: any) => {
      window.dispatchEvent(
        new CustomEvent("lenis-scroll", {
          detail: { scroll: e?.scroll, limit: e?.limit, velocity: e?.velocity },
        }),
      );
    });

    setLenis(instance);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      instance.destroy();
      setLenis(null);
      document.documentElement.classList.remove(
        "lenis",
        "lenis-smooth",
        "lenis-stopped",
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion]);

  // Blur + reveal después del splash, y control de bloqueo de scroll
  React.useEffect(() => {
    const handleSplashEnd = () => {
      // Arrancamos la animación de quitar blur
      setIsRevealed(true);

      // Cancelamos fallback si existía
      if (revealTimeoutRef.current) {
        window.clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }

      // Tras la duración del blur, liberamos el scroll
      if (unlockTimeoutRef.current) {
        window.clearTimeout(unlockTimeoutRef.current);
      }
      unlockTimeoutRef.current = window.setTimeout(() => {
        setScrollLocked(false);
        unlockTimeoutRef.current = null;
      }, 700); // mismo tiempo que la transición CSS (duration-700)
    };

    window.addEventListener("bc:splash:end", handleSplashEnd);

    // Fallback: por si nunca llega el evento, no dejamos bloqueado para siempre
    if (typeof window !== "undefined") {
      revealTimeoutRef.current = window.setTimeout(() => {
        setIsRevealed(true);
        setScrollLocked(false);
        revealTimeoutRef.current = null;
      }, 4000);
    }

    return () => {
      window.removeEventListener("bc:splash:end", handleSplashEnd);
      if (revealTimeoutRef.current) {
        window.clearTimeout(revealTimeoutRef.current);
      }
      if (unlockTimeoutRef.current) {
        window.clearTimeout(unlockTimeoutRef.current);
      }
    };
  }, []);

  // Bloqueo real de scroll (Lenis + nativo)
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const body = document.body;

    if (scrollLocked) {
      // Bloqueamos overflow nativo
      body.style.overflow = "hidden";
      // Para Lenis: clase + stop()
      root.classList.add("lenis-stopped");
      if (lenis) {
        lenis.stop();
      }
    } else {
      // Liberamos overflow
      body.style.overflow = "";
      root.classList.remove("lenis-stopped");
      if (lenis) {
        lenis.start();
      }
    }

    return () => {
      body.style.overflow = "";
      root.classList.remove("lenis-stopped");
    };
  }, [scrollLocked, lenis]);

  return (
    <LenisContext.Provider value={lenis}>
      {/* Splash inicial de marca */}
      <InitialSplash />

      {/* Contenido de la app: empieza desenfocado y sin scroll;
          luego se limpia el blur y se habilita el scroll */}
      <div
        className={`min-h-dvh transition-[filter,opacity] duration-700 ${
          isRevealed ? "blur-0 opacity-100" : "blur-md opacity-70"
        }`}
      >
        {children}
      </div>

      {/* Splash de transición para navegaciones internas (Home/Pricing, etc.) */}
      <TransitionOverlay />
    </LenisContext.Provider>
  );
}
