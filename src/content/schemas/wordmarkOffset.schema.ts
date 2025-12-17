import { z } from "zod";

export const wordmarkOffsetSchema = z.object({
  kind: z.literal("wordmarkOffset"),
  word: z.string(),
  media: z
    .object({
      kind: z.literal("image"),
      src: z.string(),
      alt: z.string().optional(),
    })
    .optional(),
});

export type WordmarkOffsetSection = z.infer<typeof wordmarkOffsetSchema>;

export default wordmarkOffsetSchema;
