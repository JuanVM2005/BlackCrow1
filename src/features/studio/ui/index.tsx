// src/features/studio/ui/index.tsx
"use client";

import * as React from "react";
import type { StudioIntroProps } from "@/features/studio/content/studio.mapper";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

import Section from "@/ui/Section";
import Container from "@/ui/Container";
import { Heading, Text } from "@/ui/Typography";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7 17L17 7M17 7H9M17 7V15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type PillWipeButtonBaseProps = {
  label: string;
  reduceMotion?: boolean;
  className?: string;
};

type PillWipeButtonProps =
  | (PillWipeButtonBaseProps & {
      href: string;
      external?: boolean;
      onClick?: never;
      type?: never;
    })
  | (PillWipeButtonBaseProps & {
      href?: never;
      external?: never;
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
      type?: "button" | "submit";
    });

/**
 * Pill moderno con wipe diagonal (hover) + micro-lift.
 * Todo inline (sin tocar globals.css ni CSS externos).
 */
function PillWipeButton(props: PillWipeButtonProps) {
  const reduce = !!props.reduceMotion;

  const base =
    // layout
    "relative inline-flex items-center justify-center gap-2 overflow-hidden " +
    // pill
    "rounded-full px-5 py-3 " +
    // base look (minimal)
    "border border-black/15 bg-transparent text-black " +
    // motion
    (reduce
      ? ""
      : "transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-[1px] active:translate-y-0") +
    " " +
    // shadow (premium)
    (reduce ? "" : "hover:shadow-[0_10px_30px_-18px_rgba(0,0,0,.55)]") +
    " " +
    // focus
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent " +
    // text/icon color switch
    "hover:text-white";

  const wipe =
    // diagonal wipe layer
    "before:content-[''] before:absolute before:inset-[-35%] before:-z-10 " +
    "before:rotate-[12deg] before:bg-black " +
    (reduce
      ? "before:translate-x-[-120%] hover:before:translate-x-0"
      : "before:translate-x-[-120%] hover:before:translate-x-0 before:transition-transform before:duration-[520ms] before:ease-[cubic-bezier(.2,.8,.2,1)]");

  const icon =
    "shrink-0 " +
    (reduce
      ? ""
      : "transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:translate-x-[2px] group-hover:-translate-y-[1px]");

  const content =
    "relative z-10 inline-flex items-center gap-2 " +
    (reduce
      ? ""
      : "transition-colors duration-300 ease-[cubic-bezier(.2,.8,.2,1)]");

  const cls = [base, wipe, "group", props.className].filter(Boolean).join(" ");

  if ("href" in props && props.href) {
    return (
      <a
        className={cls}
        href={props.href}
        target={props.external ? "_blank" : undefined}
        rel={props.external ? "noopener noreferrer" : undefined}
        aria-label={props.label}
      >
        <span className={content}>
          <span>{props.label}</span>
          <ArrowIcon className={icon} />
        </span>
      </a>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      className={cls}
      onClick={props.onClick}
      aria-label={props.label}
    >
      <span className={content}>
        <span>{props.label}</span>
        <ArrowIcon className={icon} />
      </span>
    </button>
  );
}

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
                <PillWipeButton
                  label={cta.label}
                  href={cta.href}
                  external
                  reduceMotion={reduce}
                />
              ) : (
                <PillWipeButton
                  label={cta.label}
                  onClick={handleInternalCtaClick}
                  reduceMotion={reduce}
                />
              )}
            </div>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
