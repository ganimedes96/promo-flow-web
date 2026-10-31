"use client";

import { QRCodeSVG } from "qrcode.react";
import {
  Check,
  CheckCircle2,
  LoaderCircle,
  LogOut,
  QrCode,
  RefreshCw,
  Smartphone,
  WifiOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConnectionSheetSkeleton } from "@/components/feedback/loading-skeletons";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { getConnectionBadgeStyle } from "@/domains/whatsapp/badge-styles";
import { WhatsAppSession } from "@/domains/whatsapp/types";
import { cn } from "@/lib/shadcn/utils";

export type ConnectionAccountDetailsProps = {
  session?: WhatsAppSession;
  loading: boolean;
  refreshing: boolean;
  error?: Error | null;
  busy: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
};

export function ConnectionAccountDetails({
  session,
  loading,
  refreshing,
  error,
  busy,
  onConnect,
  onDisconnect,
  onRefresh,
}: ConnectionAccountDetailsProps) {
  if (error) {
    return (
      <div className="p-6">
        <ApiErrorCard
          title="Não foi possível atualizar esta conexão"
          onRetry={onRefresh}
          retrying={refreshing}
        />
      </div>
    );
  }
  if (loading || !session) return <ConnectionSheetSkeleton />;
  const ready = session.status === "READY";
  const connected = ready && session.worker?.status === "ONLINE";
  const waitingQr = session.status === "WAITING_QR";
  const connecting =
    session.status === "CONNECTING" || session.status === "AUTHENTICATED";
  const canConnect =
    session.status === "DISCONNECTED" || session.status === "ERROR";
  const name = session.connectedName?.trim() || "Sua conta do WhatsApp";
  const initials = session.connectedName
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const title = connected
    ? "Tudo conectado por aqui!"
    : ready
      ? "Sua sessão está salva"
      : waitingQr
        ? "Só falta ler o QR Code"
        : connecting
          ? "Estamos conectando sua conta"
          : "Vamos conectar seu WhatsApp?";
  const description = connected
    ? "Você já pode usar esta conta para compartilhar suas ofertas."
    : ready
      ? "Aguardando o publicador ficar disponível para continuar os envios."
      : waitingQr
        ? "Pegue seu celular e siga os passos abaixo. É rapidinho."
        : connecting
          ? "Deixe esta janela aberta. A conexão será atualizada automaticamente."
          : "Conecte seu número para começar a preparar seus envios.";
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-7">
        <section className="bg-card relative overflow-hidden rounded-3xl border p-6 text-center">
          <div
            aria-hidden="true"
            className="from-primary/10 pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b to-transparent"
          />
          <div
            className={cn(
              "relative mx-auto mb-5 flex size-20 items-center justify-center rounded-3xl border shadow-sm",
              connected
                ? "border-success/25 bg-success/10 text-success"
                : "border-primary/20 bg-primary/10 text-primary"
            )}
          >
            {connected ? (
              <CheckCircle2 className="size-9" />
            ) : connecting ? (
              <LoaderCircle className="size-9 motion-safe:animate-spin" />
            ) : waitingQr ? (
              <QrCode className="size-9" />
            ) : (
              <Smartphone className="size-9" />
            )}
            {connected && (
              <span
                aria-hidden="true"
                className="border-card bg-success absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border-4 text-white"
              >
                <Check className="size-3" />
              </span>
            )}
          </div>
          <div role="status" aria-live="polite" className="relative">
            <Badge
              variant="outline"
              className={cn(
                "mb-3 gap-1.5",
                getConnectionBadgeStyle(session.status, connected)
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full bg-current",
                  connecting && "motion-safe:animate-pulse"
                )}
              />
              {connected
                ? "Conectado"
                : ready
                  ? "Aguardando publicador"
                  : waitingQr
                    ? "Aguardando leitura"
                    : connecting
                      ? "Conectando"
                      : session.status === "ERROR"
                        ? "Precisa de atenção"
                        : "Desconectado"}
            </Badge>
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm leading-relaxed">
              {description}
            </p>
          </div>
          {ready && (
            <div className="bg-background relative mt-6 flex items-center gap-3 rounded-2xl border p-4 text-left">
              <div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-full text-base font-semibold">
                {initials || <Smartphone className="size-5" />}
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs">Conta vinculada</p>
                <p title={name} className="truncate font-semibold">
                  {name}
                </p>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  {session.connectedPhone
                    ? "+" + session.connectedPhone.replace(/^\+/, "")
                    : "Número indisponível"}
                </p>
              </div>
            </div>
          )}
          {waitingQr && (
            <div className="relative mt-6">
              {session.qrCode ? (
                <div className="mx-auto w-fit max-w-full rounded-2xl border bg-white p-3 shadow-sm">
                  <QRCodeSVG
                    value={session.qrCode}
                    size={216}
                    marginSize={4}
                    className="h-auto max-w-full"
                    title="Leia este QR Code com o WhatsApp do celular"
                  />
                </div>
              ) : (
                <div
                  role="status"
                  className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed"
                >
                  <LoaderCircle className="text-primary size-6 motion-safe:animate-spin" />
                  <p className="text-muted-foreground text-sm">
                    Gerando um novo QR Code…
                  </p>
                </div>
              )}
              <p className="text-muted-foreground mt-3 text-xs">
                O código é atualizado automaticamente.
              </p>
            </div>
          )}
          {canConnect && (
            <Button
              className="relative mt-6 w-full"
              onClick={onConnect}
              disabled={busy}
              loading={busy}
            >
              <QrCode className="size-4" />
              Conectar WhatsApp
            </Button>
          )}
        </section>

        {session.lastError && (
          <Alert variant="destructive" className="mt-4">
            <WifiOff className="size-4" />
            <AlertDescription className="break-words">
              {session.lastError}
            </AlertDescription>
          </Alert>
        )}
        {session.isPaused && (
          <Alert className="border-warning/25 bg-warning/5 mt-4">
            <AlertDescription>
              Os envios desta conta estão pausados. Você pode retomá-los no card
              da conexão.
            </AlertDescription>
          </Alert>
        )}

        {!ready && (
          <section className="mt-6">
            <h3 className="mb-4 text-sm font-semibold">Como conectar</h3>
            <ol className="space-y-4">
              {[
                "Abra o WhatsApp no seu celular.",
                "Acesse Configurações ou o menu ⋮ e toque em Aparelhos conectados.",
                "Toque em Conectar aparelho e aponte a câmera para o QR Code.",
              ].map((step, index) => (
                <li
                  key={step}
                  className="flex items-start gap-3 text-sm leading-relaxed"
                >
                  <span className="bg-primary/10 text-primary flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
        {connected && (
          <div className="bg-primary/5 mt-5 flex items-start gap-3 rounded-2xl p-4 text-sm">
            <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" />
            <p className="text-muted-foreground leading-relaxed">
              Pode fechar esta janela. Na hora de preparar uma oferta, selecione
              esta conexão e os grupos de destino.
            </p>
          </div>
        )}
      </div>
      <div className="bg-card flex shrink-0 flex-wrap items-center justify-between gap-3 border-t px-5 py-4 sm:px-7">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing || busy}
        >
          <RefreshCw
            className={cn("size-4", refreshing && "motion-safe:animate-spin")}
          />
          Atualizar status
        </Button>
        {!canConnect && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDisconnect}
            disabled={busy}
            loading={busy}
          >
            <LogOut className="size-4" />
            Desconectar
          </Button>
        )}
      </div>
    </>
  );
}
