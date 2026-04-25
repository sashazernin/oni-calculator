import { z } from "zod";

export const dupeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter name"),
  gluttonous: z.boolean(),
});