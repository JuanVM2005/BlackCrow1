// src/content/schemas/page.schema.ts
import { z } from "zod";
import { heroDataSchema } from "./hero.schema";
import { StudioIntroSchema } from "./studioIntro.schema";
import { ValueGridSchema } from "./value-grid.schema";
import { stackGridSchema as StackGridSchema } from "./stack-grid.schema";
import { messageBarSchema as MessageBarSchema } from "./messageBar.schema";
import { pricingDataSchema as PricingDataSchema } from "./pricing.schema";
import { CtaMinimalDataSchema } from "./cta-minimal.schema";
import { FaqSchema } from "./faq.schema";

/** Ruta pública: debe iniciar con "/" */
const publicPathRegex = /^\/(?!\/)[^\s]*$/;

const publicPath = z
  .string()
  .refine((v) => publicPathRegex.test(v), 'debe ser una ruta pública que empiece por "/"');

const nonEmptyTrimmed = (min: number, max: number) =>
  z
    .string()
    .refine((v) => typeof v === "string", "debe ser texto")
    .refine((v) => v.trim().length >= min, `debe tener al menos ${min} caracteres`)
    .refine((v) => v.trim().length <= max, `debe tener como máximo ${max} caracteres`);

/** Locales soportados (sin z.enum; compat v4 con refine) */
export const localeSchema = z
  .string()
  .refine((v) => v === "en" || v === "es", 'locale debe ser "en" o "es"');

/** Metadatos opcionales para SEO/OG */
export const pageMetaSchema = z.object({
  title: nonEmptyTrimmed(1, 80).optional(),
  description: nonEmptyTrimmed(1, 160).optional(),
  ogImage: publicPath.optional(),
});

/** Sección genérica (laxa) para no romper mientras tipamos otras secciones */
export const genericSectionSchema = z.object({
  kind: nonEmptyTrimmed(1, 200),
  data: z.unknown().optional(),
});

/** Contenedor laxo para iterar y validar condicionalmente por kind */
const sectionUnknownSchema = z.object({
  kind: z.string(),
  data: z.unknown().optional(),
});

export type SectionUnknown = z.infer<typeof sectionUnknownSchema>;

