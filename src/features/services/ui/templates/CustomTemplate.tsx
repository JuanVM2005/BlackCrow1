// src/features/services/ui/templates/CustomTemplate.tsx
import Container from "@/ui/Container";
import Section from "@/ui/Section";
import Typography from "@/ui/Typography";
import Grid from "@/ui/Grid";
import ServiceDetailsModal from "@/features/services/ui/ServiceDetailsModal";
import type { ServiceDetailJSON } from "@/content/schemas/serviceDetail.schema";
import type { ServiceKey } from "@/i18n/routing/static";

export type ServiceDetailViewProps = {
  data: ServiceDetailJSON;
  locale: "es" | "en";
};

export default function CustomTemplate({ data, locale }: ServiceDetailViewProps) {
  const hasColA = Array.isArray(data.featuresLeft) && data.featuresLeft.length > 0;
  const hasColB = Array.isArray(data.featuresRight) && data.featuresRight.length > 0;
  const hasTags = Array.isArray(data.tags) && data.tags.length > 0;

  // Asegura el tipo requerido por ServiceDetailsModal
  const serviceKey = (data.key ?? "custom") as ServiceKey;

  return (
    <>
      {/* HERO — igual que Landing (mismo tamaño responsivo) */}
      <Section className="!py-0">
        <Container size="xl">
          <div className="min-w-0">
            <Typography.Heading
              as="h1"
              size="2xl"
              leading="tight"
              tracking="tight"
              weight="bold"
              className="
                text-[8.5vw] md:text-[7.5vw] lg:text-[6.25vw] xl:text-[5.5vw]
              "
            >
              {data.header.title}

              {data.priceRange ? (
                <span
                  className="
                    align-baseline ml-[var(--radius-md)]
                    inline-flex items-center
                    rounded-[var(--radius-lg)] border border-[var(--border-card)]
                    bg-[var(--surface-card)]
                    px-[var(--radius-md)] py-[calc(var(--radius-sm)/2)]
                  "
                >
                  <Typography.Text as="span" weight="medium">
                    {data.priceRange}
                  </Typography.Text>
                </span>
              ) : null}
            </Typography.Heading>
          </div>

          {/* Subtítulo — igual que Landing */}
          {data.header.subtitle ? (
            <div className="mt-[var(--radius-xl)]">
              <Typography.Text as="p" size="xl">
                {data.header.subtitle}
              </Typography.Text>
            </div>
          ) : null}
        </Container>
      </Section>

      {/* FEATURES — igual que Landing */}
      {(hasColA || hasColB) && (
        <Section className="!py-0">
          <Container size="xl" className="mt-[var(--radius-2xl)]">
            <Grid className="grid-cols-1 md:grid-cols-2 gap-[var(--radius-xl)]">
              {/* Columna izquierda */}
              <div>
                {hasColA ? (
                  <ul role="list" className="flex flex-col gap-[var(--radius-md)]">
                    {data.featuresLeft!.map((item, i) => (
                      <li key={`fl-${i}`} className="flex items-start gap-[var(--radius-md)]">
                        <span
                          aria-hidden
                          className="mt-[calc(var(--radius-sm)/2)] inline-flex h-[var(--radius-lg)] w-[var(--radius-lg)] items-center justify-center rounded-full border border-[var(--border-card)]"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-[var(--radius-md)] w-[var(--radius-md)]"
                          >
                            <path
                              d="M4 8h8M8 4l4 4-4 4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <Typography.Text as="span">{item}</Typography.Text>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {/* Columna derecha */}
              <div>
                {hasColB ? (
                  <ul role="list" className="flex flex-col gap-[var(--radius-md)]">
                    {data.featuresRight!.map((item, i) => (
                      <li key={`fr-${i}`} className="flex items-start gap-[var(--radius-md)]">
                        <span
                          aria-hidden
                          className="mt-[calc(var(--radius-sm)/2)] inline-flex h-[var(--radius-lg)] w-[var(--radius-lg)] items-center justify-center rounded-full border border-[var(--border-card)]"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-[var(--radius-md)] w-[var(--radius-md)]"
                          >
                            <path
                              d="M4 8h8M8 4l4 4-4 4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <Typography.Text as="span">{item}</Typography.Text>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Grid>

            {/* Fila: Tags (izquierda) + Botón “Detalles” (derecha) */}
            <div className="mt-[calc(var(--radius-xl)*1.25)] flex items-center justify-between gap-[var(--radius-md)]">
              {/* Tags como texto plano con # */}
              {hasTags ? (
                <ul role="list" className="flex flex-wrap gap-[var(--radius-sm)]">
                  {data.tags!.map((tag, i) => (
                    <li key={`tag-${i}`}>
                      <Typography.Text as="span" size="sm" weight="medium">
                        #{tag}
                      </Typography.Text>
                    </li>
                  ))}
                </ul>
              ) : (
                <div />
              )}

              {/* Botón que abre el modal */}
              <div className="shrink-0">
                <ServiceDetailsModal
                  locale={locale}
                  serviceKey={serviceKey}
                  triggerClassName="
                    inline-flex items-center
                    rounded-full border border-[var(--border-card)]
                    bg-[color:transparent]
                    px-[var(--radius-lg)] py-[calc(var(--radius-sm)*0.75)]
                  "
                />
              </div>
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
