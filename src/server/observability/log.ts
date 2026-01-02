// src/server/observability/log.ts
/**
 * Logger mínimo, sin dependencias, con niveles y contexto.
 * - JSON lines (una línea por log) para fácil ingesta.
 * - Soporta `logger.child(ctx)` para añadir contexto fijo.
 * - Serializa errores con { name, message, stack, cause }.
 */

export type LogLevel = "silent" | "error" | "warn" | "info" | "debug";

type ErrorLike = {
  name: string;
  message: string;
  stack?: string;
  cause?: unknown;
  [k: string]: unknown;
};

type LogRecord = {
  ts: string; // ISO timestamp
  level: Exclude<LogLevel, "silent">;
  msg?: string;
  ctx?: Record<string, unknown>;
  fields?: Record<string, unknown>;
};

const LVL: Record<LogLevel, number> = {
  silent: 99,
  error: 40,
  warn: 30,
  info: 20,
  debug: 10,
};

function envLevel(): LogLevel {
  const l = (process.env.LOG_LEVEL || "").toLowerCase();
  if (l === "error" || l === "warn" || l === "info" || l === "debug" || l === "silent") {
    return l;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function toErrorLike(e: unknown): ErrorLike {
  if (e instanceof Error) {
    const anyErr = e as any;
    const out: ErrorLike = {
      name: e.name,
      message: e.message,
      stack: e.stack,
    };
    if (anyErr.cause !== undefined) out.cause = anyErr.cause;
    for (const k of Object.keys(anyErr)) {
      if (!(k in out)) (out as any)[k] = anyErr[k];
    }
    return out;
  }
  return { name: "NonError", message: String(e) };
}

function safeMerge(a?: Record<string, unknown>, b?: Record<string, unknown>) {
  return { ...(a ?? {}), ...(b ?? {}) };
}

function jsonLine(obj: unknown): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return `{"ts":"${new Date().toISOString()}","level":"error","msg":"[logger] JSON stringify failed"}`;
  }
}

function write(level: "error" | "warn" | "info" | "debug", rec: LogRecord) {
  const line = jsonLine(rec);

  // En plataformas (Vercel) es mejor separar streams por nivel
  // eslint-disable-next-line no-console
  if (level === "error") console.error(line);
  // eslint-disable-next-line no-console
  else if (level === "warn") console.warn(line);
  // eslint-disable-next-line no-console
  else console.log(line);
}

function makeLogger(baseCtx?: Record<string, unknown>, minLevel: LogLevel = envLevel()) {
  const min = LVL[minLevel];

  function allowed(l: LogLevel) {
    return LVL[l] >= min;
  }

  function emit(level: LogLevel, ...args: unknown[]) {
    if (level === "silent") return;
    if (!allowed(level)) return;

    let msg: string | undefined;
    let fields: Record<string, unknown> | undefined;

    for (const arg of args) {
      if (arg == null) continue;

      if (typeof arg === "string") {
        msg = msg ? `${msg} ${arg}` : arg;
        continue;
      }

      if (arg instanceof Error) {
        fields = safeMerge(fields, { error: toErrorLike(arg) });
        continue;
      }

      if (typeof arg === "object") {
        fields = safeMerge(fields, arg as Record<string, unknown>);
        continue;
      }

      fields = safeMerge(fields, { value: arg });
    }

    const rec: LogRecord = {
      ts: new Date().toISOString(),
      level,
      msg,
      ctx: baseCtx && Object.keys(baseCtx).length ? baseCtx : undefined,
      fields: fields && Object.keys(fields).length ? fields : undefined,
    };

    write(level, rec);
  }

  return {
    level: minLevel as LogLevel,
    child(extraCtx: Record<string, unknown>) {
      return makeLogger(safeMerge(baseCtx, extraCtx), minLevel);
    },
    error: (...a: unknown[]) => emit("error", ...a),
    warn: (...a: unknown[]) => emit("warn", ...a),
    info: (...a: unknown[]) => emit("info", ...a),
    debug: (...a: unknown[]) => emit("debug", ...a),
  };
}

const defaultCtx = {
  service: process.env.OTEL_SERVICE_NAME || "black-crow-web",
  env: process.env.NODE_ENV || "development",
  pid: typeof process !== "undefined" ? process.pid : undefined,
};

export const logger = makeLogger(defaultCtx);
export type Logger = ReturnType<typeof makeLogger>;
export default logger;
