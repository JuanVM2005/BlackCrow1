import type { MutableRefObject, Ref, RefCallback } from 'react';

/**
 * Combina múltiples refs (callback u objeto) en un solo callback-ref.
 * Útil en componentes con forwardRef + ref interno.
 */
export function mergeRefs<T>(
  ...refs: Array<Ref<T> | undefined | null>
): RefCallback<T> {
  return (value: T) => {
    for (const ref of refs) {
      if (!ref) continue;

      if (typeof ref === 'function') {
        ref(value);
      } else {
        // Es un ref-objeto (MutableRefObject)
        (ref as MutableRefObject<T>).current = value;
      }
    }
  };
}
