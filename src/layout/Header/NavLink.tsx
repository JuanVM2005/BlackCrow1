// src/layout/Header/NavLink.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";

export type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  /** Estrategia de match para estado activo */
  match?: "exact" | "startsWith";
  /**
   * Acción opcional para manejar clicks personalizados (scroll, etc.)
   * El nombre termina en `Action` para evitar el warning de Next 15
   * que exige que las funciones en props no sean Server Actions.
   */
  onClickAction?: React.MouseEventHandler<HTMLAnchorElement>;
};

/** Link con estado activo basado en `usePathname`. */
export default function NavLink({
  href,
  children,
  className,
  match = "exact",
  onClickAction,
}: NavLinkProps) {
  const pathname = usePathname();

  const normalize = (v: string) => {
    const noHash = v.split("#")[0] || "/";
    const noLocale = noHash.replace(/^\/[a-z]{2,3}(?=\/|$)/i, "");
    const clean = noLocale.replace(/\/+$/, "");
    return clean === "" ? "/" : clean;
  };

  const target = normalize(href);
  const current = normalize(pathname || "/");

  const isActive =
    match === "startsWith"
      ? target === "/"
        ? current === "/"
        : current.startsWith(target)
      : current === target;

  // Span interno: subrayado ultra-delgado justo bajo las letras, SOLO en hover
  const labelClassName = cn(
    "relative inline-block",
    "after:pointer-events-none after:absolute",
    "after:left-1/2 after:-translate-x-1/2",
    "after:bottom-[-0.05em]", // pegadito al texto
    "after:h-[0.4px] after:bg-[var(--text)]", // aún más delgada
    "after:w-0 after:origin-center",
    "after:transition-[width] after:duration-220 after:ease-out",
    // solo hover (no se mantiene por estar activo)
    "group-hover/navlink:after:w-full",
  );

  return (
    <Link
      href={href}
      onClick={onClickAction}
      aria-current={isActive ? "page" : undefined}
      data-active={isActive ? "true" : "false"}
      className={cn(
        "group/navlink",
        "relative inline-flex items-center justify-center",
        // 🔹 menos alto el contenedor
        "px-2.5 md:px-3 py-0.5 md:py-0.5 rounded-full text-sm md:text-sm",
        "text-(--text-muted) hover:text-(--text)",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)",
        "transition-colors",
        "data-[active=true]:text-(--text)", // solo color para activo
        className,
      )}
    >
      <span className={labelClassName}>{children}</span>
    </Link>
  );
}
