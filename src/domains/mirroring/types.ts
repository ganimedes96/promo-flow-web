import { telegramStateSchema } from "@/domains/telegram/types";
import { z } from "zod";
export const mirrorSourcesSchema = z.object({
  limit: z.number(),
  selectedCount: z.number(),
  sources: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      connectionName: z.string(),
      selected: z.boolean(),
      enabled: z.boolean(),
      available: z.boolean(),
      capturedCount: z.number(),
      destinationIds: z.array(z.string()).default([]),
      lastCapturedAt: z.string().nullable(),
    })
  ),
});
export type MirrorSources = z.infer<typeof mirrorSourcesSchema>;

export const personalTelegramSchema = telegramStateSchema.extend({
  collectorOnline: z.boolean(),
  limit: z.number(),
  selectedCount: z.number(),
});
