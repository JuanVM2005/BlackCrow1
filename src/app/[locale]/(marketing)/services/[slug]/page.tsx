// src/app/[locale]/(marketing)/services/[slug]/page.tsx

export {
  default,
  generateMetadata,
  generateStaticParams,
} from "../../servicios/[slug]/page";

// ❌ Ya no re-exportamos revalidate desde otro archivo
// ⛔ export const revalidate = revalidate; (NO permitdo)

// ✅ Definir el mismo valor directamente aquí
export const revalidate = 3600;
