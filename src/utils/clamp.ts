/**
 * Limita un valor numérico al rango [min, max].
 */
export function clamp(value: number, min = 0, max = 1): number {
    if (Number.isNaN(value) || Number.isNaN(min) || Number.isNaN(max)) {
      return value;
    }
    if (min > max) [min, max] = [max, min];
    return Math.min(max, Math.max(min, value));
  }
  