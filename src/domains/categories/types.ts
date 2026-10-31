import { z } from "zod";
export const categorySchema = z.object({
  id: z.string().max(50),
  name: z.string().max(80),
});
export const categorySelectionSchema = z.preprocess(
  (value) => (value === "" || value === "auto" ? undefined : value),
  z.string().max(50).optional()
);
