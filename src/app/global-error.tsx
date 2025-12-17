'use client';

import '@/styles/globals.css';

export default function GlobalError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { error, reset } = props;

  // Log opcional en cliente (útil en desarrollo)
  // console.error(error);

  return (
    <html lang="es">
      <body>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-md text-center">
            <h1 className="text-2xl font-semibold">¡Ups! Algo salió mal</h1>
            <p className="mt-2 text-sm opacity-80">
              Ha ocurrido un error inesperado. Puedes intentar nuevamente.
            </p>

            {error?.digest ? (
              <p className="mt-2 text-xs opacity-60">ID de error: {error.digest}</p>
            ) : null}

            <button
              type="button"
              onClick={() => reset()}
              className="mt-6 inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium
                         hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2
                         border-[color:var(--border)] text-[color:var(--text)] 
                         bg-[color:var(--surface-raised)] focus:ring-[color:var(--ring)]"
            >
              Reintentar
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
