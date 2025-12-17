// src/ui/Typography/Heading.tsx
import * as React from "react";
import { cn } from "@/utils/cn";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type HeadingSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "display";

/** Variantes tipográficas */
type Weight = "thin" | "light" | "regular" | "medium" | "semibold" | "bold";
type Leading = "tight" | "snug" | "normal" | "relaxed";
type Tracking = "tighter" | "tight" | "normal" | "wide";

/** Mapas centralizados de clases Tailwind */
const sizeClass: Record<HeadingSize, string> = {
  xs: "text-sm",
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl sm:text-2xl",
  xl: "text-2xl sm:text-3xl",
  "2xl": "text-3xl sm:text-4xl",
  "3xl": "text-4xl sm:text-5xl",
  display: "text-5xl sm:text-6xl",
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

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  /** Etiqueta semántica del heading */
  as?: HeadingTag;
  /** Tamaño tipográfico */
  size?: HeadingSize;
  /** Peso, interlineado y tracking */
  weight?: Weight;
  leading?: Leading;
  tracking?: Tracking;
};

export const Heading = React.forwardRef<
  React.ElementRef<HeadingTag>,
  HeadingProps
>(
  (
    {
      as = "h2",
      size = "xl",
      weight = "semibold",
      leading = "tight",
      tracking = "tight",
      className,
      ...props
    },
    ref
  ) => {
    const Tag = as as HeadingTag;

    return (
      <Tag
        ref={ref as any}
        className={cn(
          sizeClass[size],
          weightClass[weight],
          leadingClass[leading],
          trackingClass[tracking],
          className
        )}
        {...props}
      />
    );
  }
);

Heading.displayName = "Heading";
