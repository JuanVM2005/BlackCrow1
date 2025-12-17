// src/features/interactive-3d/content/interactive-3d.mapper.ts
import { interactive3DSchema, type Interactive3DContent } from "@/content/schemas/interactive-3d.schema";

/**
 * Props esperados por el componente UI <Interactive3D />
 * (El shader es runtime: lo pasas como string desde tu implementación, no viene del JSON)
 */
export type Interactive3DUiProps = {
  eyebrow: string;
  headline: string;
  shader: string;
  /** Accesibilidad opcional para el canvas/shader */
  ariaLabel?: string;
  /** Layout opcional por si quieres alternar */
  variant?: "fullBleed" | "contained";
};

type MapOptions = {
  /** GLSL fragment shader (string inline, sin archivos .glsl) */
  shader: string;
  ariaLabel?: string;
  variant?: "fullBleed" | "contained";
};

/**
 * Valida el JSON con el schema y lo mapea a props de UI,
 * inyectando el `shader` en tiempo de ejecución.
 */
export function mapInteractive3D(
  data: unknown,
  options: MapOptions
): Interactive3DUiProps {
  const parsed: Interactive3DContent = interactive3DSchema.parse(data);

  const shader = (options.shader ?? "").trim();
  if (!shader) {
    throw new Error(
      "[interactive-3d.mapper] `shader` debe ser un string GLSL no vacío."
    );
  }

  return {
    eyebrow: parsed.eyebrow,
    headline: parsed.headline,
    shader,
    ariaLabel: options.ariaLabel ?? parsed.eyebrow,
    variant: options.variant ?? "fullBleed",
  };
}
