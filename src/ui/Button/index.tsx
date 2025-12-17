// src/ui/Button/index.tsx
"use client";

import * as React from "react";
import { cn } from "@/utils/cn";
import { motion, useSpring, useMotionTemplate } from "framer-motion";

/** Tamaños (puedes moverlos a un config local si quieres) */
const sizeClasses = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
  xl: "h-12 px-6 text-base",
} as const;

/** Altura real por tamaño (para el efecto “morph circle” del borde) */
const sizeToH = {
  sm: "2.25rem", // h-9
  md: "2.5rem",  // h-10
  lg: "2.75rem", // h-11
  xl: "3rem",    // h-12
} as const;

/**
 * Variantes (colores desde tus TOKENS en globals.css):
 * --btn-bg, --btn-bg-hover, --btn-fg, --btn-border, --ring, --text, --surface
 */
const variantClasses = {
  solid:
    "border border-[color:var(--btn-border)] " +
    "bg-[color:var(--btn-bg)] text-[color:var(--btn-fg)] " +
    "hover:bg-[color:var(--btn-bg-hover)] " +
    "focus-visible:outline-[color:var(--ring)]",
  outline:
    "border border-[color:var(--btn-border)] bg-transparent " +
    "text-[color:var(--btn-fg)] hover:bg-[color:var(--btn-bg-muted,_transparent)] " +
    "focus-visible:outline-[color:var(--ring)]",
  ghost:
    "bg-transparent text-[color:var(--btn-fg)] " +
    "hover:bg-[color:var(--btn-bg-muted,_transparent)] " +
    "focus-visible:outline-[color:var(--ring)]",
  link:
    "bg-transparent underline underline-offset-4 px-0 " +
    "text-[color:var(--btn-fg)] focus-visible:outline-[color:var(--ring)]",

  /** CTA outline con “lift + inversión de colores + flecha” (menos curvo + borde 2px) */
  ctaRaise:
    "border-2 border-[color:var(--btn-border)] bg-transparent " +
    "text-[color:var(--text)] " +
    "motion-safe:hover:-translate-y-px " +
    "hover:bg-[color:var(--btn-bg)] hover:text-[color:var(--btn-fg)] hover:border-[color:var(--btn-border)] " +
    "focus-visible:outline-[color:var(--ring)]",

  /**
   * MORPH (sin imán): borde que se “encapsula” a la derecha en hover.
   * El borde vive en ::before (se deforma a círculo con ancho = alto del botón).
   */
  morph:
    "relative overflow-hidden bg-transparent text-[color:var(--text)] " +
    "rounded-[var(--radius-full)] " +
    "before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-full " +
    "before:rounded-[var(--radius-full)] before:border-2 before:border-[color:var(--btn-border)] before:pointer-events-none " +
    "before:transition-[transform,left,width,border-radius] before:duration-300 before:ease-[cubic-bezier(.16,1,.3,1)] " +
    "hover:before:left-[calc(100%-var(--btn-h))] hover:before:w-[var(--btn-h)] hover:before:rounded-[var(--radius-full)] " +
    "focus-visible:outline-[color:var(--ring)]",

  /**
   * === NUEVA === morphMagnet (con “imán”/seguimiento del puntero)
   * - Reusa el borde morph (::before) y añade seguimiento con springs (Framer Motion).
   * - Solo en puntero fino; respeta prefers-reduced-motion.
   */
  morphMagnet:
    "relative overflow-hidden bg-transparent text-[color:var(--text)] " +
    "rounded-[var(--radius-full)] " +
    "before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-full " +
    "before:rounded-[var(--radius-full)] before:border-2 before:border-[color:var(--btn-border)] before:pointer-events-none " +
    "before:transition-[transform,left,width,border-radius] before:duration-300 before:ease-[cubic-bezier(.16,1,.3,1)] " +
    "hover:before:left-[calc(100%-var(--btn-h))] hover:before:w-[var(--btn-h)] hover:before:rounded-[var(--radius-full)] " +
    "focus-visible:outline-[color:var(--ring)]",
} as const;

