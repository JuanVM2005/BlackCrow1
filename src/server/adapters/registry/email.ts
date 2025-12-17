// src/server/adapters/registry/email.ts

import { EMAIL_PROVIDER } from "@/server/config/env";
import type { EmailClient } from "@/server/adapters/email/contract";
import {
  noopEmailClient,
  resendEmailClient,
} from "@/server/adapters/email";

/**
 * Selecciona el cliente de email según configuración.
 *
 * Por ahora:
 *  - "resend" → usa Resend
 *  - cualquier otro valor → NOOP (no envía nada real)
 */
const provider = EMAIL_PROVIDER ?? "resend";

export const emailClient: EmailClient =
  provider === "resend" ? resendEmailClient : noopEmailClient;

export const EMAIL_PROVIDER_IN_USE = provider;
