// src/features/cta-minimal/ui/index.tsx
import React from "react";
import Link from "next/link";
import Section from "@/ui/Section";
import Container from "@/ui/Container";
import Button, { ButtonArrow } from "@/ui/Button";

export type CtaMinimalProps = {
  title: string;
  action: { label: string; href: string };
  align?: "center" | "left" | "right";
};

/**
 * Sección CTA minimalista: línea superior + título + botón.
 * Fondo y color se heredan del layout global.
 */
export default function CtaMinimal({
  title,
  action,
  align = "center",
}: CtaMinimalProps) {
  const alignClasses =
    align === "left"
      ? "items-start text-left"
      : align === "right"
        ? "items-end text-right"
        : "items-center text-center";

  return (
    <Section>
      <Container>
        <div className={`flex flex-col ${alignClasses} gap-6 sm:gap-8`}>
          <hr className="h-px w-12 border-0 bg-(--border-strong) opacity-90" />

          {/* Mobile: más compacto, sin perder presencia */}
          <h2 className="max-w-[20ch] leading-[1.06] tracking-tight font-medium text-[clamp(2rem,5.4vw,3.25rem)] sm:text-[clamp(2.6rem,4.2vw,4rem)]">
            {title}
          </h2>

          {/* Baja la velocidad del cambio de color del morph (si tu variant lo soporta por CSS vars) */}
          <Button
            asChild
            variant="morphMagnet"
            size="lg"
            withArrow
            data-testid="cta-minimal"
            style={
              {
                // vars “opcionales”: si tu Button las usa, se aplican; si no, no rompen nada.
                ["--morph-duration" as never]: "18s",
                ["--morph-hue-duration" as never]: "18s",
                ["--morph-speed" as never]: "0.45",
              } as React.CSSProperties
            }
          >
            <Link href={action.href} aria-label={action.label}>
              {action.label}
              <ButtonArrow />
            </Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
