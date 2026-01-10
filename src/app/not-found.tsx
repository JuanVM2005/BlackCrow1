import Link from "next/link";
import Image from "next/image";

import Section from "@/ui/Section";
import Container from "@/ui/Container";
import { Text } from "@/ui/Typography";
import Footer from "@/layout/Footer";

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

function PillWipeLink({
  label,
  href,
  className,
}: {
  label: string;
  href: string;
  className?: string;
}) {
  const base =
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden " +
    "rounded-full px-4 py-2 " +
    "border border-white/55 bg-transparent text-white " +
    "transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,.1)] hover:-translate-y-[1px] active:translate-y-0 " +
    "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0 " +
    "hover:shadow-[0_10px_30px_-18px_rgba(0,0,0,.65)] motion-reduce:hover:shadow-none " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "focus-visible:ring-(--ring) focus-visible:ring-offset-(--surface-inverse) " +
    "hover:text-black";

  const wipe =
    "before:content-[''] before:absolute before:inset-[-35%] before:-z-10 " +
    "before:rotate-[12deg] before:bg-white " +
    "before:translate-x-[-120%] hover:before:translate-x-0 " +
    "before:transition-transform before:duration-[520ms] before:ease-[cubic-bezier(.2,.8,.2,.1)] " +
    "motion-reduce:before:transition-none";

  const icon =
    "shrink-0 text-white transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,.1)] " +
    "group-hover:translate-x-[2px] group-hover:-translate-y-[1px] " +
    "motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0 " +
    "group-hover:text-black";

  const content =
    "relative z-10 inline-flex items-center gap-2 text-white transition-colors duration-300 ease-[cubic-bezier(.2,.8,.2,.1)] " +
    "motion-reduce:transition-none group-hover:text-black";

  const cls = [base, wipe, "group", className].filter(Boolean).join(" ");

  return (
    <Link className={cls} href={href} aria-label={label}>
      <span className={content}>
        <span>{label}</span>
        <ArrowIcon className={icon} />
      </span>
    </Link>
  );
}

export default function NotFound() {
  return (
    <main
      data-surface="inverse"
      className="
        relative
        min-h-dvh
        overflow-hidden
        text-(--text-inverse)

        /* Fondo */
        bg-(--surface-inverse)
        bg-[url('/icons/BlackCrow/IconBCWhite.svg')]
        bg-no-repeat
        bg-size-[230%]
        bg-position-[55%_30%]
      "
    >
      {/* Overlay para apagar el icono */}
      <div
        aria-hidden
        className="
          pointer-events-none
          absolute inset-0
          bg-(--surface-inverse)
          opacity-[0.95]
        "
      />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <Section className="relative flex-1">
          <Container>
            {/* Logo esquina */}
            <div className="absolute left-0 top-0 translate-x-(--space-6) translate-y-(--space-6) p-(--space-6)">
              <Link href="/" aria-label="Black Crow" className="inline-flex">
                <Image
                  src="/logos/BlackCrow/LogoBlackCrowWhite.svg"
                  alt="Black Crow"
                  width={150}
                  height={48}
                  priority
                />
              </Link>
            </div>

            {/* Centro */}
            <div className="grid min-h-dvh place-items-center">
              <div className="flex flex-col items-center text-center gap-(--space-7)">
                <Image
                  src="/logos/BlackCrow/404bc.png"
                  alt="404 Not Found"
                  width={520}
                  height={260}
                  priority
                  className="h-auto w-[min(48vw,300px)] md:w-[min(42vw,330px)] select-none"
                />

                <div className="flex items-center gap-(--space-7)">
                  <Text as="span" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal">
                    NOT
                  </Text>
                  <span
                    aria-hidden
                    className="h-px w-[clamp(36px,5vw,80px)] bg-current/55"
                  />
                  <Text as="span" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal">
                    FOUND
                  </Text>
                </div>

                <div className="mt-10">
                  <PillWipeLink label="Ir al Home" href="/" />
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Footer surface="inverse" />
      </div>
    </main>
  );
}
