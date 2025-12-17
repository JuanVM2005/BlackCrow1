// src/features/message-bar/content/message-bar.mapper.ts
import {
    messageBarSchema,
    type MessageBarContent,
    type MessageBarTextPart,
  } from "@/content/schemas/messageBar.schema";
  
  /** Estructura esperada del bloque en page.json */
  export type MessageBarSection = {
    kind: "message-bar";
    data?: unknown;
  } & Record<string, unknown>;
  
  /** Props que consumirá el UI de MessageBar */
  export type MessageBarProps = {
    parts: MessageBarTextPart[];
    separator: string;
    align: "left" | "center" | "right";
  };
  
  export const isMessageBar = (
    section: { kind?: string } | null | undefined
  ): section is MessageBarSection => Boolean(section && section.kind === "message-bar");
  
  /** Mapea/valida el contenido crudo de MessageBar hacia las props del UI */
  export function mapMessageBar(data: unknown): MessageBarProps {
    const parsed = messageBarSchema.safeParse(data ?? {});
    if (!parsed.success) {
      // Fallback con "highlight" explícito para cumplir el tipo
      return {
        parts: [
          { text: "Mensaje", highlight: true },
          { text: "Configura messageBar.json", highlight: false },
        ],
        separator: " • ",
        align: "center",
      };
    }
    const value: MessageBarContent = parsed.data;
    return {
      parts: value.textParts,
      separator: value.separator,
      align: (value.align ?? "center") as MessageBarProps["align"],
    };
  }
  
  /** Atajo: mapea tomando toda la sección (si tu compositor pasa {kind,data}) */
  export function mapMessageBarFromSection(section: MessageBarSection): MessageBarProps {
    const maybeInline = (section as any)?.textParts ? section : section.data;
    return mapMessageBar(maybeInline);
  }
  