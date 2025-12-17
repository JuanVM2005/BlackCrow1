import * as React from "react";
import { cn } from "@/utils/cn";

type Variant = "info" | "success" | "warning" | "danger";

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Tipo visual y semántico del aviso */
  variant?: Variant;
  /** Título corto del aviso (opcional) */
  title?: React.ReactNode;
  /** Texto descriptivo (opcional) */
  description?: React.ReactNode;
  /** Icono a la izquierda (opcional) */
  icon?: React.ReactNode;
  /** Acciones a la derecha/abajo (opcional) */
  actions?: React.ReactNode;
  /** Permitir botón de cierre (controlado por onClose) */
  dismissible?: boolean;
  onClose?: () => void;
}

const base =
  "w-full rounded-md p-4 ring-1 ring-inset flex gap-3 items-start";

const palette: Record<
  Variant,
  { container: string; title: string; desc: string; ring: string }
> = {
  info: {
    container: "bg-blue-50 text-blue-900",
    title: "text-blue-900",
    desc: "text-blue-800/80",
    ring: "ring-blue-200",
  },
  success: {
    container: "bg-green-50 text-green-900",
    title: "text-green-900",
    desc: "text-green-800/80",
    ring: "ring-green-200",
  },
  warning: {
    container: "bg-amber-50 text-amber-900",
    title: "text-amber-900",
    desc: "text-amber-800/80",
    ring: "ring-amber-200",
  },
  danger: {
    container: "bg-red-50 text-red-900",
    title: "text-red-900",
    desc: "text-red-800/80",
    ring: "ring-red-200",
  },
};

const liveMap: Record<Variant, "polite" | "assertive"> = {
  info: "polite",
  success: "polite",
  warning: "assertive",
  danger: "assertive",
};

const titleCls = "text-sm font-medium";
const descCls = "text-sm leading-6";
const iconCls = "mt-0.5 shrink-0";
const actionsCls = "mt-2 flex flex-wrap gap-2";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = "info",
      title,
      description,
      icon,
      actions,
      dismissible,
      onClose,
      children,
      ...rest
    },
    ref
  ) => {
    const paletteCls = palette[variant];

    return (
      <div
        ref={ref}
        role="alert"
        aria-live={liveMap[variant]}
        className={cn(base, paletteCls.container, paletteCls.ring, className)}
        {...rest}
      >
        {icon ? <div className={iconCls}>{icon}</div> : null}

        <div className="flex-1">
          {title ? (
            <div className={cn(titleCls, paletteCls.title)}>{title}</div>
          ) : null}

        {description ? (
            <div className={cn(descCls, paletteCls.desc)}>{description}</div>
          ) : null}

          {children}

          {actions ? <div className={actionsCls}>{actions}</div> : null}
        </div>

        {dismissible && onClose ? (
          <button
            type="button"
            aria-label="Cerrar alerta"
            onClick={onClose}
            className={cn(
              "shrink-0 rounded-md px-2 py-1 text-xs",
              "hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
            )}
          >
            ×
          </button>
        ) : null}
      </div>
    );
  }
);

Alert.displayName = "Alert";
export default Alert;
export type { Variant as AlertVariant };
