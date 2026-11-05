import { activityEventSchema } from "@/domains/activity/types";
import { z } from "zod";
export const sessionSchema = z.object({
  activityEvents: activityEventSchema.array().optional(),
  updatedAt: z.string().optional(),
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  isDefault: z.boolean().optional(),
  isPaused: z.boolean().optional(),
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
  platform: z.enum(["WHATSAPP", "TELEGRAM"]).optional(),
  participantCount: z.number().int().nonnegative().nullable().optional(),
  participantsUpdatedAt: z.string().nullable().optional(),
  growthTrackedFrom: z.string().nullable().optional(),
  isCommunity: z.boolean().optional(),
  joinedToday: z.number().int().nonnegative().optional(),
  leftToday: z.number().int().nonnegative().optional(),
  connectionId: z.string().uuid().nullable().optional(),
  accountPhone: z.string().optional(),
  isDefault: z.boolean(),
  isFavorite: z.boolean(),
  id: z.string(),
  whatsappId: z.string(),
  name: z.string(),
});
export type WhatsAppSession = z.infer<typeof sessionSchema>;
export type WhatsAppGroup = z.infer<typeof groupSchema>;
