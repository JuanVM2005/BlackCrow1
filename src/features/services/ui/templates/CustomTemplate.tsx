// src/features/services/ui/templates/CustomTemplate.tsx
"use client";

import * as React from "react";
import Container from "@/ui/Container";
import Section from "@/ui/Section";
import Typography from "@/ui/Typography";
import Grid from "@/ui/Grid";
import ServiceDetailsModal from "@/features/services/ui/ServiceDetailsModal";
import type { ServiceDetailJSON } from "@/content/schemas/serviceDetail.schema";
import type { ServiceKey } from "@/i18n/routing/static";

export type ServiceDetailViewProps = {
  data: ServiceDetailJSON;
  locale: "es" | "en";
};

function PriceBadge({ text }: { text: string }) {
  const rootRef = React.useRef<HTMLSpanElement | null>(null);
  const overlayRef = React.useRef<HTMLSpanElement | null>(null);

  const hoveringRef = React.useRef(false);
  const spawnTimerRef = React.useRef<number | null>(null);
  const lastPosRef = React.useRef({ x: 0, y: 0 });

  const stop = React.useCallback(() => {
    hoveringRef.current = false;
    if (spawnTimerRef.current) {
      window.clearInterval(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }
  }, []);

  const spawn = React.useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const { x, y } = lastPosRef.current;

    const el = document.createElement("span");
    el.textContent = "$";
    el.style.position = "absolute";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.transform = "translate(-50%, -80%)";
    el.style.pointerEvents = "none";
    el.style.userSelect = "none";
    el.style.fontSize = "12px";
    el.style.fontWeight = "800";
    el.style.letterSpacing = "-0.02em";
    el.style.opacity = "0";
    el.style.filter = "blur(0px)";
    el.style.color = "rgba(255,255,255,0.95)";
    el.style.textShadow =
      "0 0 12px rgba(255,255,255,0.12), 0 0 26px rgba(255,255,255,0.08)";

    overlay.appendChild(el);

    const dx = (Math.random() - 0.5) * 34;
    const dy = -34 - Math.random() * 40;
    const rot = (Math.random() - 0.5) * 60;
    const s0 = 0.9 + Math.random() * 0.65;

    const anim = el.animate(
      [
        {
          opacity: 0,
          transform: `translate(-50%, -80%) translate(0px, 0px) rotate(0deg) scale(${s0})`,
          filter: "blur(0px)",
        },
        {
          opacity: 1,
          offset: 0.22,
          transform: `translate(-50%, -80%) translate(${dx * 0.25}px, ${dy * 0.25}px) rotate(${rot * 0.25}deg) scale(${s0})`,
          filter: "blur(0px)",
        },
        {
          opacity: 0,
          transform: `translate(-50%, -80%) translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${s0 * 0.92})`,
          filter: "blur(0.7px)",
        },
      ],
      {
        duration: 760 + Math.floor(Math.random() * 260),
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      },
    );

    anim.onfinish = () => {
      try {
        el.remove();
      } catch {}
    };
  }, []);

  const onPointerMove = React.useCallback((e: React.PointerEvent) => {
    const root = rootRef.current;
    if (!root) return;
    const r = root.getBoundingClientRect();
    lastPosRef.current = {
      x: Math.max(0, Math.min(r.width, e.clientX - r.left)),
      y: Math.max(0, Math.min(r.height, e.clientY - r.top)),
    };
  }, []);

  const onPointerEnter = React.useCallback(() => {
    hoveringRef.current = true;

    if (!spawnTimerRef.current) {
      spawnTimerRef.current = window.setInterval(() => {
        if (!hoveringRef.current) return;
        spawn();
        if (Math.random() > 0.4) spawn();
      }, 135);
    }
  }, [spawn]);

  const onPointerLeave = React.useCallback(() => stop(), [stop]);

  React.useEffect(() => stop, [stop]);

  return (
    <span
      ref={rootRef}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className="
        relative inline-flex items-center
        rounded-(--radius-full)
        border border-[rgba(255,255,255,0.12)]
        bg-[rgba(0,0,0,0.62)]
        text-(--text-inverse)
        shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_18px_60px_rgba(0,0,0,0.45)]
        backdrop-blur-md
        px-[calc(var(--radius-lg)*0.95)] py-[calc(var(--radius-sm)*0.65)]
      "
    >
      <span
        ref={overlayRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-20"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
      />
      <Typography.Text as="span" weight="medium" size="sm" className="relative z-10">
        {text}
      </Typography.Text>
    </span>
  );
}

