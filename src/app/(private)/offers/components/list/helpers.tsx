import { OfferQueueActions } from "./queue-actions";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@/components/ui/data-table";
import { Offer } from "@/domains/offers/types";
import { formatDate } from "@/utils/date";
const statusLabels: Record<Offer["status"], string> = {
  PROCESSING: "Processando",
  READY: "Pronta",
  SCHEDULED: "Agendada",
  PUBLISHING: "Enviando",
  PUBLISHED: "Publicada",
  FAILED: "Falhou",
  CANCELLED: "Cancelada",
};
const statusColors: Record<Offer["status"], string> = {
  PROCESSING: "border-info/25 bg-info/10 text-info",
  READY: "border-primary/25 bg-primary/10 text-primary",
  SCHEDULED: "border-info/25 bg-info/10 text-info",
  PUBLISHING: "border-warning/25 bg-warning/10 text-warning",
  PUBLISHED: "border-success/25 bg-success/10 text-success",
  FAILED: "border-destructive/25 bg-destructive/10 text-destructive",
  CANCELLED: "border-border bg-muted text-muted-foreground",
};
export const columns: ColumnDef<Offer>[] = [
  {
    key: "title",
    header: "Oferta",
    className: "min-w-52 w-60",
    primary: true,
    render: (_value, row) => (
      <span
        className="block max-w-60 truncate font-medium"
        title={row.title || undefined}
      >
        {row.title || "—"}
      </span>
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
    render: (_value, row) => row.whatsappGroup?.name ?? "Grupo indisponível",
  },
  {
    key: "status",
    header: "Status",
    isStatus: true,
    render: (_value, row) => (
      <Badge
        variant="outline"
        className={
          row.queueBlockedReason
            ? statusColors.PUBLISHING
            : statusColors[row.status]
        }
      >
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
        {row.status === "PUBLISHING" && row.errorMessage
          ? "Conferir envio"
          : row.queueBlockedReason
            ? "Fila aguardando"
            : statusLabels[row.status]}
      </Badge>
    ),
  },
  {
    key: "scheduledAt",
    header: "Horário previsto",
    render: (_value, row) =>
      row.scheduledAt ? formatDate(row.scheduledAt, "dd/MM/yyyy HH:mm") : "—",
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
