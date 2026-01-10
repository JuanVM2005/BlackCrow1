// src/layout/RootProviders/InitialSplash.client.tsx
"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import splashConfig from "@/content/ui/splash.json";
import { useHeroReady } from "@/hooks/useHeroReady";

const config = splashConfig;

const MIN_DURATION_FALLBACK = 1600;
const HERO_MAX_WAIT_MS = 9000; // ✅ evita loop infinito si el 3D falla

const AUDIO_CONSENT_KEY = "bc:splash-audio-consent";
const SESSION_KEY = "bc:splash-seen";

function getSafeVolume(v: number | undefined): number {
  if (typeof v !== "number" || Number.isNaN(v)) return 1;
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

export default function InitialSplash() {
  const { ready: heroReady } = useHeroReady();

  const [active, setActive] = useState<boolean>(() => (config.enabled ?? true));

  // ✅ control de tiempos
  const startedAtRef = useRef<number>(0);
  const minDoneRef = useRef<boolean>(false);
  const closingRef = useRef<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const heroReadyRef = useRef<boolean>(heroReady);
  useEffect(() => {
    heroReadyRef.current = heroReady;
  }, [heroReady]);

  const minDurationMs = config.minDurationMs ?? MIN_DURATION_FALLBACK;
  const durationSeconds = minDurationMs / 1000;

  // ✅ Memo hooks SIEMPRE antes de cualquier return
  const logoMask: CSSProperties = useMemo(
    () => ({
      maskImage: `url(${config.brand?.logoSrc})`,
      WebkitMaskImage: `url(${config.brand?.logoSrc})`,
      maskRepeat: "no-repeat",
      WebkitMaskRepeat: "no-repeat",
      maskPosition: "center",
      WebkitMaskPosition: "center",
      maskSize: "contain",
      WebkitMaskSize: "contain",
      width: "clamp(22rem, 32vw, 36rem)",
      height: "clamp(22rem, 32vw, 36rem)",
    }),
    [],
  );

  const shineGradient = useMemo(
    () =>
      "linear-gradient(90deg," +
      "transparent 0%," +
      "color-mix(in oklab, var(--text-inverse) 40%, transparent) 42%," +
      "color-mix(in oklab, var(--text-inverse) 85%, transparent) 50%," +
      "color-mix(in oklab, var(--text-inverse) 40%, transparent) 58%," +
      "transparent 100%)",
    [],
  );

  const overlayStyle: CSSProperties = useMemo(
    () => ({
      zIndex: "var(--z-overlay, 9999)",
      backgroundColor: "var(--surface-inverse)",
    }),
    [],
  );

  const endSplash = (reason: "ready" | "timeout" | "disabled" | "session") => {
    if (closingRef.current) return;
    closingRef.current = true;

    setActive(false);
    window.dispatchEvent(new CustomEvent("bc:splash:end", { detail: { reason } }));

    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {}
    }
  };

  useEffect(() => {
    if (!config.enabled) {
      endSplash("disabled");
      return;
    }

    startedAtRef.current = Date.now();

    if (config.oncePerSession) {
      try {
        const seen = window.sessionStorage.getItem(SESSION_KEY);
        if (seen) {
          endSplash("session");
          return;
        }
        window.sessionStorage.setItem(SESSION_KEY, "true");
      } catch {}
    }

    // ✅ mínimo de tiempo visible (para que el efecto se vea completo)
    const minTimer = window.setTimeout(() => {
      minDoneRef.current = true;

      // ✅ usa ref (evita valor stale)
      if (heroReadyRef.current) endSplash("ready");
    }, minDurationMs);

    // ✅ máximo de espera (si Hero nunca “ready”, igual salimos)
    const maxTimer = window.setTimeout(() => {
      endSplash("timeout");
    }, Math.max(minDurationMs, HERO_MAX_WAIT_MS));

    const handleFirstInteraction = () => {
      try {
        window.localStorage.setItem(AUDIO_CONSENT_KEY, "granted");
      } catch {}

      if (audioRef.current) {
        audioRef.current.muted = false;
        audioRef.current.volume = getSafeVolume(config.audio?.volume);
        void audioRef.current.play().catch(() => {});
      }

      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };

    if (config.audio?.enabled && config.audio?.src) {
      window.addEventListener("click", handleFirstInteraction, { once: true });
      window.addEventListener("keydown", handleFirstInteraction, { once: true });
    }

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);

      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ cuando el hero esté listo, cerramos si ya cumplimos el mínimo
  useEffect(() => {
    if (!active) return;
    if (!heroReady) return;

    if (minDoneRef.current) {
      endSplash("ready");
      return;
    }

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, minDurationMs - elapsed);

    const t = window.setTimeout(() => endSplash("ready"), remaining);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroReady, active]);

  // ✅ return DESPUÉS de todos los hooks
  if (!active) return null;

  const shineSegment = Math.min(2.0, durationSeconds * 0.5);
  const secondDelay = shineSegment * 0.3;
  const fillDelay = shineSegment + secondDelay * 0.5;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={config.label}
      className="fixed inset-0 flex items-center justify-center"
      style={overlayStyle}
    >
      {config.srOnly ? <span className="sr-only">{config.srOnly}</span> : null}

      <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
        <div
          style={{
            ...logoMask,
            backgroundColor: "color-mix(in oklab, var(--text-inverse) 18%, transparent)",
            opacity: 0.28,
          }}
        />

        <motion.div
          style={{
            ...logoMask,
            position: "absolute",
            backgroundImage: shineGradient,
            backgroundSize: "200% 100%",
            backgroundRepeat: "no-repeat",
            clipPath: "inset(10% 0 50% 0)",
          }}
          initial={{ backgroundPositionX: "150%" }}
          animate={{ backgroundPositionX: "-150%" }}
          transition={{ duration: shineSegment, ease: "easeInOut" }}
        />

        <motion.div
          style={{
            ...logoMask,
            position: "absolute",
            backgroundImage: shineGradient,
            backgroundSize: "200% 100%",
            backgroundRepeat: "no-repeat",
            clipPath: "inset(51.5% 0 10% 0)",
          }}
          initial={{ backgroundPositionX: "150%" }}
          animate={{ backgroundPositionX: "-150%" }}
          transition={{ duration: shineSegment, ease: "easeInOut", delay: secondDelay }}
        />

        <motion.div
          style={{
            ...logoMask,
            position: "absolute",
            backgroundColor: "color-mix(in oklab, var(--text-inverse) 78%, transparent)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: durationSeconds * 0.65, ease: "easeOut", delay: fillDelay }}
        />
      </div>

      {config.audio?.enabled && config.audio?.src ? (
        <audio
          ref={audioRef}
          src={config.audio.src}
          preload="auto"
          playsInline
          muted
          onCanPlay={() => {
            try {
              const stored = window.localStorage.getItem(AUDIO_CONSENT_KEY);
              if (stored === "granted" && audioRef.current) {
                audioRef.current.muted = false;
                audioRef.current.volume = getSafeVolume(config.audio?.volume);
                void audioRef.current.play().catch(() => {});
              }
            } catch {}
          }}
        />
      ) : null}
    </div>
  );
}