export default function CustomTemplate({ data, locale }: ServiceDetailViewProps) {
  const hasColA = Array.isArray(data.featuresLeft) && data.featuresLeft.length > 0;
  const hasColB = Array.isArray(data.featuresRight) && data.featuresRight.length > 0;
  const hasTags = Array.isArray(data.tags) && data.tags.length > 0;

  const serviceKey = (data.key ?? "custom") as ServiceKey;

  return (
    <>
      {/* HERO */}
      <Section className="py-0!">
        <Container size="xl">
          <div className="min-w-0">
            <Typography.Heading
              as="h1"
              size="2xl"
              leading="tight"
              tracking="tight"
              weight="bold"
              className="wrap-break-word text-[8.5vw] md:text-[7.5vw] lg:text-[6.25vw] xl:text-[5.5vw]"
            >
              <span className="block sm:inline">{data.header.title}</span>

              {data.priceRange ? (
                <span className="mt-[calc(var(--radius-sm)*0.9)] block sm:mt-0 sm:ml-(--radius-md) sm:inline-flex">
                  <PriceBadge text={data.priceRange} />
                </span>
              ) : null}
            </Typography.Heading>
          </div>

          {data.header.subtitle ? (
            <div className="mt-(--radius-lg) sm:mt-(--radius-xl) max-w-[56ch]">
              <Typography.Text
                as="p"
                size="xl"
                className="text-[16px] leading-[1.68] sm:text-inherit sm:leading-[inherit]"
              >
                {data.header.subtitle}
              </Typography.Text>
            </div>
          ) : null}

          {/* Mobile: tags + botón */}
          <div className="mt-(--radius-xl) flex flex-col gap-(--radius-md) sm:hidden">
            {hasTags ? (
              <ul role="list" className="flex flex-wrap gap-(--radius-sm)">
                {data.tags!.slice(0, 4).map((tag, i) => (
                  <li key={`tag-m-${i}`}>
                    <Typography.Text as="span" size="sm" weight="medium" className="opacity-90">
                      #{tag}
                    </Typography.Text>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="w-full">
              <div className="group relative inline-flex w-full">
                <span
                  aria-hidden
                  className="
                    pointer-events-none absolute -inset-0.5
                    rounded-(--radius-full)
                    opacity-0 blur-md
                    transition-opacity duration-200
                    group-hover:opacity-100
                  "
                  style={{
                    background:
                      "radial-gradient(60% 120% at 50% 50%, rgba(255,255,255,0.18), rgba(255,255,255,0.02) 60%, transparent 75%)",
                  }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-(--radius-full)"
                >
                  <span
                    className="
                      absolute inset-y-0 -left-[70%] w-[70%]
                      transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
                      group-hover:translate-x-[240%]
                    "
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), rgba(255,255,255,0.18), transparent)",
                      filter: "blur(0.2px)",
                    }}
                  />
                </span>

                <ServiceDetailsModal
                  locale={locale}
                  serviceKey={serviceKey}
                  triggerClassName="
                    w-full justify-center
                    relative z-10 inline-flex items-center
                    rounded-full
                    border border-[rgba(255,255,255,0.16)]
                    bg-[rgba(0,0,0,0.70)]
                    text-[var(--text-inverse)]
                    px-[calc(var(--radius-lg)*1.05)] py-[calc(var(--radius-sm)*0.95)]
                    backdrop-blur-[14px]
                    shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_22px_70px_rgba(0,0,0,0.55)]
                    transition-[transform,opacity,box-shadow,border-color] duration-200
                    group-hover:-translate-y-[1px]
                    group-hover:border-[rgba(255,255,255,0.26)]
                    active:translate-y-0 active:scale-[0.98]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
                  "
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* FEATURES */}
      {(hasColA || hasColB) && (
        <Section className="py-0!">
          <Container size="xl" className="mt-(--radius-2xl)">
            <Grid className="grid-cols-1 md:grid-cols-2 gap-(--radius-lg) sm:gap-(--radius-xl)">
              <div>
                {hasColA ? (
                  <ul
                    role="list"
                    className="
                      flex flex-col
                      gap-[calc(var(--radius-md)*0.82)]
                      sm:gap-(--radius-md)
                    "
                  >
                    {data.featuresLeft!.map((item, i) => (
                      <li key={`fl-${i}`} className="flex items-start gap-(--radius-md)">
                        <span
                          aria-hidden
                          className="
                            mt-[calc(var(--radius-sm)/2)]
                            inline-flex
                            h-[calc(var(--radius-lg)*0.88)] w-[calc(var(--radius-lg)*0.88)]
                            sm:h-(--radius-lg) sm:w-(--radius-lg)
                            items-center justify-center rounded-full
                            border border-[rgba(255,255,255,0.14)]
                            bg-[rgba(0,0,0,0.35)]
                            backdrop-blur-[10px]
                            shadow-[0_0_0_1px_rgba(255,255,255,0.04)]
                          "
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-(--radius-md) w-(--radius-md)"
                          >
                            <path
                              d="M4 8h8M8 4l4 4-4 4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>

                        <Typography.Text
                          as="span"
                          className="text-[15px] leading-[1.6] sm:text-inherit sm:leading-[inherit]"
                        >
                          {item}
                        </Typography.Text>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div>
                {hasColB ? (
                  <ul
                    role="list"
                    className="
                      flex flex-col
                      gap-[calc(var(--radius-md)*0.82)]
                      sm:gap-(--radius-md)
                    "
                  >
                    {data.featuresRight!.map((item, i) => (
                      <li key={`fr-${i}`} className="flex items-start gap-(--radius-md)">
                        <span
                          aria-hidden
                          className="
                            mt-[calc(var(--radius-sm)/2)]
                            inline-flex
                            h-[calc(var(--radius-lg)*0.88)] w-[calc(var(--radius-lg)*0.88)]
                            sm:h-(--radius-lg) sm:w-(--radius-lg)
                            items-center justify-center rounded-full
                            border border-[rgba(255,255,255,0.14)]
                            bg-[rgba(0,0,0,0.35)]
                            backdrop-blur-[10px]
                            shadow-[0_0_0_1px_rgba(255,255,255,0.04)]
                          "
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-(--radius-md) w-(--radius-md)"
                          >
                            <path
                              d="M4 8h8M8 4l4 4-4 4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>

                        <Typography.Text
                          as="span"
                          className="text-[15px] leading-[1.6] sm:text-inherit sm:leading-[inherit]"
                        >
                          {item}
                        </Typography.Text>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Grid>

            {/* Desktop/Windows: fila original */}
            <div className="mt-[calc(var(--radius-xl)*1.25)] hidden sm:flex items-center justify-between gap-(--radius-md)">
              {hasTags ? (
                <ul role="list" className="flex flex-wrap gap-(--radius-sm)">
                  {data.tags!.map((tag, i) => (
                    <li key={`tag-${i}`}>
                      <Typography.Text as="span" size="sm" weight="medium">
                        #{tag}
                      </Typography.Text>
                    </li>
                  ))}
                </ul>
              ) : (
                <div />
              )}

              <div className="shrink-0">
                <div className="group relative inline-flex">
                  <span
                    aria-hidden
                    className="
                      pointer-events-none absolute -inset-0.5
                      rounded-(--radius-full)
                      opacity-0 blur-[10px]
                      transition-opacity duration-200
                      group-hover:opacity-100
                    "
                    style={{
                      background:
                        "radial-gradient(60% 120% at 50% 50%, rgba(255,255,255,0.16), rgba(255,255,255,0.02) 60%, transparent 75%)",
                    }}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 overflow-hidden rounded-(--radius-full)"
                  >
                    <span
                      className="
                        absolute inset-y-0 -left-[70%] w-[70%]
                        transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]
                        group-hover:translate-x-[240%]
                      "
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.42), rgba(255,255,255,0.12), transparent)",
                        filter: "blur(0.2px)",
                      }}
                    />
                  </span>

                  <ServiceDetailsModal
                    locale={locale}
                    serviceKey={serviceKey}
                    triggerClassName="
                      relative z-10 inline-flex items-center
                      rounded-full
                      border border-[rgba(255,255,255,0.14)]
                      bg-[rgba(0,0,0,0.65)]
                      text-[var(--text-inverse)]
                      px-[calc(var(--radius-lg)*1.05)] py-[calc(var(--radius-sm)*0.9)]
                      backdrop-blur-[12px]
                      shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_22px_70px_rgba(0,0,0,0.55)]
                      transition-[transform,opacity,box-shadow,border-color] duration-200
                      group-hover:-translate-y-[1px]
                      group-hover:border-[rgba(255,255,255,0.22)]
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]
                      active:translate-y-0 active:scale-[0.98]
                    "
                  />
                </div>
              </div>
            </div>

            <div className="sm:hidden mt-(--radius-xl)" />
          </Container>
        </Section>
      )}
    </>
  );
}