export const pageSchema = z
  .object({
    kind: z.string().refine((v) => v === "page", 'kind debe ser "page"'),
    locale: localeSchema.optional(),
    slug: nonEmptyTrimmed(1, 200).optional(),
    meta: pageMetaSchema.optional(),
    sections: z.array(sectionUnknownSchema).min(1, {
      message: "La página debe incluir al menos una sección",
    }),
  })
  .superRefine((val, ctx) => {
    val.sections.forEach((section, index) => {
      // HERO
      if (section.kind === "hero") {
        const parsed = heroDataSchema.safeParse(section.data);
        if (!parsed.success) {
          parsed.error.issues.forEach((issue) => {
            ctx.addIssue({
              code: "custom",
              message: issue.message,
              path: ["sections", index, "data", ...(issue.path ?? [])],
            });
          });
        }
      }
      // STUDIO INTRO
      else if (section.kind === "studioIntro") {
        const parsed = StudioIntroSchema.shape.data.safeParse(section.data);
        if (!parsed.success) {
          parsed.error.issues.forEach((issue) => {
            ctx.addIssue({
              code: "custom",
              message: issue.message,
              path: ["sections", index, "data", ...(issue.path ?? [])],
            });
          });
        }
      }
      // BIG STATEMENT (validación manual)
      else if (section.kind === "bigStatement") {
        const s = section as any;

        if (!s.data || typeof s.data !== "object") {
          ctx.addIssue({
            code: "custom",
            message: "`data` es requerido en bigStatement",
            path: ["sections", index, "data"],
          });
          return;
        }

        // left
        if (!s.data.left || typeof s.data.left !== "object") {
          ctx.addIssue({
            code: "custom",
            message: "`left` es requerido en bigStatement",
            path: ["sections", index, "data", "left"],
          });
        } else {
          const lines = s.data.left.lines;
          if (!Array.isArray(lines) || lines.length < 1) {
            ctx.addIssue({
              code: "custom",
              message: "`left.lines` debe ser un array con al menos 1 línea",
              path: ["sections", index, "data", "left", "lines"],
            });
          } else {
            const bad = lines.findIndex(
              (x: unknown) => typeof x !== "string" || !String(x).trim(),
            );
            if (bad !== -1) {
              ctx.addIssue({
                code: "custom",
                message: "`left.lines` solo acepta strings no vacíos",
                path: ["sections", index, "data", "left", "lines", bad],
              });
            }
            if (lines.length > 4) {
              ctx.addIssue({
                code: "custom",
                message: "`left.lines` admite máximo 4 líneas",
                path: ["sections", index, "data", "left", "lines"],
              });
            }
          }
          if (
            s.data.left.ariaLabel !== undefined &&
            (typeof s.data.left.ariaLabel !== "string" || !s.data.left.ariaLabel.trim())
          ) {
            ctx.addIssue({
              code: "custom",
              message: "`left.ariaLabel` debe ser string no vacío si se provee",
              path: ["sections", index, "data", "left", "ariaLabel"],
            });
          }
        }

        // right
        if (!s.data.right || typeof s.data.right !== "object") {
          ctx.addIssue({
            code: "custom",
            message: "`right` es requerido en bigStatement",
            path: ["sections", index, "data", "right"],
          });
        } else {
          if (typeof s.data.right.headline !== "string" || !s.data.right.headline.trim()) {
            ctx.addIssue({
              code: "custom",
              message: "`right.headline` debe ser un texto no vacío",
              path: ["sections", index, "data", "right", "headline"],
            });
          }
          if (typeof s.data.right.copy !== "string" || !s.data.right.copy.trim()) {
            ctx.addIssue({
              code: "custom",
              message: "`right.copy` debe ser un texto no vacío",
              path: ["sections", index, "data", "right", "copy"],
            });
          }
          if (
            s.data.right.kicker !== undefined &&
            (typeof s.data.right.kicker !== "string" || !s.data.right.kicker.trim())
          ) {
            ctx.addIssue({
              code: "custom",
              message: "`right.kicker` debe ser string no vacío si se provee",
              path: ["sections", index, "data", "right", "kicker"],
            });
          }
        }

        // layout (opcional)
        const layout = s.data.layout;
        if (layout !== undefined) {
          if (typeof layout !== "object") {
            ctx.addIssue({
              code: "custom",
              message: "`layout` debe ser un objeto",
              path: ["sections", index, "data", "layout"],
            });
          } else {
            const allowed = new Set(["md", "lg", "xl", "2xl"]);
            if (
              layout.container !== undefined &&
              (typeof layout.container !== "string" || !allowed.has(layout.container))
            ) {
              ctx.addIssue({
                code: "custom",
                message: '`layout.container` debe ser "md" | "lg" | "xl" | "2xl"',
                path: ["sections", index, "data", "layout", "container"],
              });
            }
            if (layout.reverse !== undefined && typeof layout.reverse !== "boolean") {
              ctx.addIssue({
                code: "custom",
                message: "`layout.reverse` debe ser boolean",
                path: ["sections", index, "data", "layout", "reverse"],
              });
            }
            if (layout.bleedY !== undefined && typeof layout.bleedY !== "boolean") {
              ctx.addIssue({
                code: "custom",
                message: "`layout.bleedY` debe ser boolean",
                path: ["sections", index, "data", "layout", "bleedY"],
              });
            }
          }
        }
      }
      // VALUE GRID (permite referencia vacía u objeto embebido válido)
      else if (section.kind === "value-grid") {
        if (section.data !== undefined) {
          const parsed = ValueGridSchema.safeParse(section.data);
          if (!parsed.success) {
            parsed.error.issues.forEach((issue) =>
              ctx.addIssue({
                code: "custom",
                message: issue.message,
                path: ["sections", index, "data", ...(issue.path ?? [])],
              }),
            );
          }
        }
      }
      // STACK GRID (permite referencia vacía u objeto embebido válido)
      else if (section.kind === "stack-grid") {
        if (section.data !== undefined) {
          const parsed = StackGridSchema.safeParse(section.data);
          if (!parsed.success) {
            parsed.error.issues.forEach((issue) =>
              ctx.addIssue({
                code: "custom",
                message: issue.message,
                path: ["sections", index, "data", ...(issue.path ?? [])],
              }),
            );
          }
        }
      }
      // MESSAGE BAR (permite referencia vacía u objeto embebido válido)
      else if (section.kind === "message-bar") {
        if (section.data !== undefined) {
          const parsed = MessageBarSchema.safeParse(section.data);
          if (!parsed.success) {
            parsed.error.issues.forEach((issue) =>
              ctx.addIssue({
                code: "custom",
                message: issue.message,
                path: ["sections", index, "data", ...(issue.path ?? [])],
              }),
            );
          }
        }
      }
      // PRICING (permite referencia vacía u objeto embebido válido)
      else if (section.kind === "pricing") {
        if (section.data !== undefined) {
          const parsed = PricingDataSchema.safeParse(section.data);
          if (!parsed.success) {
            parsed.error.issues.forEach((issue) =>
              ctx.addIssue({
                code: "custom",
                message: issue.message,
                path: ["sections", index, "data", ...(issue.path ?? [])],
              }),
            );
          }
        }
      }
      // CTA MINIMAL (permite referencia vacía u objeto embebido válido)
      else if (section.kind === "cta-minimal") {
        if (section.data !== undefined) {
          const parsed = CtaMinimalDataSchema.safeParse(section.data);
          if (!parsed.success) {
            parsed.error.issues.forEach((issue) =>
              ctx.addIssue({
                code: "custom",
                message: issue.message,
                path: ["sections", index, "data", ...(issue.path ?? [])],
              }),
            );
          }
        }
      }
      // FAQ (permite referencia vacía u objeto embebido válido)
      else if (section.kind === "faq") {
        if (section.data !== undefined) {
          const parsed = FaqSchema.safeParse(section.data);
          if (!parsed.success) {
            parsed.error.issues.forEach((issue) =>
              ctx.addIssue({
                code: "custom",
                message: issue.message,
                path: ["sections", index, "data", ...(issue.path ?? [])],
              }),
            );
          }
        }
      }
      // Otros `kind` quedan como genéricos por ahora.
    });

    /** Chequeo de ORDEN relativo:
     * hero → studioIntro → wordmarkOffset → capabilities → bigStatement → value-grid → stack-grid → message-bar → pricing → cta-minimal → faq
     */
    const want = [
      "hero",
      "studioIntro",
      "wordmarkOffset",
      "capabilities",
      "bigStatement",
      "value-grid",
      "stack-grid",
      "message-bar",
      "pricing",
      "cta-minimal",
      "faq",
    ] as const;

    const firstIndex: Record<string, number | undefined> = {};
    val.sections.forEach((s, i) => {
      if (want.includes(s.kind as any) && firstIndex[s.kind] === undefined) {
        firstIndex[s.kind] = i;
      }
    });

    for (let i = 0; i < want.length - 1; i++) {
      const a = firstIndex[want[i]];
      const b = firstIndex[want[i + 1]];
      if (a !== undefined && b !== undefined && a > b) {
        ctx.addIssue({
          code: "custom",
          message:
            "El orden de secciones debe ser: hero → studioIntro → wordmarkOffset → capabilities → bigStatement → value-grid → stack-grid → message-bar → pricing → cta-minimal → faq",
          path: ["sections", b, "kind"],
        });
      }
    }
  });

export type Page = z.infer<typeof pageSchema>;
export type PageMeta = z.infer<typeof pageMetaSchema>;
export type GenericSection = z.infer<typeof genericSectionSchema>;
