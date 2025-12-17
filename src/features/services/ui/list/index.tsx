// src/features/services/ui/list/index.tsx
import Link from "next/link";
import Grid from "@/ui/Grid";
import Typography from "@/ui/Typography";
import Button from "@/ui/Button";
import { normalizeLocale } from "@/i18n/locales";
import { serviceDetailPath } from "@/i18n/routing/static";
import type { ServiceKey } from "@/i18n/routing/static";

type LinkItem = { label: string; href?: string; external?: boolean };
export type ServicesListItem = {
  key: ServiceKey;
  title: string;
  summary?: string;
  cta?: LinkItem;
};

export type ServicesListProps = {
  locale: string;
  items: ServicesListItem[];
  className?: string;
};

export default function ServicesList({ locale, items, className }: ServicesListProps) {
  const l = normalizeLocale(locale);
  const t = {
    details: l === "es" ? "Ver detalles" : "View details",
  };

  return (
    <Grid
      role="list"
      className={["grid-cols-1 md:grid-cols-2 gap-[var(--space-6)]", className].filter(Boolean).join(" ")}
    >
      {items.map((item) => {
        const href = item.cta?.href ?? serviceDetailPath(l, item.key);
        const external = Boolean(item.cta?.external);
        const label = item.cta?.label ?? t.details;

        return (
          <article
            role="listitem"
            key={item.key}
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-raised, var(--surface-base))]"
          >
            <div className="p-[var(--space-6)]">
              <Typography.Heading as="h3">{item.title}</Typography.Heading>

              {item.summary ? (
                <Typography.Text as="p">{item.summary}</Typography.Text>
              ) : null}

              <div className="mt-[var(--space-4)]">
                <Link
                  href={href}
                  aria-label={label}
                  {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="inline-block"
                >
                  <Button>{label}</Button>
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </Grid>
  );
}
