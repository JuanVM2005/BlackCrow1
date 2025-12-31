// src/app/[locale]/(marketing)/services/[slug]/layout.tsx
import type { ReactNode } from "react";
import ServicePageFrame from "@/features/services/ui/ServicePageFrame";
import { serviceFormSchema } from "@/content/schemas/serviceForm.schema";
import type { ServiceFormJSON } from "@/content/schemas/serviceForm.schema";

// Navegación (EN)
import enNav from "@/content/locales/en/services/_nav.json";
// A11y (EN)
import a11y from "@/content/locales/en/services/_a11y.json";

// Formularios (EN) — JSON crudo por servicio
import landingFormRaw from "@/content/locales/en/services/forms/landing.json";
import websiteFormRaw from "@/content/locales/en/services/forms/website.json";
import ecommerceFormRaw from "@/content/locales/en/services/forms/ecommerce.json";
import customFormRaw from "@/content/locales/en/services/forms/custom.json";

type Params = {
  locale: "es" | "en";
  slug: "landing" | "website" | "ecommerce" | "custom";
};

type NavItem = { label: string; slug: string; order: number };
type A11yJSON = { switcherLabel: string };

export default async function ServiceDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;

  const nav = (enNav as NavItem[]).slice().sort((a, b) => a.order - b.order);
  const switcherItems = nav.map((it) => ({
    label: it.label,
    slug: it.slug,
    href: `/${locale}/services/${it.slug}`,
  }));

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
    case "custom":
      formData = serviceFormSchema.parse(customFormRaw);
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
