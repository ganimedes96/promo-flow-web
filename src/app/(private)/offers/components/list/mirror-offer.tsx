"use client";
import { isShopeeLink } from "@/domains/offers/affiliate-links";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  requestMirrorConversion,
  type ConversionRetryFeedback,
} from "@/domains/mirroring/extension";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { Users, Check, Link2, ArrowRight, Sparkles } from "lucide-react";
import { Offer } from "@/domains/offers/types";
import {
  applyMirrorAffiliate,
  retryMirrorConversion,
} from "@/domains/mirroring/actions";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledSingleCheckbox } from "@/components/form/controllers/controlled-single-checkbox";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { MirrorDestinations } from "./mirror-destinations";
import { PromotionImage } from "@/app/(private)/promotions/components/promotion-image";
import { Badge } from "@/components/ui/badge";

export function MirrorOfferAction({ offer }: { offer: Offer }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Users className="size-3" />
        {offer.mirrorAffiliateStatus === "APPLIED"
          ? "Vincular grupos"
          : "Preparar link"}
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-3xl">
          <SheetHeader className="bg-primary/5 border-b p-6">
            <span className="text-primary mb-1 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="size-4 motion-safe:animate-pulse" />
              Sua oferta, seus destinos
            </span>
            <SheetTitle className="text-xl">
              Escolha o próximo destino do seu achado
            </SheetTitle>
            <SheetDescription>
              Aplique seu link e organize os grupos que vão receber esta oferta.
              Você controla o momento do envio.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
            {open && (
              <MirrorDestinationForm
                key={offer.id}
                offer={offer}
                onDone={() => setOpen(false)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
function MirrorDestinationForm({
  offer,
  onDone,
}: {
  offer: Offer;
  onDone: () => void;
}) {
  const { data: session } = useSession();
  const [retryFeedback, setRetryFeedback] =
    useState<ConversionRetryFeedback | null>(null);
  const form = useForm({
    defaultValues: {
      affiliateUrl: offer.affiliateUrl ?? "",
      confirmed: false,
    },
  });
  const values = useWatch({ control: form.control });
  const affiliate = useServerAction({
    mutationFn: applyMirrorAffiliate,
    invalidateQueries: [queryKeys.offers.all],
    successMessage: "Link próprio aplicado.",
  });
  const applied = offer.mirrorAffiliateStatus === "APPLIED";
  const retry = useServerAction({
    mutationFn: retryMirrorConversion,
    invalidateQueries: [queryKeys.offers.all],
    disableSuccessToast: true,
    onMutate: () =>
      setRetryFeedback({
        ok: true,
        message: "Solicitando nova tentativa à extensão…",
      }),
    onSuccess: async (_response, offerId) =>
      setRetryFeedback(
        await requestMirrorConversion(offerId, session?.user.id)
      ),
    onError: (error) => setRetryFeedback({ ok: false, message: error.message }),
  });

  return (
    <div className="mt-6 space-y-5">
      <div className="bg-card motion-safe:animate-in motion-safe:fade-in flex items-center gap-4 rounded-2xl border p-4 motion-safe:duration-300">
        <PromotionImage
          src={offer.imageUrl}
          title={offer.title || "Oferta"}
          compact
          className="size-16 rounded-xl"
        />
        <div className="min-w-0">
          <Badge variant="outline" className="mb-1 text-[10px]">
            Oferta capturada
          </Badge>
          <p className="line-clamp-2 text-sm font-semibold">
            {offer.title || "Revise o nome da oferta"}
          </p>
        </div>
      </div>
      <div className="bg-muted/40 flex items-center justify-center gap-3 rounded-xl px-3 py-3 text-xs">
        <span className="text-primary flex items-center gap-2 font-medium">
          {applied ? (
            <Check className="size-4" />
          ) : (
            <Link2 className="size-4" />
          )}
          Seu link
        </span>
        <ArrowRight className="text-muted-foreground size-4" />
        <span className="flex items-center gap-2 font-medium">
          <Users className="size-4" />
          Seus grupos
        </span>
      </div>
      {applied ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <Check className="size-4" />
            Seu link de afiliado está pronto
          </p>
          <p className="mt-2 truncate text-xs">{offer.affiliateUrl}</p>
        </div>
      ) : (
        <div className="bg-primary/5 space-y-4 rounded-xl border p-4">
          <p className="text-sm font-semibold">
            {offer.mirrorConversionStatus === "RECONNECT"
              ? isShopeeLink(offer.sourceUrl)
                ? "Reconectar Shopee"
                : "Reconectar Mercado Livre"
              : offer.mirrorConversionStatus === "CONVERTING"
                ? "A extensão está convertendo seu link"
                : offer.mirrorConversionStatus === "STORE_REQUIRED"
                  ? "Configure sua loja"
                  : offer.mirrorConversionStatus === "FAILED"
                    ? "A conversão precisa de atenção"
                    : "Aguardando seu link de afiliado"}
          </p>
          <p className="text-muted-foreground text-xs">
            A extensão atualizada processa Mercado Livre e Shopee com o site
            fechado, enquanto o Chrome está aberto e conectado ao PromoFlow. Se
            a conta da loja expirou, entre novamente na loja. Amazon continua
            com link manual.
          </p>
          {offer.mirrorConversionStatus &&
            offer.mirrorConversionStatus !== "CONVERTING" && (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={retry.isPending}
                  onClick={() => retry.mutate(offer.id)}
                >
                  {retry.isPending
                    ? "Solicitando conversão…"
                    : "Tentar conversão novamente"}
                </Button>
                {offer.mirrorConversionStatus === "RECONNECT" && (
                  <Button asChild type="button" size="sm" variant="outline">
                    <a
                      href={
                        isShopeeLink(offer.sourceUrl)
                          ? "https://affiliate.shopee.com.br/offer/custom_link"
                          : "https://www.mercadolivre.com.br/"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Entrar na loja
                    </a>
                  </Button>
                )}
              </div>
            )}
          {offer.mirrorConversionStatus === "STORE_REQUIRED" && (
            <Button asChild size="sm" variant="outline">
              <Link href="/stores">Configurar minha loja</Link>
            </Button>
          )}
          {retryFeedback && (
            <div
              role="status"
              aria-live="polite"
              className={`rounded-xl border p-3 text-sm ${retryFeedback.ok ? "border-primary/30 bg-primary/10" : "border-destructive/30 bg-destructive/5 text-destructive"}`}
            >
              {retryFeedback.message}
            </div>
          )}
          {retry.error && (
            <p role="alert" className="text-destructive text-xs">
              {retry.error.message}
            </p>
          )}
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((data) =>
              affiliate.mutate({
                id: offer.id,
                affiliateUrl: data.affiliateUrl,
                confirmed: data.confirmed,
              })
            )}
          >
            <ControlledInput
              control={form.control}
              name="affiliateUrl"
              label="Seu link de afiliado"
              placeholder="https://..."
              disabled={affiliate.isPending}
            />
            <ControlledSingleCheckbox
              control={form.control}
              name="confirmed"
              label="Confirmei que este link foi gerado pela minha conta de afiliado"
              disabled={affiliate.isPending}
            />
            <Button
              type="submit"
              disabled={
                affiliate.isPending || !values.confirmed || !values.affiliateUrl
              }
            >
              Aplicar meu link
            </Button>
          </form>
        </div>
      )}
      <MirrorDestinations offer={offer} onDone={onDone} />
      {affiliate.error && (
        <p role="alert" className="text-destructive text-sm">
          {affiliate.error.message}
        </p>
      )}
      <p className="text-muted-foreground text-xs">
        Depois de vincular, use Editar para completar imagem, preço ou outros
        dados ausentes. O envio só começa quando você agendar.
      </p>
    </div>
  );
}
