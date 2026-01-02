// src/app/[locale]/(marketing)/servicios/page.tsx
import Container from "@/ui/Container";
import Section from "@/ui/Section";
import { normalizeLocale } from "@/i18n/locales";

// Pricing
import Pricing from "@/features/pricing/ui";
import * as PricingSchema from "@/content/schemas/pricing.schema";
import * as PricingMapper from "@/features/pricing/content/pricing.mapper";

/** Revalidación diaria (SSG + ISR) */
export const revalidate = 86400;

// 👇 Next 16: params es Promise
type PageProps = {
  params: Promise<{ locale: string }>;
};

/** Carga pricing i18n */
async function loadPricing(locale: string): Promise<unknown | null> {
  const l = normalizeLocale(locale);
  try {
    if (l === "es") {
      return (await import("@/content/locales/es/sections/pricing.json")).default;
    }
    return (await import("@/content/locales/en/sections/pricing.json")).default;
  } catch {
    return null;
  }
}

export default async function ServiciosPricingPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);

  const pricingRaw = await loadPricing(locale);
  if (!pricingRaw) return null;

  // Resolver parser / mapper reales del proyecto (sin asumir nombres exactos)
  const schemaAny = PricingSchema as any;
  const mapperAny = PricingMapper as any;

  const parseFn =
    schemaAny.parsePricing ??
    schemaAny.parsePricingSection ??
    schemaAny.parsePricingBlock ??
    schemaAny.parse;

  const mapFn =
    mapperAny.mapPricing ??
    mapperAny.mapPricingSection ??
    mapperAny.mapPricingBlock ??
    mapperAny.map;

  const parsed = typeof parseFn === "function" ? parseFn(pricingRaw) : pricingRaw;
  const pricingProps = typeof mapFn === "function" ? mapFn(parsed) : parsed;

  return (
    // ✅ Solo Pricing. El fondo lo maneja el layout inverse.
    <main>
      <Section>
        <Container>
          {/* ✅ Tokens INVERSE para que el contenido sea legible sobre fondo oscuro,
              sin pintar fondo (NO usar surface-inverse aquí). */}
          <div data-surface="inverse">
            <Pricing {...pricingProps} />
          </div>
        </Container>
      </Section>
    </main>
  );
}
