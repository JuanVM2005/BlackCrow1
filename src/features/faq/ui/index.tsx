// src/features/faq/ui/index.tsx
"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import Section from "@/ui/Section";
import Container from "@/ui/Container";
import { Heading, Text } from "@/ui/Typography";
import { type FaqProps } from "@/features/faq/content/faq.mapper";
import { cn } from "@/utils/cn";

type ItemProps = {
  id: string;
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
};

function FaqRow({ id, question, answer, open, onToggle }: ItemProps) {
  const panelId = `${id}-panel`;
  const btnId = `${id}-button`;

  return (
    <div className="py-1 md:py-1">
      <button
        id={btnId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className={cn(
          "group flex w-full items-start gap-2.5 md:gap-3",
          "py-2 md:py-2",
          "text-left outline-none transition-colors",
          "hover:text-(--rose-500)",
          open ? "text-(--rose-500)" : "text-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 md:mt-1 inline-flex shrink-0 items-center justify-center",
            "h-5.5 w-5.5 md:h-7 md:w-7",
            "transition-transform duration-300",
            open ? "rotate-45" : "rotate-0"
          )}
        >
          <FiPlus
            className={cn(
              "transition-colors",
              "group-hover:text-(--rose-500)",
              open ? "text-(--rose-500)" : "text-current"
            )}
          />
        </span>

        <Text
          as="span"
          weight="semibold"
          leading="snug"
          tracking="normal"
          className={cn(
            "transition-colors",
            "text-base sm:text-lg md:text-2xl lg:text-3xl"
          )}
        >
          {question}
        </Text>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={btnId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="pb-3 pl-8 md:pb-3 md:pl-10">
              <Text
                as="p"
                size="sm"
                leading="relaxed"
                className="text-muted-foreground"
              >
                {answer}
              </Text>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqSection({ title, items }: FaqProps) {
  const [openId, setOpenId] = React.useState<string | null>(null);

  return (
    <Section id="faq" aria-label={title}>
      <Container>
        <div className="md:max-w-6xl">
          <Heading
            as="h2"
            weight="semibold"
            tracking="tight"
            className={cn(
              "leading-[0.98] md:leading-[0.9]",
              // MOBILE MÁS GRANDE (solo en mobile), desktop igual
              "text-5xl sm:text-6xl md:text-8xl lg:text-9xl"
            )}
          >
            {title}
          </Heading>

          <div className="mt-4 md:mt-6 space-y-2 md:space-y-1">
            {items.map((it) => {
              const isOpen = openId === it.id;
              return (
                <FaqRow
                  key={it.id}
                  id={it.id}
                  question={it.question}
                  answer={it.answer}
                  open={isOpen}
                  onToggle={() =>
                    setOpenId((prev) => (prev === it.id ? null : it.id))
                  }
                />
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
