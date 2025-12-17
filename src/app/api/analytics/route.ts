// src/app/api/analytics/route.ts
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/** Eventos que aceptamos (extiende libremente) */
type AnalyticsEvent =
  | "cta_click"
  | "view"
  | "interaction";

/** Payload recibido desde el cliente */
type IncomingPayload = {
  event: AnalyticsEvent | string;
  label?: string;
  locale?: string;
  path?: string;
  href?: string;
  ts?: number;
  meta?: Record<string, unknown>;
};

/** Payload que almacenaremos/loguearemos en el servidor */
type ServerPayload = IncomingPayload & {
  userAgent?: string;
  ip?: string | null;
  receivedAt: number;
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function asString(x: unknown): string | undefined {
  return typeof x === "string" ? x : undefined;
}

function asFiniteNumber(x: unknown): number | undefined {
  return typeof x === "number" && Number.isFinite(x) ? x : undefined;
}

function sanitize(body: unknown): IncomingPayload | null {
  if (!isRecord(body)) return null;
  const event = asString(body.event);
  if (!event) return null;

  const meta = isRecord(body.meta) ? (body.meta as Record<string, unknown>) : undefined;

  return {
    event,
    label: asString(body.label),
    locale: asString(body.locale),
    path: asString(body.path),
    href: asString(body.href),
    ts: asFiniteNumber(body.ts) ?? Date.now(),
    meta,
  };
}

function pickIp(req: NextRequest): string | null {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip");
}

function hasLogger(mod: unknown): mod is { log: { info: (msg: unknown) => void } } {
  return (
    isRecord(mod) &&
    isRecord((mod as Record<string, unknown>).log) &&
    typeof (mod as { log: { info?: unknown } }).log.info === "function"
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json().catch(() => null);
    const sanitized = sanitize(raw);
    if (!sanitized) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    const payload: ServerPayload = {
      ...sanitized,
      userAgent: req.headers.get("user-agent") ?? undefined,
      ip: pickIp(req),
      receivedAt: Date.now(),
    };

    // Logging opcional (si existe src/server/observability/log.ts)
    try {
      const mod = await import("@/server/observability/log");
      if (hasLogger(mod)) {
        mod.log.info({ type: "analytics", ...payload });
      }
    } catch {
      /* no-op: si no existe el logger no rompemos la request */
    }

    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
}
