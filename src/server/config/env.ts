// src/server/config/env.ts
import { z } from "zod";

const BaseSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  EMAIL_PROVIDER: z.enum(["resend", "noop"]).default("resend"),
  EMAIL_FROM: z.string().min(1, "EMAIL_FROM is required"),
  EMAIL_TO_CONTACT: z.string().min(1, "EMAIL_TO_CONTACT is required"),

  // Opcionales a nivel base; se validan según modo abajo
  RESEND_API_KEY: z.string().optional(),
  REVALIDATE_SECRET: z.string().optional(),
});

function requireInProd(name: string, value: string | undefined) {
  if (process.env.NODE_ENV === "production" && (!value || value.trim() === "")) {
    throw new Error(`Missing required env var in production: ${name}`);
  }
}

export const env = (() => {
  const parsed = BaseSchema.parse({
    NODE_ENV: process.env.NODE_ENV,

    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_TO_CONTACT: process.env.EMAIL_TO_CONTACT,

    RESEND_API_KEY: process.env.RESEND_API_KEY,
    REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
  });

  // En producción, obligamos REVALIDATE_SECRET
  requireInProd("REVALIDATE_SECRET", parsed.REVALIDATE_SECRET);

  // Solo obligamos RESEND_API_KEY si vas a usar Resend
  if (parsed.EMAIL_PROVIDER === "resend") {
    requireInProd("RESEND_API_KEY", parsed.RESEND_API_KEY);
    if (!parsed.RESEND_API_KEY || parsed.RESEND_API_KEY.trim() === "") {
      throw new Error("RESEND_API_KEY is required when EMAIL_PROVIDER=resend");
    }
  }

  return parsed;
})();

/** Helpers básicos */
export const NODE_ENV = env.NODE_ENV;
export const IS_PROD = env.NODE_ENV === "production";
export const IS_TEST = env.NODE_ENV === "test";

export const EMAIL_PROVIDER = env.EMAIL_PROVIDER;
export const EMAIL_FROM = env.EMAIL_FROM;
export const EMAIL_TO_CONTACT = env.EMAIL_TO_CONTACT;

export const RESEND_API_KEY = env.RESEND_API_KEY ?? "";
export const REVALIDATE_SECRET = env.REVALIDATE_SECRET ?? "";

/** Validador para revalidación incremental */
export function assertRevalidateSecret(secret: string | null | undefined) {
  if (!REVALIDATE_SECRET) throw new Error("REVALIDATE_SECRET is not configured");
  if (secret !== REVALIDATE_SECRET) throw new Error("Invalid revalidation secret");
}
