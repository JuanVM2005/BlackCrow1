// src/features/pricing/content/pricing.mapper.ts
import { z } from "zod";
import {
  pricingSectionSchema,
  pricingDataSchema,
  type PricingPrice as SchemaPrice,
  type PricingPlan as SchemaPlan,
  type PricingRichParagraph as SchemaRichParagraph,
} from "@/content/schemas/pricing.schema";

/** ================================
 *  Tipos expuestos al UI (normalizados)
 *  ================================ */
export type PricingPlan = {
  id: string;
  name: string;
  /** Texto ya formateado, ej: "S/ 1,890 / único" o "A medida" */
  price: string;
  features: string[];
  cta: { label: string; href: string };
  badge?: string;
  featured?: boolean;
};

export type RichInline = { text: string; strong?: boolean };
export type RichParagraph = { type: "p"; children: RichInline[] };

export type PricingProps = {
  heading: { titleLines: string[] }; // ej: ["Elige tu Plan,", "Despega", "HOY"]
  /** Párrafos ricos (inline strong) a la derecha del título */
  aside: RichParagraph[];
  /** 3 tarjetas (la del medio suele ir featured) */
  plans: PricingPlan[];
  /** Texto pequeño inferior */
  disclaimer?: string;
};

/** ================================
 *  Utilidades de normalización
 *  ================================ */

/** Acepta {kind,data} o solo {heading,aside,...} y devuelve siempre data válido */
function coerceData(input: unknown) {
  const asBlock = pricingSectionSchema.safeParse(input);
  if (asBlock.success) return asBlock.data.data;
  // Si no viene con {kind}, parsea como data directo
  return pricingDataSchema.parse(input);
}

/** Normaliza price a string */
function normalizePrice(p: SchemaPrice): string {
  if (typeof p === "string") return p;
  return p.period ? `${p.amount} / ${p.period}` : p.amount;
}

/** Convierte strings a { type:"p", children:[{text}] } */
function normalizeAside(
  aside: Array<string | SchemaRichParagraph>
): RichParagraph[] {
  return aside.map((item) =>
    typeof item === "string"
      ? { type: "p", children: [{ text: item }] }
      : // Asegura shape mínimo (defensivo por si viene vacío)
        {
          type: "p" as const,
          children:
            item.children && item.children.length > 0
              ? item.children.map((c) => ({ text: c.text, strong: c.strong }))
              : [{ text: "" }],
        }
  );
}

/** ================================
 *  Export principal
 *  ================================ */
export function mapPricingSection(input: unknown): PricingProps {
  const parsed = coerceData(input);

  // Validación defensiva (evita que se “cuelen” shapes raros al mapper)
  const PlanArray = z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      price: z.any(), // ya validado por schema raíz; se normaliza abajo
      features: z.array(z.string().min(1)).min(1),
      cta: z.object({ label: z.string().min(1), href: z.string().min(1) }),
      badge: z.string().optional(),
      featured: z.boolean().optional(),
    })
  ).parse(parsed.plans as SchemaPlan[]);

  return {
    heading: parsed.heading,
    aside: normalizeAside(parsed.aside as Array<string | SchemaRichParagraph>),
    plans: PlanArray.map((pl) => ({
      id: pl.id,
      name: pl.name,
      price: normalizePrice(pl.price as SchemaPrice),
      features: pl.features,
      cta: pl.cta,
      badge: pl.badge,
      featured: pl.featured,
    })),
    disclaimer: parsed.disclaimer,
  };
}

/** Type guard por si compones desde un arreglo de secciones */
export function isPricingSection(
  block: unknown
): block is { kind: "pricing"; data: PricingProps } {
  return !!block && typeof block === "object" && (block as any).kind === "pricing";
}
