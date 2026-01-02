// src/app/api/contact/route.ts
import { ZodError } from "zod";
import type { NextRequest } from "next/server";

import { ContactFormSchema } from "@/core/validation";
import { submitContactForm } from "@/server/contact";
import { ok, badRequest, internalError, tooManyRequests } from "@/core/http";
import { rateLimit } from "@/server/security/ratelimit";

/**
 * POST /api/contact
 *
 * Orquestador del flujo de contacto:
 *  - Rate limit por IP
 *  - Lee y valida el body con ContactFormSchema (core)
 *  - Llama al caso de uso submitContactForm (server/contact)
 *  - Mapea errores a respuestas HTTP usando core/http
 */
export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(request, { windowMs: 60_000, max: 5 });

    if (!limit.ok) {
      return tooManyRequests({
        code: "CONTACT_RATE_LIMIT",
        message: "Demasiadas solicitudes. Inténtalo nuevamente en unos segundos.",
        retryAfter: limit.retryAfter,
      });
    }

    const body = await request.json();
    const parsed = ContactFormSchema.parse(body);

    const result = await submitContactForm(parsed);
    return ok(result);
  } catch (error) {
    if (error instanceof ZodError) {
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
