import {
  ActivityHistory,
  SupportReference,
} from "@/components/feedback/activity-history";
import { offerDisplayStatus } from "@/domains/offers/display-status";
import { PromotionImage } from "@/app/(private)/promotions/components/promotion-image";
import { OfferQueueActions } from "./queue-actions";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@/components/ui/data-table";
import { Offer } from "@/domains/offers/types";
import { OfferStatus } from "@/domains/offers/offer-status";
import { formatDate } from "@/utils/date";
export {
  offerDisplayStatus,
  statusLabels,
  statusColors,
} from "@/domains/offers/display-status";
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
        {row.filterMatched && (
          <Badge variant="secondary">Corresponde ao filtro</Badge>
        )}
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
              {offerDisplayStatus(row).label}
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
    render: (_value, row) => (
      <div className="max-w-64 min-w-44 space-y-2">
        {(row.queueBlockedReason || row.errorMessage) && (
          <p
            className="text-warning line-clamp-2 whitespace-normal wrap-anywhere text-xs"
            title={
              row.queueBlockedReason ||
              row.activityEvents?.[0]?.message ||
              undefined
            }
          >
            {row.queueBlockedReason ||
              (row.activityEvents?.[0]?.message ??
                (row.status === OfferStatus.PUBLISHING
                  ? "Envio sem confirmação. Confira o grupo antes de reenviar."
                  : "Não foi possível concluir a operação. Consulte o histórico."))}
          </p>
        )}
        {row.errorMessage && row.activityEvents?.[0] && (
          <SupportReference event={row.activityEvents[0]} />
        )}
        <ActivityHistory resource={{ offerId: row.id }} />
      </div>
    ),
  },
  {
    key: "id",
    header: "Agendamento",
    render: (_value, row) => <OfferQueueActions offer={row} />,
  },
];
