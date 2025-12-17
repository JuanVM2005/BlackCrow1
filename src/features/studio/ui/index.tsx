// src/features/studio/ui/index.tsx
"use client";

import * as React from "react";
import type { StudioIntroProps } from "@/features/studio/content/studio.mapper";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

import Section from "@/ui/Section";
import Container from "@/ui/Container";
import Button, { ButtonArrow } from "@/ui/Button";
import { Heading, Text } from "@/ui/Typography";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function StudioIntro({
  kicker,
  title,
  body,
  cta,
}: StudioIntroProps) {
  const headingId = React.useId();
  const reduce = usePrefersReducedMotion();

  const fullText = React.useMemo(() => body.trim(), [body]);
  const words = React.useMemo(
    () => fullText.split(/\s+/).filter(Boolean),
    [fullText],
  );

  const textRef = React.useRef<HTMLDivElement | null>(null);

  // ✅ Mobile un poco más chico; desktop se mantiene grande
  const displayClass =
    "text-[1.375rem] sm:text-4xl lg:text-6xl leading-tight tracking-tight text-pretty max-w-[68ch] w-full";

  React.useLayoutEffect(() => {
    if (reduce) return;

    const el = textRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const targets = el.querySelectorAll<HTMLSpanElement>(".studio-word");
      if (!targets.length) return;

      const baseOpacity = 0;
      const baseY = 12;

      const start = "top 82%";
      const endMode: "dynamic" | string = "dynamic";
      const stagger = 0.045;
      const smooth = 0.65;
      const markers = false;
      const once = false;

      gsap.set(targets, { opacity: baseOpacity, y: baseY });

      const tl = gsap.timeline({ paused: true });

      tl.to(
        targets,
        {
          opacity: 1,
          duration: 1,
          stagger,
          ease: "none",
        },
        0,
      ).to(
        targets,
        {
          y: 0,
          duration: 1,
          stagger,
          ease: "none",
        },
        0,
      );

      const setProgress = gsap.quickTo(tl, "progress", {
        duration: smooth,
        ease: "power2.out",
        overwrite: "auto",
      });

      const computeEnd = () => {
        if (endMode !== "dynamic") return endMode;
        const vh = window.innerHeight || 800;
        const rect = el.getBoundingClientRect();
        const px = Math.max(vh * 0.7, Math.min(vh * 1.25, rect.height * 0.9));
        return `+=${Math.round(px)}`;
      };

      ScrollTrigger.create({
        trigger: el,
        start,
        end: computeEnd(),
        markers,
        invalidateOnRefresh: true,
        onRefresh(self) {
          if (endMode === "dynamic") self.vars.end = computeEnd();
          tl.progress(0).pause();
        },
        onUpdate(self) {
          setProgress(self.progress);
        },
        onLeave(self) {
          if (once) {
            tl.progress(1);
            self.disable();
            self.kill(true);
          } else {
            setProgress(1);
          }
        },
        onLeaveBack(self) {
          if (once) {
            tl.progress(1);
            self.disable();
            self.kill(true);
          } else {
            setProgress(0);
          }
        },
      });
    }, textRef);

    return () => ctx.revert();
  }, [reduce, words.length]);

  const handleInternalCtaClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const target = document.getElementById("pricing");
      if (!target) return;

      target.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    },
    [reduce],
  );

  return (
    <Section className="py-10 sm:py-20 lg:py-24" region labelledBy={headingId}>
      <Container>
        <div className="flex flex-col items-start gap-5 sm:gap-6 w-full">
          {kicker ? (
            <Text
              size="sm"
              className="uppercase tracking-wide"
              data-testid="studio-kicker"
            >
              {kicker}
            </Text>
          ) : null}

          <Heading
            as="h2"
            id={headingId}
            className="sr-only"
            data-testid="studio-title"
          >
            {title}
          </Heading>

          <div
            ref={textRef}
            className={displayClass}
            style={{
              textAlign: "justify",
              textJustify: "inter-word",
              hyphens: "auto",
            }}
            data-testid="studio-body"
          >
            {words.map((w, i) => (
              <span key={i} className="studio-word">
                {i > 0 ? " " : ""}
                {w}
              </span>
            ))}
          </div>

          {cta ? (
            <div>
              {cta.isExternal ? (
                <Button asChild className="group" aria-label={cta.label}>
                  <a href={cta.href} target="_blank" rel="noopener noreferrer">
                    <span>{cta.label}</span>
                    <ButtonArrow />
                  </a>
                </Button>
              ) : (
                <Button
                  type="button"
                  className="group"
                  aria-label={cta.label}
                  onClick={handleInternalCtaClick}
                >
                  <span>{cta.label}</span>
                  <ButtonArrow />
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
