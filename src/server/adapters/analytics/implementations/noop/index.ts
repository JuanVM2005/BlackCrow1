// src/server/adapters/analytics/implementations/noop/index.ts
import type { AnalyticsAdapter, AnalyticsEvent } from "../../contract";

/**
 * Implementación NO-OP.
 * No envía datos a ningún lado.
 * Útil para:
 * - desarrollo
 * - proyectos sin analytics de negocio
 * - evitar condicionales en el dominio
 */
export class NoopAnalyticsAdapter implements AnalyticsAdapter {
  async track(_event: AnalyticsEvent): Promise<void> {
    // noop intencional
  }
}
