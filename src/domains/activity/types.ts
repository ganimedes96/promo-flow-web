import { z } from "zod";
export const activityEventSchema = z.object({
  id: z.string(),
  supportCode: z.string(),
  kind: z.enum(["CONNECTION", "OFFER"]),
  status: z.string(),
  message: z.string(),
  createdAt: z.string(),
});
export type ActivityEvent = z.infer<typeof activityEventSchema>;
export const activityReferenceSchema = activityEventSchema
  .extend({
    userId: z.string(),
    connectionId: z.string().nullable(),
    offerId: z.string().nullable(),
    technicalDetails: z.string().nullable(),
    user: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  })
  .nullable();
export type ActivityResource =
  | { connectionId: string; offerId?: never }
  | { offerId: string; connectionId?: never };
