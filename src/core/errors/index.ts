// src/core/errors/index.ts
import { ErrorCode } from "./codes";
import { ERROR_CATALOG } from "./catalog";

export type AppError = {
  code: ErrorCode;
  message: string;
  httpStatus: number;
  cause?: unknown;
};

/**
 * Crea un error normalizado del sistema.
 */
export function createError(
  code: ErrorCode,
  options?: {
    message?: string;
    cause?: unknown;
  },
): AppError {
  const base = ERROR_CATALOG[code] ?? ERROR_CATALOG[ErrorCode.UNKNOWN];

  return {
    code,
    message: options?.message ?? base.message,
    httpStatus: base.httpStatus ?? 500,
    cause: options?.cause,
  };
}

/**
 * Type guard
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}

export { ErrorCode };
