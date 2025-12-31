import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ContactSection from "@/features/contact/ui";
import { loadContact } from "@/features/contact/content/contact.mapper";
import Footer from "@/layout/Footer";

export const metadata: Metadata = {
  title: "Contacto",
};

function safeLocale(input: unknown): "es" | "en" {
  return input === "en" ? "en" : "es";
}

export default async function ContactoPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await props.params;
  const locale = safeLocale(rawLocale);

  // ✅ Solo existe /es/contacto
  if (locale !== "es") notFound();

  const content = await loadContact(locale);

  return (
    <div className="surface-inverse min-h-svh flex flex-col">
      <main className="flex-1">
        <ContactSection {...content} id="contacto" />
      </main>

      {/* Footer abajo */}
      <Footer locale={locale} surface="inverse" />
    </div>
  );
}
