"use client";
import {
  CalendarClock,
  CreditCard,
  ExternalLink,
  ReceiptText,
} from "lucide-react";
import { useSubscription } from "@/domains/billing/use-subscription";
import { formatDate } from "@/utils/date";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import type { BillingStatus } from "@/domains/billing/subscription-types";
import { EmptyStateCard } from "@/components/feedback/empty-state-card";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { SubscriptionSkeleton } from "@/components/feedback/loading-skeletons";

const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100
  );
// Date-only values represent a calendar date, not a midnight UTC instant.
const calendarDate = (value: string | null | undefined) =>
  value ? formatDate(value + "T12:00:00-03:00") : "—";
const states: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Aguardando pagamento",
    className:
      "bg-amber-100 text-amber-950 dark:bg-amber-400/20 dark:text-amber-200",
  },
  CONFIRMED: {
    label: "Pagamento confirmado",
    className:
      "bg-emerald-100 text-emerald-950 dark:bg-emerald-400/20 dark:text-emerald-200",
  },
  RECEIVED: {
    label: "Paga",
    className:
      "bg-emerald-100 text-emerald-950 dark:bg-emerald-400/20 dark:text-emerald-200",
  },
  OVERDUE: {
    label: "Vencida",
    className: "bg-red-100 text-red-950 dark:bg-red-400/20 dark:text-red-200",
  },
  REFUNDED: {
    label: "Estornada",
    className:
      "bg-violet-100 text-violet-950 dark:bg-violet-400/20 dark:text-violet-200",
  },
  REFUND_REQUESTED: {
    label: "Estorno solicitado",
    className:
      "bg-violet-100 text-violet-950 dark:bg-violet-400/20 dark:text-violet-200",
  },
  REFUND_IN_PROGRESS: {
    label: "Estorno em andamento",
    className:
      "bg-violet-100 text-violet-950 dark:bg-violet-400/20 dark:text-violet-200",
  },
  DELETED: {
    label: "Cancelada",
    className:
      "bg-orange-100 text-orange-950 dark:bg-orange-400/20 dark:text-orange-200",
  },
  CHARGEBACK_REQUESTED: {
    label: "Pagamento contestado",
    className: "bg-red-100 text-red-950 dark:bg-red-400/20 dark:text-red-200",
  },
  CHARGEBACK_DISPUTE: {
    label: "Contestação em análise",
    className: "bg-red-100 text-red-950 dark:bg-red-400/20 dark:text-red-200",
  },
  AWAITING_CHARGEBACK_REVERSAL: {
    label: "Aguardando contestação",
    className: "bg-red-100 text-red-950 dark:bg-red-400/20 dark:text-red-200",
  },
  AWAITING_RISK_ANALYSIS: {
    label: "Em análise",
    className:
      "bg-amber-100 text-amber-950 dark:bg-amber-400/20 dark:text-amber-200",
  },
  RECEIVED_IN_CASH: {
    label: "Recebida em dinheiro",
    className:
      "bg-emerald-100 text-emerald-950 dark:bg-emerald-400/20 dark:text-emerald-200",
  },
  DUNNING_REQUESTED: {
    label: "Em recuperação",
    className:
      "bg-amber-100 text-amber-950 dark:bg-amber-400/20 dark:text-amber-200",
  },
  DUNNING_RECEIVED: {
    label: "Recebida após recuperação",
    className:
      "bg-emerald-100 text-emerald-950 dark:bg-emerald-400/20 dark:text-emerald-200",
  },
};
const methods: Record<string, string> = {
  CREDIT_CARD: "Cartão de crédito",
  BOLETO: "Boleto",
  PIX: "Pix",
  DEBIT_CARD: "Cartão de débito",
  UNDEFINED: "Não informado",
};
type CustomerPayment = BillingStatus["payments"][number];
const paymentColumns: ColumnDef<CustomerPayment>[] = [
  {
    key: "planName",
    header: "Plano",
    primary: true,
    className: "max-w-48 truncate font-medium",
  },
  {
    key: "dueDate",
    header: "Vencimento",
    render: (_, payment) => calendarDate(payment.dueDate),
  },
  {
    key: "valueCents",
    header: "Valor",
    render: (_, payment) => money(payment.valueCents),
  },
  {
    key: "status",
    header: "Situação",
    isStatus: true,
    render: (_, payment) => {
      const state = states[payment.status] ?? {
        label: "Em processamento",
        className: "bg-secondary text-secondary-foreground",
      };
      return (
        <Badge className={`justify-center whitespace-nowrap ${state.className}`}>
          {state.label}
        </Badge>
      );
    },
  },
  {
    key: "paymentDate",
    header: "Pago em",
    render: (_, payment) => calendarDate(payment.paymentDate),
  },
  {
    key: "billingType",
    header: "Forma de pagamento",
    render: (_, payment) =>
      payment.billingType ? (methods[payment.billingType] ?? "Outro") : "—",
  },
];

