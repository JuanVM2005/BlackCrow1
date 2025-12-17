// src/core/http/index.ts

import { NextResponse } from "next/server";

export type ApiProblemDetails = {
  code: string;
  message: string;
  details?: unknown;
};

/**
 * Respuesta 200 OK genérica.
 * No envuelve el payload: devuelve exactamente lo que le pases.
 */
export function ok<T>(data: T, init?: ResponseInit): Response {
  return NextResponse.json(data, {
    status: 200,
    ...init,
  });
}

/**
 * Respuesta 400 Bad Request para errores de validación o payload inválido.
 */
export function badRequest(problem: ApiProblemDetails): Response {
  return NextResponse.json(problem, {
    status: 400,
  });
}

/**
 * Respuesta 500 Internal Server Error para errores inesperados.
 */
export function internalError(problem: ApiProblemDetails): Response {
  return NextResponse.json(problem, {
    status: 500,
  });
}
