// src/server/adapters/email/implementations/resend/index.ts

import { Resend } from "resend";
import { RESEND_API_KEY } from "@/server/config/env";
import type {
  EmailClient,
  EmailMessage,
} from "@/server/adapters/email/contract";

/**
 * Cliente de email basado en Resend.
 * Implementa el contrato genérico EmailClient.
 */
const resend = new Resend(RESEND_API_KEY);

export const resendEmailClient: EmailClient = {
  async send(message: EmailMessage): Promise<void> {
    const { to, from, subject, text, html, replyTo } = message;

    try {
      // La typings de Resend mezclan variantes con template/react,
      // así que forzamos el tipo a `any` para usar la variante html/text.
      const options: Record<string, unknown> = {
        to,
        from,
        subject,
        ...(text ? { text } : {}),
        ...(html ? { html } : {}),
        ...(replyTo ? { reply_to: replyTo } : {}),
      };

      const result = await resend.emails.send(options as any);

      if ((result as any).error) {
        // eslint-disable-next-line no-console
        console.error("[email:resend] Error al enviar email", (result as any).error);
        throw new Error("EMAIL_PROVIDER_RESEND_ERROR");
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[email:resend] Excepción al enviar email", error);
      throw new Error("EMAIL_PROVIDER_RESEND_ERROR");
    }
  },
};
