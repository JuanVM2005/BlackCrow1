// src/app/[locale]/(marketing)/page.tsx
import type { ReactNode } from "react";
import Hero from "@/features/hero/ui";
import StudioIntro from "@/features/studio/ui";
import Capabilities from "@/features/capabilities/ui";
import BigStatement from "@/features/big-statement/ui";
import ValueGrid from "@/features/value-grid/ui";
import StackGrid from "@/features/stack-grid/ui";
import MessageBar from "@/features/message-bar/ui";
import Pricing from "@/features/pricing/ui";
import CtaMinimal from "@/features/cta-minimal/ui";
import Faq from "@/features/faq/ui";
import Interactive3D from "@/features/interactive-3d/ui";
import WordmarkOffset from "@/features/wordmark-offset/ui";
import {
  composeLandingFromPage,
  type LandingBlock,
} from "@/features/landing/content/landing.composition";

import esHome from "@/content/locales/es/pages/home.json";
import enHome from "@/content/locales/en/pages/home.json";
import HomeSectionJump from "@/features/landing/ui/HomeSectionJump.client";
import { normalizeLocale } from "@/i18n/locales";
import Footer from "@/layout/Footer";

type Locale = "es" | "en";
type Params = { params: Promise<{ locale: Locale }> };

type ContentPage = {
  kind: "page";
  sections: Array<{ kind: string; data?: unknown }>;
  meta?: { title?: string; description?: string; ogImage?: string };
};

function getHomeByLocale(locale: Locale): ContentPage {
  return (locale === "en" ? enHome : esHome) as unknown as ContentPage;
}

export function generateStaticParams() {
  return [{ locale: "es" }, { locale: "en" }];
}

export default async function Page({ params }: Params) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale) as Locale;

  const page = getHomeByLocale(locale);
  const blocks = composeLandingFromPage(page, locale);

  const allowedKinds = new Set([
    "hero",
    "studioIntro",
    "capabilities",
    "wordmarkOffset",
    "bigStatement",
    "interactive-3d",
    "value-grid",
    "stack-grid",
    "message-bar",
    "pricing",
    "cta-minimal",
    "faq",
  ]);

  const filtered = blocks.filter((b) => allowedKinds.has((b as any).kind));

  // interactive-3d se queda en base (no inverse)
  const inverseKinds = new Set([
    "bigStatement",
    "interactive-3d",
    "value-grid",
    "stack-grid",
    "message-bar",
  ]);

  const renderBlock = (block: LandingBlock): ReactNode => {
    switch (block.kind) {
      case "hero":
        return <Hero {...(block as any).props} />;
      case "studioIntro":
        return <StudioIntro {...(block as any).props} />;
      case "capabilities":
        return <Capabilities {...(block as any).props} />;
      case "wordmarkOffset":
        return <WordmarkOffset {...(block as any).props} />;
      case "bigStatement":
        return <BigStatement {...(block as any).props} />;
      case "interactive-3d":
        return <Interactive3D {...(block as any).props} />;
      case "value-grid":
        return <ValueGrid {...(block as any).props} />;
      case "stack-grid":
        return <StackGrid {...(block as any).props} />;
      case "message-bar":
        return <MessageBar {...(block as any).props} />;
      case "pricing":
        return <Pricing {...(block as any).props} />;
      case "cta-minimal":
        return <CtaMinimal {...(block as any).props} />;
      case "faq":
        return <Faq {...(block as any).props} />;
      default:
        return null;
    }
  };

  type Group = { inverse: boolean; items: LandingBlock[] };
  const groups: Group[] = [];

  for (const b of filtered) {
    const inv = inverseKinds.has((b as any).kind);
    const last = groups[groups.length - 1];
    if (!last || last.inverse !== inv) {
      groups.push({ inverse: inv, items: [b] });
    } else {
      last.items.push(b);
    }
  }

  return (
    <>
      {/* Posicionamiento automático en hero / pricing cuando venimos desde otra ruta */}
      <HomeSectionJump />

      {groups.map((g, gi) => (
        <div
          key={`grp-${gi}`}
          data-surface={g.inverse ? "inverse" : "base"}
          className={
            g.inverse
              ? "surface-inverse py-20 md:py-28 transition-colors"
              : "surface-base transition-colors"
          }
        >
          <div className="flex flex-col gap-16 sm:gap-24">
            {g.items.map((blk, bi) => (
              <div key={`blk-${gi}-${bi}`}>{renderBlock(blk)}</div>
            ))}
          </div>
        </div>
      ))}

      {/* Footer claro solo para la landing */}
      <Footer locale={locale} surface="base" />
    </>
  );
}
