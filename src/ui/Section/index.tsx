// src/ui/Section/index.tsx
import * as React from "react";
import { cn } from "@/utils/cn";

type Spacing = "none" | "sm" | "md" | "lg" | "xl";

/** Mapa de ritmo vertical basado en tokens de `globals.css` (sin valores fijos). */
const SPACING_MAP: Record<Spacing, string> = {
  none: "py-0",
  sm: "py-[calc(var(--radius-md)*0.75)] md:py-[var(--radius-md)]",
  md: "py-[var(--radius-lg)] md:py-[calc(var(--radius-lg)*1.25)]",
  lg: "py-[var(--radius-xl)] md:py-[calc(var(--radius-xl)*1.5)]",
  xl: "py-[calc(var(--radius-xl)*1.5)] md:py-[calc(var(--radius-2xl)*1.25)]",
};

export type SectionProps = Omit<React.ComponentPropsWithoutRef<"section">, "role" | "aria-labelledby"> & {
  /** Polimórfico: renderiza como otro elemento si lo necesitas (por defecto <section>) */
  as?: React.ElementType;
  /** Ritmo vertical desde tokens (prefiere esto sobre utilidades sueltas) */
  spacing?: Spacing;
  /** (Compat) Si no usas `spacing`, `padded` aplica un padding vertical por defecto */
  padded?: boolean;
  /** Marca la sección como región navegable por lectores de pantalla */
  region?: boolean;
  /** Id del heading que etiqueta la región (se usa con role="region") */
  labelledBy?: string;
  /** Aplica offset para anclas según --header-h (clase .anchor-safe) */
  anchorSafe?: boolean;
  /** Superficie desde tokens globales (opcional). Suele gestionarse en page/layout. */
  surface?: "base" | "muted" | "raised" | "inverse";
};

const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      as,
      className,
      spacing,
      padded = false,
      region,
      labelledBy,
      anchorSafe = true,
      surface,
      ...props
    },
    ref,
  ) => {
    const Component = (as || "section") as any;
    const spacingClass = spacing
      ? SPACING_MAP[spacing]
      : padded
        ? SPACING_MAP.lg
        : undefined;

    return (
      <Component
        ref={ref}
        role={region ? "region" : undefined}
        aria-labelledby={region && labelledBy ? labelledBy : undefined}
        className={cn(
          "relative",
          anchorSafe && "anchor-safe",
          spacingClass,
          surface === "base" && "surface-base",
          surface === "muted" && "surface-muted",
          surface === "raised" && "surface-raised",
          surface === "inverse" && "surface-inverse",
          className,
        )}
        {...props}
      />
    );
  },
);

Section.displayName = "Section";

export default Section;
