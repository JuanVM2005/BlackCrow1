// src/app/[locale]/(marketing)/services/page.tsx

export { default } from "../servicios/page";

// ⚠️ Usa el mismo valor que tengas en `../servicios/page.tsx`.
// Si allí usas otro número, cámbialo también aquí.
export const revalidate = 3600;
