// src/features/services/ui/ServiceDetailsModal.tsx
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Modal, { ModalHeader, ModalBody } from "@/ui/Modal";
import Typography from "@/ui/Typography";
import {
  parseServiceDetails,
  type ServiceDetailsJSON,
} from "@/content/schemas/serviceDetails.schema";
import { cn } from "@/utils/cn";

type Locale = "es" | "en";
type ServiceKey = "landing" | "website" | "ecommerce" | "custom";

export interface ServiceDetailsModalProps {
  /** Idioma actual */
  locale: Locale;
  /** Clave del servicio (routing key, no el slug local) */
  serviceKey: ServiceKey;
  /** Texto del botón (si no lo envías, se toma de _common.json por locale) */
  triggerLabel?: string;
  /** Estilos del botón disparador (para mantener el look "pill" previo) */
  triggerClassName?: string;
  /** Abierto por defecto (opcional) */
  defaultOpen?: boolean;
  /** Callback controlado (opcional) – Next 15 requiere sufijo Action */
  onOpenChangeAction?: (open: boolean) => void;
  /** Clase opcional para el wrapper (externo) */
  className?: string;
}

/**
 * Ventana emergente para “Detalles y letras chicas”.
 * - Carga perezosa del JSON de detalles según locale + serviceKey.
 * - Modal accesible con blur, animación moderna y bloqueo de scroll.
 * - Sin colores hardcode: todo por tokens globales.
 */
