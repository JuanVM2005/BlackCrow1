import type { ReactNode } from "react";

export default async function ContactLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      data-surface="inverse"
      className={[
        // ✅ pinta negro desde el borde superior real
        "surface-inverse -mt-(--header-h) pt-(--header-h) min-h-svh",
        // ✅ si adentro hay un <main> con bg, lo neutraliza
        "[&_main]:bg-transparent",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
