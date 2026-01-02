// src/server/observability/metrics.ts
import type { Counter, Histogram, Meter } from "@opentelemetry/api";

/**
 * Wrapper mínimo de métricas.
 * - No rompe si OpenTelemetry no está activo
 * - Tipado estricto (sin undefined)
 * - Listo para Grafana Cloud
 */

/* =========================================================
   Estado interno
   ========================================================= */

const counters = new Map<string, Counter>();
const histograms = new Map<string, Histogram>();

let cachedMeter: Meter | null = null;

/* =========================================================
   Meter
   ========================================================= */

function getMeter(): Meter | null {
  if (cachedMeter) return cachedMeter;

  try {
    // Import dinámico para no romper si OTEL no está habilitado
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const api = require("@opentelemetry/api") as typeof import("@opentelemetry/api");
    cachedMeter = api.metrics.getMeter("black-crow-web");
    return cachedMeter;
  } catch {
    return null;
  }
}

/* =========================================================
   Counters
   ========================================================= */

export function increment(
  name: string,
  value = 1,
  attributes?: Record<string, string | number | boolean>,
): void {
  const meter = getMeter();
  if (!meter) return;

  let counter = counters.get(name);

  if (!counter) {
    counter = meter.createCounter(name, {
      description: `Counter: ${name}`,
    });
    counters.set(name, counter);
  }

  counter.add(value, attributes);
}

/* =========================================================
   Histograms
   ========================================================= */

export function observe(
  name: string,
  value: number,
  attributes?: Record<string, string | number | boolean>,
): void {
  const meter = getMeter();
  if (!meter) return;

  let histogram = histograms.get(name);

  if (!histogram) {
    histogram = meter.createHistogram(name, {
      description: `Histogram: ${name}`,
      unit: "ms",
    });
    histograms.set(name, histogram);
  }

  histogram.record(value, attributes);
}

/* =========================================================
   Helpers semánticos (recomendados)
   ========================================================= */

/**
 * Métrica estándar HTTP
 */
export function httpRequestMetric(params: {
  route: string;
  method: string;
  status: number;
  durationMs: number;
}): void {
  const { route, method, status, durationMs } = params;

  increment("http.requests.total", 1, {
    route,
    method,
    status,
  });

  observe("http.requests.duration_ms", durationMs, {
    route,
    method,
    status,
  });
}

/**
 * Evento de negocio (ej. contacto, checkout, etc.)
 */
export function businessEvent(
  name: string,
  attributes?: Record<string, string | number | boolean>,
): void {
  increment(`business.${name}`, 1, attributes);
}
