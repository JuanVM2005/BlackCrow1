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
  locale: Locale;
  serviceKey: ServiceKey;
  triggerLabel?: string;
  triggerClassName?: string;
  defaultOpen?: boolean;
  onOpenChangeAction?: (open: boolean) => void;
  className?: string;
}

/**
 * Modal “Detalles y letras chicas”
 * - Desktop: se mantiene igual
 * - Mobile: MUCHO más compacto (padding + letras + gaps), sin desbordes
 * - Sin tocar globals
 *
 * Nota: todo lo "mobile" va SIN prefijo (base), y lo "desktop normal" va con `sm:...`
 * para garantizar que SOLO afecte a mobile.
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

  const changeOpen = React.useCallback(
    (v: boolean) => {
      setOpen(v);
      onOpenChangeAction?.(v);
    },
    [onOpenChangeAction],
  );

  const loadDetails = React.useCallback(async () => {
    const loaders: Record<
      Locale,
      Record<ServiceKey, () => Promise<{ default: unknown }>>
    > = {
      es: {
        landing: () =>
          import("@/content/locales/es/services/details/landing.json"),
        website: () =>
          import("@/content/locales/es/services/details/website.json"),
        ecommerce: () =>
          import("@/content/locales/es/services/details/ecommerce.json"),
        custom: () =>
          import("@/content/locales/es/services/details/personalizado.json"),
      },
      en: {
        landing: () =>
          import("@/content/locales/en/services/details/landing.json"),
        website: () =>
          import("@/content/locales/en/services/details/website.json"),
        ecommerce: () =>
          import("@/content/locales/en/services/details/ecommerce.json"),
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

    const commonLoaders: Record<
      Locale,
      () => Promise<{ default: { triggerLabel?: string } }>
    > = {
      es: () => import("@/content/locales/es/services/details/_common.json"),
      en: () => import("@/content/locales/en/services/details/_common.json"),
    };

    const mod = await commonLoaders[locale]();
    return (
      mod.default?.triggerLabel ||
      (locale === "es" ? "Detalles y letras chicas" : "Small print & details")
    );
  }, [label, locale]);

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

  const modalTitle =
    label ??
    (locale === "es" ? "Detalles y letras chicas" : "Small print & details");

  const listVariants = {
    hidden: { opacity: 0, y: 10, filter: "blur(10px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { staggerChildren: 0.05, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)" },
  };

  return (
    <div className={className}>
      {/* Trigger (pill) */}
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => changeOpen(true)}
        className={cn(
          "group relative inline-flex items-center justify-center rounded-full",
          // ✅ MOBILE (base): más chico
          "gap-[calc(var(--radius-sm)*0.85)]",
          "px-[calc(var(--radius-lg)*0.8)] py-[calc(var(--radius-sm)*0.6)]",
          // ✅ DESKTOP (sm+): igual que antes
          "sm:gap-(--radius-sm) sm:px-(--radius-lg) sm:py-0.75",
          "transition-[transform,opacity,box-shadow,border-color] duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)",
          !triggerClassName
            ? cn(
                "border border-[rgba(255,255,255,0.14)]",
                "bg-[rgba(0,0,0,0.62)] text-(--text-inverse) backdrop-blur-[14px]",
                "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_22px_80px_rgba(0,0,0,0.65)]",
                "hover:-translate-y-px hover:border-[rgba(255,255,255,0.22)]",
                "active:translate-y-0 active:scale-[0.98]",
              )
            : "",
          triggerClassName,
        )}
      >
        {!triggerClassName ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          >
            <span
              className="
                absolute inset-y-[-30%] -left-[70%] w-[55%] rotate-18
                bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]
                blur-[1px]
                transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
                group-hover:translate-x-[260%]
              "
            />
          </span>
        ) : null}

        {/* ✅ MOBILE: texto más pequeño | ✅ DESKTOP: hereda */}
        <Typography.Text
          as="span"
          size="sm"
          weight="medium"
          className="text-[12px] leading-[1.05rem] sm:text-inherit sm:leading-[inherit]"
        >
          {modalTitle}
        </Typography.Text>

        <svg
          aria-hidden
          className="h-4 w-4 sm:h-[18px] sm:w-[18px] opacity-90"
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
        {/* Header */}
        <ModalHeader
          id="service-details-title"
          className={cn(
            "relative overflow-hidden min-w-0",
            "border-b border-[rgba(255,255,255,0.08)]",
            "bg-[rgba(0,0,0,0.82)] text-(--text-inverse)",
            "backdrop-blur-[18px]",
            // ✅ MOBILE (base): compacto
            "px-[calc(var(--radius-lg)*0.65)] py-[calc(var(--radius-md)*0.52)]",
            // ✅ DESKTOP (sm+): como estaba (más aire)
            "sm:px-(--radius-xl) sm:py-[calc(var(--radius-lg)*0.9)]",
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{
              background:
                "radial-gradient(70% 140% at 18% 0%, rgba(255,109,196,0.22), rgba(0,0,0,0) 55%), radial-gradient(70% 140% at 82% 0%, rgba(139,92,246,0.24), rgba(0,0,0,0) 55%)",
            }}
          />

          <Typography.Heading
            as="h3"
            size="md"
            weight="semibold"
            className={cn(
              "relative min-w-0 truncate",
              // ✅ MOBILE: más chico
              "text-[13px] leading-[1.1rem]",
              // ✅ DESKTOP: hereda
              "sm:text-inherit sm:leading-[inherit]",
            )}
          >
            {modalTitle}
          </Typography.Heading>
        </ModalHeader>

        {/* Body */}
        <ModalBody
          id="service-details-desc"
          className={cn(
            "relative min-w-0 overflow-x-hidden",
            "bg-[rgba(0,0,0,0.92)] text-(--text-inverse)",
            "backdrop-blur-[18px]",
            // ✅ MOBILE (base): padding mínimo + tipografía compacta
            "px-[calc(var(--radius-lg)*0.65)] py-[calc(var(--radius-lg)*0.55)]",
            "text-[11.5px] leading-[1.22]",
            // ✅ DESKTOP (sm+): intacto
            "sm:px-(--radius-xl) sm:py-(--radius-xl) sm:text-inherit sm:leading-[inherit]",
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,0.06), rgba(0,0,0,0) 60%), radial-gradient(90% 70% at 20% 20%, rgba(255,109,196,0.10), rgba(0,0,0,0) 55%), radial-gradient(90% 70% at 80% 30%, rgba(139,92,246,0.12), rgba(0,0,0,0) 58%)",
            }}
          />

          <div className="relative min-w-0">
            {/* Estados */}
            {loading && (
              <div className="animate-pulse min-w-0">
                <div className="h-[0.95rem] w-1/2 sm:w-1/3 rounded-sm bg-[rgba(255,255,255,0.08)]" />
                <div className="mt-[calc(var(--radius-md)*0.65)] space-y-0.5 sm:mt-(--radius-md) sm:space-y-0.75">
                  <div className="h-[0.78rem] sm:h-[0.95rem] w-[92%] rounded-sm bg-[rgba(255,255,255,0.06)]" />
                  <div className="h-[0.78rem] sm:h-[0.95rem] w-[78%] rounded-sm bg-[rgba(255,255,255,0.06)]" />
                  <div className="h-[0.78rem] sm:h-[0.95rem] w-[85%] rounded-sm bg-[rgba(255,255,255,0.06)]" />
                </div>
              </div>
            )}

            {err && !loading && (
              <Typography.Text
                as="p"
                className="opacity-90 text-[11.5px] sm:text-inherit"
              >
                {locale === "es"
                  ? "No se pudo cargar los detalles."
                  : "Failed to load details."}
              </Typography.Text>
            )}

            {details && !loading && !err && (
              <div className="min-w-0">
                {details.title ? (
                  <Typography.Heading
                    as="h4"
                    size="sm"
                    weight="semibold"
                    className="text-[12px] leading-[1.1rem] sm:text-inherit sm:leading-[inherit]"
                  >
                    {details.title}
                  </Typography.Heading>
                ) : null}

                {details.intro ? (
                  <div className="mt-[calc(var(--radius-sm)*0.55)] sm:mt-(--radius-sm)">
                    <Typography.Text
                      as="p"
                      className="opacity-95 text-[11.5px] sm:text-inherit"
                    >
                      {details.intro}
                    </Typography.Text>
                  </div>
                ) : null}

                <motion.div
                  className={cn(
                    // ✅ MOBILE: gaps mínimos
                    "mt-[calc(var(--radius-lg)*0.55)] space-y-[calc(var(--radius-lg)*0.5)]",
                    // ✅ DESKTOP
                    "sm:mt-(--radius-lg)pace-y-(--radius-lg)"
                  )}
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
                >
                  {details.sections.map((sec, i) => (
                    <motion.section
                      key={`sec-${i}`}
                      variants={itemVariants}
                      className={cn(
                        "min-w-0 overflow-hidden",
                        "rounded-xl",
                        "border border-[rgba(255,255,255,0.10)]",
                        "bg-[rgba(255,255,255,0.04)]",
                        "backdrop-blur-[14px]",
                        "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_22px_70px_rgba(0,0,0,0.55)]",
                        // ✅ MOBILE: padding súper chico
                        "p-[calc(var(--radius-lg)*0.58)]",
                        // ✅ DESKTOP
                        "sm:p-(--radius-lg)",
                      )}
                    >
                      {sec.title ? (
                        <div className="flex items-center gap-[calc(var(--radius-sm)*0.85)] sm:gap-(--radius-sm)w-0">
                          <span
                            aria-hidden
                            className="inline-flex h-28px] sm:h-2.5 sm:w-2.5 rounded-full shrink-0"
                            style={{
                              background:
                                "radial-gradient(circle at 30% 30%, rgba(255,109,196,0.85), rgba(139,92,246,0.55), rgba(255,255,255,0.12))",
                              boxShadow:
                                "0 0 14px rgba(255,109,196,0.14), 0 0 22px rgba(139,92,246,0.10)",
                            }}
                          />
                          <Typography.Heading
                            as="h5"
                            size="xs"
                            weight="semibold"
                            className="min-w-0 truncate text-[11.5px] leading-[1.05rem] sm:text-inherit sm:leading-[inherit]"
                          >
                            {sec.title}
                          </Typography.Heading>
                        </div>
                      ) : null}

                      <ul
                        role="list"
                        className={cn(
                          // ✅ MOBILE
                          "mt-[calc(var(--radius-sm)*0.55)] space-y-[calc(var(--radius-sm)*0.42)]",
                          // ✅ DESKTOP
                          "sm:mt-[calc(var(--radius-sm)*0.9)] sm:space-y-[calc(var(--radius-sm)*0.7)]",
                        )}
                      >
                        {sec.items.map((it, j) => (
                          <li
                            key={`it-${i}-${j}`}
                            className="flex items-start gap-[calc(var(--radius-md)*0.75)] sm:gap-(--radius-md) min-w-0"
                          >
                            <span
                              aria-hidden
                              className="mt-1.5 sm:mt-[7px] inline-block h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full shrink-0 bg-[rgba(255,255,255,0.22)]"
                              style={{
                                boxShadow: "0 0 12px rgba(255,255,255,0.10)",
                              }}
                            />
                            <Typography.Text
                              as="span"
                              className="opacity-95 min-w-0 text-[11.5px] leading-[1.22] sm:text-inherit sm:leading-[inherit]"
                            >
                              {it}
                            </Typography.Text>
                          </li>
                        ))}
                      </ul>
                    </motion.section>
                  ))}
                </motion.div>

                {details.footnotes?.length ? (
                  <div className="mt-[calc(var(--radius-lg)*0.55)] sm:mt-(--radius-lg) min-w-0">
                    <div
                      className={cn(
                        "min-w-0 overflow-hidden",
                        "rounded-xl",
                        "border border-[rgba(255,255,255,0.10)]",
                        "bg-[rgba(255,255,255,0.035)]",
                        "backdrop-blur-[14px]",
                        // ✅ MOBILE
                        "p-[calc(var(--radius-lg)*0.58)]",
                        // ✅ DESKTOP
                        "sm:p-(--radius-lg)",
                      )}
                    >
                      <ul
                        role="list"
                        className="space-y-[calc(var(--radius-sm)*0.38)] sm:space-y-[calc(var(--radius-sm)*0.6)]"
                      >
                        {details.footnotes.map((n, k) => (
                          <li key={`fn-${k}`} className="min-w-0">
                            <Typography.Text
                              as="span"
                              size="sm"
                              className="opacity-85 text-[11px] leading-[1.18] sm:text-inherit sm:leading-[inherit]"
                            >
                              {n}
                            </Typography.Text>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}
