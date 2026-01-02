// src/core/index.ts
// Barrel del core (API pública interna).
// Mantén aquí solo módulos estables que se consumen desde features/app.

export * as validation from "./validation";
export * as http from "./http";
export * as seo from "./seo";
export * as errors from "./errors";
