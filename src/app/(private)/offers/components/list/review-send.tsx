"use client";
import { useState } from "react";
import { CheckCircle2, SearchCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { reviewOffer } from "@/domains/offers/actions";
import { Offer } from "@/domains/offers/types";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
export function ReviewSend({ offer }: { offer: Offer }) {
  const [attempt, setAttempt] = useState<number | null>(null);
  const review = useServerAction<Offer, Parameters<typeof reviewOffer>[0]>({
    mutationFn: reviewOffer,
    invalidateQueries: [queryKeys.offers.all],
    successMessage: "Conferência registrada. A fila do grupo foi liberada.",
    onSuccess: () => setAttempt(null),
  });
  const submit = (outcome: "RECEIVED" | "NOT_SENT") => {
    if (attempt !== null)
      review.mutate({ offerId: offer.id, attempt, outcome });
  };
  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="border-warning/30 text-warning"
        onClick={() => setAttempt(offer.attempts)}
      >
        <SearchCheck className="size-4" aria-hidden="true" />
        Conferir envio
      </Button>
      <Dialog
        open={attempt !== null}
        onOpenChange={(open) => {
          if (!open && !review.isPending) setAttempt(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Esta oferta chegou ao grupo?</DialogTitle>
            <DialogDescription>
              Confira no WhatsApp a oferta “{offer.title}”, no grupo{" "}
              {offer.whatsappGroup?.name || "de destino"}, antes de responder. O
              worker não conseguiu confirmar essa tentativa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              <strong>Chegou ao grupo:</strong> marca a oferta como publicada. O
              horário da conferência será usado para respeitar o intervalo entre
              publicações.
            </p>
            <p>
              <strong>Não foi enviado:</strong> marca a tentativa como falha e
              libera as próximas ofertas. Para reenviar esta oferta, use Tentar
              novamente depois.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:flex-wrap">
            <Button
              type="button"
              variant="ghost"
              disabled={review.isPending}
              onClick={() => setAttempt(null)}
            >
              Voltar
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={review.isPending}
              onClick={() => submit("NOT_SENT")}
            >
              <XCircle className="size-4" aria-hidden="true" />
              Não foi enviado
            </Button>
            <Button
              type="button"
              disabled={review.isPending}
              loading={review.isPending}
              onClick={() => submit("RECEIVED")}
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Chegou ao grupo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
