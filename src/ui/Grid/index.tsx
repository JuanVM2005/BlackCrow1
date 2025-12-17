import type {
  ElementType,
  ReactNode,
  HTMLAttributes,
} from "react";
import { cn } from "@/utils/cn";

type Gap = "none" | "sm" | "md" | "lg" | "xl";

type GridOwnProps = {
  as?: ElementType;
  children?: ReactNode;
  /** columnas base (1..12) */
  cols?: number;
  /** columnas por breakpoint (1..12) */
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  gap?: Gap;
  className?: string;
};

export type GridProps = GridOwnProps &
  Omit<HTMLAttributes<HTMLElement>, keyof GridOwnProps>;

const clamp = (n?: number) => {
  if (!n && n !== 0) return undefined;
  return Math.min(12, Math.max(1, n));
};

const gapMap: Record<Gap, string> = {
  none: "gap-0",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-12",
};

const colCls = (prefix: string | null, n?: number) =>
  n ? `${prefix ? `${prefix}:` : ""}grid-cols-${clamp(n)}` : undefined;

export default function Grid({
  as: As = "div",
  children,
  cols = 1,
  sm,
  md,
  lg,
  xl,
  gap = "md",
  className,
  ...rest
}: GridProps) {
  const Component = As as any;

  const classes = cn(
    "grid",
    gapMap[gap],
    colCls(null, cols),
    colCls("sm", sm),
    colCls("md", md),
    colCls("lg", lg),
    colCls("xl", xl),
    className,
  );

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
