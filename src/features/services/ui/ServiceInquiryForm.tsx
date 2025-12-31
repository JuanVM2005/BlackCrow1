// src/features/services/ui/ServiceInquiryForm.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Typography from "@/ui/Typography";
import type { ServiceFormJSON } from "@/content/schemas/serviceForm.schema";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

type ServiceInquiryFormProps = {
  data: ServiceFormJSON;
  serviceKey?: string;
  locale?: "es" | "en";
};

export default function ServiceInquiryForm({
  data,
  serviceKey,
  locale,
}: ServiceInquiryFormProps) {
  const [firstName, lastName, email, message, newsletter, acceptPrivacy] =
    data.fields;

  const reducedMotion = usePrefersReducedMotion();

  // Limita a 500 caracteres
  const [msg, setMsg] = useState("");
  const onMessageInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const raw = e.target.value ?? "";
      setMsg(raw.length <= 500 ? raw : raw.slice(0, 500));
    },
    [],
  );

  // Estado de envío
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  const resolvedServiceKey = serviceKey ?? "landing";
  const resolvedLocale: "es" | "en" = locale ?? "es";

  const feedback = useMemo(() => {
    if (status === "success")
      return resolvedLocale === "es"
        ? "Mensaje enviado. Te contactamos pronto."
        : "Sent. We’ll reach out soon.";
    if (status === "error")
      return resolvedLocale === "es"
        ? "No se pudo enviar. Intenta nuevamente."
        : "Couldn’t send. Try again.";
    return "";
  }, [status, resolvedLocale]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setStatus("loading");

      const form = event.currentTarget;
      const fd = new FormData(form);

      const payload = {
        firstName: String(fd.get(firstName.id) ?? "").trim(),
        lastName: String(fd.get(lastName.id) ?? "").trim(),
        email: String(fd.get(email.id) ?? "").trim(),
        message: msg.trim(),
        newsletter: fd.get(newsletter.id) != null,
        acceptPrivacy: fd.get(acceptPrivacy.id) != null,
        serviceKey: resolvedServiceKey,
        locale: resolvedLocale,
      };

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          setStatus("error");
          return;
        }

        form.reset();
        setMsg("");
        setStatus("success");
      } catch {
        setStatus("error");
      }
    },
    [
      firstName.id,
      lastName.id,
      email.id,
      newsletter.id,
      acceptPrivacy.id,
      msg,
      resolvedServiceKey,
      resolvedLocale,
    ],
  );

  const isSubmitting = status === "loading";

  // ===== Desktop (manteniendo la idea, pero sin clases [] no-canónicas) =====
  const inputBase =
    "peer block w-full bg-transparent text-(--text-inverse) " +
    "placeholder:text-(--text-inverse) placeholder:opacity-70 " +
    "outline-none ring-0 border-0 px-0 py-(--radius-sm)";

  const underlineBase =
    "relative after:block after:h-px after:w-full after:bg-(--border) after:opacity-70 " +
    "after:transition-opacity after:duration-200";

  const underlineAccent =
    "pointer-events-none absolute left-0 right-0 -bottom-px h-[2px] " +
    "bg-(--accent-500) opacity-0 scale-x-0 origin-left " +
    "transition duration-300 ease-out " +
    "group-focus-within:opacity-100 group-focus-within:scale-x-100";

  const fieldGroup =
    "group md:col-span-1 transition-transform duration-200 ease-out focus-within:-translate-y-[1px]";

  const checkboxBox =
    "relative inline-flex items-center justify-center " +
    "rounded-(--radius-sm) border border-(--border) " +
    "h-(--radius-lg) w-(--radius-lg) " +
    "transition-all duration-200 will-change-transform " +
    "group-hover:scale-[1.05] " +
    "peer-checked:bg-(--accent-500) peer-checked:border-(--accent-500) " +
    "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-(--accent-500)";

  const checkSvg =
    "opacity-0 scale-75 transition-all duration-200 ease-out " +
    "peer-checked:opacity-100 peer-checked:scale-100";

  // ===== Mobile-only =====
  const mobileFieldWrap =
    "max-sm:relative max-sm:after:block max-sm:after:h-px max-sm:after:w-full " +
    "max-sm:after:bg-(--border) max-sm:after:opacity-50 " +
    "max-sm:after:transition-opacity max-sm:after:duration-200 " +
    "max-sm:focus-within:after:opacity-90";

  const mobileInput =
    "max-sm:py-(--radius-sm) max-sm:text-[1rem] max-sm:placeholder:opacity-55";

  const mobileLabel =
    "max-sm:opacity-90 max-sm:text-[0.92rem] max-sm:tracking-tight";

  const mobileForm = "max-sm:gap-(--radius-md) max-sm:md:grid-cols-2";

  const mobileCta =
    "max-sm:w-full max-sm:justify-center max-sm:py-(--radius-sm)";

  const animContainer = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10, filter: "blur(10px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, amount: 0.35 },
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
      };

  const animItem = (i: number) =>
    reducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 8 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.35 },
          transition: {
            duration: 0.45,
            delay: 0.05 * i,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        };

  return (
    <motion.section
      {...animContainer}
      className={[
        "rounded-xl",
        "border border-(--border-card)",
        "bg-(--surface-inverse)",
        "p-(--radius-xl)",
        "text-(--text-inverse)",
        "max-sm:rounded-xl",
        "max-sm:p-(--radius-lg)",
      ].join(" ")}
    >
      <header className="mb-(--radius-lg) max-sm:mb-(--radius-md)">
        <Typography.Heading
          as="h2"
          size="2xl"
          weight="semibold"
          className="max-sm:text-[1.35rem] max-sm:leading-tight"
        >
          {data.title}
        </Typography.Heading>

        {feedback ? (
          <div className="mt-(--radius-sm)">
            <Typography.Text as="p" size="sm" className="opacity-85">
              {feedback}
            </Typography.Text>
          </div>
        ) : null}
      </header>

      <form
        className={[
          "grid grid-cols-1 md:grid-cols-2 gap-(--radius-lg)",
          mobileForm,
        ].join(" ")}
        onSubmit={handleSubmit}
      >
        {/* Nombre */}
        <motion.div {...animItem(0)} className={fieldGroup}>
          <label className="inline-block mb-(--radius-sm)">
            <Typography.Text
              as="span"
              size="sm"
              weight="medium"
              className={mobileLabel}
            >
              {firstName.label}
            </Typography.Text>
          </label>

          <div className={[underlineBase, mobileFieldWrap].join(" ")}>
            <input
              id="firstName"
              name={firstName.id}
              type="text"
              required
              autoComplete="given-name"
              placeholder={firstName.placeholder}
              className={[inputBase, mobileInput].join(" ")}
            />
            <span aria-hidden className={underlineAccent + " max-sm:hidden"} />
          </div>
        </motion.div>

        {/* Apellido */}
        <motion.div {...animItem(1)} className={fieldGroup}>
          <label className="inline-block mb-(--radius-sm)">
            <Typography.Text
              as="span"
              size="sm"
              weight="medium"
              className={mobileLabel}
            >
              {lastName.label}
            </Typography.Text>
          </label>

          <div className={[underlineBase, mobileFieldWrap].join(" ")}>
            <input
              id="lastName"
              name={lastName.id}
              type="text"
              required
              autoComplete="family-name"
              placeholder={lastName.placeholder}
              className={[inputBase, mobileInput].join(" ")}
            />
            <span aria-hidden className={underlineAccent + " max-sm:hidden"} />
          </div>
        </motion.div>

        {/* Email */}
        <motion.div
          {...animItem(2)}
          className="group md:col-span-2 transition-transform duration-200 ease-out focus-within:-translate-y-px"
        >
          <label className="inline-block mb-(--radius-sm)">
            <Typography.Text
              as="span"
              size="sm"
              weight="medium"
              className={mobileLabel}
            >
              {email.label}
            </Typography.Text>
          </label>

          <div className={[underlineBase, mobileFieldWrap].join(" ")}>
            <input
              id="email"
              name={email.id}
              type="email"
              inputMode="email"
              required
              autoComplete="email"
              placeholder={email.placeholder}
              className={[inputBase, mobileInput].join(" ")}
            />
            <span aria-hidden className={underlineAccent + " max-sm:hidden"} />
          </div>
        </motion.div>

        {/* Mensaje */}
        <motion.div
          {...animItem(3)}
          className="group md:col-span-2 transition-transform duration-200 ease-out focus-within:-translate-y-px"
        >
          <div className="flex items-end justify-between gap-(--radius-md)">
            <label className="inline-block mb-(--radius-sm)">
              <Typography.Text
                as="span"
                size="sm"
                weight="medium"
                className={mobileLabel}
              >
                {message.label}
              </Typography.Text>
            </label>

            <Typography.Text
              as="span"
              size="sm"
              className="opacity-70 max-sm:block hidden"
            >
              {msg.length}/500
            </Typography.Text>
          </div>

          <div className={[underlineBase, mobileFieldWrap].join(" ")}>
            <textarea
              id="message"
              name={message.id}
              required
              placeholder={message.placeholder}
              rows={message.rows ?? 6}
              maxLength={500}
              className={[inputBase, "resize-none overflow-auto", mobileInput].join(
                " ",
              )}
              value={msg}
              onChange={onMessageInput}
            />
            <span aria-hidden className={underlineAccent + " max-sm:hidden"} />
          </div>

          <div className="mt-(--radius-sm) max-sm:hidden">
            <Typography.Text as="span" size="sm" className="opacity-70">
              {msg.length}/500
            </Typography.Text>
          </div>
        </motion.div>

        {/* Newsletter */}
        <motion.div {...animItem(4)} className="md:col-span-2">
          <label className="group inline-flex items-center gap-(--radius-md) cursor-pointer select-none">
            <input
              id="newsletter"
              name={newsletter.id}
              type="checkbox"
              className="peer sr-only"
            />
            <span className={checkboxBox} aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18" className={checkSvg}>
                <path
                  d="M5.5 12.5l4 4 9-9"
                  fill="none"
                  stroke="var(--text-inverse)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <Typography.Text as="span" size="sm" className="opacity-90">
              {newsletter.label}
            </Typography.Text>
          </label>
        </motion.div>

        {/* Privacidad */}
        <motion.div {...animItem(5)} className="md:col-span-2">
          <label className="group inline-flex items-center gap-(--radius-md) cursor-pointer select-none">
            <input
              id="acceptPrivacy"
              name={acceptPrivacy.id}
              type="checkbox"
              required
              className="peer sr-only"
            />
            <span className={checkboxBox} aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18" className={checkSvg}>
                <path
                  d="M5.5 12.5l4 4 9-9"
                  fill="none"
                  stroke="var(--text-inverse)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <Typography.Text as="span" size="sm" className="opacity-90">
              {acceptPrivacy.label}
            </Typography.Text>
          </label>
        </motion.div>

        {/* CTA */}
        <motion.div
          {...animItem(6)}
          className="md:col-span-2 flex justify-end max-sm:justify-stretch"
        >
          <button
            type="submit"
            disabled={isSubmitting}
            className={[
              "group relative inline-flex items-center justify-center overflow-hidden",
              "rounded-(--radius-full)",
              "px-(--radius-lg) py-(--radius-sm)",
              "bg-transparent",
              "shadow-(--shadow-sm)",

              // aurora border + inner core (tokens/util global)
              "before:absolute before:inset-0 before:content-['']",
              "before:bg-g-card before:opacity-80",
              "before:transition-opacity before:duration-200",
              "group-hover:before:opacity-100",

              "after:absolute after:inset-px after:rounded-(--radius-full) after:content-['']",
              "after:bg-(--surface-inverse)",
              "after:border after:border-(--border-card)",
              "after:transition-all after:duration-200",
              "group-hover:after:border-(--border)",

              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-500)",
              "transition-all duration-200 will-change-transform",
              "hover:-translate-y-px hover:shadow-(--shadow-md)",
              "active:translate-y-0 active:scale-[0.985]",
              "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-(--shadow-sm)",

              mobileCta,
            ].join(" ")}
            aria-label={data.cta.label}
          >
            <span
              aria-hidden
              className="
                pointer-events-none absolute inset-0 z-1
                translate-x-[-120%] rotate-12
                bg-g-card opacity-0 blur-[10px]
                transition-all duration-500
                group-hover:translate-x-[120%] group-hover:opacity-35
              "
            />

            <span className="relative z-2 inline-flex items-center">
              {isSubmitting ? (
                <span
                  aria-hidden
                  className="mr-(--radius-sm) inline-block h-[0.95em] w-[0.95em] rounded-(--radius-full) border border-(--text-inverse) border-b-transparent opacity-80 animate-spin"
                />
              ) : null}

              <Typography.Text as="span" weight="semibold" size="sm">
                {isSubmitting
                  ? resolvedLocale === "es"
                    ? "Enviando…"
                    : "Sending…"
                  : data.cta.label}
              </Typography.Text>
            </span>
          </button>
        </motion.div>
      </form>
    </motion.section>
  );
}
