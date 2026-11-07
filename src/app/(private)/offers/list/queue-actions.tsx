"use client";
import { ExternalLink } from "lucide-react";
import { MirrorOfferAction } from "./mirror-offer";
import { FormSheet } from "@/components/form/containers/form-sheet";
import { UpdateOfferForm } from "../update/update";
import { ReviewSend } from "./review-send";
import { ActionDelete } from "@/components/action-delete";
import { deleteOffer } from "@/domains/offers/actions";
import { Button } from "@/components/ui/button";
import { scheduleOffer, cancelOfferSchedule } from "@/domains/offers/actions";
import { Offer } from "@/domains/offers/types";
import { OfferStatus } from "@/domains/offers/offer-status";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";

export function OfferQueueActions({ offer }: { offer: Offer }) {
  const schedule = useServerAction<Offer, string>({
    mutationFn: scheduleOffer,
    invalidateQueries: [queryKeys.offers.all],
    successMessage: "Oferta agendada. Confira o horário previsto na lista.",
  });
  const cancel = useServerAction<Offer, string>({
    mutationFn: cancelOfferSchedule,
    invalidateQueries: [queryKeys.offers.all],
    successMessage: "Agendamento cancelado.",
  });
  const busy = schedule.isPending || cancel.isPending;
  if (offer.mirrorAffiliateStatus && !offer.whatsappGroup) {
    const awaitingLink = offer.mirrorAffiliateStatus === "PENDING" && !offer.mirrorConversionStatus;
    let productUrl: string | null = null;
    try {
      const url = new URL(offer.sourceUrl);
      if (url.protocol === "https:" && !url.username && !url.password) productUrl = url.href;
    } catch { /* Keep other actions available when the source URL is invalid. */ }
    return (
      <div className="flex flex-wrap items-center gap-2">
        {awaitingLink && productUrl && (
          <Button asChild variant="outline" size="sm">
            <a href={productUrl} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>
              <ExternalLink className="size-3.5" />
              Abrir produto
            </a>
          </Button>
        )}
        <MirrorOfferAction offer={offer} />
      </div>
    );
  }
  if (offer.status === OfferStatus.PUBLISHING && offer.errorMessage)
    return <ReviewSend offer={offer} />;
  if (offer.status === OfferStatus.SCHEDULED)
    return (
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {offer.queueBlockedBy && (
          <ReviewSend
            offer={offer.queueBlockedBy}
            label="Conferir envio anterior"
          />
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          loading={cancel.isPending}
          onClick={() => cancel.mutate(offer.id)}
        >
          Cancelar agendamento
        </Button>
      </div>
    );
  if (
    offer.status === OfferStatus.READY ||
    offer.status === OfferStatus.CANCELLED ||
    offer.status === OfferStatus.FAILED ||
    offer.status === OfferStatus.PUBLISHED
  )
    return (
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={busy}
          loading={schedule.isPending}
          onClick={() => schedule.mutate(offer.id)}
        >
          {offer.status === OfferStatus.PUBLISHED
            ? "Republicar"
            : offer.status === OfferStatus.FAILED
              ? "Tentar novamente"
              : "Enviar"}
        </Button>
      </div>
    );
  return <span className="text-muted-foreground">—</span>;
}

export function OfferDeleteAction({ offer }: { offer: Offer }) {
  return (
    <>
      {new Set<OfferStatus>([
        OfferStatus.READY,
        OfferStatus.CANCELLED,
        OfferStatus.FAILED,
        OfferStatus.PUBLISHED,
      ]).has(offer.status) &&
        (!offer.mirrorAffiliateStatus || !!offer.whatsappGroup) && (
          <FormSheet
            title="Editar oferta"
            description="Revise todos os dados e o grupo de destino antes da próxima publicação."
            formComponent={UpdateOfferForm}
            formProps={{ offer }}
            isEdit
            className="w-full gap-6 overflow-y-auto px-6 pb-6 data-[side=right]:sm:max-w-4xl"
          />
        )}
      <ActionDelete
        name={offer.title || "Oferta"}
        onDelete={() => deleteOffer(offer.id)}
        invalidateQueries={[queryKeys.offers.all]}
        disabled={
          offer.status === OfferStatus.PUBLISHING || offer.status === OfferStatus.PROCESSING
        }
        confirmTitle="Excluir oferta"
        confirmDescription="Excluir esta oferta e seu histórico? O agendamento será removido. Mensagens já enviadas ao WhatsApp permanecerão no grupo."
      />
    </>
  );
}
