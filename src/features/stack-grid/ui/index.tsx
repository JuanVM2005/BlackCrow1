// src/features/stack-grid/ui/index.tsx
"use client";

import Image from "next/image";
import React from "react";
import { motion, useReducedMotion, cubicBezier, type Variants } from "framer-motion";
import Container from "@/ui/Container";
import { Heading } from "@/ui/Typography";
import { cn } from "@/utils/cn";
import type {
  StackGridProps,
  StackGridGroup,
  StackGridItem,
} from "../content/stack-grid.mapper";

type StackGridItemWithDesc = StackGridItem & { description?: string };

type GlowScheme = {
  top: string;
  bottom: string;
};

const GLOW_SCHEMES: GlowScheme[] = [
  {
    top:
      "radial-gradient(circle, rgba(111,192,255,0.9) 0%, rgba(221,250,255,0.12) 65%, rgba(221,250,255,0) 100%)",
    bottom:
      "radial-gradient(circle, rgba(252,167,255,0.85) 0%, rgba(255,227,252,0.12) 65%, rgba(255,227,252,0) 100%)",
  },
  {
    top: "radial-gradient(circle, #ffb34788, #6dd5fa88)",
    bottom: "radial-gradient(circle, #8360c388, #2ebf9188)",
  },
  {
    top: "radial-gradient(circle, #ff9a9eaa, #fad0c4aa)",
    bottom: "radial-gradient(circle, #a1c4fd88, #c2e9fb88)",
  },
  {
    top: "radial-gradient(circle, #f7b733aa, #fc4a1aaa)",
    bottom: "radial-gradient(circle, #ff5e62aa, #f968)",
  },
  {
    top: "radial-gradient(circle, #00c6ff99, #0072ff99)",
    bottom: "radial-gradient(circle, #6a11cb88, #2575fc88)",
  },
  {
    top: "radial-gradient(circle, #ff8a00aa, #e52e71aa)",
    bottom: "radial-gradient(circle, #662d8caa, #ed1e79aa)",
  },
  { top: "radial-gradient(circle, #fff4, #9992)", bottom: "radial-gradient(circle, #ccc3, #7772)" },
  {
    top: "radial-gradient(circle, #61dafbaa, #20232a66)",
    bottom: "radial-gradient(circle, #282c34aa, #61dafbaa)",
  },
  {
    top: "radial-gradient(circle, #d53369aa, #cbad6daa)",
    bottom: "radial-gradient(circle, #f6d365aa, #fda085aa)",
  },
  {
    top: "radial-gradient(circle, #56ab2faa, #a8e063aa)",
    bottom: "radial-gradient(circle, #3ca55caa, #b5ac49aa)",
  },
  { top: "radial-gradient(circle, #434343aa, #000a)", bottom: "radial-gradient(circle, #2c3e50aa, #000a)" },
  { top: "radial-gradient(circle, #f96a, #ff5e62aa)", bottom: "radial-gradient(circle, #7f00ffaa, #e100ffaa)" },
];

const SECTION_GLOW_INDICES: number[][] = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11],
];

type CardProps = {
  item?: StackGridItemWithDesc;
  glowScheme: GlowScheme;
};

