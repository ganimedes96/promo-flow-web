"use client";
import { ActivityReferenceLookup } from "./activity-reference";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import {
  RefreshCw,
  UserRoundSearch,
  Copy,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import {
  getSupportUsers,
  getSupportDetails,
} from "@/domains/operations/client";
import type {
  SupportFilters,
  SupportOffer,
  SupportDiagnostic,
} from "@/domains/operations/types";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useDebounce } from "@/hooks/use-debounce";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { ControlledSelect } from "@/components/form/controllers/controlled-select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyStateCard } from "@/components/feedback/empty-state-card";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { formatDate } from "@/utils/date";
import { toast } from "@/lib/toast";
import { SupportStatus } from "./support-status";
import { SupportPagination } from "./support-pagination";
const date = (value: string | null) =>
  value ? formatDate(value, "dd/MM/yyyy HH:mm:ss") : "—";
const statuses = [
  { id: "ALL", name: "Todos os status" },
  { id: "READY", name: "Prontas" },
  { id: "SCHEDULED", name: "Agendadas" },
  { id: "PUBLISHING", name: "Em envio / sem confirmação" },
  { id: "PUBLISHED", name: "Publicadas" },
  { id: "FAILED", name: "Com falha" },
  { id: "CANCELLED", name: "Canceladas" },
  { id: "PROCESSING", name: "Processando" },
];
export function SupportPanel() {
  const { data: session } = useSession();
  const form = useForm({ defaultValues: { userId: "" } });
  const userId = useWatch({ control: form.control, name: "userId" });
  const [search, setSearch] = useState("");
  const term = search.trim().slice(0, 100);
  const debouncedSearch = useDebounce(term, 400);
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>();
  const users = useQuery({
    queryKey: queryKeys.operations.users(session?.user.id, debouncedSearch),
    queryFn: () => getSupportUsers(debouncedSearch),
    enabled: !!session?.user.id,
    retry: false,
    staleTime: 30000,
  });
  return (
    <section className="space-y-5">
      <ActivityReferenceLookup />
      <Card className="border-primary/25 from-primary/15 via-card to-card overflow-hidden bg-gradient-to-br">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRoundSearch className="text-primary size-5" />
            Investigar um cliente
          </CardTitle>
          <CardDescription>
            Selecione uma conta para consultar conexões, fila, tentativas e
            erros da API. A consulta é somente leitura.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          {users.isError ? (
            <ApiErrorCard
              title="Não foi possível buscar clientes"
              error={users.error}
              onRetry={() => void users.refetch()}
              retrying={users.isFetching}
            />
          ) : (
            <ControlledCombobox
              control={form.control}
              name="userId"
              label="Cliente em investigação"
              searchPlaceholder="Digite o nome ou e-mail do cliente"
              onSearchChange={setSearch}
              onOptionSelect={(option) => setSelectedLabel(option?.name)}
              selectedLabel={selectedLabel}
              placeholder="Selecione o cliente"
              loading={users.isFetching || term !== debouncedSearch}
              options={users.data?.map((user) => ({
                id: user.id,
                name: user.name + " · " + user.email,
              }))}
              noOptionsMessage="Nenhum cliente encontrado para este nome ou e-mail."
            />
          )}
          <p className="text-muted-foreground text-xs">
            Digite no campo de seleção para buscar clientes por nome ou e-mail.
          </p>
        </CardContent>
      </Card>
      {userId ? (
        <SupportDetails key={userId} userId={userId} />
      ) : (
        <EmptyStateCard
          icon={UserRoundSearch}
          title="Escolha quem precisa de ajuda"
          description="O diagnóstico desse cliente aparecerá aqui, sem alterar conexões ou reenviar mensagens."
        />
      )}
    </section>
  );
}
function SupportDetails({ userId }: { userId: string }) {
  const { data: session } = useSession();
  const form = useForm({ defaultValues: { status: "ALL" } });
  const [filters, setFilters] = useState<SupportFilters>({
    userId,
    page: 1,
    errorPage: 1,
  });
  const query = useQuery({
    queryKey: queryKeys.operations.support(session?.user.id, filters),
    queryFn: () => getSupportDetails(filters),
    enabled: !!session?.user.id,
    retry: false,
    refetchInterval: (q) => (q.state.error ? false : 15000),
    refetchIntervalInBackground: false,
  });
  if (query.isPending)
    return (
      <div
        className="space-y-4"
        role="status"
        aria-label="Carregando diagnóstico do cliente"
      >
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  if (query.isError || !query.data)
    return (
      <ApiErrorCard
        title="Não foi possível consultar o cliente"
        error={query.error}
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  const data = query.data;
  const columns: ColumnDef<SupportOffer>[] = [
    {
      key: "title",
      header: "Oferta",
      primary: true,
      render: (_, row) => (
        <span className="block max-w-60 truncate" title={row.title ?? row.id}>
          {row.title || "Sem título"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      isStatus: true,
      render: (_, row) => <SupportStatus status={row.status} />,
    },
    {
      key: "connection",
      header: "Conexão / grupo",
      render: (_, row) => (
        <div className="max-w-52 text-xs">
          <p className="truncate">{row.connection?.name ?? "Sem conexão"}</p>
          <p className="text-muted-foreground truncate">
            {row.whatsappGroup?.name ?? "Sem destino"}
          </p>
        </div>
      ),
    },
    {
      key: "scheduledAt",
      header: "Previsto",
      render: (_, row) => date(row.scheduledAt),
    },
    {
      key: "publishedAt",
      header: "Publicado",
      render: (_, row) => date(row.publishedAt),
    },
    { key: "attempts", header: "Tentativas" },
    {
      key: "blockedReason",
      header: "Diagnóstico",
      render: (_, row) => (
        <p className="max-w-72 text-xs whitespace-normal">
          {row.blockedReason ||
            row.errorMessage ||
            (row.mirrorAffiliateStatus === "PENDING"
              ? "Aguardando conversão do link de afiliado."
              : "Sem bloqueio identificado.")}
        </p>
      ),
    },
  ];
  const errorColumns: ColumnDef<SupportDiagnostic>[] = [
    {
      key: "createdAt",
      header: "Quando",
      primary: true,
      render: (_, row) => date(row.createdAt),
    },
    {
      key: "statusCode",
      header: "HTTP",
      isStatus: true,
      render: (_, row) => (
        <Badge
          className={
            row.statusCode >= 500
              ? "bg-rose-700 text-white"
              : "bg-orange-600 text-white"
          }
        >
          {row.statusCode}
        </Badge>
      ),
    },
    {
      key: "route",
      header: "Operação",
      render: (_, row) => (
        <span className="text-xs break-all">
          {row.method} {row.route}
        </span>
      ),
    },
    { key: "errorType", header: "Tipo" },
    {
      key: "requestId",
      header: "Referência",
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          title={row.requestId}
          onClick={() => {
            void navigator.clipboard
              .writeText(row.requestId)
              .then(() => toast.success("Referência copiada."))
              .catch(() => toast.error("Não foi possível copiar."));
          }}
        >
          <Copy className="size-3" />
          <span className="max-w-36 truncate">{row.requestId}</span>
        </Button>
      ),
    },
  ];
  return (
    <div className="space-y-5">
      <div className="bg-primary/5 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
        <div>
          <h2 className="font-semibold">{data.user.name}</h2>
          <p className="text-muted-foreground text-sm">{data.user.email}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Consulta em {date(data.status.checkedAt)}
          </p>
        </div>
        <Button
          variant="outline"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          <RefreshCw className="size-4" />
          Atualizar cliente
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Agendadas", data.status.queue.scheduled],
          ["Em envio", data.status.queue.sending],
          ["Sem confirmação", data.status.queue.unconfirmed],
          ["Com falha", data.status.queue.failed],
        ].map(([label, count]) => (
          <Card
            key={label}
            className="from-primary/15 via-card to-card bg-gradient-to-br"
          >
            <CardContent className="pt-4">
              <p className="text-muted-foreground text-xs">{label}</p>
              <p className="mt-2 text-2xl font-bold">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {data.connections.map((connection) => (
          <Card
            key={connection.id}
            className="from-primary/15 via-card to-card bg-gradient-to-br"
          >
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageCircle className="size-4" />
                  {connection.name}
                </CardTitle>
                <SupportStatus
                  status={
                    connection.status === "READY"
                      ? "CONNECTED"
                      : connection.status
                  }
                />
              </div>
              <CardDescription>
                {connection.connectedName || "Sem nome de conta disponível"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <Badge
                className={
                  connection.isPaused
                    ? "bg-orange-600 text-white"
                    : "bg-emerald-700 text-white"
                }
              >
                {connection.isPaused ? "Envios pausados" : "Envios liberados"}
              </Badge>
              <p>Última conexão: {date(connection.lastConnectedAt)}</p>
              <p>Última desconexão: {date(connection.lastDisconnectedAt)}</p>
              {connection.lastError && (
                <p className="text-destructive break-words">
                  {connection.lastError}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {!data.connections.length && (
        <EmptyStateCard
          title="Este cliente ainda não tem conexões"
          description="Nenhuma conta WhatsApp foi cadastrada para este cliente."
        />
      )}
      <Card className="from-primary/15 via-card to-card bg-gradient-to-br">
        <CardHeader>
          <CardTitle>Ofertas e tentativas de envio</CardTitle>
          <CardDescription>
            Histórico ordenado pela última alteração. Expanda uma linha para
            investigar até 10 tentativas recentes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={form.handleSubmit((values) =>
              setFilters((current) => ({
                ...current,
                page: 1,
                status: values.status === "ALL" ? undefined : values.status,
              }))
            )}
          >
            <ControlledSelect
              control={form.control}
              name="status"
              label="Status da oferta"
              placeholder="Todos os status"
              options={statuses}
            />
            <Button type="submit" variant="outline">
              Filtrar ofertas
            </Button>
          </form>
          {data.offers.items.length ? (
            <>
              <DataTable
                data={data.offers.items}
                columns={columns}
                getRowKey={(row) => row.id}
                renderExpanded={(offer) => (
                  <div className="space-y-3 p-3 text-xs">
                    <p className="break-all">Oferta: {offer.id}</p>
                    <p>
                      Cadastrada em {date(offer.createdAt)} · Última tentativa:{" "}
                      {date(offer.lastAttemptAt)}
                    </p>
                    {offer.mirrorConversion && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span>Conversão de afiliado:</span>
                        <SupportStatus status={offer.mirrorConversion.status} />
                        <span>
                          {offer.mirrorConversion.attempts} tentativa(s) ·{" "}
                          {offer.mirrorConversion.lastErrorCode ??
                            "Sem erro informado"}
                        </span>
                      </div>
                    )}
                    {offer.publicationAttempts.length ? (
                      offer.publicationAttempts.map((attempt) => (
                        <div
                          key={attempt.id}
                          className="space-y-2 rounded-lg border p-3"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <strong>Tentativa {attempt.attempt}</strong>
                            <SupportStatus status={attempt.status} />
                          </div>
                          <p>
                            Início: {date(attempt.startedAt)} · Fim:{" "}
                            {date(attempt.finishedAt)}
                          </p>
                          {attempt.errorMessage && (
                            <p className="text-destructive break-words whitespace-pre-wrap">
                              {attempt.errorMessage}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">
                        Nenhuma tentativa de envio registrada.
                      </p>
                    )}
                  </div>
                )}
              />
              <SupportPagination
                label="Páginas das ofertas do cliente"
                page={filters.page}
                total={data.offers.total}
                busy={query.isFetching}
                onPage={(page) =>
                  setFilters((current) => ({ ...current, page }))
                }
              />
            </>
          ) : (
            <EmptyStateCard
              variant="search"
              title="Nenhuma oferta encontrada"
              description="Este cliente não possui ofertas para o status selecionado."
            />
          )}
        </CardContent>
      </Card>
      <Card className="from-primary/15 via-card to-card bg-gradient-to-br">
        <CardHeader>
          <CardTitle>Erros da API · últimos 30 dias</CardTitle>
          <CardDescription>
            Ocorrências de requisições autenticadas, registradas após esta
            atualização. Copie a referência para localizar os detalhes técnicos
            na Vercel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.errors.items.length ? (
            <>
              <DataTable
                data={data.errors.items}
                columns={errorColumns}
                getRowKey={(row) => row.id}
              />
              <SupportPagination
                label="Páginas dos erros da API"
                page={filters.errorPage}
                total={data.errors.total}
                busy={query.isFetching}
                onPage={(errorPage) =>
                  setFilters((current) => ({ ...current, errorPage }))
                }
              />
            </>
          ) : (
            <EmptyStateCard
              icon={ShieldCheck}
              title="Nenhum erro da API registrado"
              description="Não há ocorrências autenticadas desse cliente nos últimos 30 dias. Falhas de rede ou anteriores ao login podem não aparecer aqui."
            />
          )}
        </CardContent>
      </Card>
      <p className="text-muted-foreground text-xs">
        Somente leitura. Os sinais do worker e do coletor são da infraestrutura
        compartilhada; os contadores, conexões, ofertas e erros acima são deste
        cliente.
      </p>
    </div>
  );
}
