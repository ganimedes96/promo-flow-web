import { CreditCard } from "lucide-react";
import type { ClientBilling } from "@/domains/clients/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { formatDate } from "@/utils/date";
const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value / 100
  );
const labels: Record<string, string> = {
  ACTIVE: "Ativa",
  WAITING: "Aguardando pagamento",
  CREATING: "Preparando",
  REVIEW_REQUIRED: "Conferência necessária",
  PAST_DUE: "Em atraso",
  CANCELLED: "Cancelada",
  INACTIVE: "Suspensa",
  EXPIRED: "Expirada",
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  RECEIVED: "Recebido",
  OVERDUE: "Em atraso",
  REFUNDED: "Estornado",
  DELETED: "Excluída",
};
type ClientPayment = ClientBilling["payments"][number];
const paymentColumns: ColumnDef<ClientPayment>[] = [
  {
    key: "dueDate",
    header: "Vencimento",
    primary: true,
    render: (_, payment) => payment.dueDate.split("-").reverse().join("/"),
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
    render: (_, payment) => labels[payment.status] || payment.status,
  },
];
export function ClientBillingHistory({
  billing,
}: {
  billing: ClientBilling[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="size-4" />
          Assinaturas e cobranças
        </CardTitle>
        <CardDescription>
          Últimas cinco contratações, com até dez cobranças de cada uma.
          Cancelar a renovação preserva o período pago.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {!billing.length ? (
          <p className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
            Este cliente ainda não iniciou uma contratação pelo Asaas.
          </p>
        ) : (
          billing.map((row) => (
            <section className="space-y-3 rounded-xl border p-4" key={row.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-semibold">
                  {row.planName} · {money(row.priceCents)}/mês
                </h4>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {row.environment === "sandbox" ? "Sandbox" : "Produção"}
                  </Badge>
                  <Badge
                    className={
                      row.status === "ACTIVE"
                        ? "justify-center bg-emerald-700 text-white"
                        : row.status === "CANCELLED"
                          ? "justify-center bg-rose-700 text-white"
                          : "justify-center bg-amber-600 text-white"
                    }
                  >
                    {labels[row.status] || "Em atualização"}
                  </Badge>
                </div>
              </div>
              <div className="text-muted-foreground grid gap-1 text-xs">
                <p>
                  Contratação: {formatDate(row.createdAt, "dd/MM/yyyy HH:mm")}
                </p>
                <p>
                  Período pago:{" "}
                  {row.currentPeriodEnd
                    ? formatDate(row.currentPeriodEnd, "dd/MM/yyyy HH:mm")
                    : "Sem pagamento confirmado"}
                </p>
                <p>
                  Última sincronização:{" "}
                  {row.lastSyncAt
                    ? formatDate(row.lastSyncAt, "dd/MM/yyyy HH:mm")
                    : "Aguardando confirmação"}
                </p>
              </div>
              {row.payments.length ? (
                <DataTable
                  data={row.payments}
                  columns={paymentColumns}
                  getRowKey={(payment) => payment.remoteId}
                />
              ) : (
                <p className="text-muted-foreground text-xs">
                  Nenhuma cobrança sincronizada.
                </p>
              )}
            </section>
          ))
        )}
      </CardContent>
    </Card>
  );
}
