import type { WordmarkOffsetSection } from "@/content/schemas/wordmarkOffset.schema";

export interface WordmarkOffsetProps {
  word: string;
  imageSrc?: string;
  imageAlt?: string;
}

export const mapWordmarkOffset = (
  section: WordmarkOffsetSection,
): WordmarkOffsetProps => ({
  word: section.word,
  imageSrc: section.media?.src,
  imageAlt: section.media?.alt,
});

export default mapWordmarkOffset;
