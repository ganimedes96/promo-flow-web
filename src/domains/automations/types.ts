import { z } from "zod";

const dayRuleSchema = z.object({
  start: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
  end: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$|^24:00$/),
  dailyLimit: z.number().int().min(1).max(100000),
  intervalMinutes: z.number().int().min(2).max(1440),
}).refine((rule) => rule.start < rule.end);

export const automationSchema = z
  .object({
    enabled: z.boolean(),
    dayRules: z.array(dayRuleSchema).length(7).optional(),
    groupIds: z.array(z.string().uuid()).max(20),
    marketplaces: z.array(z.enum(["MERCADO_LIVRE", "SHOPEE", "AMAZON"])).max(3),
    categoryIds: z.array(z.string().uuid()).max(100),
    days: z.array(z.number().int().min(0).max(6)).max(7),
    start: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$|^24:00$/),
    dailyLimit: z.number().int().min(1).max(100000),
    intervalMinutes: z.number().int().min(2).max(1440),
  })
  .refine(
    (s) =>
      s.start < s.end &&
      (!s.enabled ||
        !!(s.marketplaces.length && s.days.length)),
    "Informe lojas, dias e uma faixa de horário válida."
  );

export type Automation = z.infer<typeof automationSchema>;
