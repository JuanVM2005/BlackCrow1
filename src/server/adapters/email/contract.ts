// src/server/adapters/email/contract.ts

/**
 * Dirección de correo. Por ahora usamos un string plano,
 * pero si quieres algo más estricto, puedes cambiarlo aquí.
 */
export type EmailAddress = string;

/**
 * Mensaje de email genérico que cualquier proveedor debe poder enviar.
 */
export type EmailMessage = {
  to: EmailAddress;
  from: EmailAddress;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: EmailAddress;
};

/**
 * Contrato mínimo que debe implementar cualquier adapter de email.
 * Ejemplos de implementaciones:
 *  - noop (dev/test): no envía nada real.
 *  - resend: usa la API de Resend para enviar correos.
 */
export interface EmailClient {
  send(message: EmailMessage): Promise<void>;
}
