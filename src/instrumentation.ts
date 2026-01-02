// src/instrumentation.ts

/**
 * Next ejecuta este archivo una vez por proceso antes de manejar requests.
 * Activamos OpenTelemetry SOLO si:
 *  - ENABLE_OTEL === "1"
 *
 * Importante:
 * - NO usar `new Function()` / `eval` (Vercel lo bloquea).
 * - Si faltan dependencias, hacemos no-op sin romper.
 */

export const runtime = "nodejs";

type HeaderMap = Record<string, string>;

function parseOtelHeaders(raw?: string): HeaderMap {
  if (!raw) return {};
  const out: HeaderMap = {};
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (!key || !value) continue;
    out[key] = value;
  }
  return out;
}

function normalizeTracesEndpoint(endpoint: string): string {
  const e = endpoint.trim().replace(/\/+$/, "");
  if (e.endsWith("/v1/traces")) return e;
  if (e.endsWith("/otlp")) return `${e}/v1/traces`;
  return `${e}/v1/traces`;
}

export async function register() {
  if (process.env.ENABLE_OTEL !== "1") return;

  const g = globalThis as any;
  if (g.__otel_sdk_started) return;

  try {
    // ✅ Sin eval/new Function: imports normales (si no existen, cae al catch)
    const [{ NodeSDK }, { getNodeAutoInstrumentations }, { OTLPTraceExporter }, api] =
      await Promise.all([
        import("@opentelemetry/sdk-node"),
        import("@opentelemetry/auto-instrumentations-node"),
        import("@opentelemetry/exporter-trace-otlp-http"),
        import("@opentelemetry/api"),
      ]);

    const serviceName = process.env.OTEL_SERVICE_NAME || "black-crow-web";
    const rawEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim();

    // En prod: si no hay endpoint, no inicializamos
    if (process.env.NODE_ENV === "production" && !rawEndpoint) return;

    const exporterEndpoint = rawEndpoint
      ? normalizeTracesEndpoint(rawEndpoint)
      : "http://localhost:4318/v1/traces";

    const headers = parseOtelHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS);

    const traceExporter = new OTLPTraceExporter({
      url: exporterEndpoint,
      headers,
    });

    const sdk = new NodeSDK({
      traceExporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          "@opentelemetry/instrumentation-fs": { enabled: false },
        }),
      ],
    });

    await sdk.start();
    g.__otel_sdk_started = true;

    api.diag.setLogger(
      { debug() {}, error() {}, info() {}, warn() {}, verbose() {} },
      api.DiagLogLevel.NONE,
    );

    if (typeof process !== "undefined" && typeof process.on === "function") {
      process.on("beforeExit", async () => {
        try {
          await sdk.shutdown();
        } catch {
          // ignore
        }
      });
    }

    // (opcional) usa serviceName si luego configuras Resource, etc.
    void serviceName;
  } catch (err) {
    // Si faltan dependencias OTEL o falla algo, no rompemos el deploy
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log(
        "[instrumentation] OpenTelemetry no habilitado:",
        (err as Error)?.message ?? err,
      );
    }
  }
}
