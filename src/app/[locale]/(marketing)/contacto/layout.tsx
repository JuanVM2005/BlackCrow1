import type { ReactNode } from "react";

export default async function ContactoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      data-surface="inverse"
      className={[
        "surface-inverse -mt-(--header-h) pt-(--header-h) min-h-svh",
        "[&_main]:bg-transparent",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
