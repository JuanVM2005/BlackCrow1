// src/app/api/contact/route.ts

import { ZodError } from "zod";
import { ContactFormSchema } from "@/core/validation";
import { submitContactForm } from "@/server/contact";
import { ok, badRequest, internalError } from "@/core/http";

/**
 * POST /api/contact
 *
 * Orquestador del flujo de contacto:
 *  - Lee y valida el body con ContactFormSchema (core)
 *  - Llama al caso de uso submitContactForm (server/contact)
 *  - Mapea errores a respuestas HTTP usando core/http
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = ContactFormSchema.parse(body);

    const result = await submitContactForm(parsed);

    // result: { ok: true; newsletterOptIn: boolean }
    return ok(result);
  } catch (error) {
    if (error instanceof ZodError) {
      // Payload inválido → 400
      return badRequest({
        code: "INVALID_CONTACT_PAYLOAD",
        message: "El formulario de contacto contiene datos inválidos.",
        details: error.flatten(),
      });
    }

    // eslint-disable-next-line no-console
    console.error("[api/contact] Error inesperado", error);

    return internalError({
      code: "CONTACT_SUBMIT_ERROR",
      message: "No se pudo procesar tu mensaje. Inténtalo de nuevo más tarde.",
    });
  }
}
