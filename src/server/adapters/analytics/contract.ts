// src/server/adapters/analytics/contract.ts

/**
 * Contrato de Analytics de negocio.
 * NO es web analytics (eso lo maneja Vercel).
 *
 * Ejemplos:
 * - contact.submit
 * - lead.created
 * - newsletter.opt_in
 */

export type AnalyticsEvent = {
    name: string;
    properties?: Record<string, string | number | boolean | null>;
  };
  
  export interface AnalyticsAdapter {
    track(event: AnalyticsEvent): Promise<void>;
  }
  