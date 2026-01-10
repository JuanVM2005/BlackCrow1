// src/layout/RootProviders/index.tsx
"use client";

import * as React from "react";
import Lenis from "lenis";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { HeroReadyProvider } from "@/hooks/useHeroReady";
import InitialSplash from "./InitialSplash.client";
import TransitionOverlay from "./TransitionOverlay.client";

type Props = { children: React.ReactNode };

const LenisContext = React.createContext<Lenis | null>(null);
export const useLenis = () => React.useContext(LenisContext);

export default function RootProviders({ children }: Props) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [lenis, setLenis] = React.useState<Lenis | null>(null);

  // ✅ Fuente única de verdad para blur/scroll-lock
  const [splashActive, setSplashActive] = React.useState<boolean>(true);

  const rafId = React.useRef<number | null>(null);

  // Lenis: scroll suave global
  React.useEffect(() => {
    if (prefersReducedMotion || typeof window === "undefined") {
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      if (lenis) {
        if (rafId.current) cancelAnimationFrame(rafId.current);
        lenis.destroy();
        setLenis(null);
      }
      return;
    }

    const instance = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.1,
    });

    document.documentElement.classList.add("lenis", "lenis-smooth");

    const raf = (time: number) => {
      instance.raf(time);
      rafId.current = requestAnimationFrame(raf);
    };
    rafId.current = requestAnimationFrame(raf);

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
      document.documentElement.classList.remove("lenis", "lenis-smooth", "lenis-stopped");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion]);

  // ✅ Cuando el splash termina → quitamos blur + desbloqueamos scroll
  React.useEffect(() => {
    const handleSplashEnd = () => setSplashActive(false);
    window.addEventListener("bc:splash:end", handleSplashEnd);

    // fallback por seguridad (por si no llega nunca)
    const t = window.setTimeout(() => setSplashActive(false), 12000);

    return () => {
      window.removeEventListener("bc:splash:end", handleSplashEnd);
      window.clearTimeout(t);
    };
  }, []);

  // Bloqueo real de scroll (Lenis + nativo)
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const body = document.body;

    if (splashActive) {
      body.style.overflow = "hidden";
      root.classList.add("lenis-stopped");
      lenis?.stop();
    } else {
      body.style.overflow = "";
      root.classList.remove("lenis-stopped");
      lenis?.start();
    }

    return () => {
      body.style.overflow = "";
      root.classList.remove("lenis-stopped");
    };
  }, [splashActive, lenis]);

  return (
    <HeroReadyProvider>
      <LenisContext.Provider value={lenis}>
        <InitialSplash />

        <div
          className={[
            "min-h-dvh transition-[filter,opacity] duration-700",
            splashActive ? "blur-md opacity-70" : "blur-0 opacity-100",
          ].join(" ")}
        >
          {children}
        </div>

        <TransitionOverlay />
      </LenisContext.Provider>
    </HeroReadyProvider>
  );
}
