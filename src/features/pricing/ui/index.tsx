// src/features/pricing/ui/index.tsx
"use client";

import { Fragment } from "react";
import { motion, cubicBezier, useReducedMotion, type Variants } from "framer-motion";
import Container from "@/ui/Container";
import Section from "@/ui/Section";
import { Heading, Text } from "@/ui/Typography";
import PlanCard from "./PlanCard";
import type { PricingProps } from "../content/pricing.mapper";

type Props = PricingProps & {
  id?: string;
  className?: string;
};

export default function Pricing({
  id = "pricing",
  heading,
  aside,
  plans,
  disclaimer,
}: Props) {
  const normalized = plans.map((p, i, arr) => ({
    ...p,
    featured:
      typeof p.featured === "boolean" ? p.featured : arr.length === 3 && i === 1,
  }));

  const prefersReducedMotion = useReducedMotion();
  const EASE = cubicBezier(0.2, 0.8, 0.2, 1);

  // ✅ No tan exagerado: menos blur, menos Y, stagger más corto, delay suave
  const gridVariants: Variants = prefersReducedMotion
    ? {
        hidden: {},
        show: { transition: { delayChildren: 0.06, staggerChildren: 0.08 } },
      }
    : {
        hidden: {},
        show: {
          transition: {
            delayChildren: 0.14,
            staggerChildren: 0.12,
          },
        },
      };

  const cardVariants: Variants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.2, ease: "linear" } },
      }
    : {
        hidden: { opacity: 0, y: 14, scale: 0.992, filter: "blur(3px)" },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: { duration: 0.52, ease: EASE },
        },
      };

  const viewport = { once: true, amount: 0.22 } as const;

  return (
    <Section id={id}>
      <Container>
        {/* Título + Aside */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 lg:gap-12">
          <div className="lg:col-span-7 xl:col-span-8">
            <Heading
              as="h2"
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.9] tracking-tight"
            >
              {heading.titleLines.map((line, i) => (
                <Fragment key={i}>
                  {line}
                  {i < heading.titleLines.length - 1 ? <br /> : null}
                </Fragment>
              ))}
            </Heading>
          </div>

          {/* Contenido derecho plomizo, alineado a los "pies" del titular */}
          <aside className="lg:col-span-5 xl:col-span-4 lg:self-end">
            <div className="space-y-3 text-(--text-muted)">
              {aside.map((p, i) => (
                <Text as="p" key={i} className="text-sm md:text-base">
                  {"children" in (p as any)
                    ? (p as any).children.map((node: any, k: number) =>
                        node.strong ? (
                          <strong key={k} className="font-semibold">
                            {node.text}
                          </strong>
                        ) : (
                          <span key={k}>{node.text}</span>
                        ),
                      )
                    : (p as unknown as string)}
                </Text>
              ))}
            </div>
          </aside>
        </div>

        {/* Grid de tarjetas (entrada 1x1) */}
        <div className="mt-8 md:mt-14">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-7"
            variants={gridVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
          >
            {normalized.map((plan, i) => (
              <motion.div key={plan.id} variants={cardVariants}>
                <PlanCard
                  {...plan}
                  // Líneas sólidas por contenedor: izq=rojas(rose), centro=moradas(violet), der=celestes(blue)
                  railColor={i === 0 ? "rose" : i === 1 ? "violet" : "blue"}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Disclaimer */}
        {disclaimer && (
          <div className="mt-6 md:mt-8">
            <Text as="p" className="text-xs text-center text-muted">
              {disclaimer}
            </Text>
          </div>
        )}
      </Container>
    </Section>
  );
}
