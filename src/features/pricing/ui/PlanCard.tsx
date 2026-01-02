// src/features/pricing/ui/PlanCard.tsx
import Link from "next/link";
import Tilt3D from "@/ui/effects";
import { cn } from "@/utils/cn";
import { Text } from "@/ui/Typography";
import Button, { ButtonArrow } from "@/ui/Button";

export type PlanCardProps = {
  name: string;
  price: string;
  features: string[];
  cta: { label: string; href: string };
  badge?: string;
  featured?: boolean;
  className?: string;
  /** Color de las líneas laterales (ambas iguales) */
  railColor?: "rose" | "violet" | "blue";
};

/**
 * Tarjeta de Plan — “tilt 3D + pop-out”
 * Mobile: menos alta + tipografía un poco más compacta (md+ intacto).
 */
export default function PlanCard({
  name,
  price,
  features,
  cta,
  badge,
  featured,
  className,
  railColor = "violet",
}: PlanCardProps) {
  const railColorVar =
    railColor === "rose"
      ? "var(--rose-600)"
      : railColor === "blue"
        ? "var(--blue-400)"
        : "var(--violet-700)";

  const subtleBorder = `color-mix(in oklab, ${railColorVar} 34%, transparent)`;

  const headerGradient = featured
    ? {
        backgroundImage:
          "linear-gradient(135deg," +
          "color-mix(in oklab, var(--violet-700) 64%, white) 0%," +
          "color-mix(in oklab, var(--pink-700) 60%, white) 50%," +
          "color-mix(in oklab, var(--blue-400) 56%, white) 100%)",
      }
    : undefined;

  const glowBackground = {
    background:
      `radial-gradient(45% 40% at 50% 8%, color-mix(in oklab, ${railColorVar} 32%, transparent) 0%, transparent 58%),` +
      `radial-gradient(50% 45% at 50% 92%, color-mix(in oklab, ${railColorVar} 28%, transparent) 0%, transparent 60%),` +
      `radial-gradient(90% 90% at 6% 50%,  color-mix(in oklab, ${railColorVar} 24%, transparent) 0%, transparent 56%),` +
      `radial-gradient(90% 90% at 94% 50%, color-mix(in oklab, ${railColorVar} 24%, transparent) 0%, transparent 56%)`,
    filter: "blur(16px)",
    opacity: 0.32,
  } as React.CSSProperties;

  return (
    <Tilt3D
      className={cn(
        // Más pequeña SOLO en mobile, md+ intacto
        "group mx-auto w-[90%] sm:w-[92%] md:w-[92%] lg:w-[90%]",
        className,
      )}
      maxRotateX={8}
      maxRotateY={12}
      scale={1.02}
      perspective={1100}
    >
      <div className="relative rounded-2xl">
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-2 rounded-[inherit] z-0"
          style={glowBackground}
        />

        <article
          // ✅ IMPORTANTE: las cards usan surface BASE para el color de texto,
          // pero el fondo sigue siendo bg-(--surface-raised) (no tocamos el fondo global).
          data-surface="base"
          className={cn(
            "relative z-10 h-full rounded-[inherit] overflow-hidden",
            "bg-(--surface-raised)",
            "text-(--text)",
            "border-solid border-[0.5px]",
            "transition-shadow duration-300 ease-out",
            "shadow-(--shadow-sm) group-hover:shadow-(--shadow-md) group-focus-within:shadow-(--shadow-md)",
            "focus-within:outline-none",
            // Menos alta SOLO en mobile
            "min-h-[410px] sm:min-h-[440px] md:min-h-[560px] lg:min-h-[600px]",
          )}
          style={{ borderColor: subtleBorder }}
        >
          {/* Líneas laterales (1px) — ajustadas al nuevo alto */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-3 top-[3.1rem] sm:top-15 bottom-35 sm:bottom-42 w-px z-10"
            style={{ backgroundColor: railColorVar }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute right-3 top-[4.45rem] sm:top-22 bottom-27 sm:bottom-32 w-px z-10"
            style={{ backgroundColor: railColorVar }}
          />

          {/* Header */}
          <div className="relative z-0 p-5 sm:p-6 md:p-8" style={headerGradient}>
            {badge ? (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border"
                style={{
                  background: "var(--surface-muted)",
                  color: "var(--text)",
                  borderColor: "var(--border)",
                }}
              >
                {badge}
              </span>
            ) : null}

            <h3 className="mt-3 text-[1.35rem] sm:text-2xl md:text-[2rem] font-semibold leading-tight tracking-tight">
              {name}
            </h3>

            <div className="mt-2.5">
              <p className="text-[1.05rem] sm:text-xl md:text-3xl font-medium">
                {price}
              </p>
            </div>

            <div className="mt-3.5">
              <Text
                as="p"
                className="text-xs sm:text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                {/* subtítulo opcional */}
              </Text>
            </div>
          </div>

          {/* Divider */}
          <div
            className="mx-5 sm:mx-6 md:mx-8 h-px"
            style={{ background: "var(--border-strong)" }}
          />

          {/* Features */}
          <ul className="flex-1 p-5 sm:p-6 md:p-8 space-y-2.5 sm:space-y-3.5">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <span aria-hidden className="mt-0.5 inline-flex shrink-0">
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path
                      d="M20 6L9 17l-5-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-[0.9rem] sm:text-[0.93rem] md:text-base leading-6 sm:leading-7">
                  {f}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="px-5 sm:px-6 md:px-8 pb-6 sm:pb-7 pt-2">
            <Button
              asChild
              variant="ctaRaise"
              size="md"
              fullWidth
              data-testid="plan-cta"
            >
              <Link href={cta.href}>
                <span className="truncate">{cta.label}</span>
                <ButtonArrow />
              </Link>
            </Button>
          </div>
        </article>
      </div>
    </Tilt3D>
  );
}
