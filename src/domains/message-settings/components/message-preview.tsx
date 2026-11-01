"use client";
import Link from "next/link";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PromotionImage } from "@/app/(private)/promotions/components/promotion-image";
import { MessageTemplate, MessageProduct } from "../types";
import { formatMessage } from "../format-message";
const example: MessageProduct = {
  title: "Fone Bluetooth sem fio",
  description: "Som de qualidade para acompanhar o seu dia.",
  currentPrice: "149.90",
  originalPrice: "199.90",
  currency: "BRL",
  couponCode: "PROMO10",
  affiliateUrl: "https://meli.la/seu-link",
  sourceUrl: "https://www.mercadolivre.com.br",
  messageHeadline: null,
};
function formattedLine(line: string) {
  return line
    .split(/(\*[^*]+\*|~[^~]+~)/g)
    .map((part, index) =>
      part.startsWith("*") && part.endsWith("*") ? (
        <strong key={index}>{part.slice(1, -1)}</strong>
      ) : part.startsWith("~") && part.endsWith("~") ? (
        <del key={index}>{part.slice(1, -1)}</del>
      ) : (
        <span key={index}>{part}</span>
      )
    );
}
export function MessagePreview({
  template,
  product,
  showSettingsLink = false,
}: {
  template: MessageTemplate;
  product?: MessageProduct;
  showSettingsLink?: boolean;
}) {
  const item = product ?? example;
  const text = formatMessage(item, template);
  return (
    <Card className="border-primary/20 gap-0 overflow-hidden py-0">
      <CardHeader className="bg-primary text-primary-foreground flex-row items-center justify-between border-b px-4 py-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <MessageCircle className="size-4" />
          Mensagem no WhatsApp
        </CardTitle>
        {!product && <Badge variant="secondary">Exemplo</Badge>}
      </CardHeader>
      <CardContent className="bg-primary/5 space-y-3 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] bg-size-[16px_16px] p-4">
        <div className="bg-card border-primary/20 motion-safe:animate-in motion-safe:fade-in space-y-3 rounded-2xl rounded-tl-sm border p-3 shadow-sm">
          {template.showImage && (
            <div className="relative overflow-hidden rounded-xl">
              {item.imageUrl ? (
                <PromotionImage
                  src={item.imageUrl}
                  title={item.title}
                  className="h-44 rounded-xl"
                />
              ) : (
                <div className="bg-primary/10 text-primary flex h-36 flex-col items-center justify-center gap-2 rounded-xl">
                  <ShoppingBag className="size-12" />
                  <span className="text-xs">Imagem do produto</span>
                </div>
              )}
              {template.watermarkEnabled && template.watermarkText.trim() && (
                <span
                  className={`pointer-events-none absolute max-w-[90%] truncate rounded-md bg-[#132d24] px-2 py-1 text-xs font-bold text-white ${template.watermarkPosition.startsWith("top") ? "top-2" : "bottom-2"} ${template.watermarkPosition.endsWith("left") ? "left-2" : "right-2"}`}
                  style={{ opacity: template.watermarkOpacity / 100 }}
                >
                  {template.watermarkText}
                </span>
              )}
            </div>
          )}
          {!template.showImage &&
            template.showLinkPreview &&
            template.showLink && (
              <div className="bg-primary/5 overflow-hidden rounded-xl border">
                <div className="text-primary bg-primary/10 flex h-24 items-center justify-center">
                  <ShoppingBag className="size-10" />
                </div>
                <div className="space-y-1 p-3">
                  <p className="text-xs font-semibold">{item.title}</p>
                  <p className="text-muted-foreground truncate text-[10px]">
                    {item.affiliateUrl || item.sourceUrl}
                  </p>
                  <p className="text-muted-foreground text-[10px]">
                    Prévia ilustrativa · gerada pela loja no WhatsApp
                  </p>
                </div>
              </div>
            )}
          <div className="space-y-1 text-sm wrap-break-word">
            {text ? (
              text.split("\n").map((line, index) => (
                <p key={index} className={line ? "whitespace-pre-wrap" : "h-2"}>
                  {formattedLine(line)}
                </p>
              ))
            ) : (
              <p className="text-muted-foreground text-xs">
                {template.showImage
                  ? "Somente a imagem será enviada."
                  : "Selecione conteúdo para a mensagem."}
              </p>
            )}
          </div>
          <span className="text-muted-foreground block text-right text-[10px]">
            Prévia · não envia mensagens
          </span>
        </div>
        <p
          className={
            text.length > 1000
              ? "text-destructive text-xs"
              : "text-muted-foreground text-xs"
          }
        >
          {text.length}/1000 caracteres
          {text.length > 1000
            ? " — reduza os textos ou use um link mais curto."
            : ""}
        </p>
        {showSettingsLink && (
          <Link
            href="/message-settings"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-xs font-medium underline underline-offset-4"
          >
            Personalizar padrão da minha conta
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
