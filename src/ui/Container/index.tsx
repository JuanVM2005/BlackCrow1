// src/ui/Container/index.tsx
import * as React from "react";
import { cn } from "@/utils/cn";

type Size = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

const sizeClass: Record<Size, string> = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
  full: "max-w-none",
};

export type ContainerProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Controla el ancho máximo del contenedor */
  size?: Size;
  /** Si true, remueve el padding horizontal */
  noGutters?: boolean;
};

const Container = React.forwardRef<React.ElementRef<"div">, ContainerProps>(
  ({ className, size = "2xl", noGutters, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mx-auto w-full",
          sizeClass[size],
          !noGutters && "px-4 sm:px-6 lg:px-8",
          className
        )}
        {...props}
      />
    );
  }
);

Container.displayName = "Container";

export default Container;
