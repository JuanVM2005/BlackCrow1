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
   * Auto inversión: usa currentColor + mix-blend-difference.
   * Útil cuando el fondo cambia (base/inverse) y quieres que el icono “se adapte”
   * sin pasar props de tono.
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

  const iconPx = bare ? (size === "sm" ? 20 : 22) : size === "sm" ? 18 : 20;

  const ringClass =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-2";

  return (
    <ul
      className={cn(
        "flex items-center gap-3 md:gap-4",
        // ✅ Por defecto HEREDA currentColor del padre (TopBar/BottomDock wrapper).
        // ✅ AutoInvert opcional (si lo activas desde donde lo uses).
        autoInvert
          ? "text-(--text-inverse) mix-blend-difference"
          : "text-current",
        className,
      )}
    >
      {socials.map((s) => {
        const k = (s.kind?.toString().toLowerCase() || "x") as IconKind;
        const Icon = ICONS[k] as IconType | undefined;
        const label = s.label ?? LABELS[k] ?? "Social";

        return (
          <li key={`${s.kind}-${s.href}`}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className={cn(
                "inline-flex",
                bare
                  ? cn(
                      "rounded-sm",
                      "transition-[opacity,transform] duration-200",
                      "hover:opacity-90 active:scale-[0.98]",
                      ringClass,
                    )
                  : cn(
                      "items-center justify-center",
                      size === "sm" ? "h-9 w-9" : "h-10 w-10",
                      "rounded-(--radius-full)",
                      "border border-(--border)",
                      // chip neutro (no fuerza “negro”), sigue tokens
                      "bg-[color-mix(in_oklab,var(--surface) 92%,transparent)]",
                      "shadow-(--shadow-xs)",
                      "transition-[opacity,transform,background-color,border-color] duration-200",
                      "hover:opacity-90 active:scale-[0.98]",
                      ringClass,
                    ),
              )}
            >
              {Icon ? (
                <Icon size={iconPx} aria-hidden="true" focusable="false" />
              ) : (
                <span aria-hidden="true">•</span>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
