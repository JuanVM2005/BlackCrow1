// src/instrumentation.ts

/**
 * Next ejecuta este archivo una vez por proceso antes de manejar requests.
 * Forzamos **Node.js runtime** (no Edge) y activamos OpenTelemetry SOLO si:
 *  - ENABLE_OTEL === "1"
 *  - Los paquetes existen (si no, no-op sin romper la build)
 */

// ❗ Evita que Next intente cargar este archivo en Edge Runtime
export const runtime = "nodejs";

export async function register() {
  // Flag de activación temprana (evita tocar Node APIs si no está habilitado)
  if (process.env.ENABLE_OTEL !== "1") return;

  // Evita doble inicialización en dev/hot-reload
  const g = globalThis as any;
  if (g.__otel_sdk_started) return;

  // Import dinámico por nombre (evita error TS2307 si no están instalados)
  const dynImport = (new Function(
    "m",
    "return import(m)"
  ) as unknown) as (m: string) => Promise<any>;

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
    const exporterEndpoint =
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318/v1/traces";

    const traceExporter = new OTLPTraceExporter({
      url: exporterEndpoint,
      headers: {}, // agrega headers si tu collector los requiere
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
      api.DiagLogLevel.NONE
    );

    // Cierre ordenado en Node.js (no usar en Edge)
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
        (err as Error)?.message ?? err
      );
    }
  }
}
