"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { WorkerIndicator } from "./worker-indicator";
import { ConnectionAccountDetails } from "./connection-account-details";
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
import { getWhatsAppSession } from "@/domains/whatsapp/client";
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
export function WhatsAppConnection({
  connectionId,
  showWorkerIndicator = true,
  variant = "panel",
  onConnected,
}: {
  connectionId?: string;
  showWorkerIndicator?: boolean;
  variant?: "panel" | "sheet";
  onConnected?: () => void;
} = {}) {
  const account = useSession();
  const awaitingConnection = useRef(false);
  const session = useQuery({
    queryKey: [
      ...queryKeys.whatsapp.sessionFor(connectionId),
      account.data?.user.id,
    ],
    queryFn: () => getWhatsAppSession(connectionId),
    enabled: !!account.data?.user.id,
    refetchInterval: 3000,
  });
  const connect = useServerAction({
    mutationFn: () => connectWhatsApp(connectionId),
    invalidateQueries: [
      queryKeys.whatsapp.session,
      queryKeys.whatsapp.groups,
      queryKeys.whatsapp.connections,
      queryKeys.offers.all,
    ],
    successMessage: "Conexão solicitada. Aguarde o QR Code.",
  });
  const disconnect = useServerAction({
    mutationFn: () => disconnectWhatsApp(connectionId),
    invalidateQueries: [
      queryKeys.whatsapp.session,
      queryKeys.whatsapp.groups,
      queryKeys.whatsapp.connections,
      queryKeys.offers.all,
    ],
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
  useEffect(() => {
    if (
      status === "CONNECTING" ||
      status === "WAITING_QR" ||
      status === "AUTHENTICATED"
    ) {
      awaitingConnection.current = true;
    }
    if (status === "DISCONNECTED" || status === "ERROR") {
      awaitingConnection.current = false;
    }
    if (!connected || busy || !awaitingConnection.current || !onConnected)
      return;
    const timeout = window.setTimeout(() => {
      awaitingConnection.current = false;
      onConnected();
    }, 3000);
    return () => window.clearTimeout(timeout);
  }, [status, connected, busy, onConnected]);
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
  if (variant === "sheet") {
    return (
      <ConnectionAccountDetails
        session={session.data}
        loading={session.isPending}
        refreshing={session.isFetching}
        error={session.error}
        busy={busy}
        onConnect={() => connect.mutate()}
        onDisconnect={() => disconnect.mutate()}
        onRefresh={() => {
          void session.refetch();
        }}
      />
    );
  }
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
              {session.data?.name || "Conexão do WhatsApp"}
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
          {session.data?.isPaused && (
            <Badge variant="secondary">Envios pausados nesta conexão</Badge>
          )}
          {showWorkerIndicator && (
            <WorkerIndicator
              worker={session.data?.worker}
              unavailable={!!session.error}
            />
          )}
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
            <div className="whatsapp-connection-subcard rounded-xl border p-5">
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
              }}
              disabled={session.isFetching}
            >
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="justify-center">
        <CardContent className="flex flex-col items-start gap-4 p-6">
          <span className="bg-primary/10 text-primary rounded-2xl p-3">
            <Users className="size-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">
              Seus grupos, em um só lugar
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Busque por nome, filtre por conta e favorite os grupos que devem
              aparecer ao preparar uma oferta.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/groups">Gerenciar grupos</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
