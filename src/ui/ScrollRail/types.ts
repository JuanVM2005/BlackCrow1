// src/ui/ScrollRail/types.ts
export type ScrollRailPosition = "right" | "left";

export type ScrollRailProps = {
  /** Lado de la pantalla donde aparece la barra */
  position?: ScrollRailPosition;
  /** Offset superior en px */
  offsetTop?: number;
  /** Offset inferior en px */
  offsetBottom?: number;
  /** Grosor (ancho) del rail en px */
  thickness?: number;
  /** Radio del thumb y rail en px (0 = rectangular) */
  radius?: number;

  /** Ocultar cuando no hay interacción */
  autoHide?: boolean;
  /** Ms para ocultar tras inactividad (si autoHide=true) */
  idleDelay?: number;

  /** Alto mínimo del thumb en px */
  minThumbSize?: number;
  /** Multiplicador del alto proporcional del thumb (1 = actual) */
  thumbScale?: number;
  /** Alto fijo del thumb (si se define, ignora proporcional + scale) */
  thumbFixedPx?: number;

  /** Clases opcionales */
  className?: string;
  trackClassName?: string;
  thumbClassName?: string;

  /** Etiqueta accesible opcional */
  ariaLabel?: string;
  /** id del contenedor de scroll (si deseas exponerlo) */
  ariaControlsId?: string;
};
