import { z } from "zod";
export const botStatusSchema = z.object({
  online: z.boolean(),
  username: z.string().nullable(),
});
export const botLinkSchema = z.object({
  command: z.string(),
  expiresAt: z.string(),
  username: z.string(),
});
export type BotLink = z.infer<typeof botLinkSchema>;
