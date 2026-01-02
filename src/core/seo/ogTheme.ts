// src/core/seo/ogTheme.ts

/**
 * Tema visual para Open Graph images.
 * ⚠️ Las OG no leen globals.css, por eso este snapshot existe.
 */
export const OG_THEME = {
    surface: "#FCFCFC",
    text: "#0B0F10",
    textMuted: "#6A6F78",
    brand: "#FF2D8A",
    brandMuted: "#FFE0EF",
    border: "#EAEAEA",
  } as const;
  
  /**
   * Convierte HEX → rgba()
   */
  export function rgba(hex: string, alpha: number): string {
    const clean = hex.replace("#", "");
    const value =
      clean.length === 3
        ? clean
            .split("")
            .map((c) => c + c)
            .join("")
        : clean;
  
    const bigint = parseInt(value, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
  
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  