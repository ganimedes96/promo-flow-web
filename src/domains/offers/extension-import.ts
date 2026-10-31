import { z } from "zod";
const matchesHost = (host: string, domain: string) =>
  host === domain || host.endsWith("." + domain);
function allowedHttps(value: string, hosts: readonly string[]): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      hosts.some((host) => matchesHost(url.hostname, host))
    );
  } catch {
    return false;
  }
}
const productHosts = ["mercadolivre.com.br", "amazon.com.br", "shopee.com.br"];
const productUrl = z
  .string()
  .max(2048)
  .url()
  .refine(
    (value) => allowedHttps(value, productHosts),
    "Use um link HTTPS do Mercado Livre, da Amazon Brasil ou da Shopee."
  );
const affiliateUrl = z
  .string()
  .max(2048)
  .refine(
    (value) =>
      !value ||
      allowedHttps(value, [
        ...productHosts,
        "meli.la",
        "amzn.to",
        "a.co",
        "shope.ee",
        "shp.ee",
      ]),
    "Link de afiliado inválido."
  );
const imageUrl = z
  .string()
  .max(2048)
  .url()
  .refine(
    (value) =>
      allowedHttps(value, [
        "mlstatic.com",
        "susercontent.com",
        "shopee.com.br",
        "media-amazon.com",
        "ssl-images-amazon.com",
        "images-amazon.com",
      ]),
    "Imagem da loja inválida."
  );
const price = z
  .number()
  .positive()
  .max(9999999999.99)
  .multipleOf(0.01)
  .nullable()
  .optional();
export const extensionImportSchema = z.object({
  accountId: z.string().uuid().optional(),
  target: z.enum(["offer", "central"]).default("offer"),
  version: z.literal(1),
  capturedAt: z.string().datetime(),
  draft: z.object({
    categoryId: z.string().max(50).optional(),
    sourceCategory: z.string().max(300).optional(),
    sourceUrl: productUrl,
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
