// src/features/services/ui/ServiceSwitcher.tsx
import Link from "next/link";
import Typography from "@/ui/Typography";
import { cn } from "@/utils/cn";

type Item = {
  label: string;
  href: string;   // resuelto con locale (/es/servicios/landing)
  slug: string;   // landing | website | ecommerce | personalizado|custom
};

export interface ServiceSwitcherProps {
  items: Item[];
  activeSlug?: string;
  className?: string;
  size?: "md" | "lg";
  /** Label accesible para el nav (viene de i18n). Ej: "Cambiar tipo de servicio" */
  ariaLabel?: string;
}

/**
 * Segmented-control accesible para navegar entre servicios.
 * - Sin colores hardcode: tokens (--surface, --border, --text, --surface-card, --border-card).
 * - Server-friendly (sin hooks).
 */
export default function ServiceSwitcher({
  items,
  activeSlug,
  className,
  size = "md",
  ariaLabel,
}: ServiceSwitcherProps) {
  const padX = size === "lg" ? "px-[var(--radius-lg)]" : "px-[var(--radius-md)]";
  const padY =
    size === "lg"
      ? "py-[calc(var(--radius-sm)*0.9)]"
      : "py-[calc(var(--radius-sm)*0.75)]";

  return (
    <nav aria-label={ariaLabel} className={cn("w-full", className)}>
      <ul role="list" className="flex flex-wrap gap-(--radius-sm)">
        {items.map((item) => {
          const isActive = activeSlug ? item.slug === activeSlug : false;

          return (
            <li key={item.slug}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex items-center rounded-full border transition-[background-color,opacity,transform]",
                  padX,
                  padY,
                  // Base: chip “ghost” sin fondo
                  "bg-transparent border-(--border-card)",
                  "hover:opacity-100 active:scale-[0.98]",
                  // Activo: superficie clara para contraste
                  isActive && "bg-(--surface) border-(--border)",
                )}
                style={{ boxShadow: isActive ? "var(--shadow-sm)" : "none" }}
              >
                <Typography.Text
                  as="span"
                  weight={isActive ? "semibold" : "medium"}
                  className={cn(isActive && "text-(--text)")}
                  size="sm"
                >
                  {item.label}
                </Typography.Text>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
