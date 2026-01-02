// src/server/index.ts

// Contact
export * from "./contact";

// Observabilidad
export * from "./observability/log";
export * from "./observability/metrics";

// Seguridad
export * from "./security/ratelimit";
export * from "./security/cors";

// Adapters registry (punto de entrada recomendado)
export { analyticsAdapter } from "./adapters/registry/analytics";
export { newsletterAdapter } from "./adapters/registry/newsletter";
