// src/app/(system)/api/revalidate/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Revalidación manual (ISR) protegida por secret.
 *
 * Ejemplos:
 * - /api/revalidate?secret=XXX&path=/es
 * - /api/revalidate?secret=XXX&paths=/es,/en,/es/servicios
 * - /api/revalidate?secret=XXX&tag=services
 * - /api/revalidate?secret=XXX&tags=services,home
 *
 * Opcional:
 * - profile=page | layout (default: page)
 */
export const runtime = "nodejs";

/* =========================
   Helpers
   ========================= */

function csv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function json(
  status: number,
  payload: Record<string, unknown>,
  extraHeaders?: Record<string, string>,
) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      ...(extraHeaders ?? {}),
    },
  });
}

function normalizePath(p: string): string {
  const trimmed = p.trim();
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function parseProfile(v: string | null): "page" | "layout" {
  return v === "layout" ? "layout" : "page";
}

/* =========================
   GET /api/revalidate
   ========================= */

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  /* -------------------------------------------------
   * Seguridad por secret
   * ------------------------------------------------- */
  const secret = url.searchParams.get("secret") ?? "";
  const expected = process.env.REVALIDATE_SECRET ?? "";

  if (process.env.NODE_ENV === "production" && !expected) {
    return json(500, {
      ok: false,
      error:
        "REVALIDATE_SECRET no configurado en producción. Configúralo en Vercel.",
    });
  }

  if (expected && secret !== expected) {
    return json(401, { ok: false, error: "Unauthorized" });
  }

  /* -------------------------------------------------
   * Parámetros
   * ------------------------------------------------- */
  const profile = parseProfile(url.searchParams.get("profile"));

  const singlePath = url.searchParams.get("path");
  const paths = [
    ...csv(url.searchParams.get("paths")),
    ...(singlePath ? [singlePath] : []),
  ].map(normalizePath);

  const singleTag = url.searchParams.get("tag");
  const tags = [
    ...csv(url.searchParams.get("tags")),
    ...(singleTag ? [singleTag] : []),
  ]
    .map((t) => t.trim())
    .filter(Boolean);

  if (paths.length === 0 && tags.length === 0) {
    return json(400, {
      ok: false,
      error: "Debes enviar al menos `path/paths` o `tag/tags`.",
    });
  }

  /* -------------------------------------------------
   * Revalidación
   * ------------------------------------------------- */
  const revalidatedPaths: string[] = [];
  const revalidatedTags: string[] = [];

  for (const p of paths) {
    revalidatePath(p, profile);
    revalidatedPaths.push(p);
  }

  for (const t of tags) {
    // Next 16 exige profile también aquí
    revalidateTag(t, profile);
    revalidatedTags.push(t);
  }

  /* -------------------------------------------------
   * Respuesta
   * ------------------------------------------------- */
  return json(200, {
    ok: true,
    now: new Date().toISOString(),
    revalidated: {
      profile,
      paths: revalidatedPaths,
      tags: revalidatedTags,
    },
  });
}
