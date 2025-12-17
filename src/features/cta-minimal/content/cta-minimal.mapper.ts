import type { CtaMinimalProps } from "../ui";

export type CtaMinimalSection = {
  kind: "cta-minimal";
  data?: {
    title: string;
    action: { label: string; href: string };
    align?: "center" | "left" | "right";
  };
};

export const isCtaMinimal = (v: unknown): v is CtaMinimalSection =>
  !!v && typeof v === "object" && (v as any).kind === "cta-minimal";

/**
 * Mapea el bloque de contenido a props del componente.
 * Si no hay data, aplica un fallback razonable.
 */
export function mapCtaMinimal(
  section?: CtaMinimalSection,
  fallback?: CtaMinimalSection["data"],
): CtaMinimalProps {
  const d =
    section?.data ??
    fallback ?? {
      title: "¿Listo para algo personalizado?",
      action: { label: "Habla con nosotros", href: "/contact" },
      align: "center" as const,
    };

  return {
    title: String(d.title),
    action: {
      label: String(d.action.label),
      href: String(d.action.href),
    },
    align: d.align ?? "center",
  };
}
