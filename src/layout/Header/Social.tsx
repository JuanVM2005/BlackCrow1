// src/layout/Header/Social.tsx
"use client";

import * as React from "react";
import { cn } from "@/utils/cn";
import type { IconType } from "react-icons";
import {
  FaXTwitter,
  FaInstagram,
  FaWhatsapp,
  FaFacebook,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa6";

export type IconKind =
  | "x"
  | "instagram"
  | "whatsapp"
  | "facebook"
  | "github"
  | "linkedin";

export type SocialItem = {
  kind: IconKind | string;
  href: string;
  label?: string;
};

type Props = {
  items?: SocialItem[];
  className?: string;
  size?: "sm" | "md";
  /** Solo icono (sin contenedor) */
  bare?: boolean;
  /**
   * Auto inversión: icono en blanco base con mix-blend-difference.
   * - Sobre fondo blanco se ve negro, sobre fondo negro se ve blanco.
   */
  autoInvert?: boolean;
};

const ICONS: Record<IconKind, IconType> = {
  x: FaXTwitter,
  instagram: FaInstagram,
  whatsapp: FaWhatsapp,
  facebook: FaFacebook,
  github: FaGithub,
  linkedin: FaLinkedin,
};

const LABELS: Record<IconKind, string> = {
  x: "X",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  github: "GitHub",
  linkedin: "LinkedIn",
};

/** Lista de íconos sociales (react-icons), heredan currentColor. */
export default function Social({
  items,
  className,
  size = "md",
  bare = false,
  autoInvert = false,
}: Props) {
  const socials: SocialItem[] =
    items ??
    [
      { kind: "x", href: "#" },
      { kind: "instagram", href: "#" },
      { kind: "whatsapp", href: "#" },
    ];

  const iconPx = bare ? (size === "sm" ? 18 : 20) : size === "sm" ? 16 : 18;

  return (
    <ul
      className={cn(
        "flex items-center gap-3 md:gap-4",
        autoInvert
          ? "mix-blend-difference text-[var(--text-inverse)]"
          : "text-[var(--text)]",
        className
      )}
    >
      {socials.map((s) => {
        const k = (s.kind?.toString().toLowerCase() || "x") as IconKind;
        const Icon = ICONS[k] as IconType | undefined;
        const label = s.label ?? LABELS[k] ?? "Social";
        const content = Icon ? (
          <Icon size={iconPx} aria-hidden="true" focusable="false" />
        ) : (
          <span aria-hidden="true">•</span>
        );

        return (
          <li key={`${s.kind}-${s.href}`}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className={cn(
                bare
                  ? "inline-flex hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded"
                  : [
                      "inline-flex items-center justify-center",
                      size === "sm" ? "h-7 w-7" : "h-8 w-8",
                      "rounded-full border border-[var(--border)]",
                      "bg-[color-mix(in_oklab,var(--surface) 92%,transparent)]",
                      "shadow-sm hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    ]
              )}
            >
              {content}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
