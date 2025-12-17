/**
 * Compone dos handlers de evento respetando `event.defaultPrevented`.
 * - Llama primero al handler del "consumidor" (theirs).
 * - Si `checkDefaultPrevented` es true (default) y el consumidor llamó `preventDefault`,
 *   NO invoca el handler interno (ours).
 */
export function composeEventHandlers<E extends { defaultPrevented?: boolean }>(
    theirs?: (event: E) => void,
    ours?: (event: E) => void,
    options: { checkDefaultPrevented?: boolean } = {}
  ) {
    const { checkDefaultPrevented = true } = options;
  
    return (event: E) => {
      // Handler del consumidor primero
      theirs?.(event);
  
      // Si no queremos checar defaultPrevented, siempre ejecutamos el interno
      if (!checkDefaultPrevented) {
        ours?.(event);
        return;
      }
  
      // Ejecutar el interno SOLO si no se previno por el externo
      if (!event.defaultPrevented) {
        ours?.(event);
      }
    };
  }
  