// src/features/pricing/ui/index.tsx
import { Fragment } from "react";
import Container from "@/ui/Container";
import Section from "@/ui/Section";
import { Heading, Text } from "@/ui/Typography";
import PlanCard from "./PlanCard";
import type { PricingProps } from "../content/pricing.mapper";

type Props = PricingProps & {
  id?: string;
  className?: string;
};

export default function Pricing({
  id = "pricing",
  heading,
  aside,
  plans,
  disclaimer,
}: Props) {
  const normalized = plans.map((p, i, arr) => ({
    ...p,
    featured:
      typeof p.featured === "boolean" ? p.featured : arr.length === 3 && i === 1,
  }));

  return (
    <Section id={id}>
      <Container>
        {/* Título + Aside */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 lg:gap-12">
          <div className="lg:col-span-7 xl:col-span-8">
            <Heading
              as="h2"
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.9] tracking-tight"
            >
              {heading.titleLines.map((line, i) => (
                <Fragment key={i}>
                  {line}
                  {i < heading.titleLines.length - 1 ? <br /> : null}
                </Fragment>
              ))}
            </Heading>
          </div>

          {/* Contenido derecho plomizo, alineado a los "pies" del titular */}
          <aside className="lg:col-span-5 xl:col-span-4 lg:self-end">
            <div className="space-y-3 text-(--text-muted)">
              {aside.map((p, i) => (
                <Text as="p" key={i} className="text-sm md:text-base">
                  {"children" in (p as any)
                    ? (p as any).children.map((node: any, k: number) =>
                        node.strong ? (
                          <strong key={k} className="font-semibold">
                            {node.text}
                          </strong>
                        ) : (
                          <span key={k}>{node.text}</span>
                        ),
                      )
                    : (p as unknown as string)}
                </Text>
              ))}
            </div>
          </aside>
        </div>

        {/* Grid de tarjetas */}
        <div className="mt-8 md:mt-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-7">
            {normalized.map((plan, i) => (
              <PlanCard
                key={plan.id}
                {...plan}
                // Líneas sólidas por contenedor: izq=rojas(rose), centro=moradas(violet), der=celestes(blue)
                railColor={i === 0 ? "rose" : i === 1 ? "violet" : "blue"}
              />
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        {disclaimer && (
          <div className="mt-6 md:mt-8">
            <Text as="p" className="text-xs text-center text-muted">
              {disclaimer}
            </Text>
          </div>
        )}
      </Container>
    </Section>
  );
}
