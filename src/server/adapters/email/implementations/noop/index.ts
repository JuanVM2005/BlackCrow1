// src/server/adapters/email/implementations/noop/index.ts

import type {
    EmailClient,
    EmailMessage,
  } from "@/server/adapters/email/contract";
  
  /**
   * Implementación NOOP del cliente de email.
   *
   * Útil para:
   * - entorno de desarrollo sin credenciales reales
   * - tests de integración / e2e
   *
   * No envía nada real, solo loguea (salvo en test).
   */
  export const noopEmailClient: EmailClient = {
    async send(message: EmailMessage): Promise<void> {
      if (process.env.NODE_ENV === "test") return;
  
      // Log mínimo para no ensuciar demasiado la consola.
      // Ajusta o elimina si tu configuración de ESLint no permite console.
      // eslint-disable-next-line no-console
      console.info("[email:noop] Email simulado", {
        to: message.to,
        subject: message.subject,
      });
    },
  };
  