// src/features/services/ui/ServiceInquiryForm.tsx
"use client";

import { useState, useCallback } from "react";
import Typography from "@/ui/Typography";
import type { ServiceFormJSON } from "@/content/schemas/serviceForm.schema";

/**
 * Props del formulario de servicio.
 * - data: viene del JSON de contenido (service form)
 * - serviceKey: clave del servicio (ej: "landing", "ecommerce"...) → se envía al backend
 * - locale: idioma actual ("es" | "en") → se envía al backend
 */
type ServiceInquiryFormProps = {
  data: ServiceFormJSON;
  serviceKey?: string;
  locale?: "es" | "en";
};

/**
 * Formulario MINIMAL (6 campos) con:
 * - Fondo oscuro (plomo): --surface-inverse
 * - Título más grande
 * - Labels e inputs en blanco (placeholders con leve opacidad)
 * - Inputs transparentes, solo subrayado decorativo animado (accent)
 * - Textarea no redimensionable y máx. 500 caracteres
 * - Checkboxes custom con animación
 * - Sólo tokens de globals.css
 *
 * Ahora además:
 * - Orquesta el submit contra /api/contact
 * - Envía un payload compatible con ContactFormSchema
 */
export default function ServiceInquiryForm({
  data,
  serviceKey,
  locale,
}: ServiceInquiryFormProps) {
  const [firstName, lastName, email, message, newsletter, acceptPrivacy] = data.fields;

  // Limita a 500 CARACTERES
  const [msg, setMsg] = useState("");
  const onMessageInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value ?? "";
    setMsg(raw.length <= 500 ? raw : raw.slice(0, 500));
  }, []);

  // Estado de envío
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const resolvedServiceKey = serviceKey ?? "landing";
  const resolvedLocale: "es" | "en" = locale ?? "es";

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setStatus("loading");

      const form = event.currentTarget;
      const formData = new FormData(form);

      const payload = {
        firstName: String(formData.get(firstName.id) ?? "").trim(),
        lastName: String(formData.get(lastName.id) ?? "").trim(),
        email: String(formData.get(email.id) ?? "").trim(),
        message: msg.trim(),
        newsletter: formData.get(newsletter.id) != null,
        acceptPrivacy: formData.get(acceptPrivacy.id) != null,
        serviceKey: resolvedServiceKey,
        locale: resolvedLocale,
      };

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          setStatus("error");
          return;
        }

        // Éxito: reseteamos formulario y mensaje
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

  // Base inputs: underlined
  const inputBase =
    "peer block w-full bg-transparent text-[var(--text-inverse)] " +
    "placeholder:text-[var(--text-inverse)] placeholder:opacity-70 " +
    "outline-none ring-0 border-0 px-0 py-[calc(var(--radius-sm)*0.9)]";

  // Subrayado base + acento animado
  const underlineBase =
    "relative after:block after:h-px after:w-full after:bg-[var(--border)] after:opacity-70 " +
    "after:transition-opacity after:duration-200";
  const underlineAccent =
    "pointer-events-none absolute left-0 right-0 -bottom-px h-[2px] " +
    "bg-[var(--accent-500)] opacity-0 scale-x-0 origin-left " +
    "transition duration-300 ease-out " +
    "group-focus-within:opacity-100 group-focus-within:scale-x-100";

  // Grupo con micro-animación
  const fieldGroup =
    "group md:col-span-1 transition-transform duration-200 ease-out focus-within:-translate-y-[1px]";

  // Checkbox visual custom (usa peer)
  const checkboxBox =
    "relative inline-flex items-center justify-center " +
    "rounded-[var(--radius-sm)] border border-[var(--border)] " +
    "h-[calc(var(--radius-md)*1.25)] w-[calc(var(--radius-md)*1.25)] " +
    "transition-all duration-200 will-change-transform " +
    "group-hover:scale-[1.05] " +
    "peer-checked:bg-[var(--accent-500)] peer-checked:border-[var(--accent-500)] " +
    "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent-500)]";

  const checkSvg =
    "opacity-0 scale-75 transition-all duration-200 ease-out " +
    "peer-checked:opacity-100 peer-checked:scale-100";

  const isSubmitting = status === "loading";

  return (
    <section
      className="
        rounded-[var(--radius-xl)]
        border border-[var(--border-card)]
        bg-[var(--surface-inverse)]
        p-[var(--radius-xl)]
        text-[var(--text-inverse)]
      "
    >
      {/* Título (un poco más grande) */}
      <header className="mb-[var(--radius-lg)]">
        <Typography.Heading as="h2" size="2xl" weight="semibold">
          {data.title}
        </Typography.Heading>
      </header>

      {/* Grid: Nombre/Apellido en 2 col; los demás full */}
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-[var(--radius-lg)]"
        onSubmit={handleSubmit}
      >
        {/* Nombre */}
        <div className={fieldGroup}>
          <label className="inline-block mb-[calc(var(--radius-sm)*0.25)] text-[var(--text-inverse)]">
            <Typography.Text as="span" size="sm" weight="medium">
              {firstName.label}
            </Typography.Text>
          </label>
          <div className={underlineBase}>
            <input
              id="firstName"
              name={firstName.id}
              type="text"
              required
              autoComplete="given-name"
              placeholder={firstName.placeholder}
              className={inputBase}
            />
            <span aria-hidden className={underlineAccent} />
          </div>
        </div>

        {/* Apellido */}
        <div className={fieldGroup}>
          <label className="inline-block mb-[calc(var(--radius-sm)*0.25)] text-[var(--text-inverse)]">
            <Typography.Text as="span" size="sm" weight="medium">
              {lastName.label}
            </Typography.Text>
          </label>
          <div className={underlineBase}>
            <input
              id="lastName"
              name={lastName.id}
              type="text"
              required
              autoComplete="family-name"
              placeholder={lastName.placeholder}
              className={inputBase}
            />
            <span aria-hidden className={underlineAccent} />
          </div>
        </div>

        {/* Correo (full) */}
        <div className="group md:col-span-2 transition-transform duration-200 ease-out focus-within:-translate-y-[1px]">
          <label className="inline-block mb-[calc(var(--radius-sm)*0.25)] text-[var(--text-inverse)]">
            <Typography.Text as="span" size="sm" weight="medium">
              {email.label}
            </Typography.Text>
          </label>
          <div className={underlineBase}>
            <input
              id="email"
              name={email.id}
              type="email"
              inputMode="email"
              required
              autoComplete="email"
              placeholder={email.placeholder}
              className={inputBase}
            />
            <span aria-hidden className={underlineAccent} />
          </div>
        </div>

        {/* Mensaje (no redimensionable, máx. 500 caracteres) */}
        <div className="group md:col-span-2 transition-transform duration-200 ease-out focus-within:-translate-y-[1px]">
          <label className="inline-block mb-[calc(var(--radius-sm)*0.25)] text-[var(--text-inverse)]">
            <Typography.Text as="span" size="sm" weight="medium">
              {message.label}
            </Typography.Text>
          </label>
          <div className={underlineBase}>
            <textarea
              id="message"
              name={message.id}
              required
              placeholder={message.placeholder}
              rows={message.rows ?? 6}
              maxLength={500}
              className={inputBase + " resize-none overflow-auto"}
              value={msg}
              onChange={onMessageInput}
            />
            <span aria-hidden className={underlineAccent} />
          </div>
        </div>

        {/* Newsletter (checkbox animado) */}
        <div className="md:col-span-2">
          <label className="group inline-flex items-center gap-[var(--radius-md)] cursor-pointer select-none">
            <input id="newsletter" name={newsletter.id} type="checkbox" className="peer sr-only" />
            <span className={checkboxBox} aria-hidden>
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                className={checkSvg}
                style={{ transitionProperty: "opacity, transform" }}
              >
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
            <Typography.Text as="span" size="sm" className="text-[var(--text-inverse)]">
              {newsletter.label}
            </Typography.Text>
          </label>
        </div>

        {/* Acepto privacidad (checkbox animado) */}
        <div className="md:col-span-2">
          <label className="group inline-flex items-center gap-[var(--radius-md)] cursor-pointer select-none">
            <input
              id="acceptPrivacy"
              name={acceptPrivacy.id}
              type="checkbox"
              required
              className="peer sr-only"
            />
            <span className={checkboxBox} aria-hidden>
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                className={checkSvg}
                style={{ transitionProperty: "opacity, transform" }}
              >
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
            <Typography.Text as="span" size="sm" className="text-[var(--text-inverse)]">
              {acceptPrivacy.label}
            </Typography.Text>
          </label>
        </div>

        {/* Botón */}
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="
              inline-flex items-center justify-center
              rounded-[var(--radius-full)]
              border border-[var(--border)]
              bg-[var(--surface)]
              px-[var(--radius-lg)] py-[calc(var(--radius-sm)*0.9)]
              transition-all duration-150 will-change-transform
              hover:opacity-95 hover:-translate-y-[1px]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)]
              active:translate-y-0 active:scale-[0.98]
              disabled:opacity-60 disabled:cursor-not-allowed
            "
            aria-label={data.cta.label}
          >
            <Typography.Text as="span" weight="medium" size="sm">
              {data.cta.label}
            </Typography.Text>
          </button>
        </div>
      </form>
    </section>
  );
}
