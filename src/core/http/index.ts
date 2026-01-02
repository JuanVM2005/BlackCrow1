// src/core/http/index.ts
import { NextResponse } from "next/server";

export type ApiProblemDetails = {
  code: string;
  message: string;
  details?: unknown;
};

type RateLimitProblem = ApiProblemDetails & {
  retryAfter?: number;
};

function noStoreHeaders(init?: ResponseInit): ResponseInit {
  const h = new Headers(init?.headers);
  // APIs: nunca cachear
  h.set("Cache-Control", "no-store");
  return { ...init, headers: h };
}

/**
 * Respuesta 200 OK genérica.
 * No envuelve el payload: devuelve exactamente lo que le pases.
 */
export function ok<T>(data: T, init?: ResponseInit): Response {
  return NextResponse.json(data, {
    status: 200,
    ...noStoreHeaders(init),
  });
}

/**
 * Respuesta 400 Bad Request para errores de validación o payload inválido.
 */
export function badRequest(problem: ApiProblemDetails, init?: ResponseInit): Response {
  return NextResponse.json(problem, {
    status: 400,
    ...noStoreHeaders(init),
  });
}

/**
 * Respuesta 401 Unauthorized.
 */
export function unauthorized(problem: ApiProblemDetails, init?: ResponseInit): Response {
  return NextResponse.json(problem, {
    status: 401,
    ...noStoreHeaders(init),
  });
}

/**
 * Respuesta 403 Forbidden.
 */
export function forbidden(problem: ApiProblemDetails, init?: ResponseInit): Response {
  return NextResponse.json(problem, {
    status: 403,
    ...noStoreHeaders(init),
  });
}

/**
 * Respuesta 404 Not Found.
 */
export function notFound(problem: ApiProblemDetails, init?: ResponseInit): Response {
  return NextResponse.json(problem, {
    status: 404,
    ...noStoreHeaders(init),
  });
}

/**
 * Respuesta 429 Too Many Requests (rate limit).
 * Incluye header Retry-After cuando se provee.
 */
export function tooManyRequests(problem: RateLimitProblem, init?: ResponseInit): Response {
  const baseInit = noStoreHeaders(init);
  const headers = new Headers(baseInit.headers);

  if (typeof problem.retryAfter === "number" && Number.isFinite(problem.retryAfter)) {
    headers.set("Retry-After", String(problem.retryAfter));
  }

  return NextResponse.json(
    {
      code: problem.code,
      message: problem.message,
      ...(problem.details ? { details: problem.details } : {}),
    },
    {
      status: 429,
      ...baseInit,
      headers,
    },
  );
}

/**
 * Respuesta 500 Internal Server Error para errores inesperados.
 */
export function internalError(problem: ApiProblemDetails, init?: ResponseInit): Response {
  return NextResponse.json(problem, {
    status: 500,
    ...noStoreHeaders(init),
  });
}
