"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { Users, Settings2, SlidersHorizontal } from "lucide-react";
import { getClients } from "@/domains/clients/client";
import type { Client } from "@/domains/clients/types";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useDebounce } from "@/hooks/use-debounce";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledSelect } from "@/components/form/controllers/controlled-select";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { EmptyStateCard } from "@/components/feedback/empty-state-card";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { formatDate } from "@/utils/date";
import { SupportPagination } from "../../operations/components/support-pagination";
import { ClientDetails } from "./client-details";
import { ClientAdjustment } from "./client-adjustment";
import { ClientStatus } from "./client-status";
export function ClientsPanel() {
  const { data: session } = useSession();
  const [selected, setSelected] = useState<string | null>(null);
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const form = useForm({ defaultValues: { search: "", status: "ALL" } });
  const values = useWatch({ control: form.control });
  const search = useDebounce((values.search ?? "").trim(), 400),
    status = values.status ?? "ALL";
  const filterKey = search + ":" + status;
  const [pagination, setPagination] = useState({ filterKey, page: 1 });
  const page = pagination.filterKey === filterKey ? pagination.page : 1;
  const filters = { search, status, page };
  const query = useQuery({
    queryKey: queryKeys.clients.list(session?.user.id, filters),
    queryFn: () => getClients(filters),
    enabled: !!session?.user.id,
    retry: false,
  });
  const columns: ColumnDef<Client>[] = [
    {
      key: "name",
      header: "Cliente",
      primary: true,
      render: (_, client) => (
        <div>
          <p className="font-semibold">{client.name}</p>
          <p className="text-muted-foreground text-xs">{client.email}</p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Telefone",
      render: (_, client) => client.phone || "—",
    },
    {
      key: "isDisabled",
      header: "Conta",
      isStatus: true,
      render: (_, client) => <ClientStatus client={client} />,
    },
    {
      key: "effectivePlanName",
      header: "Plano",
      render: (_, client) => (
        <div>
          <p className="font-semibold">
            {client.effectivePlanName || "Teste grátis"}
          </p>
          <p className="text-muted-foreground text-xs">
            {client.accessStatus === "ACTIVE" && client.subscriptionActiveUntil
              ? "Pago até " +
                formatDate(client.subscriptionActiveUntil, "dd/MM/yyyy")
              : client.accessStatus === "EXPIRED"
                ? "Acesso encerrado"
                : "Período de teste"}
          </p>
        </div>
      ),
    },
    {
      key: "trialEndsAt",
      header: "Fim do teste",
      render: (_, client) => (
        <div>
          <p>{formatDate(client.trialEndsAt, "dd/MM/yyyy HH:mm")}</p>
          <p className="text-muted-foreground text-xs">
            {new Date(client.trialEndsAt).getTime() > Date.now()
              ? "Em teste"
              : "Teste encerrado"}
          </p>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Cadastro",
      render: (_, client) => formatDate(client.createdAt, "dd/MM/yyyy HH:mm"),
    },
  ];
  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Users className="text-primary" />
          Clientes
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Consulte os cadastros, gerencie o acesso e ajuste o prazo de teste de
          cada cliente.
        </p>
      </header>
      <Card className="from-primary/15 via-card to-card bg-gradient-to-br">
        <CardContent className="grid gap-4 pt-5 sm:grid-cols-[2fr_1fr]">
          <ControlledInput
            control={form.control}
            name="search"
            label="Buscar cliente"
            placeholder="Nome ou e-mail"
            maxLength={100}
          />
          <ControlledSelect
            control={form.control}
            name="status"
            label="Situação"
            placeholder="Todas"
            options={[
              { id: "ALL", name: "Todos os clientes" },
              { id: "ENABLED", name: "Contas ativas" },
              { id: "DISABLED", name: "Contas desativadas" },
              { id: "SUBSCRIBED", name: "Com assinatura vigente" },
              { id: "TRIALING", name: "Em teste" },
              { id: "EXPIRED", name: "Acesso encerrado" },
            ]}
          />
        </CardContent>
      </Card>
      {query.isError ? (
        <ApiErrorCard
          title="Não foi possível carregar os clientes"
          error={query.error}
          onRetry={() => void query.refetch()}
          retrying={query.isFetching}
        />
      ) : query.isPending ? (
        <DataTable data={[]} columns={columns} loading />
      ) : !query.data.items.length ? (
        <EmptyStateCard
          variant={search || status !== "ALL" ? "search" : "empty"}
          title={
            search || status !== "ALL"
              ? "Cliente não encontrado"
              : "Nenhum cliente cadastrado"
          }
          description="Os clientes cadastrados aparecerão aqui. Ajuste os filtros para consultar outras contas."
        />
      ) : (
        <>
          <p className="text-muted-foreground text-xs">
            {query.data.total} cliente(s) encontrado(s)
          </p>
          <DataTable
            data={query.data.items}
            columns={columns}
            getRowKey={(client) => client.id}
            actions={(client) => (
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={
                    !client.subscriptionActiveUntil ||
                    new Date(client.subscriptionActiveUntil).getTime() <= Date.now()
                  }
                  title="Ajustar limite e mensalidade para a próxima fatura"
                  onClick={() => setAdjusting(client.id)}
                >
                  <SlidersHorizontal className="size-3.5" />
                  Ajustar plano
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelected(client.id)}
                >
                  <Settings2 className="size-3.5" />
                  Gerenciar
                </Button>
              </div>
            )}
          />
          <SupportPagination
            label="Páginas de clientes"
            page={page}
            total={query.data.total}
            busy={query.isFetching}
            onPage={(next) => setPagination({ filterKey, page: next })}
          />
        </>
      )}
      <Sheet
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-3xl">
          <SheetHeader className="border-b p-6">
            <SheetTitle>Gerenciar cliente</SheetTitle>
            <SheetDescription>
              Plano, cobranças, acesso e período de teste.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            {selected && <ClientDetails key={selected} id={selected} />}
          </div>
        </SheetContent>
      </Sheet>
      <Sheet
        open={!!adjusting}
        onOpenChange={(open) => {
          if (!open) setAdjusting(null);
        }}
      >
        <SheetContent className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-2xl">
          <SheetHeader className="border-b p-6">
            <SheetTitle>Ajuste individual</SheetTitle>
            <SheetDescription>
              Configure limite e mensalidade para a renovação do cliente.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            {adjusting && <ClientAdjustment key={adjusting} id={adjusting} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
