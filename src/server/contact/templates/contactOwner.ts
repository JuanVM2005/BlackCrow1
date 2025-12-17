// src/server/contact/templates/contactOwner.ts

import { EMAIL_FROM, EMAIL_TO_CONTACT } from "@/server/config/env";
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
 * Construye el email que te llega a ti (owner).
 * Aquí concentramos todo el copy y estructura de mensaje.
 */
export function buildContactOwnerEmail(
  payload: ContactDomainPayload,
): EmailMessage {
  const { fullName, email, message, serviceKey, locale, newsletterOptIn } =
    payload;

  const subject =
    locale === "es"
      ? `Nuevo contacto (${serviceKey})`
      : `New contact (${serviceKey})`;

  const textLines = [
    locale === "es"
      ? "Tienes un nuevo mensaje desde el formulario de servicios:"
      : "You have a new message from the services form:",
    "",
    `Nombre: ${fullName}`,
    `Email: ${email}`,
    `Servicio: ${serviceKey}`,
    `Newsletter: ${newsletterOptIn ? "sí" : "no"}`,
    "",
    "Mensaje:",
    message,
  ];

  const text = textLines.join("\n");

  const html = textLines
    .map((line) =>
      line === ""
        ? "<br />"
        : `<p>${line.replace(/\n/g, "<br />").replace(/</g, "&lt;")}</p>`
    )
    .join("");

  return {
    to: EMAIL_TO_CONTACT,
    from: EMAIL_FROM,
    subject,
    text,
    html,
  };
}
