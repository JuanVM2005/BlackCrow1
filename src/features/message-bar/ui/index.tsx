// src/features/message-bar/ui/index.tsx
"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

export type MessageBarProps = {
  parts: Array<{ text: string; highlight?: boolean }>;
  separator: string;
  align?: "left" | "center" | "right";
  className?: string;
  id?: string;
};

const alignMap = {
  left: "text-left justify-start",
  center: "text-center justify-center",
  right: "text-right justify-end",
} as const;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function MessageBar({
  parts,
  separator,
  align = "center",
  className,
  id,
}: MessageBarProps) {
  const [isReduced, setIsReduced] = React.useState(false);
  const [clones, setClones] = React.useState(2);

  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const firstCopyRef = React.useRef<HTMLParagraphElement | null>(null);
  const halfRef = React.useRef<HTMLDivElement | null>(null);

  const [marqueeVars, setMarqueeVars] = React.useState<{
    distancePx: number;
    durationMs: number;
  }>({ distancePx: 0, durationMs: 18000 });

  if (!parts || parts.length === 0) return null;

  const renderPhrase = React.useCallback(
    (withBullet: boolean, animateHighlight: boolean) =>
      parts
        .map((part, idx) => {
          const isLast = idx === parts.length - 1;
          const showSep = idx > 0;
          const sepText = isLast ? " = " : separator ?? " • ";
          return (
            <React.Fragment key={`${idx}-${part.text}`}>
              {showSep && (
                <span className="opacity-70 select-none" aria-hidden="true">
                  {sepText}
                </span>
              )}
              <span
                className={cn(
                  "whitespace-pre",
                  part.highlight ? "font-semibold text-transparent" : "",
                )}
                data-animated-highlight={
                  part.highlight && animateHighlight ? "true" : undefined
                }
                style={
                  part.highlight
                    ? ({ WebkitTextFillColor: "transparent" } as React.CSSProperties)
                    : undefined
                }
              >
                {part.text}
              </span>
            </React.Fragment>
          );
        })
        .concat(
          withBullet
            ? [
                <span
                  key="bullet"
                  className="opacity-70 select-none"
                  aria-hidden="true"
                >
                  {" "}
                  •
                </span>,
              ]
            : [],
        ),
    [parts, separator],
  );

  // prefers-reduced-motion
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setIsReduced(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // Velocidad por ancho real (sin matchMedia)
  const speedFromWidth = React.useCallback((w: number) => {
    // ~mobile
    if (w < 768) return 240;
    // ~tablet
    if (w < 1200) return 290;
    // desktop (tu valor)
    return 340;
  }, []);

  const measure = React.useCallback(() => {
    const wrap = wrapRef.current;
    const first = firstCopyRef.current;
    const half = halfRef.current;
    if (!wrap || !first || !half) return;

    const wrapW = wrap.clientWidth || 0;
    const phraseW = first.scrollWidth || 0;

    const needed = Math.max(2, Math.ceil((wrapW + phraseW) / Math.max(1, phraseW)));
    setClones(needed);

    const distancePx = half.scrollWidth || 0;
    const SPEED_PX_S = speedFromWidth(wrapW);

    const durationMs =
      distancePx > 0 ? (distancePx / SPEED_PX_S) * 1000 : 12000;

    setMarqueeVars({
      distancePx,
      durationMs: clamp(durationMs, 5000, 45000),
    });
  }, [speedFromWidth]);

  React.useEffect(() => {
    measure();

    // @ts-ignore
    if (document.fonts?.ready) {
      // @ts-ignore
      document.fonts.ready.then(() => requestAnimationFrame(() => measure()));
    }

    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => measure())
        : null;

    if (ro) {
      if (wrapRef.current) ro.observe(wrapRef.current);
      if (firstCopyRef.current) ro.observe(firstCopyRef.current);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
    };
  }, [measure]);

  React.useEffect(() => {
    const id2 = requestAnimationFrame(() => measure());
    return () => cancelAnimationFrame(id2);
  }, [clones, measure]);

  const alignCls = alignMap[align] ?? alignMap.center;

  const fadePx = 48;
  const mask = `linear-gradient(to right, transparent 0, black ${fadePx}px, black calc(100% - ${fadePx}px), transparent 100%)`;

  const textScale =
    "text-[clamp(26px,8vw,92px)] leading-[1.18] tracking-[-0.5px]";

  const styleVars = !isReduced
    ? ({
        ["--mb-distance" as any]: `${marqueeVars.distancePx}px`,
        ["--mb-duration" as any]: `${marqueeVars.durationMs}ms`,
        ["--grad" as any]:
          "linear-gradient(270deg, #ff6ec4, #7873f5, #00d2ff, #6ef9f5, #ff6ec4)",
        ["--grad-size" as any]: "800% 800%",
        ["--grad-speed" as any]: "6s",
      } as React.CSSProperties)
    : undefined;

  return (
    <section
      id={id}
      role="region"
      aria-label="Message bar"
      data-kind="message-bar"
      className={cn("w-full", className)}
    >
      <style jsx>{`
        @keyframes mb-marquee {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(calc(var(--mb-distance, 0px) * -1), 0, 0);
          }
        }

        @keyframes texto-degradado {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        :global([data-kind="message-bar"] [data-animated-highlight="true"]) {
          background: var(--grad);
          background-size: var(--grad-size);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          animation: texto-degradado var(--grad-speed) ease-in-out infinite;
          font-weight: 700;
          will-change: background-position;
        }

        @media (prefers-reduced-motion: reduce) {
          :global([data-kind="message-bar"] [data-animated-highlight="true"]) {
            animation: none !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-400 px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        <div
          ref={wrapRef}
          className="relative overflow-hidden select-none"
          style={{ maskImage: mask, WebkitMaskImage: mask, ...styleVars }}
        >
          {isReduced ? (
            <p
              className={cn(
                "flex flex-wrap items-center gap-x-6 gap-y-3",
                textScale,
                alignCls,
              )}
            >
              {renderPhrase(true, false)}
            </p>
          ) : (
            <div className="relative">
              <div
                className="flex flex-nowrap items-center gap-x-0 will-change-transform"
                style={{
                  animation:
                    "mb-marquee var(--mb-duration, 12000ms) linear infinite",
                }}
              >
                <div ref={halfRef} className="flex flex-nowrap items-center">
                  {Array.from({ length: clones }).map((_, i) => (
                    <p
                      ref={i === 0 ? firstCopyRef : undefined}
                      key={`a-${i}`}
                      className={cn("flex flex-nowrap items-center gap-x-6", textScale)}
                    >
                      {renderPhrase(true, true)}
                    </p>
                  ))}
                </div>

                <div className="flex flex-nowrap items-center" aria-hidden="true">
                  {Array.from({ length: clones }).map((_, i) => (
                    <p
                      key={`b-${i}`}
                      className={cn("flex flex-nowrap items-center gap-x-6", textScale)}
                    >
                      {renderPhrase(true, true)}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