type Variant = keyof typeof variantClasses;
type Size = keyof typeof sizeClasses;

type ButtonRef = HTMLButtonElement | HTMLAnchorElement;

export type ButtonProps = {
  asChild?: boolean;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  withArrow?: boolean;
  arrowPosition?: "right" | "left";
  "data-testid"?: string;
  className?: string;
  children?: React.ReactNode;
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "color" | "disabled" | "children"
>;

/** Slot mínimo para `asChild` (tolerante, ignora espacios y sólo usa el único elemento válido) */
function asChildClone(
  child: React.ReactNode,
  props: Record<string, any>,
  ref: React.Ref<ButtonRef>,
) {
  // Normaliza a array y filtra sólo elementos válidos
  const elements = React.Children.toArray(child).filter(
    (node): node is React.ReactElement => React.isValidElement(node),
  );

  // Si NO hay exactamente un elemento válido → fallback a <button>
  if (elements.length !== 1) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error(
        "[Button] `asChild` requiere un único elemento React como hijo. " +
          "Se renderizará un <button> estándar como fallback.",
        child,
      );
    }

    const { asChild: _omit, ...restProps } = props;

    return React.createElement(
      "button",
      {
        ...(restProps as React.ButtonHTMLAttributes<HTMLButtonElement>),
        ref: ref as React.Ref<HTMLButtonElement>,
      },
    );
  }

  const only = elements[0] as React.ReactElement<any>;

  return React.cloneElement(only, {
    ...props,
    ref,
    className: cn(
      (only.props as any)?.className,
      (props as any).className,
    ),
    style: {
      ...(only.props as any)?.style,
      ...(props as any).style,
    },
  });
}

/** Spinner minimal (hereda currentColor) */
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-4 h-4 animate-spin", className)}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        opacity="0.25"
        fill="none"
      />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Flecha amplia (usa currentColor) */
