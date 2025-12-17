// src/app/[locale]/(marketing)/servicios/error.tsx
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Container from "@/ui/Container";
import Section from "@/ui/Section";
import Typography from "@/ui/Typography";
import Button from "@/ui/Button";
import { normalizeLocale } from "@/i18n/locales";

/**
 * Error boundary del segmento /servicios.
 * Minimal, con reset y copy por locale (fallback).
 */
export default function ServiciosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname?.split("/")[1]);
  const t = {
    title: locale === "es" ? "Ocurrió un error" : "Something went wrong",
    action: locale === "es" ? "Reintentar" : "Try again",
  } as const;

  React.useEffect(() => {
    // Log no intrusivo
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main data-surface="base" className="bg-[var(--surface-base)] text-[var(--text)]">
      <Section>
        <Container>
          {/* Usa el tamaño por defecto de Heading; evita `size` para no romper el tipo */}
          <Typography.Heading as="h1">
            {t.title}
          </Typography.Heading>

          <div className="mt-[var(--space-4)]">
            <Button onClick={reset}>{t.action}</Button>
          </div>
        </Container>
      </Section>
    </main>
  );
}