export function SubscriptionPayments() {
  const query = useSubscription();
  if (query.isPending) return <SubscriptionSkeleton />;
  if (query.isError)
    return (
      <ApiErrorCard
        title="Não foi possível consultar suas cobranças"
        error={query.error}
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  if (!query.data) return null;
  const { subscription: row, payments, environment } = query.data;
  const recurring =
    row &&
    !row.cancelledAt &&
    !["CANCELLED", "EXPIRED", "FAILED", "INACTIVE"].includes(row.status);
  const pending = payments.filter((p) =>
    ["PENDING", "OVERDUE"].includes(p.status)
  );
  return (
    <section
      className="space-y-4"
      id="subscription-payments"
      aria-label="Cobranças da assinatura"
    >
      {row && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="from-primary/10 via-card to-card bg-gradient-to-br">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="text-primary size-5" />
                Próxima cobrança
              </CardTitle>
              <CardDescription>
                {recurring
                  ? "Renovação mensal no Asaas"
                  : "Renovação automática interrompida"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-2xl font-semibold">
                {recurring && row.nextDueDate
                  ? calendarDate(row.nextDueDate)
                  : recurring
                    ? "Aguardando atualização"
                    : "Sem próxima renovação"}
              </p>
              {recurring && (
                <p className="text-muted-foreground text-sm">
                  {money(row.nextPriceCents ?? row.priceCents)} / mês
                </p>
              )}
              {row.nextPriceCents !== undefined &&
                row.nextPriceCents !== row.priceCents && (
                  <p className="text-muted-foreground text-xs">
                    {row.customAdjustment
                      ? "Valor previsto para as próximas cobranças ainda não emitidas."
                      : "Valor da próxima renovação considera a troca de plano agendada."}
                  </p>
                )}
              <p className="text-muted-foreground text-xs">
                A data de renovação é diferente da validade do acesso e do
                vencimento de cobranças já emitidas.
              </p>
            </CardContent>
          </Card>
          <Card className="from-primary/10 via-card to-card bg-gradient-to-br">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="text-primary size-5" />
                Situação das cobranças
              </CardTitle>
              <CardDescription>
                Acompanhamento dos registros sincronizados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-2xl font-semibold">
                {pending.length
                  ? `${pending.length} pendência${pending.length === 1 ? "" : "s"}`
                  : "Nenhuma pendência"}
              </p>
              <p className="text-muted-foreground text-sm">
                {pending.length
                  ? "Consulte o vencimento e abra a fatura abaixo para verificar o pagamento."
                  : "Os pagamentos confirmados aparecem no histórico abaixo."}
              </p>
              {row.lastSyncAt && (
                <p className="text-muted-foreground text-xs">
                  Última sincronização:{" "}
                  {formatDate(row.lastSyncAt, "dd/MM/yyyy HH:mm")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <ReceiptText className="text-primary size-5" />
              Histórico de cobranças
            </CardTitle>
            {environment === "sandbox" && (
              <Badge variant="outline">Ambiente de teste</Badge>
            )}
          </div>
          <CardDescription>
            Até 50 cobranças mais recentes. Novas cobranças aparecem quando
            forem geradas pelo Asaas. Fatura é o documento da cobrança, não uma
            nota fiscal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!payments.length ? (
            <EmptyStateCard
              icon={ReceiptText}
              title="Você ainda não tem cobranças"
              description="Quando o Asaas gerar a primeira cobrança, ela aparecerá aqui com valor, vencimento e situação."
            />
          ) : (
            <DataTable
              data={payments}
              columns={paymentColumns}
              getRowKey={(payment) => payment.id}
              actionsHeader="Fatura"
              loadingActionsCount={1}
              actions={(payment) =>
                payment.invoiceUrl ? (
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={payment.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver fatura
                      <ExternalLink className="size-3.5" />
                    </a>
                  </Button>
                ) : (
                  "—"
                )
              }
            />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
