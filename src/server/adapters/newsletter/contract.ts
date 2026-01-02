// src/server/adapters/newsletter/contract.ts

/**
 * Contrato de Newsletter.
 * Hoy se usa para registrar "opt-in" desde el formulario de contacto.
 * Más adelante puedes implementar Brevo/Mailchimp/ConvertKit, etc.
 */

export type NewsletterSubscriber = {
    email: string;
    fullName?: string;
    locale?: "es" | "en";
    /** De dónde viene el opt-in (contact, footer, modal, etc.) */
    source?: string;
  };
  
  export interface NewsletterAdapter {
    /**
     * Registra el usuario como suscriptor.
     * Debe ser idempotente: si ya existe, no debe fallar.
     */
    subscribe(subscriber: NewsletterSubscriber): Promise<void>;
  }
  