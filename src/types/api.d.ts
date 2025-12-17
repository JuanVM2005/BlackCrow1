// src/types/api.d.ts

import type { ContactFormInput } from "@/core/validation";
import type { ApiProblemDetails } from "@/core/http";

/**
 * Payload esperado por POST /api/contact
 * (es exactamente el ContactFormInput validado por Zod).
 */
export type ContactFormRequest = ContactFormInput;

/**
 * Respuesta de éxito (200 OK) de POST /api/contact.
 * Es lo que devuelve submitContactForm.
 */
export type ContactFormResponse = {
  ok: true;
  newsletterOptIn: boolean;
};

/**
 * Alias para los errores que envía la API en 4xx/5xx
 * (badRequest / internalError).
 */
export type ApiError = ApiProblemDetails;
