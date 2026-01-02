// src/server/adapters/registry/newsletter.ts
import { createNewsletterAdapter } from "@/server/adapters/newsletter";
import type { NewsletterAdapter } from "@/server/adapters/newsletter/contract";

/**
 * Registry: un solo lugar para resolver el adapter real.
 * (Hoy: noop. Mañana: Brevo/Mailchimp/etc.)
 */
let singleton: NewsletterAdapter | null = null;

export function newsletterAdapter(): NewsletterAdapter {
  if (!singleton) singleton = createNewsletterAdapter();
  return singleton;
}
