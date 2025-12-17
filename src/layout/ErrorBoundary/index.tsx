// src/ui/feedback/ErrorState/index.tsx
"use client";

import * as React from "react";
import { cn } from "@/utils/cn";
import Button from "@/ui/Button"; // Si tu Button no es export default, lee la nota al final.

export type ErrorStateProps = {
  title?: string;
  description?: string;
  className?: string;
  /**
   * Acción opcional de reintento. Si se provee, se muestra un botón.
   */
  onRetry?: () => void;
  /**
   * Etiqueta del botón de reintento (si onRetry existe).
   * @default "Reintentar"
   */
  retryLabel?: string;
};

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(function ErrorState(
  { title = "Algo salió mal", description, className, onRetry, retryLabel = "Reintentar" },
  ref,
) {
  return (
    <div ref={ref} className={cn("mx-auto w-full max-w-3xl p-6 text-center", className)}>
      <h2 className="text-xl font-semibold">{title}</h2>
      {description ? <p className="mt-2 text-gray-600">{description}</p> : null}

      {onRetry ? (
        <div className="mt-6">
          <Button onClick={onRetry}>{retryLabel}</Button>
        </div>
      ) : null}
    </div>
  );
});

export default ErrorState;
