import { z } from "zod";
const mercadoLivreUrl = z
  .string()
  .max(2048)
  .url()
  .refine((value) => {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (host === "mercadolivre.com.br" || host.endsWith(".mercadolivre.com.br"))
    );
  }, "O produto deve ser um link HTTPS do Mercado Livre.");
const affiliateUrl = z
  .string()
  .max(2048)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value),
        host = url.hostname.toLowerCase();
      return (
        url.protocol === "https:" &&
        !url.username &&
        !url.password &&
        (host === "meli.la" ||
          host === "www.meli.la" ||
          host === "mercadolivre.com.br" ||
          host.endsWith(".mercadolivre.com.br"))
      );
    } catch {
      return false;
    }
  }, "Link de afiliado inválido.");
const imageUrl = z
  .string()
  .max(2048)
  .url()
  .refine((value) => {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (url.hostname === "mlstatic.com" ||
        url.hostname.endsWith(".mlstatic.com"))
    );
  });
const price = z
  .number()
  .positive()
  .max(9999999999.99)
  .multipleOf(0.01)
  .nullable()
  .optional();
export const extensionImportSchema = z.object({
  version: z.literal(1),
  capturedAt: z.string().datetime(),
  draft: z.object({
    sourceUrl: mercadoLivreUrl,
    title: z.string().max(200).default(""),
    description: z.string().max(2000).default(""),
    imageUrls: z.array(imageUrl).max(8).default([]),
    currentPrice: price,
    originalPrice: price,
    affiliateUrl: affiliateUrl.default(""),
    couponCode: z.string().max(100).default(""),
  }),
  warnings: z.array(z.string().max(300)).max(10).default([]),
});
export type ExtensionImport = z.infer<typeof extensionImportSchema>;
export type ImportedOfferDraft = ExtensionImport["draft"];
export const EXTENSION_DRAFT_KEY = "promoflow:extension-draft:v1";
