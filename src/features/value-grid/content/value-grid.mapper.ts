// src/features/value-grid/content/value-grid.mapper.ts
import {
  ValueGridSchema,
} from "@/content/schemas/value-grid.schema";

/**
 * ValueGrid – Mapper (v2 con retrocompatibilidad v1)
 *
 * La UI consume:
 *  {
 *    titleLines: string[];
 *    cards: [
 *      { title, body?, image?, cms?, chipTitle?, chipItems?, chipIcons? },
 *      x3 ...
 *    ]
 *  }
 *
 * v2 (nuevo): cards con { title, body, image?, widget?{kind:'cms', ...} }
 * v1 (legacy): distintas formas por tarjeta (eyebrow/title/subtitle/chip...). Se normaliza a lo anterior.
 */

/* =========================
 * Tipos para la UI
 * ========================= */
export type ValueGridCardVM = {
  title: string;
  body?: string;
  image?: { src: string; alt: string };
  /** Widget CMS estructurado (preferido por la UI si lo soporta) */
  cms?: { title: string; items: { label: string; icon?: string }[] };

  /** Campos legacy para compatibilidad con UI anterior (chip) */
  chipTitle?: string;
  chipItems?: string[];
  chipIcons?: (string | undefined)[];
};

export type ValueGridProps = {
  titleLines: string[];
  cards: [ValueGridCardVM, ValueGridCardVM, ValueGridCardVM, ValueGridCardVM];
};

/* =========================
 * Guards / helpers
 * ========================= */
export function isValueGridSection(
  input: unknown
): input is { kind: "value-grid"; data?: unknown } {
  return !!input && typeof input === "object" && (input as any).kind === "value-grid";
}

const publicPathRegex = /^\/(?!\/)[^\s]*$/;

function toLines(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function s(input: unknown, fallback = ""): string {
  return typeof input === "string" ? input.trim() : fallback;
}

function normalizeImage(
  img: any | undefined
): { src: string; alt: string } | undefined {
  if (!img || typeof img !== "object") return undefined;
  const src = s(img.src);
  const alt = s(img.alt);
  if (!src || !publicPathRegex.test(src)) return undefined;
  if (!alt) return undefined;
  return { src, alt };
}

/* ==========================================================
 * Mapper principal
 * ========================================================== */
export function mapValueGrid(data: unknown): ValueGridProps {
  // 1) Intentar validar como v2 (schema actual)
  const parsed = ValueGridSchema.safeParse(data);
  if (parsed.success) {
    const titleLines = parsed.data.title;

    const cards = parsed.data.cards.map((c, idx) => {
      const vm: ValueGridCardVM = {
        title: c.title,
        body: c.body,
        image: c.image ? { src: c.image.src, alt: c.image.alt } : undefined,
      };

      if (c.widget && c.widget.kind === "cms") {
        vm.cms = {
          title: c.widget.title,
          items: c.widget.items.map((it) => ({
            label: it.label,
            icon: it.icon,
          })),
        };
        // Campos legacy (para UI previa que esperaba "chip")
        if (idx === 1) {
          vm.chipTitle = c.widget.title;
          vm.chipItems = c.widget.items.map((it) => it.label);
          vm.chipIcons = c.widget.items.map((it) => it.icon);
        }
      }

      return vm;
    }) as ValueGridProps["cards"];

    return { titleLines, cards };
  }

  // 2) Fallback: legacy v1 (estructura heterogénea)
  const raw = (data ?? {}) as any;
  const titleLines = toLines(raw.title);
  const cardsRaw = Array.isArray(raw.cards) ? raw.cards : [];

  const c0 = (cardsRaw[0] ?? {}) as any; // idea
  const c1 = (cardsRaw[1] ?? {}) as any; // uiux
  const c2 = (cardsRaw[2] ?? {}) as any; // responsive
  const c3 = (cardsRaw[3] ?? {}) as any; // optimization

  // Card 1
  const card0: ValueGridCardVM = {
    title: s(c0.title, "De idea a realidad"),
    body: s(c0.body),
  };

  // Card 2 (puede traer eyebrow/title/subtitle/chip)
  const uiuxTitle = s(c1.title);
  const uiuxEyebrow = s(c1.eyebrow);
  const uiuxSubtitle = s(c1.subtitle);
  const chipObj = c1.chip;

  const card1: ValueGridCardVM = {
    title: uiuxEyebrow || (uiuxTitle || "Diseño UI/UX Intuitivo"),
    body: s(c1.body) || (uiuxTitle && uiuxTitle !== uiuxEyebrow ? uiuxTitle : uiuxSubtitle),
  };

  if (chipObj && typeof chipObj === "object") {
    const items = Array.isArray(chipObj.items) ? chipObj.items : [];
    const labels = items
      .map((x: unknown) => (typeof x === "string" ? x.trim() : ""))
      .filter(Boolean);

    card1.cms = {
      title: s(chipObj.title, "CMS"),
      items: labels.map((label: string) => ({ label })), // sin iconos en legacy
    };
    card1.chipTitle = card1.cms.title;
    card1.chipItems = labels;
  }

  // Card 3 (responsive)
  const respEyebrow = s(c2.eyebrow);
  const respTitle = s(c2.title);
  const card2: ValueGridCardVM = {
    title: respTitle || respEyebrow || "Responsivo",
    body: s(c2.body) || (respEyebrow && respEyebrow !== respTitle ? respEyebrow : undefined),
    image: normalizeImage(c2.image),
  };

  // Card 4 (optimization)
  const card3: ValueGridCardVM = {
    title: s(c3.title, "Optimización Total"),
    body: s(c3.body),
    image: normalizeImage(c3.image),
  };

  const safeTitleLines =
    titleLines.length > 0 ? titleLines : ["DISEÑO", "SIN LÍMITES"];

  return {
    titleLines: safeTitleLines,
    cards: [card0, card1, card2, card3],
  };
}
