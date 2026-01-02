// src/server/adapters/newsletter/index.ts
import type { NewsletterAdapter } from "./contract";
import { NoopNewsletterAdapter } from "./implementations/noop";

/**
 * Factory de Newsletter Adapter.
 * En el futuro puedes cambiar esto por:
 * - Brevo
 * - Mailchimp
 * - ConvertKit
 * - etc.
 */
export function createNewsletterAdapter(): NewsletterAdapter {
  return new NoopNewsletterAdapter();
}

export type { NewsletterAdapter, NewsletterSubscriber } from "./contract";
