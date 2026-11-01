import { z } from "zod";
export const marketplaces = ["MERCADO_LIVRE", "SHOPEE", "AMAZON"] as const;
export type Marketplace = (typeof marketplaces)[number];
export const storeNames: Record<Marketplace, string> = {
  MERCADO_LIVRE: "Mercado Livre",
  SHOPEE: "Shopee",
  AMAZON: "Amazon",
};
export const storeInputSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome.").max(80),
  affiliateProfile: z
    .string()
    .trim()
    .max(80)
    .regex(
      /^[a-zA-Z0-9_.-]*$/,
      "Use apenas letras, números, ponto, hífen ou sublinhado."
    ),
  campaignTag: z
    .string()
    .trim()
    .max(100)
    .regex(/^[^\p{Cc}]*$/u, "Etiqueta inválida."),
  linkBuilderUrl: z
    .string()
    .trim()
    .max(2048)
    .refine(
      (value) =>
        !value ||
        (() => {
          try {
            const url = new URL(value);
            return (
              url.protocol === "https:" &&
              !url.username &&
              !url.password &&
              !url.port
            );
          } catch {
            return false;
          }
        })(),
      "Informe uma URL HTTPS válida."
    ),
  isDefault: z.boolean(),
});
export type StoreInput = z.infer<typeof storeInputSchema>;
export const storeSchema = storeInputSchema.extend({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  marketplace: z.enum(marketplaces),
  affiliateProfile: z.string().nullable(),
  campaignTag: z.string().nullable(),
  linkBuilderUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type AffiliateStore = z.infer<typeof storeSchema>;
