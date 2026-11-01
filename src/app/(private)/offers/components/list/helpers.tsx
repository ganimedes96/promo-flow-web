import { PromotionImage } from "@/app/(private)/promotions/components/promotion-image";
import { OfferQueueActions } from "./queue-actions";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@/components/ui/data-table";
import { Offer } from "@/domains/offers/types";
import { formatDate } from "@/utils/date";
export const statusLabels: Record<Offer["status"], string> = {
  PROCESSING: "Processando",
  READY: "Pronta",
  SCHEDULED: "Agendada",
  PUBLISHING: "Enviando",
  PUBLISHED: "Publicada",
  FAILED: "Falhou",
  CANCELLED: "Cancelada",
};
export const statusColors: Record<Offer["status"], string> = {
  PROCESSING: "border-violet-700 bg-violet-700 text-white font-semibold",
  READY: "border-cyan-800 bg-cyan-800 text-white font-semibold",
  SCHEDULED: "border-blue-700 bg-blue-700 text-white font-semibold",
  PUBLISHING: "border-amber-300 bg-amber-300 text-amber-950 font-semibold",
  PUBLISHED: "border-emerald-700 bg-emerald-700 text-white font-semibold",
  FAILED: "border-rose-700 bg-rose-700 text-white font-semibold",
  CANCELLED: "border-orange-700 bg-orange-700 text-white font-semibold",
};
export function offerDisplayStatus(offer: Offer): {
  label: string;
  color: string;
} {
  if (offer.status === "PUBLISHING" && offer.errorMessage)
    return { label: "Sem confirmação", color: statusColors.PUBLISHING };
  if (offer.status === "SCHEDULED" && offer.queueBlockedReason) {
    const labels: Partial<
      Record<NonNullable<Offer["queueBlockedCode"]>, string>
    > = {
      PAUSED: "Pausada",
      WAITING_CONNECTION: "Aguardando conexão",
      GROUP_UNAVAILABLE: "Grupo indisponível",
      WORKER_OFFLINE: "Publicador offline",
      PUBLISHING_DISABLED: "Envios desativados",
      PREVIOUS_UNCONFIRMED: "Aguardando conferência",
      PREVIOUS_SENDING: "Aguardando envio anterior",
    };
    return {
      label:
        (offer.queueBlockedCode && labels[offer.queueBlockedCode]) ||
        "Fila aguardando",
      color:
        offer.queueBlockedCode === "PAUSED"
          ? statusColors.CANCELLED
          : statusColors.PUBLISHING,
    };
  }
  return {
    label: statusLabels[offer.status],
    color: statusColors[offer.status],
  };
}
export const columns: ColumnDef<Offer>[] = [
  {
    key: "title",
    header: "Oferta",
    className: "min-w-52 w-60",
    primary: true,
    render: (_value, row) => (
      <div className="flex min-w-0 items-center gap-3">
        <PromotionImage
          src={row.imageUrl}
          title={row.title || "Oferta"}
          compact
          className="size-11 rounded-lg"
        />
        <span
          className="block max-w-44 min-w-0 truncate font-medium"
          title={row.title || undefined}
        >
          {row.title || "—"}
        </span>
      </div>
    ),
  },
  {
    key: "currentPrice",
    header: "Preço",
    render: (_value, row) =>
      row.currentPrice
        ? new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: row.currency,
          }).format(Number(row.currentPrice))
        : "—",
  },
  {
    key: "whatsappGroup",
    header: "Grupo",
    render: (_value, row) => (
      <div className="space-y-1">
        <p>{row.whatsappGroup?.name ?? "Grupo indisponível"}</p>
        {row.connection && (
          <p className="text-muted-foreground text-xs">
            {row.connection.name}
            {row.connection.connectedPhone
              ? " · +" + row.connection.connectedPhone
              : ""}
          </p>
        )}
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    isStatus: true,
    render: (_value, row) => {
      const display = offerDisplayStatus(row);
      return (
        <Badge
          variant="outline"
          className={display.color}
          title={row.queueBlockedReason || row.errorMessage || undefined}
        >
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-current"
          />
          {display.label}
        </Badge>
      );
    },
  },
  {
    key: "scheduledAt",
    header: "Horário previsto",
    render: (_value, row) =>
      row.scheduledAt ? (
        <div className="space-y-1">
          <span>{formatDate(row.scheduledAt, "dd/MM/yyyy HH:mm")}</span>
          {row.queueBlockedReason && (
            <small className="text-muted-foreground block text-xs">
              Aguardando liberação da fila
            </small>
          )}
        </div>
      ) : (
        "—"
      ),
  },
  {
    key: "publishedAt",
    header: "Publicado em",
    render: (_value, row) =>
      row.publishedAt ? formatDate(row.publishedAt, "dd/MM/yyyy HH:mm") : "—",
  },
  {
    key: "errorMessage",
    header: "Observação",
    render: (_value, row) =>
      row.queueBlockedReason ? (
        <span
          className="text-warning block max-w-60 truncate text-xs"
          title={row.queueBlockedReason}
        >
          {row.queueBlockedReason}
        </span>
      ) : row.errorMessage ? (
        <span
          className="text-destructive block max-w-60 truncate text-xs"
          title={row.errorMessage}
        >
          {row.errorMessage}
        </span>
      ) : (
        "—"
      ),
  },
  {
    key: "id",
    header: "Agendamento",
    render: (_value, row) => <OfferQueueActions offer={row} />,
  },
];
