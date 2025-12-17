// src/server/config/env.ts
import { z } from "zod";

/**
 * Esquema de variables de entorno tipadas.
 * Aquí añadimos lo necesario para el flujo de contacto.
 */
const EnvSchema = z.object({
  REVALIDATE_SECRET: z.string().min(1, "Set REVALIDATE_SECRET in your env"),

  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  /**
   * PROVEEDOR DE EMAIL (adapter)
   * - "resend" → usa Resend (producción / staging)
   * - "noop"   → no envía nada real (dev / test)
   */
  EMAIL_PROVIDER: z.enum(["resend", "noop"]).default("resend"),

  /**
   * Remitente base para correos transaccionales.
   * Ej: "Black Crow <hello@blackcrow.agency>"
   */
  EMAIL_FROM: z.string().min(1, "EMAIL_FROM is required"),

  /**
   * Correo donde tú recibirás mensajes de contacto.
   */
  EMAIL_TO_CONTACT: z.string().min(1, "EMAIL_TO_CONTACT is required"),

  /**
   * API key del proveedor Resend.
   * Solo se usa si EMAIL_PROVIDER = "resend".
   */
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
});

/**
 * Parse y validación de entorno real.
 */
export const env = EnvSchema.parse({
  REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
  NODE_ENV: process.env.NODE_ENV,

  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_TO_CONTACT: process.env.EMAIL_TO_CONTACT,

  RESEND_API_KEY: process.env.RESEND_API_KEY,
});

/** Helpers básicos */
export const REVALIDATE_SECRET = env.REVALIDATE_SECRET;
export const IS_PROD = env.NODE_ENV === "production";
export const IS_TEST = env.NODE_ENV === "test";

export const EMAIL_PROVIDER = env.EMAIL_PROVIDER;
export const EMAIL_FROM = env.EMAIL_FROM;
export const EMAIL_TO_CONTACT = env.EMAIL_TO_CONTACT;
export const RESEND_API_KEY = env.RESEND_API_KEY;

/**
 * Validador para revalidación incremental (ya lo tenías).
 */
export function assertRevalidateSecret(secret: string | null | undefined) {
  if (secret !== REVALIDATE_SECRET) {
    throw new Error("Invalid revalidation secret");
  }
}
