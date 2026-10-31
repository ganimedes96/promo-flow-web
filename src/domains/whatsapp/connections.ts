import { z } from "zod";
import { sessionSchema } from "./types";
export const connectionSchema = sessionSchema.extend({
  id: z.string().uuid(),
  name: z.string(),
  isDefault: z.boolean(),
  isPaused: z.boolean(),
  provider: z.string(),
  groupCount: z.number().optional(),
  pendingCount: z.number().optional(),
});
export const connectionListSchema = z.object({
  connections: connectionSchema.array(),
  worker: sessionSchema.shape.worker,
});
export type WhatsAppConnectionAccount = z.infer<typeof connectionSchema>;
export const connectionInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .trim()
    .min(1, "Informe um nome.")
    .max(80, "Use até 80 caracteres."),
});
