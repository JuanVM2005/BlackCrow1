// src/app/not-found.tsx
import { Container, Heading, Text } from "@/ui";
import Link from "next/link";

export default function NotFound() {
  const headingId = "not-found-title";

  return (
    <Container className="py-24">
      <section
        role="region"
        aria-labelledby={headingId}
        className="mx-auto max-w-xl text-center space-y-4"
      >
        <Heading as="h1" id={headingId} className="tracking-tight">
          Página no encontrada
        </Heading>

        <Text className="opacity-80">
          La ruta que buscaste no existe o fue movida.
        </Text>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium
                       border border-[color:var(--border)]
                       bg-[color:var(--surface-raised)] text-[color:var(--text)]
                       hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2
                       focus:ring-[color:var(--ring)]"
          >
            Volver al inicio
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium
                       text-[color:var(--text)] hover:underline"
          >
            Contactar soporte
          </Link>
        </div>
      </section>
    </Container>
  );
}
