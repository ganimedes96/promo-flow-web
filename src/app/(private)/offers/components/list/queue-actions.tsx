"use client";
import { FormSheet } from "@/components/form/containers/form-sheet";
import { UpdateOfferForm } from "../form/update";
import { ReviewSend } from "./review-send";
import { ActionDelete } from "@/components/action-delete";
import { deleteOffer } from "@/domains/offers/actions";
import { Button } from "@/components/ui/button";
import { scheduleOffer, cancelOfferSchedule } from "@/domains/offers/actions";
import { Offer } from "@/domains/offers/types";
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
  if (offer.status === "PUBLISHING" && offer.errorMessage)
    return <ReviewSend offer={offer} />;
  if (offer.status === "SCHEDULED")
    return (
      <div className="flex shrink-0 items-center gap-2">
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
    offer.status === "READY" ||
    offer.status === "CANCELLED" ||
    offer.status === "FAILED" ||
    offer.status === "PUBLISHED"
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
          {offer.status === "PUBLISHED"
            ? "Republicar"
            : offer.status === "FAILED"
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
      {["READY", "CANCELLED", "FAILED", "PUBLISHED"].includes(offer.status) && (
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
          offer.status === "PUBLISHING" || offer.status === "PROCESSING"
        }
        confirmTitle="Excluir oferta"
        confirmDescription="Excluir esta oferta e seu histórico? O agendamento será removido. Mensagens já enviadas ao WhatsApp permanecerão no grupo."
      />
    </>
  );
}
