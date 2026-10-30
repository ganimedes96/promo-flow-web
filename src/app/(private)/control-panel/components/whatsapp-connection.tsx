"use client";
import { WorkerIndicator } from "./worker-indicator";
import { GroupFavorites } from "./group-favorites";
import { TargetGroupForm } from "./target-group-form";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  MessageCircle,
  Smartphone,
  Users,
  LoaderCircle,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getWhatsAppSession,
  getWhatsAppGroups,
} from "@/domains/whatsapp/client";
import {
  connectWhatsApp,
  disconnectWhatsApp,
} from "@/domains/whatsapp/actions";
import { WhatsAppSession } from "@/domains/whatsapp/types";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
const labels: Record<WhatsAppSession["status"], string> = {
  DISCONNECTED: "Desconectado",
  CONNECTING: "Iniciando conexão",
  WAITING_QR: "Aguardando leitura do QR Code",
  AUTHENTICATED: "Autenticado, sincronizando",
  READY: "Conectado",
  ERROR: "Falha na conexão",
};
export function WhatsAppConnection() {
  const session = useQuery({
    queryKey: queryKeys.whatsapp.session,
    queryFn: getWhatsAppSession,
    refetchInterval: 3000,
  });
  const groups = useQuery({
    queryKey: [
      ...queryKeys.whatsapp.groups,
      session.data?.connectedPhone ?? null,
    ],
    queryFn: getWhatsAppGroups,
    enabled: session.data?.status === "READY",
    refetchInterval: 5000,
  });
  const connect = useServerAction({
    mutationFn: connectWhatsApp,
    invalidateQueries: [queryKeys.whatsapp.session, queryKeys.whatsapp.groups],
    successMessage: "Conexão solicitada. Aguarde o QR Code.",
  });
  const disconnect = useServerAction({
    mutationFn: disconnectWhatsApp,
    invalidateQueries: [queryKeys.whatsapp.session, queryKeys.whatsapp.groups],
    successMessage: "Desconexão solicitada.",
  });
  const busy = connect.isPending || disconnect.isPending;
  const status = session.data?.status;
  const canConnect = status === "DISCONNECTED" || status === "ERROR";
  const qr = session.data?.qrCode;
  const connected =
    status === "READY" &&
    !session.error &&
    session.data?.worker?.status === "ONLINE";
  const connecting = status === "CONNECTING" || status === "AUTHENTICATED";
  const accountName =
    session.data?.connectedName?.trim() || "Sua conta do WhatsApp";
  const initials = session.data?.connectedName
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="whatsapp-connection-card">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle
                className={connected ? "text-success size-5" : "size-5"}
                aria-hidden="true"
              />
              Conexão do WhatsApp
            </CardTitle>
            {connected && (
              <Badge
                variant="outline"
                className="border-success/30 bg-success/10 text-success gap-1.5"
              >
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                Conectado
              </Badge>
            )}
          </div>
          <CardDescription>
            {connected
              ? "Sua conta está conectada para compartilhar ofertas nos seus grupos."
              : "Vincule sua conta para consultar os grupos disponíveis."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <WorkerIndicator
            worker={session.data?.worker}
            unavailable={!!session.error}
          />
          <div
            role="status"
            aria-live="polite"
            className={
              connected
                ? "text-success flex items-center gap-2 text-sm font-medium"
                : "text-muted-foreground flex items-center gap-2 text-sm"
            }
          >
            {connected ? (
              <CheckCircle2 className="size-4" aria-hidden="true" />
            ) : connecting || session.isPending ? (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <WifiOff className="size-4" aria-hidden="true" />
            )}
            {session.isPending
              ? "Carregando conexão…"
              : session.error
                ? "Não foi possível atualizar a conexão"
                : connected
                  ? "WhatsApp conectado com sucesso"
                  : status === "READY" && !connected
                    ? "Sessão salva; aguardando o worker"
                    : status
                      ? labels[status]
                      : "Conexão indisponível"}
          </div>
          {session.error && (
            <Alert variant="destructive">
              <AlertDescription>{session.error.message}</AlertDescription>
            </Alert>
          )}
          {session.data?.lastError && (
            <Alert variant="destructive">
              <AlertDescription>{session.data.lastError}</AlertDescription>
            </Alert>
          )}
          {connected && (
            <div className="bg-background border-success/20 rounded-xl border p-5">
              <div className="flex items-center gap-4">
                <div className="bg-success/10 text-success flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold">
                  {initials || (
                    <Smartphone className="size-6" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Conta conectada
                  </p>
                  <p
                    className="truncate text-lg font-semibold"
                    title={accountName}
                  >
                    {accountName}
                  </p>
                  <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                    <Smartphone
                      className="size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    {session.data?.connectedPhone
                      ? "+" + session.data.connectedPhone.replace(/^\+/, "")
                      : "Número indisponível"}
                  </p>
                </div>
                <CheckCircle2
                  className="text-success size-6 shrink-0"
                  aria-label="Conta conectada"
                />
              </div>
              <div className="border-success/15 mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
                <Badge
                  variant="outline"
                  className="text-success border-success/30 bg-success/5"
                >
                  Sessão conectada
                </Badge>
                {groups.data && (
                  <Badge variant="secondary" className="gap-1.5">
                    <Users className="size-3.5" aria-hidden="true" />
                    {groups.data.length} grupos sincronizados
                  </Badge>
                )}
              </div>
            </div>
          )}
          {status === "WAITING_QR" &&
            (qr ? (
              <div className="space-y-4">
                <div className="inline-flex rounded-lg border bg-white p-4">
                  <QRCodeSVG
                    value={qr}
                    size={232}
                    marginSize={4}
                    title="QR Code para conectar o WhatsApp"
                  />
                </div>
                <p className="text-muted-foreground text-sm">
                  No celular, abra WhatsApp → Aparelhos conectados → Conectar
                  aparelho e leia o código.
                </p>
              </div>
            ) : (
              <p>Aguardando um novo QR Code…</p>
            ))}
          {(status === "CONNECTING" || status === "AUTHENTICATED") && (
            <p className="text-muted-foreground text-sm">
              Aguarde. O QR Code ou a confirmação aparecerá aqui
              automaticamente.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {canConnect && (
              <Button onClick={() => connect.mutate()} disabled={busy}>
                Conectar WhatsApp
              </Button>
            )}
            {status && !canConnect && (
              <Button
                variant="outline"
                onClick={() => disconnect.mutate()}
                disabled={busy}
              >
                Desconectar
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                void session.refetch();
                if (status === "READY") void groups.refetch();
              }}
              disabled={session.isFetching}
            >
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Grupos do WhatsApp</CardTitle>
          <CardDescription>
            {status === "READY" && session.data?.connectedPhone
              ? "Grupos vinculados ao WhatsApp +" + session.data.connectedPhone
              : "Os grupos aparecem após a conexão e a sincronização da conta."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status !== "READY" ? (
            <p className="text-muted-foreground">
              Conecte seu WhatsApp para visualizar os grupos.
            </p>
          ) : groups.error ? (
            <Alert variant="destructive">
              <AlertDescription>{groups.error.message}</AlertDescription>
            </Alert>
          ) : groups.isPending ? (
            <p>Carregando grupos…</p>
          ) : groups.data?.length ? (
            <div className="space-y-5">
              <TargetGroupForm
                key={groups.data.find((group) => group.isDefault)?.id ?? "none"}
                groups={groups.data}
              />
              <GroupFavorites
                key={session.data?.connectedPhone}
                groups={groups.data}
              />
            </div>
          ) : (
            <p className="text-muted-foreground">
              Nenhum grupo sincronizado ainda. A lista é atualizada
              automaticamente.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