export default function ServiceDetailsModal({
  locale,
  serviceKey,
  triggerLabel,
  triggerClassName,
  defaultOpen = false,
  onOpenChangeAction,
  className,
}: ServiceDetailsModalProps) {
  const [open, setOpen] = React.useState<boolean>(!!defaultOpen);
  const [label, setLabel] = React.useState<string | null>(triggerLabel ?? null);
  const [details, setDetails] = React.useState<ServiceDetailsJSON | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // Notifica fuera si se provee callback
  const changeOpen = React.useCallback(
    (v: boolean) => {
      setOpen(v);
      onOpenChangeAction?.(v);
    },
    [onOpenChangeAction],
  );

  // Loaders perezosos
  const loadDetails = React.useCallback(async () => {
    const loaders: Record<Locale, Record<ServiceKey, () => Promise<{ default: unknown }>>> = {
      es: {
        landing: () => import("@/content/locales/es/services/details/landing.json"),
        website: () => import("@/content/locales/es/services/details/website.json"),
        ecommerce: () => import("@/content/locales/es/services/details/ecommerce.json"),
        custom: () => import("@/content/locales/es/services/details/personalizado.json"),
      },
      en: {
        landing: () => import("@/content/locales/en/services/details/landing.json"),
        website: () => import("@/content/locales/en/services/details/website.json"),
        ecommerce: () => import("@/content/locales/en/services/details/ecommerce.json"),
        custom: () => import("@/content/locales/en/services/details/custom.json"),
      },
    };

    const fn = loaders[locale]?.[serviceKey];
    if (!fn) throw new Error("No details loader for given locale/serviceKey");

    const mod = await fn();
    return parseServiceDetails(mod.default);
  }, [locale, serviceKey]);

  const loadCommonLabel = React.useCallback(async () => {
    if (label) return label;
    const commonLoaders: Record<Locale, () => Promise<{ default: { triggerLabel?: string } }>> = {
      es: () => import("@/content/locales/es/services/details/_common.json"),
      en: () => import("@/content/locales/en/services/details/_common.json"),
    };
    const mod = await commonLoaders[locale]();
    return mod.default?.triggerLabel || (locale === "es" ? "Detalles y letras chicas" : "Small print & details");
  }, [label, locale]);

  // Al abrir: carga label + detalles
  React.useEffect(() => {
    let mounted = true;
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        const [d, lbl] = await Promise.all([loadDetails(), loadCommonLabel()]);
        if (!mounted) return;
        setDetails(d);
        setLabel(lbl);
        setErr(null);
      } catch {
        if (!mounted) return;
        setErr("load_error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [open, loadDetails, loadCommonLabel]);

  // Animaciones para el contenido
  const listVariants = {
    hidden: { opacity: 0, y: 6 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.05, delayChildren: 0.05 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 4 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className={className}>
      {/* Trigger (pill) */}
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => changeOpen(true)}
        className={cn(
          "inline-flex items-center",
          "rounded-full border border-[var(--border-card)] bg-[color:transparent]",
          "px-[var(--radius-lg)] py-[calc(var(--radius-sm)*0.75)]",
          "transition-[opacity,transform] hover:opacity-90 active:scale-95",
          triggerClassName,
        )}
      >
        <Typography.Text as="span" size="sm" weight="medium">
          {label ?? (locale === "es" ? "Detalles y letras chicas" : "Small print & details")}
        </Typography.Text>
        <svg
          aria-hidden
          className="ml-[var(--radius-sm)] h-[18px] w-[18px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
        </svg>
      </button>

      {/* Modal */}
      <Modal
        open={open}
        onOpenChangeAction={changeOpen}
        titleId="service-details-title"
        descId="service-details-desc"
      >
        <ModalHeader id="service-details-title">
          <Typography.Heading as="h3" size="md" weight="semibold">
            {label ?? (locale === "es" ? "Detalles y letras chicas" : "Small print & details")}
          </Typography.Heading>
        </ModalHeader>

        <ModalBody id="service-details-desc">
          {/* Estados */}
          {loading && (
            <div className="animate-pulse">
              <div className="h-[1.25rem] w-1/3 rounded-[var(--radius-sm)] bg-[var(--surface)]" />
              <div className="mt-[var(--radius-md)] space-y-[calc(var(--radius-sm)*0.75)]">
                <div className="h-[0.9rem] w-[90%] rounded-[var(--radius-sm)] bg-[var(--surface)]" />
                <div className="h-[0.9rem] w-[75%] rounded-[var(--radius-sm)] bg-[var(--surface)]" />
              </div>
            </div>
          )}

          {err && !loading && (
            <Typography.Text as="p">
              {locale === "es" ? "No se pudo cargar los detalles." : "Failed to load details."}
            </Typography.Text>
          )}

          {details && !loading && !err && (
            <div>
              {/* Título opcional del contenido */}
              {details.title ? (
                <Typography.Heading as="h4" size="sm" weight="semibold">
                  {details.title}
                </Typography.Heading>
              ) : null}

              {/* Intro opcional */}
              {details.intro ? (
                <div className="mt-[var(--radius-sm)]">
                  <Typography.Text as="p">{details.intro}</Typography.Text>
                </div>
              ) : null}

              {/* Secciones con animación */}
              <motion.div
                className="mt-[var(--radius-lg)] space-y-[var(--radius-lg)]"
                variants={listVariants}
                initial="hidden"
                animate="show"
              >
                {details.sections.map((sec, i) => (
                  <motion.section key={`sec-${i}`} variants={itemVariants}>
                    {sec.title ? (
                      <Typography.Heading as="h5" size="xs" weight="semibold">
                        {sec.title}
                      </Typography.Heading>
                    ) : null}
                    <ul
                      role="list"
                      className="mt-[calc(var(--radius-sm)*0.75)] space-y-[calc(var(--radius-sm)*0.5)]"
                    >
                      {sec.items.map((it, j) => (
                        <li key={`it-${i}-${j}`} className="flex items-start gap-[var(--radius-sm)]">
                          <span
                            aria-hidden
                            className="mt-[6px] inline-block h-[6px] w-[6px] rounded-full bg-[var(--border)]"
                          />
                          <Typography.Text as="span">{it}</Typography.Text>
                        </li>
                      ))}
                    </ul>
                  </motion.section>
                ))}
              </motion.div>

              {/* Notas al pie */}
              {details.footnotes?.length ? (
                <div className="mt-[var(--radius-lg)]">
                  <ul role="list" className="space-y-[calc(var(--radius-sm)*0.5)]">
                    {details.footnotes.map((n, k) => (
                      <li key={`fn-${k}`}>
                        <Typography.Text as="span" size="sm">
                          {n}
                        </Typography.Text>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
}
