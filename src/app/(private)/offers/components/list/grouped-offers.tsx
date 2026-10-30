"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  scheduleOfferGroup,
  cancelOfferGroupSchedule,
} from "@/domains/offers/actions";
import {
  Offer,
  OfferGroup,
  OfferGroupActionResult,
} from "@/domains/offers/types";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { toast } from "@/lib/toast";
import { formatDate } from "@/utils/date";
import { columns, statusColors } from "./helpers";
import { OfferDeleteAction } from "./queue-actions";
const summaryLabels: Record<Offer["status"], [string, string]> = {
  PROCESSING: ["processando", "processando"],
  READY: ["pronta", "prontas"],
  SCHEDULED: ["na fila", "na fila"],
  PUBLISHING: ["em envio", "em envio"],
  PUBLISHED: ["publicada", "publicadas"],
  FAILED: ["com falha", "com falha"],
  CANCELLED: ["cancelada", "canceladas"],
};
function OfferGroupSummary({ destinations }: { destinations: Offer[] }) {
  const counts = new Map<Offer["status"], number>();
  destinations.forEach((offer) =>
    counts.set(offer.status, (counts.get(offer.status) ?? 0) + 1)
  );
  const review = destinations.filter(
    (offer) => offer.status === "PUBLISHING" && offer.errorMessage
  ).length;
  return (
    <div className="flex max-w-64 flex-wrap gap-1.5">
      {Array.from(counts.entries()).map(([status, count]) => (
        <Badge key={status} variant="outline" className={statusColors[status]}>
          {count} {summaryLabels[status][count === 1 ? 0 : 1]}
        </Badge>
      ))}
      {review > 0 && (
        <span className="text-warning text-xs">
          {review} envio(s) para conferir
        </span>
      )}
    </div>
  );
}
export const groupedColumns: ColumnDef<OfferGroup>[] = [
  {
    key: "product.title",
    header: "Oferta",
    primary: true,
    className: "min-w-52 w-64",
    render: (_value, group) => (
      <span
        className="block max-w-64 truncate font-medium"
        title={group.product.title || undefined}
      >
        {group.product.title || "Oferta"}
      </span>
    ),
  },
  {
    key: "product.currentPrice",
    header: "Preço",
    render: (_value, group) => {
      const prices = new Set(
        group.destinations.map(
          (offer) => `${offer.currency}:${offer.currentPrice}`
        )
      );
      if (prices.size > 1)
        return (
          <span className="text-muted-foreground text-xs">
            Valores por destino
          </span>
        );
      return group.product.currentPrice
        ? new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: group.product.currency,
          }).format(Number(group.product.currentPrice))
        : "—";
    },
  },
  {
    key: "destinations",
    header: "Grupos",
    render: (_value, group) =>
      `${group.destinations.length} destino${group.destinations.length === 1 ? "" : "s"}`,
  },
  {
    key: "product.status",
    header: "Resumo dos envios",
    isStatus: true,
    render: (_value, group) => (
      <OfferGroupSummary destinations={group.destinations} />
    ),
  },
  {
    key: "product.scheduledAt",
    header: "Próximo envio",
    render: (_value, group) => {
      const dates = group.destinations
        .flatMap((offer) =>
          offer.status === "SCHEDULED" && offer.scheduledAt
            ? [offer.scheduledAt]
            : []
        )
        .sort();
      return dates[0] ? formatDate(dates[0], "dd/MM/yyyy HH:mm") : "—";
    },
  },
];
const destinationColumns: ColumnDef<Offer>[] = columns
  .filter((column) => column.key !== "title")
  .map((column) =>
    column.key === "whatsappGroup"
      ? { ...column, primary: true, className: "min-w-44" }
      : column
  );
export function OfferDestinations({ group }: { group: OfferGroup }) {
  return (
    <section aria-label="Destinos da oferta" className="min-w-0 space-y-3">
      <div>
        <h3 className="text-sm font-semibold">Envios por grupo</h3>
        <p className="text-muted-foreground mt-1 text-xs">
          Cada destino mantém seu horário, histórico e ações. Edições e
          exclusões afetam apenas o destino escolhido.
        </p>
      </div>
      <DataTable
        columns={destinationColumns}
        data={group.destinations}
        actions={(offer) => <OfferDeleteAction offer={offer} />}
        loadingActionsCount={2}
        getRowKey={(offer) => offer.id}
        className="[&_table]:min-w-[1050px]"
      />
    </section>
  );
}
export function OfferGroupActions({ group }: { group: OfferGroup }) {
  const scheduleCount = group.destinations.filter((offer) =>
    ["READY", "FAILED", "CANCELLED"].includes(offer.status)
  ).length;
  const cancelCount = group.destinations.filter(
    (offer) => offer.status === "SCHEDULED"
  ).length;
  const schedule = useServerAction<OfferGroupActionResult, string>({
    mutationFn: scheduleOfferGroup,
    invalidateQueries: [queryKeys.offers.all],
    disableSuccessToast: true,
    onSuccess: (response) =>
      toast.success(
        `${response.data.updated} destino(s) agendado(s). ${response.data.unchanged} mantido(s).`
      ),
  });
  const cancel = useServerAction<OfferGroupActionResult, string>({
    mutationFn: cancelOfferGroupSchedule,
    invalidateQueries: [queryKeys.offers.all],
    disableSuccessToast: true,
    onSuccess: (response) =>
      toast.success(`${response.data.updated} agendamento(s) cancelado(s).`),
  });
  const busy = schedule.isPending || cancel.isPending;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            size="sm"
            disabled={busy || scheduleCount === 0}
            loading={schedule.isPending}
          >
            Agendar pendentes{scheduleCount > 0 ? ` (${scheduleCount})` : ""}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Agendar destinos pendentes?</AlertDialogTitle>
            <AlertDialogDescription>
              Os destinos prontos, cancelados ou com falha serão colocados na
              fila, respeitando 2 minutos por grupo. Com o publicador ativo, os
              envios poderão começar ao chegar a vez da oferta. Os envios já
              publicados permanecem no histórico; use Republicar no destino para
              reenviar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={() => schedule.mutate(group.id)}>
              Agendar {scheduleCount} destino(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy || cancelCount === 0}
            loading={cancel.isPending}
          >
            Cancelar pendentes{cancelCount > 0 ? ` (${cancelCount})` : ""}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Cancelar agendamentos pendentes?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Serão cancelados apenas os destinos que ainda estiverem agendados.
              Publicações concluídas ou já em envio permanecem no histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={() => cancel.mutate(group.id)}>
              Cancelar {cancelCount} agendamento(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
