// src/app/[locale]/(marketing)/services/[slug]/opengraph-image.tsx

// Next necesita ver estos exports directamente en este archivo
export const runtime = "edge";
export const revalidate = 3600;

// El resto lo reutilizamos desde la versión en /servicios
export {
  default,
  alt,
  size,
  contentType,
} from "../../servicios/[slug]/opengraph-image";
