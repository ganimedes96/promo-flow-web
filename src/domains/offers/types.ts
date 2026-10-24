import { z } from "zod";
const httpUrl = z
  .string()
  .trim()
  .max(2048)
  .url("Informe uma URL válida.")
  .refine((value) => /^https?:\/\//i.test(value), "Use um link http ou https.");
export const createOfferSchema = z
  .object({
    sourceUrl: httpUrl,
    affiliateUrl: httpUrl.optional(),
    couponCode: z
      .string()
      .trim()
      .max(100, "O cupom deve ter até 100 caracteres.")
      .optional(),
    imageUrl: httpUrl,
    title: z.string().trim().min(1, "Informe o título.").max(200),
    description: z.string().trim().min(1, "Informe a descrição.").max(2000),
    currentPrice: z
      .number()
      .positive("Informe o preço atual.")
      .max(9999999999.99)
      .multipleOf(0.01),
    originalPrice: z
      .number()
      .positive()
      .max(9999999999.99)
      .multipleOf(0.01)
      .optional(),
    whatsappGroupId: z.string().uuid("Selecione um grupo.").optional(),
  })
  .refine(
    (values) =>
      values.originalPrice === undefined ||
      values.originalPrice >= values.currentPrice,
    {
      message: "O preço original deve ser maior ou igual ao preço atual.",
      path: ["originalPrice"],
    }
  );
export const reviseOfferSchema = createOfferSchema.safeExtend({
  whatsappGroupId: z.string().uuid("Selecione um grupo."),
});
export type ReviseOffer = z.infer<typeof reviseOfferSchema>;
export type CreateOffer = z.infer<typeof createOfferSchema>;
export type OfferFormValues = Omit<
  CreateOffer,
  "currentPrice" | "affiliateUrl" | "whatsappGroupId"
> & { currentPrice?: number; affiliateUrl: string; whatsappGroupId: string };
export interface Offer {
  id: string;
  userId: string;
  title: string | null;
  description: string | null;
  sourceUrl: string;
  affiliateUrl: string | null;
  couponCode: string | null;
  imageUrl: string | null;
  currentPrice: string | null;
  originalPrice: string | null;
  discountPercentage: string | null;
  currency: string;
  createdAt: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  errorMessage: string | null;
  attempts: number;
  queueBlockedReason?: string | null;
  status:
    | "PROCESSING"
    | "READY"
    | "SCHEDULED"
    | "PUBLISHING"
    | "PUBLISHED"
    | "FAILED"
    | "CANCELLED";
  whatsappGroup: { id: string; name: string } | null;
}

export interface ProductPreview {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  currentPrice: number | null;
  warnings: string[];
}
