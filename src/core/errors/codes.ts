// src/core/errors/codes.ts

/**
 * Códigos de error del sistema.
 * Usar SIEMPRE estos códigos para server/api/logs/UI.
 */
export enum ErrorCode {
    // Genéricos
    UNKNOWN = "UNKNOWN",
    INTERNAL = "INTERNAL",
    INVALID_INPUT = "INVALID_INPUT",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    RATE_LIMITED = "RATE_LIMITED",
  
    // Contenido / CMS
    CONTENT_NOT_FOUND = "CONTENT_NOT_FOUND",
    CONTENT_INVALID = "CONTENT_INVALID",
  
    // Contact / forms
    CONTACT_VALIDATION_FAILED = "CONTACT_VALIDATION_FAILED",
    CONTACT_SUBMIT_FAILED = "CONTACT_SUBMIT_FAILED",
  
    // Infra / system
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
    TIMEOUT = "TIMEOUT",
  }
  