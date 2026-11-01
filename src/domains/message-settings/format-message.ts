import { MessageTemplate, MessageProduct } from "./types";
export function formatMessage(
  job: MessageProduct,
  template: MessageTemplate
): string {
  const money = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: job.currency,
    }).format(value);
  const current = Number(job.currentPrice),
    original = job.originalPrice === null ? null : Number(job.originalPrice);
  const originalCents =
    original !== null && Number.isFinite(original)
      ? Math.round(original * 100)
      : 0;
  const currentCents = Number.isFinite(current) ? Math.round(current * 100) : 0;
  const discount =
    currentCents > 0 && originalCents > currentCents
      ? Math.round(((originalCents - currentCents) / originalCents) * 10000) /
        100
      : null;
  const line = (text: string, max: number) =>
    text
      .replace(/[\r\n*]+/g, " ")
      .trim()
      .slice(0, max);
  const override = job.messageHeadline?.trim();
  const headline = override || (template.showHeadline ? template.headline : "");
  const parts: string[] = [];
  if (headline) parts.push(`*${line(headline, 80)}*`, "");
  if (template.showTitle) parts.push(`*${line(job.title, 180)}*`, "");
  if (template.showDescription && job.description.trim())
    parts.push(job.description.trim().slice(0, 300), "");
  if (template.showOriginalPrice && discount !== null && original !== null)
    parts.push(`De: ~${money(original)}~`);
  if (template.showCurrentPrice) parts.push(`💵 Por: *${money(current)}*`);
  if (template.showDiscount && discount !== null)
    parts.push(`🔥 ${discount.toLocaleString("pt-BR")}% de desconto`);
  if (template.showCoupon && job.couponCode?.trim())
    parts.push(`🎟️ Cupom: ${line(job.couponCode, 100)}`);
  if (template.showLink)
    parts.push(`🛒 Link: ${job.affiliateUrl || job.sourceUrl}`);
  if (template.showFooter && template.footer.trim())
    parts.push("", template.footer.trim());
  return parts
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
