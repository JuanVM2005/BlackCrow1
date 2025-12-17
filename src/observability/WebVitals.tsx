// src/observability/WebVitals.tsx
"use client";

import { useEffect } from "react";
import {
  onCLS,
  onFCP,
  onINP,
  onLCP,
  onTTFB,
  type ReportCallback,
} from "web-vitals";
import { reportWebVitals, type AnyMetric } from "./reportWebVitals";

type Props = {
  /** Muestra el payload en consola además de enviarlo */
  debug?: boolean;
  /** Fuerza el envío también en desarrollo */
  force?: boolean;
  /** Endpoint de recepción (default: /api/vitals) */
  endpoint?: string;
  /** Datos extra opcionales que quieras adjuntar */
  extra?: Record<string, unknown>;
};

export default function WebVitals({
  debug = false,
  force = false,
  endpoint,
  extra,
}: Props) {
  useEffect(() => {
    const enabled =
      force ||
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_ENABLE_VITALS === "1";

    if (!enabled) return;

    const handler: ReportCallback = (metric) => {
      // web-vitals pasa distintas métricas (CLS, FCP, INP, LCP, TTFB)
      reportWebVitals(metric as AnyMetric, {
        debug,
        force,
        endpoint,
        extra,
      });
    };

    onCLS(handler);
    onFCP(handler);
    onINP(handler);
    onLCP(handler);
    onTTFB(handler);
  }, [debug, force, endpoint, extra]);

  return null;
}
