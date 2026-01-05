// src/features/contact/ui/index.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

import Section from "@/ui/Section";
import Container from "@/ui/Container";
import { Heading, Text } from "@/ui/Typography";
import Button from "@/ui/Button";
import Social, { type SocialItem, type IconKind } from "@/layout/Header/Social";
import { cn } from "@/utils/cn";
import { site } from "@/config/site";

import type { ContactProps } from "../content/contact.mapper";

type Props = ContactProps & {
  id?: string;
  className?: string;
};

type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; title: string; message: string }
  | { status: "error"; title: string; message: string };

function SignatureDivider({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  const breathe = reduce
    ? {}
    : {
        animate: { opacity: [0.55, 0.95, 0.55] },
        transition: {
          duration: 5.8,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      };

  const slowRotate = reduce
    ? {}
    : {
        animate: { rotate: 360 },
        transition: { duration: 18, repeat: Infinity, ease: "linear" as const },
      };

  const shimmer = reduce
    ? {}
    : {
        animate: { pathLength: [0.12, 1, 0.12], opacity: [0.0, 0.55, 0.0] },
        transition: {
          duration: 6.5,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      };

  return (
    <div
      aria-hidden
      className={cn("relative flex items-center justify-center", className)}
    >
      <motion.svg
        width="96"
        height="380"
        viewBox="0 0 96 380"
        preserveAspectRatio="xMidYMid meet"
        className="text-(--border)"
        initial={false}
      >
        <defs>
          <linearGradient id="bc_sig_v" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.12" />
            <stop offset="0.16" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="currentColor" stopOpacity="1" />
            <stop offset="0.84" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.12" />
          </linearGradient>

          <filter id="bc_soft" x="-45%" y="-25%" width="190%" height="150%">
            <feGaussianBlur stdDeviation="1.15" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <mask id="bc_notches">
            <rect x="0" y="0" width="96" height="380" fill="white" />
            <rect x="40" y="128" width="16" height="6" rx="3" fill="black" />
            <rect x="41" y="226" width="14" height="6" rx="3" fill="black" />
          </mask>
        </defs>

        {/* aro abstracto suave */}
        <motion.g
          style={{ transformOrigin: "48px 190px" }}
          {...slowRotate}
          opacity={0.55}
          filter="url(#bc_soft)"
        >
          <path
            d="M48 145 a45 45 0 1 1 0 90 a45 45 0 1 1 0 -90"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.7"
            strokeLinecap="round"
            opacity="0.32"
          />
          <path
            d="M48 132 a58 58 0 1 1 0 116 a58 58 0 1 1 0 -116"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.45"
            strokeLinecap="round"
            opacity="0.18"
          />
          <circle cx="48" cy="132" r="1.6" fill="currentColor" opacity="0.35" />
        </motion.g>

        {/* guía fina */}
        <motion.path
          d="M48 18 L48 362"
          stroke="url(#bc_sig_v)"
          strokeWidth="1.7"
          strokeLinecap="round"
          opacity={0.9}
          {...breathe}
        />

        {/* trazo central */}
        <motion.path
          d="M48 92 L48 288"
          stroke="currentColor"
          strokeWidth="7.2"
          strokeLinecap="round"
          opacity={0.86}
          filter="url(#bc_soft)"
          mask="url(#bc_notches)"
          {...breathe}
        />

        {/* colas finas */}
        <path
          d="M48 10 L48 64"
          stroke="currentColor"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.35"
        />
        <path
          d="M48 316 L48 370"
          stroke="currentColor"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* brillo */}
        <motion.path
          d="M48 26 L48 354"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          opacity={0}
          filter="url(#bc_soft)"
          {...shimmer}
        />
      </motion.svg>
    </div>
  );
}

function pickSocialItemsFromSite(): SocialItem[] {
  const socials = (site as any)?.socials as Record<string, string | undefined>;

  const ordered: Array<{ kind: IconKind; href?: string; label: string }> = [
    { kind: "instagram", href: socials?.instagram, label: "Instagram" },
    { kind: "facebook", href: socials?.facebook, label: "Facebook" },
    { kind: "whatsapp", href: socials?.whatsapp, label: "WhatsApp" },
    { kind: "linkedin", href: socials?.linkedin, label: "LinkedIn" },
    { kind: "github", href: socials?.github, label: "GitHub" },
    { kind: "x", href: socials?.x ?? socials?.twitter, label: "X" },
  ];

  return ordered
    .filter((i) => !!i.href && i.href !== "#")
    .map((i) => ({ kind: i.kind, href: i.href!, label: i.label }));
}

function Switch({
  id,
  checked,
  onChange,
  required,
  label,
  disabled,
  hint,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  required?: boolean;
  label: string;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <label
      className={cn(
        "grid grid-cols-[44px_minmax(0,1fr)] items-start gap-(--radius-md)",
        "select-none",
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
      )}
      title={disabled ? hint : undefined}
    >
      <span className="pt-0.5">
        <input
          id={id}
          name={id}
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.currentTarget.checked)}
          aria-required={required}
          disabled={disabled}
          aria-disabled={disabled ? "true" : undefined}
        />

        {/* track */}
        <span
          aria-hidden
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-(--radius-full) border",
            "border-(--border)",
            "bg-transparent",
            "transition-[background-color,border-color,opacity] duration-200",
            "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-(--ring)",
            "peer-checked:bg-(--accent-500) peer-checked:border-(--accent-500)",
            // ✅ disabled (plomo)
            "peer-disabled:bg-(--btn-bg-muted) peer-disabled:border-(--border-card) peer-disabled:opacity-70",
          )}
        >
          {/* thumb */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute top-1/2 -translate-y-1/2",
              "h-5 w-5 rounded-(--radius-full) bg-(--text-inverse)",
              "transition-transform duration-200",
              checked ? "translate-x-5" : "translate-x-1",
              // ✅ disabled: evita “sensación interactiva”
              disabled && "opacity-80",
            )}
          />
        </span>
      </span>

      <Text className="text-(--text-muted) leading-snug text-[0.92rem]">
        {label}
        {disabled && hint ? (
          <span className="opacity-75"> · {hint}</span>
        ) : null}
      </Text>
    </label>
  );
}

