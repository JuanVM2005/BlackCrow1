// src/server/adapters/newsletter/implementations/noop/index.ts
import type { NewsletterAdapter, NewsletterSubscriber } from "../../contract";

/**
 * Implementación NO-OP.
 * No guarda ni envía nada.
 * Útil para:
 * - producción sin proveedor aún
 * - evitar condicionales en el dominio
 */
export class NoopNewsletterAdapter implements NewsletterAdapter {
  async subscribe(_subscriber: NewsletterSubscriber): Promise<void> {
    // noop intencional
  }
}
