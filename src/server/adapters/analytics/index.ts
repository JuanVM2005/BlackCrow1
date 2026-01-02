// src/server/adapters/analytics/index.ts
import type { AnalyticsAdapter } from "./contract";
import { NoopAnalyticsAdapter } from "./implementations/noop";

/**
 * Factory de Analytics Adapter.
 * En el futuro puedes cambiar esto por:
 * - Segment
 * - PostHog
 * - RudderStack
 * - GA4 server-side
 */
export function createAnalyticsAdapter(): AnalyticsAdapter {
  return new NoopAnalyticsAdapter();
}
