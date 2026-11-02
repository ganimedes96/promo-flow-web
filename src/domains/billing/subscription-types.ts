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
export const billingStatusSchema = z.object({
  enabled: z.boolean(),
  environment: z.enum(["sandbox", "production"]),
  subscription: z
    .object({
      id: z.string().uuid(),
      planCode: z.string(),
      planName: z.string(),
      priceCents: z.number(),
      status: z.string(),
      expiresAt: z.string(),
      currentPeriodEnd: z.string().nullable(),
      cancelledAt: z.string().nullable(),
      lastSyncAt: z.string().nullable(),
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
