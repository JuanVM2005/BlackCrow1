import { FaqSchema, type FaqSection, type FaqItem } from "@/content/schemas/faq.schema";

/** VM para la UI */
export type FaqProps = {
  title: string;
  items: Array<FaqItem & { id: string }>;
};

/** Util: genera un id estable a partir de la pregunta */
const toId = (s: string, i: number) =>
  `${i}-${s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;

/** Mapea y valida el contenido crudo → props para la UI */
export function mapFaq(data: unknown): FaqProps {
  const parsed: FaqSection = FaqSchema.parse(data);

  const items = parsed.items.map((it, idx) => ({
    ...it,
    id: toId(it.question, idx),
  }));

  return {
    title: parsed.title,
    items,
  };
}

/** Type guard útil en el compositor de landing */
export function isFaqSection(block: { kind?: string; data?: unknown }): boolean {
  return block?.kind === "faq";
}
