'use client';

import { Container } from '@/ui';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message =
    process.env.NODE_ENV === 'development'
      ? error?.message || 'Error'
      : 'Ocurrió un error. Inténtalo de nuevo.';

  return (
    <Container>
      <div role="alert" className="py-16 text-center">
        <h1 className="mb-2 text-2xl font-semibold">Algo salió mal</h1>
        <p className="mb-6 opacity-80">{message}</p>
        <button
          onClick={() => reset()}
          className="rounded-md px-4 py-2 ring-1 ring-inset"
        >
          Reintentar
        </button>
      </div>
    </Container>
  );
}
