import { z } from "zod";

export const dupeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "validation_name_required"),
  gluttonous: z.boolean(),
});