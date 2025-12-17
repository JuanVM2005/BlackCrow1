// src/features/big-statement/ui/index.tsx
"use client";

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/utils/cn";
import Container from "@/ui/Container";
import { Heading, Text } from "@/ui/Typography";
import { motion, useReducedMotion, type Variants } from "framer-motion";

type ContainerSize = "md" | "lg" | "xl" | "2xl";

export type BigStatementProps = {
  left: {
    lines: string[];
    ariaLabel?: string;
  };
  right: {
    kicker?: string;
    headline: string;
    copy: string;
  };
  layout?: {
    reverse?: boolean;
    container?: ContainerSize;
    bleedY?: boolean;
  };
};

// 👇 Evita choques React DOM vs Motion (motion-dom typings)
type SectionBaseProps = Omit<
  ComponentPropsWithoutRef<"section">,
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onDragEnter"
  | "onDragExit"
  | "onDragLeave"
  | "onDragOver"
  | "onDrop"
>;

export default function BigStatement(
  props: BigStatementProps & SectionBaseProps,
) {
  const { left, right, layout, className, ...rest } = props;

  const size = layout?.container ?? "2xl";
  const reversed = layout?.reverse ?? false;
  const bleedY = layout?.bleedY ?? false;

  const reduce = useReducedMotion();

  // 👇 delay real para que se note
  const VIEW_DELAY = 0.28;

  const wrapTransition = {
    duration: reduce ? 0.01 : 0.6,
    delayChildren: reduce ? 0 : VIEW_DELAY,
    staggerChildren: reduce ? 0 : 0.095,
  };

  const slow = (d: number) => ({ duration: reduce ? 0.01 : d });

  const sweepTransition = {
    duration: reduce ? 0.01 : 1.0,
    delay: reduce ? 0 : 0.22 + VIEW_DELAY,
  };

  const wrap: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: wrapTransition },
  };

  const leftBlock: Variants = {
    hidden: reduce
      ? { opacity: 0 }
      : { opacity: 0, y: 22, filter: "blur(12px)" },
    show: reduce
      ? { opacity: 1 }
      : {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: slow(0.95),
        },
  };

  const line: Variants = {
    hidden: reduce
      ? { opacity: 0 }
      : {
          opacity: 0,
          y: 12,
          filter: "blur(12px)",
          clipPath: "inset(0 0 100% 0)",
        },
    show: reduce
      ? { opacity: 1 }
      : {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          clipPath: "inset(0 0 0% 0)",
          transition: slow(0.95),
        },
  };

  const rightItem: Variants = {
    hidden: reduce
      ? { opacity: 0 }
      : { opacity: 0, y: 18, filter: "blur(10px)" },
    show: reduce
      ? { opacity: 1 }
      : {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: slow(0.85),
        },
  };

  const sweep: Variants = {
    hidden: { scaleX: 0 },
    show: { scaleX: 1, transition: sweepTransition },
  };

  return (
    <motion.section
      data-kind="bigStatement"
      className={cn(bleedY ? "" : "py-10 md:py-24 lg:py-28", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.7 }}
      variants={wrap}
      {...rest}
    >
      <Container size={size}>
        <div
          className={cn(
            "grid grid-cols-1 gap-y-7 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-10",
            reversed && "lg:[&>*:first-child]:col-start-7",
          )}
        >
          {/* Izquierda */}
          <motion.div
            className={cn(
              "lg:col-span-6",
              reversed ? "order-last lg:order-0" : "",
              "mt-6 md:mt-14 lg:mt-16",
            )}
            aria-label={left.ariaLabel}
            aria-hidden={left.ariaLabel ? undefined : true}
            variants={leftBlock}
          >
            <div className="leading-none tracking-tight">
              {left.lines.map((l, i) => (
                <motion.span
                  key={i}
                  variants={line}
                  className={cn(
                    "block font-light will-change-transform",
                    "text-[21vw] md:text-[15.8vw] lg:text-[13.3vw] xl:text-[11.7vw]",
                    i > 0 && "-mt-[2.2vw] md:-mt-[1.4vw] lg:-mt-[0.9vw]",
                    "pt-1",
                    i === 1 && "ml-[3vw] md:ml-[3.5vw] lg:ml-[4vw]",
                  )}
                >
                  {l}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Derecha */}
          <div className="lg:col-span-6 flex items-start">
            <div className="max-w-prose">
              {right.kicker ? (
                <motion.div variants={rightItem}>
                  <Text
                    as="p"
                    size="sm"
                    weight="medium"
                    tracking="wide"
                    className="mb-2 uppercase opacity-70 md:mb-3"
                  >
                    {right.kicker}
                  </Text>
                </motion.div>
              ) : null}

              <motion.div variants={rightItem} className="relative">
                <Heading
                  as="h2"
                  size="2xl"
                  weight="light"
                  leading="tight"
                  tracking="tight"
                  className={cn(
                    "text-balance max-w-[28ch] md:max-w-[32ch]",
                    "text-[clamp(2.05rem,5.2vw,3.15rem)] md:text-[clamp(2.85rem,4.8vw,4.2rem)] lg:text-[clamp(3.7rem,3.7vw,4.35rem)]",
                  )}
                >
                  {right.headline}
                </Heading>

                <motion.span
                  aria-hidden
                  variants={sweep}
                  className="pointer-events-none mt-4 block h-px origin-left opacity-60"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, currentColor, transparent)",
                  }}
                />
              </motion.div>

              <motion.div variants={rightItem}>
                <Text
                  size="sm"
                  leading="relaxed"
                  className={cn(
                    "text-pretty opacity-90",
                    "mt-4 text-[clamp(1.06rem,2.8vw,1.16rem)] md:mt-6 md:text-[clamp(1.12rem,1.55vw,1.22rem)]",
                  )}
                >
                  {right.copy}
                </Text>
              </motion.div>
            </div>
          </div>
        </div>
      </Container>
    </motion.section>
  );
}
