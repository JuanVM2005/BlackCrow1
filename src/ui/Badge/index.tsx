import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type Variant = "default" | "muted" | "outline" | "brand";
type Size = "sm" | "md";
type Shape = "rounded" | "pill";

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  shape?: Shape;
  className?: string;
}

const base =
  "inline-flex items-center justify-center ring-1 ring-inset select-none whitespace-nowrap";

const variantMap: Record<Variant, string> = {
  default:
    "bg-gray-900 text-white ring-gray-900/10 dark:bg-gray-100 dark:text-gray-900 dark:ring-gray-100/10",
  muted:
    "bg-gray-100 text-gray-900 ring-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700",
  outline:
    "bg-transparent text-gray-900 ring-gray-300 dark:text-gray-100 dark:ring-gray-700",
  brand:
    "bg-blue-600 text-white ring-blue-600/10 dark:bg-blue-500 dark:ring-blue-500/10",
};

const sizeMap: Record<Size, string> = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-0.5",
};

const shapeMap: Record<Shape, string> = {
  rounded: "rounded-md",
  pill: "rounded-full",
};

export default function Badge({
  children,
  variant = "muted",
  size = "md",
  shape = "pill",
  className,
  ...rest
}: BadgeProps) {
  return (
    <span className={cn(base, variantMap[variant], sizeMap[size], shapeMap[shape], className)} {...rest}>
      {children}
    </span>
  );
}
