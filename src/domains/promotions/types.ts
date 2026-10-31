import { z } from "zod";
import { categorySelectionSchema } from "@/domains/categories/types";
export const promotionSchema = z
  .object({
    categoryId: categorySelectionSchema,
    sourceCategory: z.string().trim().max(300).optional(),
    title: z.string().trim().min(1, "Informe o título.").max(200),
    description: z.string().trim().min(1, "Informe a descrição.").max(2000),
    sourceUrl: z
      .string()
      .url("Link inválido.")
      .max(2048)
      .startsWith("https://"),
    imageUrl: z
      .string()
      .url("Imagem inválida.")
      .max(2048)
      .refine((value) => {
        try {
          const url = new URL(value);
          return (
            !url.username &&
            !url.password &&
            (url.protocol === "https:" ||
              (url.protocol === "http:" &&
                ["localhost", "127.0.0.1"].includes(url.hostname)))
          );
        } catch {
          return false;
        }
      }, "Use HTTPS para a imagem, ou HTTP somente em localhost."),
    currentPrice: z
      .number()
      .positive("Informe o preço atual.")
      .max(9999999999.99),
    originalPrice: z.number().positive().max(9999999999.99).optional(),
    couponCode: z.string().max(100).optional(),
    marketplace: z.enum(["MERCADO_LIVRE", "AMAZON", "SHOPEE"]),
    isPublished: z.boolean(),
    expiresAt: z.string().datetime().optional(),
  })
  .refine((v) => !v.originalPrice || v.originalPrice >= v.currentPrice, {
    message: "O preço original deve ser maior ou igual ao atual.",
    path: ["originalPrice"],
  });
export type PromotionInput = z.infer<typeof promotionSchema>;
export interface Promotion extends Omit<
  PromotionInput,
  | "imageUrl"
  | "currentPrice"
  | "originalPrice"
  | "expiresAt"
  | "couponCode"
  | "categoryId"
  | "sourceCategory"
> {
  categoryId?: string | null;
  sourceCategory?: string | null;
  category?: { id: string; name: string } | null;
  id: string;
  currentPrice: string | null;
  imageUrl: string | null;
  imports?: {
    id: string;
    chatTitle: string;
    rawText: string;
    warnings: string[];
  }[];
  originalPrice: string | null;
  couponCode: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}
