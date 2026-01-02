// src/server/security/ratelimit.ts
import type { NextRequest } from "next/server";

type RateLimitOptions = {
  /** Ventana en ms (ej: 60s) */
  windowMs: number;
  /** Máximo de requests por ventana */
  max: number;
};

type Entry = {
  count: number;
  resetAt: number;
};

/**
 * Store en memoria.
 * Suficiente para landing / APIs ligeras.
 * (Si luego necesitas Redis, se reemplaza aquí.)
 */
const store = new Map<string, Entry>();

function getClientIp(req: NextRequest): string {
  /**
   * En App Router NO existe req.ip tipado.
   * En Vercel / proxies la fuente correcta es x-forwarded-for.
   */
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Puede venir como lista: "ip, ip, ip"
    return forwardedFor.split(",")[0].trim();
  }

  // Fallback seguro (último recurso)
  return "unknown";
}

/**
 * Aplica rate limit.
 * Retorna ok o retryAfter (segundos).
 */
export function rateLimit(
  req: NextRequest,
  options: RateLimitOptions,
): { ok: true } | { ok: false; retryAfter: number } {
  const ip = getClientIp(req);
  const now = Date.now();

  const entry = store.get(ip);

  if (!entry || entry.resetAt <= now) {
    store.set(ip, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return { ok: true };
  }

  if (entry.count >= options.max) {
    return {
      ok: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  store.set(ip, entry);

  return { ok: true };
}
