import { z } from "zod";
const runtime = z.object({
  status: z.enum(["ONLINE", "OFFLINE", "NOT_STARTED"]),
  lastSeenAt: z.string().nullable(),
  stoppedAt: z.string().nullable(),
});
export const operationsSchema = z.object({
  checkedAt: z.string(),
  api: z.literal("AVAILABLE"),
  worker: runtime.extend({ publishingEnabled: z.boolean() }),
  collector: runtime.extend({
    telegramEnabled: z.boolean(),
    whatsappEnabled: z.boolean(),
  }),
  queue: z.object({
    scheduled: z.number(),
    sending: z.number(),
    unconfirmed: z.number(),
    failed: z.number(),
  }),
});
export type OperationsStatus = z.infer<typeof operationsSchema>;
