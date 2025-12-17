// src/app/api/vitals/route.ts
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type VitalsPayload = {
  id: string;
  name: string;
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
  } | null;
  timestamp: number;
  extra?: Record<string, unknown>;
};

function safeNumber(n: unknown): number | undefined {
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
}

function sanitize(body: any): VitalsPayload | null {
  if (!body || typeof body !== "object") return null;
  if (typeof body.id !== "string" || typeof body.name !== "string") return null;

  const value = safeNumber(body.value);
  if (typeof value !== "number") return null;

  return {
    id: body.id,
    name: body.name,
    value,
    delta: safeNumber(body.delta),
    rating:
      body.rating === "good" || body.rating === "needs-improvement" || body.rating === "poor"
        ? body.rating
        : undefined,
    navigationType: typeof body.navigationType === "string" ? body.navigationType : undefined,
    path: typeof body.path === "string" ? body.path : "/",
    locale: typeof body.locale === "string" ? body.locale : undefined,
    href: typeof body.href === "string" ? body.href : "",
    userAgent: typeof body.userAgent === "string" ? body.userAgent : undefined,
    connection:
      body.connection && typeof body.connection === "object"
        ? {
            effectiveType: body.connection.effectiveType,
            downlink: safeNumber(body.connection.downlink),
            rtt: safeNumber(body.connection.rtt),
            saveData: Boolean(body.connection.saveData),
          }
        : null,
    timestamp: typeof body.timestamp === "number" ? body.timestamp : Date.now(),
    extra: typeof body.extra === "object" ? body.extra : undefined,
  };
}

/** Resuelve distintas formas de exportación del logger sin romper el tipado. */
async function getLoggerInfoFn(): Promise<((msg: unknown) => void) | null> {
  try {
    // Puede exportar: { log: { info } }  |  { default: { info } }  |  { info }
    const mod: any = await import("@/server/observability/log");
    if (mod?.log?.info && typeof mod.log.info === "function") return mod.log.info.bind(mod.log);
    if (typeof mod?.info === "function") return mod.info.bind(mod);
    if (typeof mod?.default?.info === "function") return mod.default.info.bind(mod.default);
    return null;
  } catch {
    return null;
  }
}

async function logVitals(payload: VitalsPayload & { ip?: string | null }) {
  const info = await getLoggerInfoFn();
  if (info) {
    info({ type: "web-vitals", ...payload });
  } else {
    // Fallback: consola (no lanza)
    // eslint-disable-next-line no-console
    console.log("[vitals]", payload);
  }
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
    const body = await req.json().catch(() => null);
    const payload = sanitize(body);
    if (!payload) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null;

    // Asegura que la ruta no haga caching en edge/CDN
    const res = new Response(null, {
      status: 204,
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });

    // No bloquees la respuesta por logging
    logVitals({ ...payload, ip }).catch(() => {});

    return res;
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
}
