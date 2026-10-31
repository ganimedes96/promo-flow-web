import { z } from "zod";
const httpUrl = z
  .string()
  .trim()
  .max(2048)
  .url("Informe uma URL válida.")
  .refine((value) => /^https?:\/\//i.test(value), "Use um link http ou https.");
const offerProductSchema = z.object({
  connectionId: z.string().uuid("Selecione uma conexão.").optional(),
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
});
const validPrice = (values: { originalPrice?: number; currentPrice: number }) =>
  values.originalPrice === undefined ||
  values.originalPrice >= values.currentPrice;
const priceError = {
  message: "O preço original deve ser maior ou igual ao preço atual.",
  path: ["originalPrice"],
};
export const createOfferSchema = offerProductSchema
  .extend({
    whatsappGroupId: z.string().uuid("Selecione um grupo.").optional(),
  })
  .refine(validPrice, priceError);
export const createOffersSchema = offerProductSchema
  .extend({
    whatsappGroupIds: z
      .array(z.string().uuid("Selecione grupos válidos."))
      .min(1, "Selecione pelo menos um grupo favorito.")
      .max(20, "Selecione no máximo 20 grupos por cadastro.")
      .refine(
        (ids) => new Set(ids).size === ids.length,
        "Não repita grupos na seleção."
      ),
    sourcePromotionId: z.string().uuid().optional(),
    addToQueue: z.boolean(),
  })
  .refine(validPrice, priceError);
export const reviseOfferSchema = createOfferSchema.safeExtend({
  whatsappGroupId: z.string().uuid("Selecione um grupo."),
});
export type ReviseOffer = z.infer<typeof reviseOfferSchema>;
export type CreateOffer = z.infer<typeof createOfferSchema>;
export type CreateOffers = z.infer<typeof createOffersSchema>;
export type OfferFormValues = Omit<
  CreateOffer,
  "currentPrice" | "affiliateUrl" | "whatsappGroupId"
> & {
  currentPrice?: number;
  affiliateUrl: string;
  whatsappGroupId: string;
  whatsappGroupIds: string[];
  addToQueue: boolean;
};
export interface Offer {
  connectionId?: string | null;
  connection?: {
    id: string;
    name: string;
    connectedPhone: string | null;
  } | null;
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
  originalPrice?: number | null;
  imageUrls?: string[];
  sourceUrl?: string | null;
  warnings: string[];
}

export interface OfferGroup {
  id: string;
  product: Offer;
  destinations: Offer[];
}
export interface OfferGroupActionResult {
  updated: number;
  unchanged: number;
}
