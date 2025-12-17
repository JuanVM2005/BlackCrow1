// src/app/[locale]/(marketing)/servicios/page.tsx
import Container from "@/ui/Container";
import Section from "@/ui/Section";
import Typography from "@/ui/Typography";
import { normalizeLocale } from "@/i18n/locales";
import type { ServiceKey } from "@/i18n/routing/static";
import { serviceDetailPath } from "@/i18n/routing/static";
import ServicesList from "@/features/services/ui/list";

/** Revalidación diaria (SSG + ISR) */
export const revalidate = 86400;

/** Forma mínima del JSON de índice (solo para tipado local) */
type LinkItem = { label: string; href?: string; external?: boolean };
type ServicesIndexJSON = {
  header?: { title: string; subtitle?: string };
  items?: Array<{ key: ServiceKey; title: string; summary?: string; cta?: LinkItem }>;
};

/** Carga el contenido i18n de /servicios (sin hardcode) */
async function loadContent(locale: string): Promise<ServicesIndexJSON | null> {
  const l = normalizeLocale(locale);
  try {
    if (l === "es") {
      return (await import("@/content/locales/es/pages/servicios.json"))
        .default as ServicesIndexJSON;
    }
    return (await import("@/content/locales/en/pages/services.json"))
      .default as ServicesIndexJSON;
  } catch {
    return null;
  }
}

// 👇 Next 16: params es un Promise y hay que hacerle await
type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ServiciosIndex({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);

  const content = await loadContent(locale);

  const header = content?.header;
  const items = content?.items ?? [];

  // Enlazado correcto: si un item no trae CTA o le falta href,
  // generamos la ruta canónica con serviceDetailPath(locale, key).
  const itemsNormalized = items.map((it) => {
    const href = it.cta?.href ?? serviceDetailPath(locale, it.key);
    const label = it.cta?.label ?? (locale === "es" ? "Ver servicio" : "View service");
    const external = it.cta?.external;
    return { ...it, cta: { label, href, external } };
  });

  return (
    <main
      data-surface="base"
      className="bg-[var(--surface-base)] text-[var(--text)]"
    >
      {/* HERO */}
      <Section>
        <Container>
          {header?.title ? (
            <Typography.Heading as="h1">{header.title}</Typography.Heading>
          ) : null}
          {header?.subtitle ? (
            <Typography.Text as="p">{header.subtitle}</Typography.Text>
          ) : null}
        </Container>
      </Section>

      {/* LISTADO DE SERVICIOS */}
      <Section>
        <Container>
          <ServicesList locale={locale} items={itemsNormalized} />
        </Container>
      </Section>
    </main>
  );
}
