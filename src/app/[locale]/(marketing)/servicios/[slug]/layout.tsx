// src/app/[locale]/(marketing)/servicios/[slug]/layout.tsx
import type { ReactNode } from "react";
import ServicePageFrame from "@/features/services/ui/ServicePageFrame";
import { serviceFormSchema } from "@/content/schemas/serviceForm.schema";
import type { ServiceFormJSON } from "@/content/schemas/serviceForm.schema";

// Navegación (ES)
import esNav from "@/content/locales/es/services/_nav.json";
// A11y label (ES)
import a11y from "@/content/locales/es/services/_a11y.json";

// Formularios (ES) — JSON crudo por servicio
import landingFormRaw from "@/content/locales/es/services/forms/landing.json";
import websiteFormRaw from "@/content/locales/es/services/forms/website.json";
import ecommerceFormRaw from "@/content/locales/es/services/forms/ecommerce.json";
import personalizadoFormRaw from "@/content/locales/es/services/forms/personalizado.json";

type Params = {
  locale: "es" | "en";
  slug: "landing" | "website" | "ecommerce" | "personalizado";
};

type NavItem = { label: string; slug: string; order: number };
type A11yJSON = { switcherLabel: string };

export default async function ServiceDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  // ✅ Next 15/16: params es Promise
  params: Promise<Params>;
}) {
  // Hay que hacer await para leer locale y slug
  const { locale, slug } = await params;

  // Items para el switcher (ordenados por 'order')
  const nav = (esNav as NavItem[]).slice().sort((a, b) => a.order - b.order);
  const switcherItems = nav.map((it) => ({
    label: it.label,
    slug: it.slug,
    href: `/${locale}/servicios/${it.slug}`,
  }));

  // Parse estricto del form (schema minimal)
  let formData: ServiceFormJSON;
  switch (slug) {
    case "landing":
      formData = serviceFormSchema.parse(landingFormRaw);
      break;
    case "website":
      formData = serviceFormSchema.parse(websiteFormRaw);
      break;
    case "ecommerce":
      formData = serviceFormSchema.parse(ecommerceFormRaw);
      break;
    case "personalizado":
      formData = serviceFormSchema.parse(personalizadoFormRaw);
      break;
    default:
      formData = serviceFormSchema.parse(landingFormRaw);
  }

  const { switcherLabel } = a11y as A11yJSON;

  return (
    <ServicePageFrame
      switcherItems={switcherItems}
      activeSlug={slug}
      formData={formData}
      switcherAriaLabel={switcherLabel}
    >
      {children}
    </ServicePageFrame>
  );
}
