// src/features/wordmark-offset/ui/index.tsx
"use client";

import type { FC, MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  type Variants,
  type Easing,
} from "framer-motion";
import Section from "@/ui/Section";
import Container from "@/ui/Container";
import type { WordmarkOffsetProps } from "../content/wordmark-offset.mapper";

type CursorPos = { x: number; y: number } | null;

const WordmarkOffset: FC<WordmarkOffsetProps> = ({ word, imageSrc }) => {
  const [cursor, setCursor] = useState<CursorPos>(null);
  const [isActive, setIsActive] = useState(false);
  const reduceMotion = useReducedMotion();

  const letters = useMemo(() => Array.from(word), [word]);

  // ✅ gate: solo dispara cuando entras bajando
  const [runKey, setRunKey] = useState(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    const el = wrapRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        const y = window.scrollY;
        const scrollingDown = y > lastY.current;

        if (entry.isIntersecting && scrollingDown) {
          setRunKey((k) => k + 1); // remount => replay
        }

        lastY.current = y;
      },
      { threshold: 0.6 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setCursor({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
    setIsActive(true);
  };

  const handleLeave = () => {
    setCursor(null);
    setIsActive(false);
  };

  // ===== estilos originales =====
  const fontSize = "clamp(2.3rem, 10.2vw, 8rem)";
  const letterSpacing = "clamp(0.12em, 1.35vw, 0.3em)";
  const fontWeight = 900;
  const lineHeight = 1.05;

  const commonTextStyle: React.CSSProperties = {
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    textAlign: "center",
    whiteSpace: "nowrap",
    display: "block",
  };

  const maskStyle = useMemo(() => {
    if (!cursor) {
      return {
        WebkitMaskImage:
          "radial-gradient(circle 0px at 50% 50%, rgba(0,0,0,1) 0, transparent 0)",
        maskImage:
          "radial-gradient(circle 0px at 50% 50%, rgba(0,0,0,1) 0, transparent 0)",
      };
    }

    const gradient = `radial-gradient(circle 140px at ${cursor.x}px ${cursor.y}px,
      rgba(0,0,0,1) 0,
      rgba(0,0,0,1) 90px,
      rgba(0,0,0,0) 140px
    )`;

    return {
      WebkitMaskImage: gradient,
      maskImage: gradient,
    };
  }, [cursor]);

  // ✅ easing tipado para que TS no joda
  const EASE: Easing = [0.22, 1, 0.36, 1];

  // ===== ANIMACIÓN DE ENTRADA =====
  const letterVariants: Variants = {
    hidden: reduceMotion
      ? { opacity: 1 }
      : {
          opacity: 0,
          transform: "translate3d(0,0,60px)",
        },
    show: reduceMotion
      ? { opacity: 1 }
      : {
          opacity: 1,
          transform: "translate3d(0,0,0)",
          transition: {
            duration: 0.55,
            ease: EASE,
          },
        },
  };

  const renderAnimatedLetters = () =>
    letters.map((char, i) => (
      <motion.span
        key={`${char}-${i}`}
        variants={letterVariants}
        className="inline-block"
      >
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ));

  return (
    <Section spacing="md" className="anchor-safe">
      <Container className="flex items-center justify-center pt-0 pb-12 md:pb-20">
        <div ref={wrapRef} className="relative inline-block">
          <motion.div
            key={runKey}
            className="relative inline-block"
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={{
              transform: "translateY(clamp(-18px, -3.5vw, -50px))",
              maxWidth: "100%",
            }}
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.045 }}
          >
            {/* Capa trasera (animada) */}
            <span
              aria-hidden="true"
              className="font-display uppercase select-none pointer-events-none absolute inset-0"
              style={{
                ...commonTextStyle,
                color: "var(--neutral-1000)",
                transform: "translate(-3px, 2px)",
              }}
            >
              {renderAnimatedLetters()}
            </span>

            {/* Capa frontal base (animada) */}
            <span
              className="font-display uppercase select-none pointer-events-none relative"
              style={{
                ...commonTextStyle,
                color:
                  "color-mix(in oklab, var(--surface) 85%, var(--neutral-300))",
              }}
            >
              {renderAnimatedLetters()}
            </span>

            {/* Capa superior — IMAGEN INTACTA */}
            <span
              aria-hidden="true"
              className="font-display uppercase select-none pointer-events-none absolute inset-0"
              style={{
                ...commonTextStyle,
                color: "transparent",
                backgroundImage: imageSrc ? `url(${imageSrc})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                ...maskStyle,
                opacity: isActive ? 1 : 0,
                transition: "opacity 260ms ease-out 120ms",
              }}
            >
              {word}
            </span>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default WordmarkOffset;
