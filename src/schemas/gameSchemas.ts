import { z } from "zod";

export const dupeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Введите название"),
  gluttonous: z.boolean(),
});