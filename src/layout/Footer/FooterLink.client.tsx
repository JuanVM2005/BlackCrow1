// src/layout/Footer/FooterLink.client.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { startTransitionOverlay } from "@/layout/RootProviders/TransitionOverlay.client";

const TARGET_KEY = "bc_target_section";

function isModifiedClick(
  event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
): boolean {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

function jumpToFirstExistingId(ids: string[]): boolean {
  if (typeof window === "undefined") return false;

  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "auto", block: "start" });
      return true;
    }
  }
  return false;
}

export type FooterLinkIntent = "home" | "pricing" | "contact" | "none";

type Props = {
  href: string;
  label: string;
  locale: "es" | "en";
  intent?: FooterLinkIntent;
  external?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export default function FooterLinkClient({
  href,
  label,
  locale,
  intent = "none",
  external = false,
  className,
  children,
}: Props) {
  const pathname = usePathname();
  const basePath = `/${locale}`;

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      if (external) return;
      if (isModifiedClick(event)) return;

      // HOME (hero)
      if (intent === "home") {
        startTransitionOverlay({ target: "hero", locale, durationMs: 1200 });

        if (pathname === basePath) {
          event.preventDefault();
          window.setTimeout(() => {
            const jumped = jumpToFirstExistingId(["hero", "features"]);
            if (!jumped) window.scrollTo({ top: 0, behavior: "auto" });
          }, 150);
        }
        return;
      }

      // PRICING
      if (intent === "pricing") {
        startTransitionOverlay({ target: "pricing", locale, durationMs: 1200 });

        if (pathname === basePath) {
          event.preventDefault();
          const idsToTry = locale === "en" ? ["pricing", "precios"] : ["precios", "pricing"];
          window.setTimeout(() => jumpToFirstExistingId(idsToTry), 150);
          return;
        }

        try {
          window.sessionStorage.setItem(TARGET_KEY, "pricing");
        } catch {}
        // dejamos que Link navegue a /{locale}
        return;
      }

      // CONTACT (página aparte)
      if (intent === "contact") {
        startTransitionOverlay({ target: "contact", locale, durationMs: 1200 });
        return;
      }
    },
    [basePath, external, intent, locale, pathname],
  );

  return (
    <Link href={href} onClick={onClick} aria-label={label} className={className}>
      {children ?? label}
    </Link>
  );
}
