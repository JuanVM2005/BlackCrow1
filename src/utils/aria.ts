/**
 * Helpers para atributos ARIA.
 * Nota: React acepta boolean/string en aria-*, pero devolvemos 'true'|'false' para consistencia.
 */

export type AriaBool = 'true' | 'false';

// Convierte boolean | undefined a 'true' | 'false' | undefined
export function ariaBool(value?: boolean): AriaBool | undefined {
  if (value === undefined) return undefined;
  return value ? 'true' : 'false';
}

export function ariaExpanded(open?: boolean): { 'aria-expanded'?: AriaBool } {
  const v = ariaBool(open);
  return v ? { 'aria-expanded': v } : {};
}

export function ariaHidden(hidden?: boolean): { 'aria-hidden'?: AriaBool } {
  const v = ariaBool(hidden);
  return v ? { 'aria-hidden': v } : {};
}

export function ariaSelected(selected?: boolean): { 'aria-selected'?: AriaBool } {
  const v = ariaBool(selected);
  return v ? { 'aria-selected': v } : {};
}

export function ariaPressed(pressed?: boolean): { 'aria-pressed'?: AriaBool } {
  const v = ariaBool(pressed);
  return v ? { 'aria-pressed': v } : {};
}

export function ariaControls(id?: string): { 'aria-controls'?: string } {
  return id ? { 'aria-controls': id } : {};
}

export function ariaLabel(label?: string): { 'aria-label'?: string } {
  return label ? { 'aria-label': label } : {};
}

export function ariaLabelledBy(id?: string): { 'aria-labelledby'?: string } {
  return id ? { 'aria-labelledby': id } : {};
}
