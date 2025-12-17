// src/observability/reportWebVitals.ts
"use client";

import type {
  Metric,
  CLSMetric,
  FCPMetric,
  INPMetric,
  LCPMetric,
  TTFBMetric,
} from "web-vitals";

/** Payload normalizado que enviaremos a /api/vitals */
export type VitalsPayload = {
  id: string;
  name: Metric["name"];
  value: number;
  delta?: number;
  rating?: "good" | "needs-improvement" | "poor";
  navigationType?: string;
  path: string;
  locale?: string;
  href: string;
  userAgent?: string;
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
  timestamp: number;
  /** Por si quieres añadir más contexto en el futuro */
  extra?: Record<string, unknown>;
};

export type AnyMetric =
  | CLSMetric
  | FCPMetric
  | INPMetric
  | LCPMetric
  | TTFBMetric;

type Options = {
  /** Forzar envío aunque no sea producción (útil en staging) */
  force?: boolean;
  /** Log a consola además de enviar */
  debug?: boolean;
  /** Endpoint de recepción (por defecto: /api/vitals) */
  endpoint?: string;
  /** Datos extra opcionales */
  extra?: Record<string, unknown>;
};

/** Extrae el locale del primer segmento de la ruta */
function detectLocaleFromPath(path: string): string | undefined {
  const seg = path.split("/").filter(Boolean)[0];
  if (!seg) return undefined;
  if (seg === "es" || seg === "en") return seg;
  return undefined;
}

/** Envía el payload usando sendBeacon (o fetch fallback) */
function send(payload: VitalsPayload, endpoint = "/api/vitals") {
  try {
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      (navigator as any).sendBeacon(endpoint, blob);
      return;
    }

    // Fallback
    void fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      cache: "no-store",
    });
  } catch {
    // Silencio: no romper la UX por telemetría
  }
}

/**
 * Reporta una métrica Web Vitals a /api/vitals.
 * Úsalo como callback de web-vitals (onLCP, onCLS, onINP, etc).
 */
export function reportWebVitals(metric: AnyMetric, opts?: Options) {
  // Por defecto, sólo en producción (o si está el flag público)
  const isProd =
    typeof process !== "undefined" && process.env.NODE_ENV === "production";
  const enabledFlag =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_ENABLE_VITALS === "1";

  if (!opts?.force && !(isProd || enabledFlag)) return;

  const path =
    typeof window !== "undefined" && window.location?.pathname
      ? window.location.pathname
      : "/";
  const href =
    typeof window !== "undefined" && window.location?.href
      ? window.location.href
      : "";

  const nav: any =
    (typeof performance !== "undefined" &&
      (performance.getEntriesByType?.("navigation")?.[0] as
        | PerformanceNavigationTiming
        | undefined)) ||
    null;

  const connection =
    typeof navigator !== "undefined" && (navigator as any).connection
      ? {
          effectiveType: (navigator as any).connection.effectiveType,
          downlink: (navigator as any).connection.downlink,
          rtt: (navigator as any).connection.rtt,
          saveData: (navigator as any).connection.saveData,
        }
      : undefined;

  const round3 = (v: number) =>
    Number.isFinite(v) ? Math.round(v * 1000) / 1000 : v;

  const payload: VitalsPayload = {
    id: metric.id,
    name: metric.name,
    value:
      typeof metric.value === "number" ? round3(metric.value) : (metric.value as number),
    delta: (metric as any).delta,
    rating: (metric as any).rating,
    navigationType: nav?.type as string | undefined,
    path,
    locale: detectLocaleFromPath(path),
    href,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    connection,
    timestamp: Date.now(),
    extra: opts?.extra,
  };

  if (opts?.debug && typeof console !== "undefined") {
    // eslint-disable-next-line no-console
    console.log("[vitals]", payload);
  }

  send(payload, opts?.endpoint);
}
