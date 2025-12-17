// src/core/seo/manifest.config.ts
import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/**
 * Config centralizado del Web App Manifest.
 * Lee todos los datos desde `@/config/site` para no hardcodear
 * strings ni colores directamente en las rutas de app.
 */
export const manifestConfig: MetadataRoute.Manifest = {
  name: site.name,
  short_name: site.shortName ?? site.name,
  description: site.description ?? site.seo.defaultDescription,

  // Rutas / comportamiento PWA
  start_url: site.manifest.startUrl,
  scope: site.manifest.scope,
  display: site.manifest.display,

  // Colores (mapeados desde config/tokens)
  background_color: site.manifest.backgroundColor,
  theme_color: site.manifest.themeColor,

  // Iconos (clonados para evitar el problema de readonly -> Icon[])
  icons: site.manifest.icons.slice(),
};
