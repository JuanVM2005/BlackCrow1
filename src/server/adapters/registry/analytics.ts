// src/server/adapters/registry/analytics.ts
import { createAnalyticsAdapter } from "@/server/adapters/analytics";
import type { AnalyticsAdapter } from "@/server/adapters/analytics/contract";

/**
 * Registry: un solo lugar para resolver el adapter real.
 * (Hoy: noop. Mañana: Segment/PostHog/etc.)
 */
let singleton: AnalyticsAdapter | null = null;

export function analyticsAdapter(): AnalyticsAdapter {
  if (!singleton) singleton = createAnalyticsAdapter();
  return singleton;
}
