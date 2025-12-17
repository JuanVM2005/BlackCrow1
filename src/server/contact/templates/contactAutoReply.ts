// src/server/contact/templates/contactAutoReply.ts

import { EMAIL_FROM } from "@/server/config/env";
import type { EmailMessage } from "@/server/adapters/email";

/**
 * Payload de dominio mínimo que usamos en plantillas de contacto.
 * Debe ser compatible con lo que construye `toDomainPayload`.
 */
type ContactDomainPayload = {
  fullName: string;
  email: string;
  message: string;
  serviceKey: string;
  locale: "es" | "en";
  newsletterOptIn: boolean;
};

/**
 * Construye la auto-respuesta para la persona que escribió.
 */
export function buildContactAutoReplyEmail(
  payload: ContactDomainPayload,
): EmailMessage {
  const { fullName, email, locale, serviceKey } = payload;

  const subject =
    locale === "es"
      ? "Hemos recibido tu mensaje ✉️"
      : "We received your message ✉️";

  const greeting =
    locale === "es"
      ? `Hola ${fullName || ""}`.trim()
      : `Hi ${fullName || ""}`.trim();

  const bodyLines =
    locale === "es"
      ? [
          greeting || "Hola,",
          "",
          "Gracias por escribir a Black Crow. Hemos recibido tu mensaje y te responderemos muy pronto.",
          "",
          `Servicio seleccionado: ${serviceKey}`,
          "",
          "Si necesitas añadir más detalles, puedes responder a este mismo correo.",
        ]
      : [
          greeting || "Hi,",
          "",
          "Thanks for reaching out to Black Crow. We've received your message and will reply as soon as possible.",
          "",
          `Selected service: ${serviceKey}`,
          "",
          "If you need to add more details, just reply to this email.",
        ];

  const text = bodyLines.join("\n");

  const html = bodyLines
    .map((line) =>
      line === ""
        ? "<br />"
        : `<p>${line.replace(/\n/g, "<br />").replace(/</g, "&lt;")}</p>`
    )
    .join("");

  return {
    to: email,
    from: EMAIL_FROM,
    subject,
    text,
    html,
  };
}
