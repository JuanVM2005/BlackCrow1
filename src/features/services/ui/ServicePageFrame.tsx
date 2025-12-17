// src/features/services/ui/ServicePageFrame.tsx
import type { ReactNode } from "react";
import Section from "@/ui/Section";
import Container from "@/ui/Container";
import ServiceSwitcher from "@/features/services/ui/ServiceSwitcher";
import ServiceInquiryForm from "@/features/services/ui/ServiceInquiryForm";
import type { ServiceFormJSON } from "@/content/schemas/serviceForm.schema";

type SwitchItem = { label: string; href: string; slug: string };

export interface ServicePageFrameProps {
  children: ReactNode;
  switcherItems: SwitchItem[];
  activeSlug: string;
  formData: ServiceFormJSON;
  className?: string;
  /** Label accesible para el nav del switcher (i18n) */
  switcherAriaLabel?: string;
}

export default function ServicePageFrame({
  children,
  switcherItems,
  activeSlug,
  formData,
  className,
  switcherAriaLabel,
}: ServicePageFrameProps) {
  return (
    <div className={className}>
      {/* 1) Template (título, contenido, etiquetas) */}
      {children}

      {/* 2) Switcher: debajo de etiquetas */}
      <Section spacing="sm">
        <Container size="xl">
          <ServiceSwitcher
            items={switcherItems}
            activeSlug={activeSlug}
            size="md"
            ariaLabel={switcherAriaLabel}
          />
        </Container>
      </Section>

      {/* 3) Formulario común */}
      <Section spacing="lg">
        <Container size="xl">
          <ServiceInquiryForm data={formData} />
        </Container>
      </Section>
    </div>
  );
}