function Card({ item, glowScheme }: CardProps) {
  if (!item || !item.icon) return null;

  return (
    <div
      tabIndex={0}
      aria-label={item.label}
      className={cn(
        "group relative flex flex-col rounded-4xl",
        "border border-(--neutral-800) bg-(--surface-crow)",
        "px-4 md:px-5 py-6 md:py-8",
        "shadow-(--shadow-sm) transition-all duration-500 ease-in-out",
        "outline-none focus-visible:ring-2 ring-(--ring)",
        "overflow-hidden",
        // ✅ MOBILE/TABLET: el slide fuerza cuadrado -> la card llena el contenedor
        "w-full h-full",
        // ✅ WINDOWS/DESKTOP: rectángulo primero, crece en hover (como antes)
        "md:h-[150px] md:w-auto md:hover:h-[220px]"
      )}
    >
      {/* ✅ Glow: mobile/tablet SIEMPRE activo | desktop solo hover */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className={cn(
            "absolute -top-28 -left-28 w-80 h-80 rounded-full blur-3xl",
            "opacity-100 md:opacity-0 md:group-hover:opacity-100",
            "transition-opacity duration-500 ease-out"
          )}
          style={{ background: glowScheme.top }}
        />
        <div
          className={cn(
            "absolute -bottom-28 -right-28 w-80 h-80 rounded-full blur-3xl",
            "opacity-100 md:opacity-0 md:group-hover:opacity-100",
            "transition-opacity duration-500 ease-out"
          )}
          style={{ background: glowScheme.bottom }}
        />
      </div>

      <div className="relative z-1 flex flex-col h-full">
        <div className="flex flex-col gap-2">
          <div className="shrink-0">
            <Image
              src={item.icon}
              alt={item.alt ?? ""}
              width={56}
              height={56}
              sizes="(min-width: 768px) 56px, 48px"
              className="rounded-md"
            />
          </div>

          <span className="text-lg md:text-xl font-medium">{item.label}</span>
        </div>

        {item.description && (
          <div
            className={cn(
              "text-sm text-(--neutral-300)",
              // ✅ Mobile/tablet visible + acomodado
              "mt-4 opacity-100 translate-y-0",
              // ✅ Desktop vuelve a hover animado como antes
              "md:mt-8 md:opacity-0 md:translate-y-4",
              "transition-all duration-500 ease-in-out",
              "md:group-hover:opacity-100 md:group-hover:translate-y-0"
            )}
          >
            {item.description}
          </div>
        )}

        <div className="mt-auto" />
      </div>
    </div>
  );
}

type GroupProps = {
  group: StackGridGroup;
  sectionIndex: number;
};

function Group({ group, sectionIndex }: GroupProps) {
  const indicesForSection = SECTION_GLOW_INDICES[sectionIndex] ?? [];

  // ===== Animación entrada 1x1 (como value-grid) =====
  const prefersReducedMotion = useReducedMotion();
  const EASE = React.useMemo(() => cubicBezier(0.2, 0.8, 0.2, 1), []);

  const listVariants = React.useMemo<Variants>(() => {
    if (prefersReducedMotion) {
      return {
        hidden: {},
        show: { transition: { delayChildren: 0.08, staggerChildren: 0.08 } },
      };
    }
    return {
      hidden: {},
      show: {
        transition: {
          delayChildren: 0.26, // 👈 delay notorio al entrar a la sección
          staggerChildren: 0.14,
        },
      },
    };
  }, [prefersReducedMotion]);

  const itemVariants = React.useMemo<Variants>(() => {
    if (prefersReducedMotion) {
      return {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.2, ease: "linear" } },
      };
    }
    return {
      hidden: { opacity: 0, y: 18, scale: 0.985, filter: "blur(6px)" },
      show: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: { duration: 0.6, ease: EASE },
      },
    };
  }, [EASE, prefersReducedMotion]);

  const viewport = React.useMemo(() => ({ once: true, amount: 0.28 }), []);

  return (
    <section
      className={cn(
        // ✅ Desktop: igual que antes
        "py-8 md:py-12 space-y-6",
        "w-full max-w-[1200px]",
        "h-auto md:h-[50vh]",
        "mx-auto",
        "overflow-hidden"
      )}
    >
      {group.title && (
        <Heading as="h2" size="xl" className="font-semibold text-left">
          {group.title}
        </Heading>
      )}

      <motion.ul
        role="list"
        className={cn(
          // ✅ WINDOWS/DESKTOP: GRID EXACTO como antes
          "md:grid md:gap-4 md:grid-cols-4 xl:grid-cols-5 md:overflow-hidden",
          // ✅ Mobile/tablet: slider horizontal
          "flex md:flex-none",
          "gap-4",
          "overflow-x-auto md:overflow-x-visible",
          "snap-x snap-mandatory md:snap-none",
          "px-6 md:px-0",
          // ocultar scrollbar sin globals
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          // no bloquea scroll vertical
          "overscroll-x-contain"
        )}
        variants={listVariants}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
      >
        {group.items.map((item, idx) => {
          const glowIdx = indicesForSection[idx] ?? 0;
          const glowScheme = GLOW_SCHEMES[glowIdx];

          return (
            <motion.li
              key={`${item.label}-${idx}`}
              role="listitem"
              variants={itemVariants}
              className={cn(
                // ✅ Mobile/tablet: SIEMPRE cuadrado
                "shrink-0 snap-start aspect-square",
                "w-[min(220px,78vw)]",
                // ✅ Desktop: vuelve al comportamiento normal del grid (no cuadrado)
                "md:w-auto md:aspect-auto"
              )}
            >
              <Card item={item as StackGridItemWithDesc} glowScheme={glowScheme} />
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}

export default function StackGrid({ groups }: StackGridProps) {
  if (!groups?.length) return null;

  const firstGroup = groups[0];
  const secondGroup = groups[1];
  const thirdGroup = groups[2];

  return (
    <div className="flex flex-col w-full">
      {/* ✅ Desktop (Windows): 50vh como antes. Mobile/tablet: auto para no recortar */}
      {firstGroup && (
        <Container
          className={cn(
            "flex justify-center items-center",
            "w-full",
            "h-auto md:h-[50vh]",
            "overflow-hidden"
          )}
        >
          <Group
            key={firstGroup.title ?? "group-0"}
            group={firstGroup}
            sectionIndex={0}
          />
        </Container>
      )}

      {secondGroup && (
        <Container
          className={cn(
            "flex justify-center items-center",
            "w-full",
            "h-auto md:h-[50vh]",
            "overflow-hidden"
          )}
        >
          <Group
            key={secondGroup.title ?? "group-1"}
            group={secondGroup}
            sectionIndex={1}
          />
        </Container>
      )}

      {thirdGroup && (
        <Container
          className={cn(
            "flex justify-center items-center",
            "w-full",
            "h-auto md:h-[50vh]",
            "overflow-hidden"
          )}
        >
          <Group
            key={thirdGroup.title ?? "group-2"}
            group={thirdGroup}
            sectionIndex={2}
          />
        </Container>
      )}
    </div>
  );
}
