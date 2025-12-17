// src/layout/RootProviders/TransitionOverlay.client.tsx
"use client";

import * as React from "react";

export type TransitionTarget = "hero" | "pricing" | "contact" | (string & {});
export type TransitionStartDetail = {
  target?: TransitionTarget;
  locale?: "es" | "en";
  durationMs?: number;
};

const DEFAULT_DURATION = 1300;
const START_EVENT = "bc:transition-start";
const END_EVENT = "bc:transition-end";

export function startTransitionOverlay(detail: TransitionStartDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<TransitionStartDetail>(START_EVENT, { detail }),
  );
}

export function endTransitionOverlay() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(END_EVENT));
}

type Direction = "up" | "down" | "right";

export default function TransitionOverlay() {
  const [active, setActive] = React.useState(false);
  const [entered, setEntered] = React.useState(false);
  const [target, setTarget] = React.useState<TransitionTarget | undefined>();
  const [direction, setDirection] = React.useState<Direction>("up");
  const [shineActive, setShineActive] = React.useState(false);

  const timeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const handleStart = (event: Event) => {
      const custom = event as CustomEvent<TransitionStartDetail>;
      const detail = custom.detail ?? {};
      const { target: t, durationMs } = detail;

      // hero → up, pricing → down, contact → right (izquierda → derecha)
      let dir: Direction = "up";
      if (t === "pricing") dir = "down";
      else if (t === "contact") dir = "right";

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setTarget(t);
      setDirection(dir);
      setActive(true);
      setEntered(false);
      setShineActive(false);

      requestAnimationFrame(() => {
        setEntered(true);
        setShineActive(true);
      });

      const d = typeof durationMs === "number" ? durationMs : DEFAULT_DURATION;
      timeoutRef.current = window.setTimeout(() => {
        setEntered(false);

        window.setTimeout(() => {
          setActive(false);
          setShineActive(false);
        }, 220);

        timeoutRef.current = null;
      }, d);
    };

    const handleEnd = () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setEntered(false);
      setShineActive(false);
      setActive(false);
    };

    window.addEventListener(START_EVENT, handleStart as EventListener);
    window.addEventListener(END_EVENT, handleEnd);

    return () => {
      window.removeEventListener(START_EVENT, handleStart as EventListener);
      window.removeEventListener(END_EVENT, handleEnd);
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  if (!active) return null;

  // Animación del panel según dirección:
  // - up / down → vertical (como antes)
  // - right     → entra desde la izquierda hacia el centro
  let slideClasses: string;
  if (direction === "right") {
    slideClasses = entered ? "translate-x-0" : "-translate-x-full";
  } else if (direction === "up") {
    slideClasses = entered ? "translate-y-0" : "translate-y-full";
  } else {
    // "down"
    slideClasses = entered ? "translate-y-0" : "-translate-y-full";
  }

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] pointer-events-auto overflow-hidden"
      aria-hidden="true"
    >
      {/* Panel de fondo */}
      <div
        className={[
          "absolute inset-0",
          "bg-[var(--surface-inverse)]",
          "transform transition-transform duration-320",
          slideClasses,
        ].join(" ")}
      />

      {/* Logo centrado */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative flex items-center justify-center"
          style={{
            width: "min(80vw, 44rem)",
            height: "min(34vh, 18rem)",
            WebkitMaskImage: "url(/logos/BlackCrow/LogoBlackCrowWhite.svg)",
            maskImage: "url(/logos/BlackCrow/LogoBlackCrowWhite.svg)",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            overflow: "hidden",
          }}
        >
          {/* Base gris apagada */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "rgba(140,140,140,0.55)",
              filter: "brightness(0.3)",
              transition: "filter 500ms ease-out",
            }}
          />

          {/* Franja que aclara el logo al pasar */}
          <div
            className={[
              "absolute inset-0",
              "w-[18%] h-[240%]",
              "rotate-20",
              "bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.6),rgba(255,255,255,0.6),transparent)]",
              "mix-blend-lighten",
              "transition-transform duration-1000 ease-out",
              shineActive ? "translate-x-[400%]" : "-translate-x-[400%]",
            ].join(" ")}
          />
        </div>
      </div>
    </div>
  );
}
