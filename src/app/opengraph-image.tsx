// src/app/opengraph-image.tsx

// Reutilizamos solo el componente de imagen
export { default } from "./[locale]/(marketing)/opengraph-image";

// Estos campos Next necesita leerlos directamente aquí,
// sin reexports ni variables importadas.
export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
