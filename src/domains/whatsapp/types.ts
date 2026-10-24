import { z } from "zod";
export const sessionSchema = z.object({
  status: z.enum([
    "DISCONNECTED",
    "CONNECTING",
    "WAITING_QR",
    "AUTHENTICATED",
    "READY",
    "ERROR",
  ]),
  worker: z
    .object({
      status: z.enum(["ONLINE", "OFFLINE", "UNKNOWN"]),
      publishingEnabled: z.boolean(),
      lastSeenAt: z.string().nullable(),
    })
    .optional(),
  qrCode: z.string().nullable().optional(),
  qrExpiresAt: z.string().nullable().optional(),
  connectedPhone: z.string().nullable().optional(),
  connectedName: z.string().nullable().optional(),
  lastError: z.string().nullable().optional(),
});
export const groupSchema = z.object({
  isDefault: z.boolean(),
  isFavorite: z.boolean(),
  id: z.string(),
  whatsappId: z.string(),
  name: z.string(),
});
export type WhatsAppSession = z.infer<typeof sessionSchema>;
export type WhatsAppGroup = z.infer<typeof groupSchema>;
