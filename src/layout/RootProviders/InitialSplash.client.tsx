// src/layout/RootProviders/InitialSplash.client.tsx
"use client";

import { useEffect, useState, useRef, type CSSProperties } from "react";
import { motion } from "framer-motion";
import splashConfig from "@/content/ui/splash.json";

const config = splashConfig;
const MIN_DURATION_FALLBACK = 1600;
const AUDIO_CONSENT_KEY = "bc:splash-audio-consent";
const SESSION_KEY = "bc:splash-seen";

function getSafeVolume(v: number | undefined): number {
  if (typeof v !== "number" || Number.isNaN(v)) return 1;
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

export default function InitialSplash() {
  const [active, setActive] = useState<boolean>(config.enabled ?? true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!config.enabled) {
      setActive(false);
      return;
    }

    if (config.oncePerSession) {
      try {
        const seen = window.sessionStorage.getItem(SESSION_KEY);
        if (seen) {
          setActive(false);
          return;
        }
        window.sessionStorage.setItem(SESSION_KEY, "true");
      } catch {}
    }

    const duration = config.minDurationMs ?? MIN_DURATION_FALLBACK;
    const timer = window.setTimeout(() => {
      setActive(false);
      window.dispatchEvent(new CustomEvent("bc:splash:end"));
    }, duration);

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
      window.clearTimeout(timer);
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  if (!active) return null;

  const durationMs = config.minDurationMs ?? MIN_DURATION_FALLBACK;
  const durationSeconds = durationMs / 1000;

  // Duración más larga del destello
  const shineSegment = Math.min(2.0, durationSeconds * 0.5);
  // Un poco menos delay entre el primer y segundo brillo
  const secondDelay = shineSegment * 0.3;
  // Hacemos que el llenado final empiece antes para que el logo brillante se vea más tiempo
  const fillDelay = shineSegment + secondDelay * 0.5;

  const logoMask: CSSProperties = {
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
  };

  const shineGradient =
    "linear-gradient(90deg," +
    "transparent 0%," +
    "color-mix(in oklab, var(--text-inverse) 40%, transparent) 42%," +
    "color-mix(in oklab, var(--text-inverse) 85%, transparent) 50%," +
    "color-mix(in oklab, var(--text-inverse) 40%, transparent) 58%," +
    "transparent 100%)";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={config.label}
      className="fixed inset-0 bg-black flex items-center justify-center"
      style={{ zIndex: "var(--z-overlay, 9999)" }}
    >
      {config.srOnly ? <span className="sr-only">{config.srOnly}</span> : null}

      <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
        {/* Logo apagado */}
        <div
          style={{
            ...logoMask,
            backgroundColor: "color-mix(in oklab, var(--text-inverse) 18%, transparent)",
            opacity: 0.28,
          }}
        />

        {/* Brillo mitad superior */}
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
          transition={{
            duration: shineSegment,
            ease: "easeInOut",
          }}
        />

        {/* Brillo mitad inferior */}
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
          transition={{
            duration: shineSegment,
            ease: "easeInOut",
            delay: secondDelay,
          }}
        />

        {/* Llenado final: dura un poco más y empieza antes para que el brillo final se quede más tiempo */}
        <motion.div
          style={{
            ...logoMask,
            position: "absolute",
            backgroundColor: "color-mix(in oklab, var(--text-inverse) 78%, transparent)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: durationSeconds * 0.65,
            ease: "easeOut",
            delay: fillDelay,
          }}
        />
      </div>

      {config.audio?.enabled && config.audio?.src ? (
        <audio
          ref={audioRef}
          src={config.audio.src}
          preload="auto"
          playsInline
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
