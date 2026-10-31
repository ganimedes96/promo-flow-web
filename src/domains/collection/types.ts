import { z } from "zod";
export const whatsappCollectionSourcesSchema = z.array(
  z.object({
    id: z.string().uuid(),
    connectionId: z.string().uuid().nullable(),
    accountPhone: z.string(),
    whatsappId: z.string(),
    name: z.string(),
    captureEnabled: z.boolean(),
    captureSelected: z.boolean(),
    capturedCount: z.number(),
    lastCapturedAt: z.string().nullable(),
    lastCaptureCheckAt: z.string().nullable(),
    connection: z
      .object({
        name: z.string(),
        status: z.string(),
        connectedPhone: z.string().nullable(),
      })
      .nullable(),
  })
);
export type WhatsAppCollectionSource = z.infer<
  typeof whatsappCollectionSourcesSchema
>[number];
