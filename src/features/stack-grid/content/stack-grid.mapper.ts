// src/features/stack-grid/content/stack-grid.mapper.ts

/** Item de tarjeta dentro del grid */
export type StackGridItem = {
  label: string;
  icon: string; // ruta pública (/logos/stack/...)
  alt: string;
  href?: string;
  /** Texto que se revela al hacer hover/focus (opcional) */
  description?: string;
};

/** Grupo (título opcional + items) */
export type StackGridGroup = {
  title?: string;
  items: StackGridItem[];
};

/** Props finales para la UI */
export type StackGridProps = {
  groups: StackGridGroup[];
};

/** Estructura de sección en el JSON de página */
export type StackGridSection = {
  kind: "stack-grid";
  data?: Partial<StackGridProps>;
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object";

/** Type guard para reconocer la sección en `page.sections[]` */
export function isStackGrid(section: unknown): section is StackGridSection {
  return isRecord(section) && (section as any).kind === "stack-grid";
}

/** Sanitiza un item (defaults mínimos) */
function normalizeItem(raw: Partial<StackGridItem>): StackGridItem {
  const label = String(raw.label ?? "").trim();
  const icon = String(raw.icon ?? "/logos/stack/placeholder.svg");

  // alt: usa el label como fallback, limpia y garantiza no vacío
  const altCandidate = raw.alt ?? label;
  const alt = (altCandidate == null ? "" : String(altCandidate)).trim() || "icon";

  const href = raw.href ? String(raw.href) : undefined;

  // description opcional: si viene vacía, se omite
  const dRaw = raw.description;
  const d = (dRaw == null ? "" : String(dRaw)).trim();
  const description = d.length ? d : undefined;

  return { label, icon, alt, href, description };
}

/** Sanitiza un grupo */
function normalizeGroup(raw: Partial<StackGridGroup>): StackGridGroup {
  const items = Array.isArray(raw.items) ? raw.items : [];

  const tRaw = (raw as any).title;
  const t = (tRaw == null ? "" : String(tRaw)).trim();
  const title = t.length ? t : undefined;

  return {
    title,
    items: items.map((it) => normalizeItem(it as Partial<StackGridItem>)),
  };
}

/**
 * Mapea cualquier entrada (sección completa o solo `data`)
 * hacia `StackGridProps` consistente para la UI.
 */
export function mapStackGrid(input?: unknown): StackGridProps {
  // Permite recibir la sección entera { kind, data } o solo { groups }
  const data =
    isRecord(input) && "data" in (input as any)
      ? ((input as any).data as unknown)
      : input;

  const groupsRaw =
    isRecord(data) && Array.isArray((data as any).groups)
      ? ((data as any).groups as unknown[])
      : [];

  const groups = groupsRaw.map((g) => normalizeGroup(g as Partial<StackGridGroup>));

  return { groups };
}
