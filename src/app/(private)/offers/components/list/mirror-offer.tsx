"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useForm, useWatch } from "react-hook-form";
import { Users } from "lucide-react";
import { Offer } from "@/domains/offers/types";
import { getWhatsAppGroups } from "@/domains/whatsapp/client";
import {
  applyMirrorAffiliate,
  retryMirrorConversion,
  assignMirrorDestination,
} from "@/domains/mirroring/actions";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
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
export function MirrorOfferAction({ offer }: { offer: Offer }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Users className="size-3" />
        {offer.mirrorAffiliateStatus === "APPLIED"
          ? "Vincular grupo"
          : "Preparar link"}
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto p-6 sm:max-w-xl">
          <SheetHeader className="px-0">
            <SheetTitle>Preparar oferta capturada</SheetTitle>
            <SheetDescription>
              {offer.title}. O grupo de origem não é um destino. Nada será
              enviado ao vincular.
            </SheetDescription>
          </SheetHeader>
          {open && (
            <MirrorDestinationForm
              key={offer.id + offer.mirrorAffiliateStatus}
              offer={offer}
              onDone={() => setOpen(false)}
            />
          )}
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
  const groups = useQuery({
    queryKey: [...queryKeys.whatsapp.groupsFor(), session?.user.id],
    queryFn: () => getWhatsAppGroups(),
    enabled: !!session?.user.id,
    retry: false,
  });
  const form = useForm({
    defaultValues: {
      affiliateUrl: offer.affiliateUrl ?? "",
      confirmed: false,
      groupId: "",
    },
  });
  const values = useWatch({ control: form.control });
  const affiliate = useServerAction({
    mutationFn: applyMirrorAffiliate,
    invalidateQueries: [queryKeys.offers.all],
    successMessage: "Link próprio aplicado.",
  });
  const assign = useServerAction({
    mutationFn: assignMirrorDestination,
    invalidateQueries: [queryKeys.offers.all],
    successMessage: "Grupo vinculado. Revise os dados antes de agendar.",
    onSuccess: onDone,
  });
  const applied = offer.mirrorAffiliateStatus === "APPLIED";
  const retry = useServerAction({
    mutationFn: retryMirrorConversion,
    invalidateQueries: [queryKeys.offers.all],
    successMessage:
      "Conversão liberada para a extensão. Mantenha o Chrome aberto.",
  });

  return (
    <div className="mt-6 space-y-5">
      {applied ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
          <p className="font-semibold">Seu link de afiliado foi aplicado</p>
          <p className="mt-2 truncate text-xs">{offer.affiliateUrl}</p>
        </div>
      ) : (
        <div className="bg-primary/5 space-y-4 rounded-xl border p-4">
          <p className="text-sm font-semibold">
            {offer.mirrorConversionStatus === "RECONNECT"
              ? "Reconectar Mercado Livre"
              : offer.mirrorConversionStatus === "CONVERTING"
                ? "A extensão está convertendo seu link"
                : offer.mirrorConversionStatus === "STORE_REQUIRED"
                  ? "Configure sua loja"
                  : offer.mirrorConversionStatus === "FAILED"
                    ? "A conversão precisa de atenção"
                    : "Aguardando seu link de afiliado"}
          </p>
          <p className="text-muted-foreground text-xs">
            A extensão atualizada processa Mercado Livre com o site fechado,
            enquanto o Chrome está aberto e conectado ao PromoFlow. Se a conta
            do Mercado Livre expirou, entre novamente na loja. Amazon e Shopee
            continuam com link manual.
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
                  Tentar conversão novamente
                </Button>
                {offer.mirrorConversionStatus === "RECONNECT" && (
                  <Button asChild type="button" size="sm" variant="outline">
                    <a
                      href="https://www.mercadolivre.com.br/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Entrar no Mercado Livre
                    </a>
                  </Button>
                )}
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
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((data) =>
          assign.mutate({ id: offer.id, groupId: data.groupId })
        )}
      >
        <ControlledCombobox
          control={form.control}
          name="groupId"
          label="Grupo favorito de destino"
          placeholder={
            groups.isPending
              ? "Carregando grupos..."
              : "Escolha onde enviar depois"
          }
          options={(groups.data ?? [])
            .filter((group) => group.isFavorite)
            .map((group) => ({
              id: group.id,
              name: group.name + " · +" + group.accountPhone,
            }))}
          disabled={
            !applied || assign.isPending || groups.isPending || groups.isError
          }
        />
        {groups.error && (
          <p className="text-destructive text-xs">
            Não foi possível carregar seus grupos.{" "}
            <button
              type="button"
              className="underline"
              onClick={() => void groups.refetch()}
            >
              Tentar novamente
            </button>
          </p>
        )}
        <Button
          type="submit"
          disabled={!applied || assign.isPending || !values.groupId}
        >
          Vincular grupo, sem agendar
        </Button>
      </form>
      {(affiliate.error || assign.error) && (
        <p role="alert" className="text-destructive text-sm">
          {affiliate.error?.message || assign.error?.message}
        </p>
      )}
      <p className="text-muted-foreground text-xs">
        Depois de vincular, use Editar para completar imagem, preço ou outros
        dados ausentes. O envio só começa quando você agendar.
      </p>
    </div>
  );
}
