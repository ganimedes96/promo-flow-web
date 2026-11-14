"use client";
import { LocalControlCard } from "./local-control-card";
import { SupportPanel } from "./support-panel";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clipboard,
  PauseCircle,
  Radio,
  RefreshCw,
  Server,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { HandleError } from "@/api/error";
import { getOperationsStatus } from "@/domains/operations/client";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { formatDate } from "@/utils/date";
import { toast } from "@/lib/toast";
const labels = {
  ONLINE: "Em comunicação",
  OFFLINE: "Sem comunicação",
  NOT_STARTED: "Ainda não iniciou",
};
export function OperationsPanel() {
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);
  const status = useQuery({
    queryKey: queryKeys.operations.status(session?.user.id),
    queryFn: getOperationsStatus,
    enabled: !!session?.user.id,
    refetchInterval: (query) => (query.state.error ? false : 30000),
    staleTime: 0,
    retry: false,
  });
  const data = status.data;
  const copy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(
          {
            checkedAt: data.checkedAt,
            api: data.api,
            worker: data.worker,
            collector: data.collector,
            queue: data.queue,
          },
          null,
          2
        )
      );
      setCopied(true);
    } catch {
      toast.error("Não foi possível copiar o diagnóstico. Tente novamente.");
    }
  };
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Activity className="text-primary" />
            Operação
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Acompanhe os serviços e identifique o que precisa de atenção.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setCopied(false);
              void status.refetch();
            }}
            disabled={status.isFetching}
          >
            <RefreshCw
              className={
                status.isFetching
                  ? "animate-spin motion-reduce:animate-none"
                  : ""
              }
            />
            Atualizar
          </Button>
          <Button
            variant="outline"
            disabled={!data}
            onClick={() => void copy()}
          >
            <Clipboard />
            {copied ? "Copiado" : "Copiar diagnóstico"}
          </Button>
        </div>
      </header>
      {status.isError && (
        <ApiErrorCard
          title="Não foi possível consultar a operação"
          description={status.error.message}
          reference={
            status.error instanceof HandleError
              ? status.error.requestId
              : undefined
          }
          onRetry={() => void status.refetch()}
          retrying={status.isFetching}
        />
      )}
      <h2 className="pt-4 text-lg font-semibold">Visão geral de todos os clientes</h2>
      <LocalControlCard />
      {status.isPending ? (
        <div
          className="grid gap-4 md:grid-cols-2"
          role="status"
          aria-label="Consultando serviços"
        >
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : (
        data && (
          <>
            {status.isError && (
              <p className="text-warning text-sm">
                Os dados abaixo são da última consulta bem-sucedida e podem
                estar desatualizados.
              </p>
            )}
            <div className="grid gap-4 lg:grid-cols-2">
              {(
                [
                  {
                    key: "worker",
                    title: "Publicador do WhatsApp",
                    icon: Server,
                    runtime: data.worker,
                    href: "/connections",
                    action: "Ver conexões",
                    text:
                      data.worker.status !== "ONLINE"
                        ? "As ofertas continuam salvas. Inicie o worker e confira sua conexão com a API."
                        : !data.worker.publishingEnabled
                          ? "O processo está ativo, mas os envios estão desativados na configuração do worker."
                          : "O publicador responde à API. Os envios dependem do WhatsApp conectado, da conexão liberada e da fila.",
                  },
                  {
                    key: "collector",
                    title: "Coletor de promoções",
                    icon: Radio,
                    runtime: data.collector,
                    href: "/promotion-sources",
                    action: "Ver fontes",
                    text:
                      data.collector.status !== "ONLINE"
                        ? "Inicie o coletor para receber novas promoções. Capturas anteriores permanecem salvas."
                        : "O coletor responde à API. Confira em Fontes de promoções se a conta e as fontes desejadas estão ativas.",
                  },
                ] as const
              ).map(
                ({ key, title, icon: Icon, runtime, href, action, text }) => (
                  <Card key={key} className="from-primary/15 via-card to-card bg-gradient-to-br">
                    <CardHeader>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Icon className="text-primary size-5" />
                          {title}
                        </CardTitle>
                        <Badge
                          className={
                            runtime.status === "ONLINE"
                              ? "bg-emerald-700 text-white"
                              : "bg-amber-300 text-amber-950"
                          }
                        >
                          {runtime.status === "ONLINE" ? (
                            <CheckCircle2 />
                          ) : (
                            <CircleAlert />
                          )}
                          {labels[runtime.status]}
                        </Badge>
                      </div>
                      <CardDescription className="leading-relaxed">
                        {text}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {key === "worker" ? (
                          <Badge variant="outline">
                            {data.worker.publishingEnabled
                              ? "Envios habilitados"
                              : "Envios desativados"}
                          </Badge>
                        ) : (
                          <>
                            <Badge variant="outline">
                              Telegram{" "}
                              {data.collector.telegramEnabled
                                ? "habilitado"
                                : "desativado"}
                            </Badge>
                            <Badge variant="outline">
                              WhatsApp{" "}
                              {data.collector.whatsappEnabled
                                ? "habilitado"
                                : "desativado"}
                            </Badge>
                          </>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Último contato:{" "}
                        {runtime.lastSeenAt
                          ? formatDate(
                              runtime.lastSeenAt,
                              "dd/MM/yyyy HH:mm:ss"
                            )
                          : "Nenhum contato registrado"}
                      </p>
                      {runtime.stoppedAt && (
                        <p className="text-muted-foreground text-xs">
                          Parada informada:{" "}
                          {formatDate(runtime.stoppedAt, "dd/MM/yyyy HH:mm:ss")}
                        </p>
                      )}
                      <Button asChild size="sm" variant="outline">
                        <Link href={href}>
                          {action}
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
            {data.queue.unconfirmed > 0 && (
              <div className="border-warning/40 bg-warning/10 flex items-start gap-3 rounded-xl border p-4">
                <PauseCircle className="text-warning mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">
                    Há envios aguardando conferência
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Confira a mensagem no grupo antes de liberar qualquer
                    reenvio. O sistema não repete automaticamente tentativas sem
                    confirmação. Os totais deste painel abrangem todos os
                    clientes; cada cliente confere suas ofertas na própria
                    conta.
                  </p>
                </div>
              </div>
            )}
            <p className="text-muted-foreground text-xs">
              Atualizado em {formatDate(data.checkedAt, "dd/MM/yyyy HH:mm:ss")}.
              A ausência de contato por 45 segundos indica indisponibilidade;
              comunicação ativa não comprova captura ou entrega de mensagens.
            </p>
          </>
        )
      )}
      <SupportPanel />
    </div>
  );
}
