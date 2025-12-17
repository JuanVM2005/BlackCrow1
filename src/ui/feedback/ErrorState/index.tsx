import * as React from "react";
import { cn } from "@/utils/cn";

export interface ErrorStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Título del estado (ej. "Algo salió mal") */
  title?: React.ReactNode;
  /** Mensaje descriptivo breve */
  description?: React.ReactNode;
  /** Slot para icono/ilustración (opcional) */
  icon?: React.ReactNode;
  /** Slot para acciones (botones, links) */
  actions?: React.ReactNode;
  /** Versión compacta (menos padding) */
  compact?: boolean;
}

const wrapperBase =
  "w-full flex flex-col items-center justify-center text-center";
const wrapperDense = "py-6 gap-2";
const wrapperComfort = "py-12 gap-3";

const titleCls = "text-base font-semibold text-gray-900";
const descCls = "text-sm text-gray-600";
const iconCls = "mb-2 text-3xl";

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      className,
      title = "Algo salió mal",
      description = "Intenta de nuevo en unos momentos.",
      icon,
      actions,
      compact,
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="region"
        aria-labelledby="errorstate-title"
        className={cn(
          wrapperBase,
          compact ? wrapperDense : wrapperComfort,
          className
        )}
        {...rest}
      >
        {icon ? <div className={iconCls}>{icon}</div> : null}

        <h2 id="errorstate-title" className={titleCls}>
          {title}
        </h2>

        {description ? <p className={descCls}>{description}</p> : null}

        {children}

        {actions ? (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    );
  }
);

ErrorState.displayName = "ErrorState";
export default ErrorState;
