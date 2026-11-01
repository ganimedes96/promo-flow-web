import { z } from "zod";
export const messageTemplateSchema = z.object({
  showImage: z.boolean(),
  showLinkPreview: z.boolean().default(false),
  watermarkEnabled: z.boolean().default(false),
  watermarkText: z.string().max(40).default(""),
  watermarkPosition: z
    .enum(["bottom-right", "bottom-left", "top-right", "top-left"])
    .default("bottom-right"),
  watermarkOpacity: z.number().int().min(20).max(100).default(70),
  showHeadline: z.boolean(),
  showTitle: z.boolean(),
  showDescription: z.boolean(),
  showCurrentPrice: z.boolean(),
  showOriginalPrice: z.boolean(),
  showDiscount: z.boolean(),
  showCoupon: z.boolean(),
  showLink: z.boolean(),
  showFooter: z.boolean(),
  headline: z.string().max(80),
  footer: z.string().max(200),
});
export type MessageTemplate = z.infer<typeof messageTemplateSchema>;
export const DEFAULT_MESSAGE_TEMPLATE: MessageTemplate = {
  showImage: true,
  showLinkPreview: false,
  watermarkEnabled: false,
  watermarkText: "",
  watermarkPosition: "bottom-right",
  watermarkOpacity: 70,
  showHeadline: false,
  showTitle: true,
  showDescription: false,
  showCurrentPrice: true,
  showOriginalPrice: true,
  showDiscount: true,
  showCoupon: true,
  showLink: true,
  showFooter: true,
  headline: "",
  footer: "❤️ Convide seus amigos\n👉 Link do grupo na descrição",
};
export interface MessageProduct {
  title: string;
  description: string;
  currentPrice: string;
  originalPrice: string | null;
  currency: string;
  couponCode?: string | null;
  affiliateUrl: string | null;
  sourceUrl: string;
  messageHeadline?: string | null;
  imageUrl?: string | null;
}
