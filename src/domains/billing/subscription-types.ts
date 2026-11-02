import { z } from "zod";
export const checkoutUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      ["sandbox.asaas.com", "www.asaas.com", "asaas.com"].includes(
        url.hostname
      ) &&
      url.pathname === "/checkoutSession/show" &&
      !url.username &&
      !url.password &&
      !url.port
    );
  });
export const planChangeSchema = z.object({
  id: z.string().uuid(),
  kind: z.enum(["UPGRADE", "DOWNGRADE"]),
  status: z.string(),
  targetPlanCode: z.string(),
  targetPlanName: z.string(),
  targetPriceCents: z.number(),
  previousPlanName: z.string(),
  previousPriceCents: z.number(),
  amountCents: z.number(),
  periodStart: z.string(),
  periodEnd: z.string(),
  effectiveAt: z.string(),
  expiresAt: z.string(),
  checkoutUrl: checkoutUrlSchema.nullable(),
});
export type PlanChange = z.infer<typeof planChangeSchema>;
export const invoiceUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      ["sandbox.asaas.com", "www.asaas.com", "asaas.com"].includes(
        u.hostname
      ) &&
      !u.username &&
      !u.password &&
      !u.port
    );
  });
export const customerPaymentSchema = z.object({
  id: z.string(),
  planName: z.string(),
  status: z.string(),
  valueCents: z.number(),
  dueDate: z.string(),
  paymentDate: z.string().nullable(),
  billingType: z.string().nullable(),
  invoiceUrl: invoiceUrlSchema.nullable(),
});
export const billingStatusSchema = z.object({
  payments: z.array(customerPaymentSchema).default([]),
  planChange: planChangeSchema.nullable().optional(),
  enabled: z.boolean(),
  environment: z.enum(["sandbox", "production"]),
  subscription: z
    .object({
      id: z.string().uuid(),
      planCode: z.string(),
      planName: z.string(),
      effectivePlanName: z.string().optional(),
      priceCents: z.number(),
      status: z.string(),
      expiresAt: z.string(),
      currentPeriodEnd: z.string().nullable(),
      cancelledAt: z.string().nullable(),
      lastSyncAt: z.string().nullable(),
      nextDueDate: z.string().nullable().optional(),
      nextPriceCents: z.number().optional(),
      checkoutUrl: checkoutUrlSchema.nullable(),
      invoiceUrl: z
        .string()
        .url()
        .refine((value) => {
          const u = new URL(value);
          return (
            u.protocol === "https:" &&
            ["sandbox.asaas.com", "www.asaas.com", "asaas.com"].includes(
              u.hostname
            ) &&
            !u.username &&
            !u.password &&
            !u.port
          );
        })
        .nullable(),
    })
    .nullable(),
});
export type BillingStatus = z.infer<typeof billingStatusSchema>;
export const checkoutSchema = z.object({
  requestId: z.string().uuid(),
  planCode: z.enum(["ESSENTIAL", "PROFESSIONAL"]),
  acceptRecurring: z.literal(true),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
