// src/ui/Typography/Text.tsx
import * as React from "react";
import { cn } from "@/utils/cn";

type TextTag = "p" | "span" | "div";
type TextSize = "xs" | "sm" | "md" | "lg" | "xl" | "lead";

/** Variantes tipográficas (prop-variants) */
type Weight = "thin" | "light" | "regular" | "medium" | "semibold" | "bold";
type Leading = "tight" | "snug" | "normal" | "relaxed";
type Tracking = "tighter" | "tight" | "normal" | "wide";

/** Mapas centralizados de clases Tailwind (sin hardcodear en el JSX) */
const sizeClass: Record<TextSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  lead: "text-lg sm:text-xl",
};

const weightClass: Record<Weight, string> = {
  thin: "font-thin",
  light: "font-light",
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const leadingClass: Record<Leading, string> = {
  tight: "leading-tight",
  snug: "leading-snug",
  normal: "leading-normal",
  relaxed: "leading-relaxed",
};

const trackingClass: Record<Tracking, string> = {
  tighter: "tracking-tighter",
  tight: "tracking-tight",
  normal: "tracking-normal",
  wide: "tracking-wide",
};

export type TextProps = React.HTMLAttributes<HTMLElement> & {
  /** Etiqueta semántica del texto */
  as?: TextTag;
  /** Tamaño tipográfico */
  size?: TextSize;
  /** Peso tipográfico */
  weight?: Weight;
  /** Interlineado (si no se pasa, usa `relaxed` como fallback por compat) */
  leading?: Leading;
  /** Tracking (espaciado entre letras) */
  tracking?: Tracking;
  /** Texto con interlineado relajado para párrafos (compatibilidad) */
  relaxed?: boolean;
  /** Trunca en una sola línea (útil para labels/CTA) */
  truncate?: boolean;
};

export const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      as = "p",
      size = "md",
      weight = "regular",
      leading,
      tracking = "normal",
      relaxed = true,
      truncate,
      className,
      ...props
    },
    ref
  ) => {
    const Tag = as as any;
    const effectiveLeading: Leading = leading ?? (relaxed ? "relaxed" : "normal");

    return (
      <Tag
        ref={ref as any}
        className={cn(
          sizeClass[size],
          weightClass[weight],
          leadingClass[effectiveLeading],
          trackingClass[tracking],
          truncate && "truncate",
          className
        )}
        {...(props as any)}
      />
    );
  }
);

Text.displayName = "Text";
