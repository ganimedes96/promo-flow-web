import { z } from "zod";
export const telegramSourceSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string(),
  telegramId: z.string(),
  title: z.string(),
  username: z.string().nullable(),
  selected: z.boolean(),
  enabled: z.boolean(),
  isAvailable: z.boolean(),
  capturedCount: z.number(),
  lastCapturedAt: z.string().nullable(),
  lastCheckedAt: z.string().nullable(),
  lastError: z.string().nullable(),
});
export const telegramStateSchema = z.object({
  online: z.boolean(),
  status: z.enum([
    "DISCONNECTED",
    "CONNECTING",
    "WAITING_QR",
    "WAITING_PASSWORD",
    "READY",
    "ERROR",
  ]),
  desiredConnected: z.boolean(),
  accountName: z.string().nullable(),
  phone: z.string().nullable(),
  flowId: z.string().uuid().nullable(),
  qrUrl: z.string().nullable(),
  qrExpiresAt: z.string().nullable(),
  lastSeenAt: z.string().nullable(),
  lastSyncAt: z.string().nullable(),
  lastError: z.string().nullable(),
  commandPending: z.boolean(),
  sources: z.array(telegramSourceSchema),
});
export type TelegramState = z.infer<typeof telegramStateSchema>;
export type TelegramSource = z.infer<typeof telegramSourceSchema>;
