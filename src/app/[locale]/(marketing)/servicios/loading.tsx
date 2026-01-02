// src/app/[locale]/(marketing)/servicios/loading.tsx
import Container from "@/ui/Container";
import Section from "@/ui/Section";
import Grid from "@/ui/Grid";

/**
 * Skeleton de carga para /servicios y subrutas.
 * Usa sólo primitivas y tokens globales.
 */
export default function LoadingServicios() {
  return (
    <main data-surface="base" className="bg-(--surface-base)">
      <Section>
        <Container>
          <div className="h-8 w-2/3 rounded-md bg-(--skeleton)" />
          <div className="mt-(--space-2) h-5 w-1/2 rounded-sm bg-(--skeleton)" />
        </Container>
      </Section>

      <Section>
        <Container>
          <Grid className="grid-cols-1 md:grid-cols-2 gap-(--space-6)">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-(--border) p-(--space-6)"
              >
                <div className="h-6 w-2/3 rounded-sm bg-(--skeleton)" />
                <div className="mt-(--space-3) h-4 w-full rounded-sm bg-(--skeleton)" />
                <div className="mt-(--space-2) h-4 w-5/6 rounded-sm bg-(--skeleton)" />
                <div className="mt-(--space-5) h-10 w-32 rounded-md bg-(--skeleton)" />
              </div>
            ))}
          </Grid>
        </Container>
      </Section>
    </main>
  );
}
