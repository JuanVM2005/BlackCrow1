// src/features/services/ui/templates/templateMap.ts
import type { ComponentType } from "react";
import type { ServiceKey } from "@/i18n/routing/static";
import type { ServiceDetailJSON } from "@/content/schemas/serviceDetail.schema";

import LandingTemplate from "./LandingTemplate";
import WebsiteTemplate from "./WebsiteTemplate";
import EcommerceTemplate from "./EcommerceTemplate";
import CustomTemplate from "./CustomTemplate";

export type ServiceDetailViewProps = {
  data: ServiceDetailJSON;
  locale: "es" | "en";
};

/**
 * Mapa de plantillas por clave de servicio.
 * Mantén este objeto como única fuente para el enrutado de vistas de detalle.
 */
export const templateMap = {
  landing: LandingTemplate,
  website: WebsiteTemplate,
  ecommerce: EcommerceTemplate,
  custom: CustomTemplate,
} satisfies Record<ServiceKey, ComponentType<ServiceDetailViewProps>>;

/** Helper para obtener el componente por clave, con fallback seguro a Landing */
export function getServiceTemplate(key: ServiceKey): ComponentType<ServiceDetailViewProps> {
  return templateMap[key] ?? LandingTemplate;
}