function useContactMeta() {
  const pathname = usePathname();

  const locale = React.useMemo<"es" | "en">(() => {
    const seg = (pathname ?? "").split("/").filter(Boolean)[0];
    return seg === "en" ? "en" : "es";
  }, [pathname]);

  // el backend lo exige (ContactFormSchema)
  const serviceKey = "contact";
  return { locale, serviceKey };
}

export default function ContactSection({
  id = "contact",
  className,
  mark,
  heading,
  description,
  form,
}: Props) {
  const { locale, serviceKey } = useContactMeta();
  const socials = React.useMemo(() => pickSocialItemsFromSite(), []);

  // ✅ Newsletter deshabilitado (plomo) hasta tener la función
  const newsletterDisabled = true;
  const newsletterHint = locale === "es" ? "Próximamente" : "Coming soon";

  const [newsletter, setNewsletter] = React.useState<boolean>(
    newsletterDisabled ? false : (form.consent.newsletter.defaultChecked ?? false),
  );
  const [acceptPrivacy, setAcceptPrivacy] = React.useState<boolean>(
    form.consent.privacy.defaultChecked ?? false,
  );
  const [state, setState] = React.useState<SubmitState>({ status: "idle" });

  const privacyRequired = !!form.consent.privacy.required;
  const isSubmitting = state.status === "loading";
  const canSubmit = !isSubmitting && (!privacyRequired || acceptPrivacy);

  // ✅ evita que respuestas viejas pisen el estado
  const requestIdRef = React.useRef(0);

  const resetFeedbackIfNeeded = React.useCallback(() => {
    setState((prev) =>
      prev.status === "success" || prev.status === "error"
        ? { status: "idle" }
        : prev,
    );
  }, []);

  const onToggleNewsletter = React.useCallback(
    (v: boolean) => {
      if (newsletterDisabled) return; // ✅ no permite cambios
      resetFeedbackIfNeeded();
      setNewsletter(v);
    },
    [resetFeedbackIfNeeded, newsletterDisabled],
  );

  const onTogglePrivacy = React.useCallback(
    (v: boolean) => {
      resetFeedbackIfNeeded();
      setAcceptPrivacy(v);
    },
    [resetFeedbackIfNeeded],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;

    if (isSubmitting) return;

    if (privacyRequired && !acceptPrivacy) {
      setState({
        status: "error",
        title: form.feedback?.errorTitle ?? "No se pudo enviar",
        message:
          form.feedback?.errorMessage ?? "Inténtalo de nuevo en unos minutos.",
      });
      return;
    }

    const myRequestId = ++requestIdRef.current;

    const fd = new FormData(formEl);
    const payload = {
      firstName: String(fd.get("firstName") ?? "").trim(),
      lastName: String(fd.get("lastName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      message: String(fd.get("message") ?? "").trim(),
      newsletter: newsletterDisabled ? false : newsletter, // ✅ nunca enviamos newsletter si está “próximamente”
      acceptPrivacy,
      serviceKey,
      locale,
    };

    try {
      setState({ status: "loading" });

      const res = await fetch(form.action.url, {
        method: form.action.method ?? "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (myRequestId !== requestIdRef.current) return;

      if (!res.ok) {
        setState({
          status: "error",
          title: form.feedback?.errorTitle ?? "No se pudo enviar",
          message:
            data?.message ??
            form.feedback?.errorMessage ??
            "Inténtalo de nuevo en unos minutos.",
        });
        return;
      }

      setState({
        status: "success",
        title: form.feedback?.successTitle ?? "Enviado",
        message:
          form.feedback?.successMessage ??
          "Gracias. Te responderemos a la brevedad.",
      });

      formEl.reset();
      setNewsletter(newsletterDisabled ? false : (form.consent.newsletter.defaultChecked ?? false));
      setAcceptPrivacy(form.consent.privacy.defaultChecked ?? false);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Contact submit error:", err);

      if (myRequestId !== requestIdRef.current) return;

      setState({
        status: "error",
        title: form.feedback?.errorTitle ?? "No se pudo enviar",
        message:
          form.feedback?.errorMessage ?? "Inténtalo de nuevo en unos minutos.",
      });
    }
  }

  return (
    <Section
      id={id}
      className={cn(
        "surface-inverse",
        "relative -mt-(--header-h) pt-(--header-h)",
        "min-h-svh",
        "flex items-center",
        "py-0!",
        className,
      )}
    >
      <Container className="pt-6 pb-10 sm:pt-8 sm:pb-12">
        <div
          className={cn(
            "grid items-center gap-10",
            "lg:grid-cols-[minmax(0,300px)_auto_minmax(0,1fr)]",
          )}
        >
          {/* LEFT */}
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="relative aspect-square w-full max-w-[260px]">
              <Image
                src={mark.src}
                alt={mark.alt}
                fill
                sizes="(max-width: 768px) 60vw, 260px"
                priority={false}
              />
            </div>
          </motion.div>

          {/* DIVIDER */}
          <div className="hidden lg:flex justify-center">
            <SignatureDivider />
          </div>

          {/* RIGHT */}
          <motion.div
            className="flex flex-col justify-center max-w-[560px]"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <Heading as="h2" size="xl">
              {heading}
            </Heading>

            {description ? (
              <Text className="mt-3 text-(--text-muted)">{description}</Text>
            ) : null}

            <form className="mt-8" onSubmit={onSubmit}>
              <div className="grid gap-5 md:grid-cols-3">
                {(["firstName", "lastName", "email"] as const).map((key) => {
                  const field = form.fields[key];
                  return (
                    <label key={key} className="block">
                      <Text
                        as="span"
                        className="text-(--text-muted) text-[0.92rem]"
                      >
                        {field.label}
                      </Text>

                      <input
                        name={key}
                        type={key === "email" ? "email" : "text"}
                        autoComplete={
                          key === "email"
                            ? "email"
                            : key === "firstName"
                              ? "given-name"
                              : "family-name"
                        }
                        className={cn(
                          "mt-2 w-full bg-transparent outline-none",
                          "border-b border-current/25 pb-2",
                          "text-[0.98rem]",
                          "transition-[border-color,opacity] duration-200",
                          "focus:border-current/60",
                        )}
                        placeholder={field.placeholder ?? ""}
                        required
                        disabled={isSubmitting}
                        onInput={resetFeedbackIfNeeded}
                      />
                    </label>
                  );
                })}
              </div>

              <label className="mt-5 block">
                <Text as="span" className="text-(--text-muted) text-[0.92rem]">
                  {form.fields.message.label}
                </Text>

                <textarea
                  name="message"
                  rows={3}
                  className={cn(
                    "mt-2 w-full resize-none bg-transparent outline-none",
                    "border-b border-current/25 pb-2",
                    "text-[0.98rem]",
                    "transition-[border-color,opacity] duration-200",
                    "focus:border-current/60",
                  )}
                  placeholder={form.fields.message.placeholder ?? ""}
                  required
                  disabled={isSubmitting}
                  onInput={resetFeedbackIfNeeded}
                />
              </label>

              <div className="mt-6 grid gap-4 max-w-[520px]">
                <Switch
                  id="newsletter"
                  checked={newsletterDisabled ? false : newsletter}
                  onChange={onToggleNewsletter}
                  label={form.consent.newsletter.label}
                  disabled={isSubmitting || newsletterDisabled}
                  hint={newsletterHint}
                />

                <Switch
                  id="acceptPrivacy"
                  checked={acceptPrivacy}
                  onChange={onTogglePrivacy}
                  required={privacyRequired}
                  label={form.consent.privacy.label}
                  disabled={isSubmitting}
                />
              </div>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <motion.div
                    initial={false}
                    whileHover={{ y: canSubmit ? -1 : 0 }}
                    whileTap={{ scale: canSubmit ? 0.99 : 1 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      variant="outline"
                      className={cn(
                        "rounded-(--radius-full)",
                        "border border-current/25",
                        "transition-[border-color,transform,opacity] duration-200",
                        canSubmit
                          ? "hover:border-current/55"
                          : "opacity-50 cursor-not-allowed",
                      )}
                    >
                      {form.submitLabel}
                    </Button>
                  </motion.div>

                  {state.status === "success" || state.status === "error" ? (
                    <Text
                      aria-live="polite"
                      className={cn(
                        "text-[0.9rem] leading-snug",
                        state.status === "success"
                          ? "text-(--text-on-inverse)"
                          : "text-(--text-muted)",
                      )}
                    >
                      <span className="opacity-95">{state.title}</span>
                      <span className="opacity-75"> — {state.message}</span>
                    </Text>
                  ) : null}
                </div>

                <div className="flex items-center justify-start sm:justify-end">
                  <Social autoInvert items={socials} />
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
