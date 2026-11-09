"use client";
import { CheckCircle2 } from "lucide-react";
import { MirrorOfferAction } from "./mirror-offer";
import { ReviewSend } from "./review-send";
import { PromotionImage } from "@/app/(private)/promotions/components/promotion-image";
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
import { OfferStatus } from "@/domains/offers/offer-status";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { toast } from "@/lib/toast";
import { formatDate } from "@/utils/date";
import { columns, offerDisplayStatus } from "./helpers";
import { OfferDeleteAction } from "./queue-actions";
function OfferGroupSummary({ destinations }: { destinations: Offer[] }) {
  const counts = new Map<string, { count: number; color: string }>();
  destinations.forEach((offer) => {
    const display = offerDisplayStatus(offer);
    counts.set(display.label, {
      count: (counts.get(display.label)?.count ?? 0) + 1,
      color: display.color,
    });
  });
  return (
    <div className="flex max-w-64 flex-wrap gap-1.5">
      {Array.from(counts.entries()).map(([label, { count, color }]) => (
        <Badge key={label} variant="outline" className={color}>
          {count} · {label}
        </Badge>
      ))}
    </div>
  );
}
export const groupedColumns: ColumnDef<OfferGroup>[] = [
  {
    key: "product.title",
    header: "Oferta",
    primary: true,
    className: "min-w-60 w-72",
    render: (_value, group) => (
      <div className="flex min-w-0 items-center gap-3">
        <PromotionImage
          src={group.product.imageUrl}
          title={group.product.title || "Oferta"}
          compact
          className="size-11 rounded-lg"
        />
        <div className="min-w-0 space-y-1">
          <span
            className="block max-w-52 truncate font-medium"
            title={group.product.title || undefined}
          >
            {group.product.title || "Oferta"}
          </span>
          {group.product.category && (
            <span className="text-muted-foreground block max-w-52 truncate text-xs">
              {group.product.category.name}
            </span>
          )}
          {group.product.sourceCategory && group.product.sourceCategory !== group.product.category?.name && (
            <span className="text-muted-foreground block max-w-52 truncate text-xs" title={group.product.sourceCategory}>
              Loja: {group.product.sourceCategory}
            </span>
          )}
        </div>
      </div>
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
    key: "product.affiliateCommissionRate",
    header: "Comissão",
    render: (_value, group) => group.product.affiliateCommissionRate != null
      ? <span title="Taxa informada pela Amazon na captura; não representa comissão confirmada">{new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(Number(group.product.affiliateCommissionRate))}%</span>
      : "—",
  },
  {
    key: "destinations",
    header: "Grupos",
    render: (_value, group) =>
      group.product.mirrorAffiliateStatus && !group.product.whatsappGroup
        ? "Escolher destino"
        : `${group.destinations.filter((offer) => offer.whatsappGroup).length} destino${group.destinations.filter((offer) => offer.whatsappGroup).length === 1 ? "" : "s"}`,
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
          offer.status === OfferStatus.SCHEDULED &&
          !offer.queueBlockedReason &&
          offer.scheduledAt
            ? [offer.scheduledAt]
            : []
        )
        .sort();
      if (dates[0]) {
        const overdue = Date.parse(dates[0]) <= Date.now();
        return (
          <div className="space-y-1">
            <span>{formatDate(dates[0], "dd/MM/yyyy HH:mm")}</span>
            {overdue && (
              <small className="text-warning block text-xs">Envio atrasado</small>
            )}
          </div>
        );
      }

      const blocked = group.destinations.filter(
        (offer) => offer.status === OfferStatus.SCHEDULED && offer.queueBlockedReason
      );
      const first = blocked[0];
      if (!first) return "—";
      if (
        blocked.some(
          (offer) => offer.queueBlockedCode !== first.queueBlockedCode
        )
      )
        return "Confira os destinos";

      return (
        <div className="max-w-60 space-y-1">
          <p>{offerDisplayStatus(first).label}</p>
          {first.queueBlockedBy && (
            <p className="text-muted-foreground whitespace-normal wrap-anywhere text-xs leading-relaxed">
              Bloqueada por “{first.queueBlockedBy.title || "oferta anterior"}”
              {first.queueBlockedBy.whatsappGroup?.name
                ? ` no grupo ${first.queueBlockedBy.whatsappGroup.name}`
                : ""}.
            </p>
          )}
          <p className="text-muted-foreground whitespace-normal wrap-anywhere text-xs leading-relaxed">
            {first.queueBlockedReason}
          </p>
        </div>
      );
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
  const scheduleCount = group.destinations.filter(
    (offer) =>
      new Set<OfferStatus>([OfferStatus.READY, OfferStatus.FAILED, OfferStatus.CANCELLED]).has(offer.status) &&
      !!offer.whatsappGroup &&
      (!offer.mirrorAffiliateStatus ||
        offer.mirrorAffiliateStatus === "APPLIED")
  ).length;
  const cancelCount = group.destinations.filter(
    (offer) => offer.status === OfferStatus.SCHEDULED
  ).length;
  const blockedBy = group.destinations.find(
    (offer) => offer.queueBlockedBy
  )?.queueBlockedBy;
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
  if (group.product.mirrorAffiliateStatus && !group.product.whatsappGroup)
    return <MirrorOfferAction offer={group.product} />;
  if (
    group.destinations.length > 0 &&
    group.destinations.every((offer) => offer.status === OfferStatus.PUBLISHED)
  )
    return (
      <span
        className="inline-flex items-center gap-2 text-sm font-semibold whitespace-nowrap text-emerald-700 dark:text-emerald-300"
        title="Todos os destinos foram publicados. Para enviar novamente, abra os destinos e use Republicar."
      >
        <CheckCircle2 aria-hidden="true" className="size-5 shrink-0" />
        Publicação concluída
      </span>
    );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {blockedBy && (
        <ReviewSend
          offer={blockedBy}
          label="Conferir envio anterior"
        />
      )}
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