export function ButtonArrow({ className }: { className?: string }) {
  return (
    <svg
      className={cn(
        "w-[22px] h-[22px] translate-x-0 transition-transform duration-200 group-hover:translate-x-1.5",
        className,
      )}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

/** Button — usa TOKENS globales */
export const Button = React.forwardRef<ButtonRef, ButtonProps>(
  (
    {
      asChild,
      variant = "solid",
      size = "md",
      fullWidth,
      isLoading,
      disabled: disabledProp,
      leftIcon,
      rightIcon,
      withArrow,
      arrowPosition = "right",
      className,
      children,
      "data-testid": dataTestId = "button",
      type = "button",
      ...rest
    },
    ref,
  ) => {
    const isMorph = variant === "morph" || variant === "morphMagnet";

    // === Springs para morphMagnet ===
    const outerX = useSpring(0, { stiffness: 300, damping: 22, mass: 0.4 });
    const outerY = useSpring(0, { stiffness: 300, damping: 22, mass: 0.4 });
    const innerX = useSpring(0, { stiffness: 380, damping: 26, mass: 0.35 });
    const innerY = useSpring(0, { stiffness: 380, damping: 26, mass: 0.35 });
    const tix = useMotionTemplate`${innerX}px`;
    const tiy = useMotionTemplate`${innerY}px`;
    const MAGNET_MAX = 14; // px de desplazamiento máximo del “imán”

    const onMove = React.useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (variant !== "morphMagnet") return;
        if (
          typeof window !== "undefined" &&
          (window.matchMedia("(pointer: fine)").matches === false ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches === true)
        ) {
          return;
        }
        const zone = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const cx = zone.left + zone.width / 2;
        const cy = zone.top + zone.height / 2;
        const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (zone.width / 2)));
        const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (zone.height / 2)));
        const tx = nx * MAGNET_MAX;
        const ty = ny * MAGNET_MAX;
        outerX.set(tx);
        outerY.set(ty);
        innerX.set(tx * 0.55);
        innerY.set(ty * 0.55);
      },
      [variant, outerX, outerY, innerX, innerY],
    );

    const onLeave = React.useCallback(() => {
      if (variant !== "morphMagnet") return;
      outerX.set(0);
      outerY.set(0);
      innerX.set(0);
      innerY.set(0);
    }, [variant, outerX, outerY, innerX, innerY]);

    const base =
      "group inline-flex items-center justify-center gap-3 " +
      (variant === "ctaRaise"
        ? "rounded-[var(--radius-md)] "
        : "rounded-[var(--radius-full)] ") +
      "font-medium select-none " +
      "transition-[background,opacity,transform,box-shadow,color,border-color] active:scale-[0.98] " +
      "disabled:opacity-50 disabled:pointer-events-none " +
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
      "will-change-transform";

    const structural = cn(
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && "w-full",
    );

    const emulateDisabled = isLoading || !!disabledProp;
    const stateClasses = cn(emulateDisabled && "pointer-events-none opacity-50");
    const composedClassName = cn(base, structural, stateClasses, className);

    const cssVars = isMorph
      ? ({
          ["--btn-h" as any]: sizeToH[size],
          ["--tix" as any]: variant === "morphMagnet" ? tix : "0px",
          ["--tiy" as any]: variant === "morphMagnet" ? tiy : "0px",
        } as React.CSSProperties)
      : undefined;

    const ariaProps = {
      "aria-busy": isLoading || undefined,
      "aria-disabled": emulateDisabled || undefined,
    };

    const innerStyle = isMorph
      ? ({ transform: "translate(var(--tix), var(--tiy))" } as React.CSSProperties)
      : undefined;

    const left =
      isLoading ? (
        <Spinner />
      ) : arrowPosition === "left" && withArrow ? (
        <ButtonArrow className={isMorph ? "" : undefined} />
      ) : (
        leftIcon
      );

    const right =
      arrowPosition === "right" && withArrow ? (
        <ButtonArrow className={isMorph ? "" : undefined} />
      ) : (
        rightIcon
      );

    const content = (
      <>
        {left && (isMorph ? <span style={innerStyle}>{left}</span> : left)}
        <span className="truncate" style={innerStyle}>
          {children}
        </span>
        {right && (isMorph ? <span style={innerStyle}>{right}</span> : right)}
      </>
    );

    // morphMagnet: wrapper motion.div
    if (variant === "morphMagnet") {
      const Wrapper = motion.div;
      if (asChild && children) {
        return (
          <Wrapper
            style={{ x: outerX, y: outerY }}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            className={fullWidth ? "w-full inline-block" : "inline-block"}
          >
            {asChildClone(
              children,
              {
                ...rest,
                className: composedClassName,
                style: cssVars,
                "data-testid": dataTestId,
                ...ariaProps,
                tabIndex: emulateDisabled ? -1 : (rest as any)?.tabIndex,
              },
              ref,
            )}
          </Wrapper>
        );
      }

      return (
        <Wrapper
          style={{ x: outerX, y: outerY }}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          className={fullWidth ? "w-full inline-block" : "inline-block"}
        >
          <button
            type={type}
            className={composedClassName}
            style={cssVars}
            data-testid={dataTestId}
            disabled={emulateDisabled}
            {...ariaProps}
            {...rest}
            ref={ref as React.Ref<HTMLButtonElement>}
          >
            {content}
          </button>
        </Wrapper>
      );
    }

    // Render normal (solid/outline/ghost/link/ctaRaise/morph)
    if (asChild && children) {
      return asChildClone(
        children,
        {
          ...rest,
          className: composedClassName,
          style: cssVars,
          "data-testid": dataTestId,
          ...ariaProps,
          tabIndex: emulateDisabled ? -1 : (rest as any)?.tabIndex,
        },
        ref,
      );
    }

    return (
      <button
        type={type}
        className={composedClassName}
        style={cssVars}
        data-testid={dataTestId}
        disabled={emulateDisabled}
        {...ariaProps}
        {...rest}
        ref={ref as React.Ref<HTMLButtonElement>}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
