// src/server/security/cors.ts
import { NextResponse, type NextRequest } from "next/server";

type CorsOptions = {
  origins: string[]; // dominios permitidos
  methods?: string[];
  headers?: string[];
  credentials?: boolean;
};

const DEFAULT_METHODS = ["GET", "POST", "OPTIONS"];
const DEFAULT_HEADERS = ["Content-Type", "Authorization"];

export function applyCors(
  req: NextRequest,
  options: CorsOptions,
): NextResponse | null {
  const origin = req.headers.get("origin");

  // No es request cross-origin → no hacer nada
  if (!origin) return null;

  const isAllowed = options.origins.includes(origin);
  if (!isAllowed) {
    return NextResponse.json(
      { error: "CORS origin not allowed" },
      { status: 403 },
    );
  }

  // Preflight
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": (options.methods ?? DEFAULT_METHODS).join(
          ",",
        ),
        "Access-Control-Allow-Headers": (options.headers ?? DEFAULT_HEADERS).join(
          ",",
        ),
        ...(options.credentials
          ? { "Access-Control-Allow-Credentials": "true" }
          : {}),
      },
    });
  }

  return null;
}

/**
 * Añade headers CORS a una respuesta normal
 */
export function withCorsHeaders(
  res: NextResponse,
  origin: string,
  options: CorsOptions,
): NextResponse {
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set(
    "Access-Control-Allow-Methods",
    (options.methods ?? DEFAULT_METHODS).join(","),
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    (options.headers ?? DEFAULT_HEADERS).join(","),
  );

  if (options.credentials) {
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return res;
}
