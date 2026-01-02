// src/instrumentation.ts

/**
 * Next ejecuta este archivo una vez por proceso antes de manejar requests.
 * Forzamos **Node.js runtime** (no Edge) y activamos OpenTelemetry SOLO si:
 *  - ENABLE_OTEL === "1"
 *  - Los paquetes existen (si no, no-op sin romper la build)
 *
 * Grafana Cloud (OTLP/HTTP):
 * - OTEL_EXPORTER_OTLP_ENDPOINT = https://<region>.grafana.net/otlp   (o /otlp/v1/traces)
 * - OTEL_EXPORTER_OTLP_HEADERS  = Authorization=Basic <TOKEN>
 * - OTEL_SERVICE_NAME           = (opcional) nombre de servicio
 */

// ❗ Evita que Next intente cargar este archivo en Edge Runtime
export const runtime = "nodejs";

type HeaderMap = Record<string, string>;

/**
 * Parsea OTEL_EXPORTER_OTLP_HEADERS desde env.
 * Formatos soportados:
 * - "Authorization=Basic xxx"
 * - "Authorization=Basic xxx, X-Scope-OrgID=yyy"
 */
function parseOtelHeaders(raw?: string): HeaderMap {
  if (!raw) return {};
  const out: HeaderMap = {};

  // Permite separador por coma
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

/**
 * Normaliza endpoint para OTLP/HTTP traces.
 * - Si viene como ".../otlp" => ".../otlp/v1/traces"
 * - Si viene como ".../v1/traces" lo deja intacto
 */
function normalizeTracesEndpoint(endpoint: string): string {
  const e = endpoint.trim().replace(/\/+$/, "");
  if (e.endsWith("/v1/traces")) return e;
  if (e.endsWith("/otlp")) return `${e}/v1/traces`;
  // Si te dan un endpoint ya específico (ej. /otlp/v1/traces) o distinto, lo respetamos
  // pero si no incluye v1/traces, lo añadimos de forma segura.
  return `${e}/v1/traces`;
}

export async function register() {
  // Flag de activación temprana
  if (process.env.ENABLE_OTEL !== "1") return;

  // Evita doble inicialización en dev/hot-reload
  const g = globalThis as any;
  if (g.__otel_sdk_started) return;

  // Import dinámico por nombre (evita error TS2307 si no están instalados)
  const dynImport = (new Function("m", "return import(m)") as unknown) as (
    m: string,
  ) => Promise<any>;

  try {
    const [
      { NodeSDK },
      { getNodeAutoInstrumentations },
      { OTLPTraceExporter },
      api,
    ] = await Promise.all([
      dynImport("@opentelemetry/sdk-node"),
      dynImport("@opentelemetry/auto-instrumentations-node"),
      dynImport("@opentelemetry/exporter-trace-otlp-http"),
      dynImport("@opentelemetry/api"),
    ]);

    const serviceName = process.env.OTEL_SERVICE_NAME || "black-crow-web";

    const rawEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim();

    // Si no hay endpoint real, no inicializamos para evitar ruido/errores silenciosos.
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
          // Ajusta instrumentaciones aquí si quieres
          "@opentelemetry/instrumentation-fs": { enabled: false },
        }),
      ],
      // Nota: el nombre de servicio también puede venir vía Resource (OTEL_SERVICE_NAME).
    });

    await sdk.start();
    g.__otel_sdk_started = true;

    // Silencia el logger interno (opcional)
    api.diag.setLogger(
      { debug() {}, error() {}, info() {}, warn() {}, verbose() {} },
      api.DiagLogLevel.NONE,
    );

    // Cierre ordenado en Node.js
    if (typeof process !== "undefined" && typeof process.on === "function") {
      process.on("beforeExit", async () => {
        try {
          await sdk.shutdown();
        } catch {
          // ignore
        }
      });
    }
  } catch (err) {
    // Si faltan dependencias OTEL o falla algo, no rompemos
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log(
        "[instrumentation] OpenTelemetry no habilitado:",
        (err as Error)?.message ?? err,
      );
    }
  }
}
