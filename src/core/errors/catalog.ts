// src/core/errors/catalog.ts
import { ErrorCode } from "./codes";

type ErrorCatalogEntry = {
  code: ErrorCode;
  message: string;
  httpStatus?: number;
};

/**
 * Catálogo base de errores.
 * El message es un fallback (no UI final).
 */
export const ERROR_CATALOG: Record<ErrorCode, ErrorCatalogEntry> = {
  [ErrorCode.UNKNOWN]: {
    code: ErrorCode.UNKNOWN,
    message: "Ocurrió un error inesperado.",
    httpStatus: 500,
  },

  [ErrorCode.INTERNAL]: {
    code: ErrorCode.INTERNAL,
    message: "Error interno del sistema.",
    httpStatus: 500,
  },

  [ErrorCode.INVALID_INPUT]: {
    code: ErrorCode.INVALID_INPUT,
    message: "Datos inválidos.",
    httpStatus: 400,
  },

  [ErrorCode.UNAUTHORIZED]: {
    code: ErrorCode.UNAUTHORIZED,
    message: "No autorizado.",
    httpStatus: 401,
  },

  [ErrorCode.FORBIDDEN]: {
    code: ErrorCode.FORBIDDEN,
    message: "Acceso denegado.",
    httpStatus: 403,
  },

  [ErrorCode.NOT_FOUND]: {
    code: ErrorCode.NOT_FOUND,
    message: "Recurso no encontrado.",
    httpStatus: 404,
  },

  [ErrorCode.RATE_LIMITED]: {
    code: ErrorCode.RATE_LIMITED,
    message: "Demasiadas solicitudes. Intenta más tarde.",
    httpStatus: 429,
  },

  [ErrorCode.CONTENT_NOT_FOUND]: {
    code: ErrorCode.CONTENT_NOT_FOUND,
    message: "Contenido no encontrado.",
    httpStatus: 404,
  },

  [ErrorCode.CONTENT_INVALID]: {
    code: ErrorCode.CONTENT_INVALID,
    message: "El contenido es inválido o está corrupto.",
    httpStatus: 500,
  },

  [ErrorCode.CONTACT_VALIDATION_FAILED]: {
    code: ErrorCode.CONTACT_VALIDATION_FAILED,
    message: "Los datos del formulario no son válidos.",
    httpStatus: 400,
  },

  [ErrorCode.CONTACT_SUBMIT_FAILED]: {
    code: ErrorCode.CONTACT_SUBMIT_FAILED,
    message: "No se pudo enviar el formulario.",
    httpStatus: 500,
  },

  [ErrorCode.SERVICE_UNAVAILABLE]: {
    code: ErrorCode.SERVICE_UNAVAILABLE,
    message: "Servicio temporalmente no disponible.",
    httpStatus: 503,
  },

  [ErrorCode.TIMEOUT]: {
    code: ErrorCode.TIMEOUT,
    message: "La operación tardó demasiado tiempo.",
    httpStatus: 504,
  },
};
