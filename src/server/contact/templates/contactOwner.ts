// src/server/contact/templates/contactOwner.ts

import { EMAIL_FROM, EMAIL_TO_CONTACT } from "@/server/config/env";
import type { EmailMessage } from "@/server/adapters/email";

type ContactDomainPayload = {
  fullName: string;
  email: string;
  message: string;
  serviceKey: string;
  locale: "es" | "en";
  newsletterOptIn: boolean;
};

function formatServiceLabel(
  locale: "es" | "en",
  serviceKey: string,
): { subjectTag: string; serviceLine: string; sourceLine: string } {
  // Contacto general
  if (serviceKey === "contact" || serviceKey === "general" || !serviceKey) {
    return {
      subjectTag: locale === "es" ? "Contacto" : "Contact",
      serviceLine: locale === "es" ? "Tipo: Contacto general" : "Type: General contact",
      sourceLine:
        locale === "es"
          ? "Tienes un nuevo mensaje desde el formulario de contacto:"
          : "You have a new message from the contact form:",
    };
  }

  // Formularios de servicios
  return {
    subjectTag: serviceKey,
    serviceLine: locale === "es" ? `Servicio: ${serviceKey}` : `Service: ${serviceKey}`,
    sourceLine:
      locale === "es"
        ? "Tienes un nuevo mensaje desde el formulario de servicios:"
        : "You have a new message from the services form:",
  };
}

export function buildContactOwnerEmail(payload: ContactDomainPayload): EmailMessage {
  const { fullName, email, message, serviceKey, locale, newsletterOptIn } = payload;

  const meta = formatServiceLabel(locale, serviceKey);

  const subject =
    locale === "es"
      ? `Nuevo mensaje — ${meta.subjectTag}`
      : `New message — ${meta.subjectTag}`;

  const textLines = [
    meta.sourceLine,
    "",
    `${locale === "es" ? "Nombre" : "Name"}: ${fullName}`,
    `Email: ${email}`,
    meta.serviceLine,
    `${locale === "es" ? "Novedades" : "Newsletter"}: ${newsletterOptIn ? (locale === "es" ? "sí" : "yes") : (locale === "es" ? "no" : "no")}`,
    "",
    locale === "es" ? "Mensaje:" : "Message:",
    message,
  ];

  const text = textLines.join("\n");

  const html = textLines
    .map((line) =>
      line === ""
        ? "<br />"
        : `<p>${line.replace(/\n/g, "<br />").replace(/</g, "&lt;")}</p>`,
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
