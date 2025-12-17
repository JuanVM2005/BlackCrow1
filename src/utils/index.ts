// Barrel de utilidades UI (front-only)
// Nota: no uses "use client" aquí.

export * from './composeEventHandlers';
export * from './mergeRefs';
export * from './aria';
export * from './clamp';

// Para `cn.ts`:
// - Si tu `cn.ts` exporta **nombrado**: `export function cn(...) {}`
//     entonces usa:
export { cn } from './cn';

// - Si tu `cn.ts` exporta **por defecto**:
//     cambia la línea anterior por:
// export { default as cn } from './cn';
