// src/server/contact/submitContactForm.ts

import type { ContactFormInput } from "@/core/validation";
import { emailClient } from "@/server/adapters/registry/email";
import { buildContactOwnerEmail } from "./templates/contactOwner";
import { buildContactAutoReplyEmail } from "./templates/contactAutoReply";

/**
 * Payload de dominio que usamos para construir los correos.
 * No expone detalles de Request/Response HTTP.
 */
export type ContactDomainPayload = {
  fullName: string;
  email: string;
  message: string;
  serviceKey: string;
  locale: "es" | "en";
  newsletterOptIn: boolean;
};

/**
 * Resultado del caso de uso. La API puede usarlo para
 * decidir si dispara otros flujos (newsletter, analytics, etc.).
 */
export type SubmitContactFormResult = {
  ok: true;
  newsletterOptIn: boolean;
};

/**
 * Normaliza el input crudo (tipado y validado por Zod) a un payload
 * de dominio más cómodo de usar en plantillas / adapters.
 */
function toDomainPayload(input: ContactFormInput): ContactDomainPayload {
  const fullName = `${input.firstName} ${input.lastName}`
    .trim()
    .replace(/\s+/g, " ");

  return {
    fullName,
    email: input.email.trim(),
    message: input.message.trim(),
    serviceKey: input.serviceKey.trim(),
    locale: input.locale,
    newsletterOptIn: Boolean(input.newsletter),
  };
}

/**
 * Caso de uso principal de contacto.
 *
 * - No sabe de Request/Response HTTP.
 * - Trabaja con tipos de dominio.
 * - Llama al adapter de email para enviar las notificaciones.
 */
export async function submitContactForm(
  input: ContactFormInput,
): Promise<SubmitContactFormResult> {
  const payload = toDomainPayload(input);

  const ownerEmail = buildContactOwnerEmail(payload);
  const customerEmail = buildContactAutoReplyEmail(payload);

  // Usamos `any` para no acoplarnos en exceso a la implementación interna
  // del adapter. Ajusta este bloque si tu contrato expone otros métodos.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = emailClient as any;

  await Promise.all([
    client?.send?.(ownerEmail),
    client?.send?.(customerEmail),
  ]);

  return {
    ok: true,
    newsletterOptIn: payload.newsletterOptIn,
  };
}
