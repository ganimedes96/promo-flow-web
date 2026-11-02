import { z } from "zod";
export const planCodes = ["TRIAL", "ESSENTIAL", "PROFESSIONAL"] as const;
export const planInputSchema = z.object({
  password: z.string().max(128).optional(),
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(500),
  monthlyPriceCents: z.number().int().min(0).max(1000000),
  maxConnections: z.number().int().min(1).max(1000),
  maxGroups: z.number().int().min(1).max(10000),
  maxMirroredGroups: z.number().int().min(0).max(1000),
  maxDailyPublications: z.number().int().min(1).max(100000),
  maxStores: z.number().int().min(1).max(3),
  trialDays: z.number().int().min(1).max(365),
  watermarkEnabled: z.boolean(),
  isActive: z.boolean(),
  expectedUpdatedAt: z.string().datetime(),
});
export const planSchema = planInputSchema
  .omit({ expectedUpdatedAt: true, password: true })
  .extend({
    code: z.enum(planCodes),
    updatedAt: z.string(),
    sortOrder: z.number(),
  });
export type ManagedPlan = z.infer<typeof planSchema>;
export type PlanInput = z.infer<typeof planInputSchema>;
