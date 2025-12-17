// src/features/big-statement/content/big-statement.mapper.ts
import type { BigStatementProps } from "@/features/big-statement/ui";
import type { BigStatementContent } from "@/content/schemas/bigStatement.schema";
import { BigStatementSchema } from "@/content/schemas/bigStatement.schema";

/**
 * Normaliza y valida en runtime sin depender de BigStatementSchema.parse()
 * para esquivar TS(2554) en ciertos setups de Zod/TS.
 */
export const BIG_STATEMENT_KIND = "bigStatement" as const;

const ALLOWED_CONTAINERS = new Set<NonNullable<BigStatementProps["layout"]>["container"]>([
  "md",
  "lg",
  "xl",
  "2xl",
]);

export function mapBigStatement(section: unknown): BigStatementProps {
  // 1) Validación de forma base con Zod *solo* para shape, sin parse()
  //    Usamos narrow manual y luego chequeos defensivos.
  const raw = section as Partial<BigStatementContent>;

  if (!raw || typeof raw !== "object") {
    throw new Error("bigStatement: sección inválida (no es objeto).");
  }
  if (raw.kind !== BIG_STATEMENT_KIND) {
    throw new Error(`bigStatement: kind inválido (esperado "${BIG_STATEMENT_KIND}").`);
  }

  // Asegurar data
  const data = (raw as any).data ?? {};
  const left = data.left ?? {};
  const right = data.right ?? {};
  const layout = data.layout ?? {};

  // 2) Left.lines → array<string> limpio, máx 4, sin vacíos
  const linesRaw: unknown = left.lines;
  const lines =
    Array.isArray(linesRaw)
      ? linesRaw.filter((x) => typeof x === "string" && x.trim()).slice(0, 4)
      : [];

  const safeLines = lines.length > 0 ? lines : ["BIG", "IDEAS"];

  // 3) Right: strings requeridos con fallback mínimos
  const headline =
    typeof right.headline === "string" && right.headline.trim()
      ? right.headline
      : "—";
  const copy =
    typeof right.copy === "string" && right.copy.trim()
      ? right.copy
      : "";

  const kicker =
    typeof right.kicker === "string" && right.kicker.trim()
      ? right.kicker
      : undefined;

  const ariaLabel =
    typeof left.ariaLabel === "string" && left.ariaLabel.trim()
      ? left.ariaLabel
      : undefined;

  // 4) Layout: normalización (enum container validado aquí)
  const reverse = typeof layout.reverse === "boolean" ? layout.reverse : false;
  const bleedY = typeof layout.bleedY === "boolean" ? layout.bleedY : false;

  const containerCandidate =
    typeof layout.container === "string" ? (layout.container as BigStatementProps["layout"] extends { container: infer C } ? C : never) : undefined;

  const container = ALLOWED_CONTAINERS.has(containerCandidate as any)
    ? containerCandidate
    : "2xl";

  // 5) Devolvemos las props finales
  const props: BigStatementProps = {
    left: { lines: safeLines, ariaLabel },
    right: { kicker, headline, copy },
    layout: { container, reverse, bleedY },
  };

  return props;
}

export default mapBigStatement;
