"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  LoaderCircle,
  LogOut,
  MessageCircle,
  Plus,
  QrCode,
  RefreshCw,
  Send,
  Smartphone,
  Sparkles,
  WifiOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConnectionPanelSkeleton } from "@/components/feedback/loading-skeletons";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { cn } from "@/lib/shadcn/utils";
import { WorkerIndicator } from "./worker-indicator";
import type { ConnectionAccountDetailsProps } from "./connection-account-details";
import styles from "./connection-panel.module.css";

export function ConnectionPanel({
  session,
  loading,
  refreshing,
  error,
  busy,
  onConnect,
  onDisconnect,
  onRefresh,
  showWorkerIndicator,
}: ConnectionAccountDetailsProps & { showWorkerIndicator: boolean }) {
  if (error)
    return (
      <ApiErrorCard
        title="Não foi possível carregar sua conta do WhatsApp"
        onRetry={onRefresh}
        retrying={refreshing}
      />
    );
  if (loading || !session) return <ConnectionPanelSkeleton />;
  const ready = session.status === "READY";
  const connected = ready && session.worker?.status === "ONLINE";
  const connecting =
    session.status === "CONNECTING" || session.status === "AUTHENTICATED";
  const waitingQr = session.status === "WAITING_QR";
  const canConnect =
    session.status === "DISCONNECTED" || session.status === "ERROR";
  const publishing =
    connected && session.worker?.publishingEnabled && !session.isPaused;
  const name = session.connectedName?.trim() || "Sua conta do WhatsApp";
  const initials = session.connectedName
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const status = connected
    ? "WhatsApp conectado"
    : ready
      ? "Sessão salva"
      : waitingQr
        ? "Leia o QR Code"
        : connecting
          ? "Conectando sua conta"
          : session.status === "ERROR"
            ? "A conexão precisa de atenção"
            : "WhatsApp desconectado";
  return (
    <Card
      className={cn(
        "whatsapp-connection-card gap-0 overflow-hidden rounded-3xl py-0",
        styles.panel
      )}
    >
      <div aria-hidden="true" className={styles.texture} />
      <div className="relative grid items-center gap-6 px-6 pt-7 pb-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 lg:px-10 lg:pt-9">
        <div className={cn("min-w-0", styles.entrance)}>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="mr-auto flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              <MessageCircle className="size-4" />
              Seu WhatsApp no PromoFlow
            </span>
            <Badge
              variant="outline"
              className="border-primary/25 bg-background text-foreground"
            >
              {session.name || "Conexão principal"}
            </Badge>
          </div>
          <div
            role="status"
            aria-live="polite"
            className="mb-4 flex items-center gap-2 text-sm font-medium"
          >
            <span
              aria-hidden="true"
              className={cn(
                "relative flex size-2.5",
                connected ? "text-success" : "text-warning"
              )}
            >
              {connected && (
                <span className="absolute inline-flex size-full rounded-full bg-current opacity-40 motion-safe:animate-ping" />
              )}
              <span className="relative inline-flex size-2.5 rounded-full bg-current" />
            </span>
            {status}
          </div>
          <h2 className="max-w-xl text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            {connected
              ? "Sua próxima boa oferta começa aqui."
              : ready
                ? "Sua conta está guardada. Vamos continuar?"
                : "Conecte sua conta. Dê mais flow às suas ofertas."}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg text-sm leading-relaxed">
            {connected
              ? "Prepare a promoção, escolha os destinos e acompanhe cada envio no seu ritmo."
              : ready
                ? "O WhatsApp tem uma sessão salva. Assim que o publicador voltar, a conexão será confirmada."
                : connecting
                  ? "Estamos preparando a conexão. O QR Code e a confirmação aparecem aqui automaticamente."
                  : waitingQr
                    ? "Abra o WhatsApp no celular, acesse Aparelhos conectados e toque em Conectar aparelho."
                    : "Vincule seu número para organizar e compartilhar suas promoções em um só lugar."}
          </p>

          {ready && (
            <div className="whatsapp-connection-subcard mt-6 flex max-w-lg items-center gap-4 rounded-2xl border p-4">
              <div className="bg-background text-primary relative flex size-14 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold">
                {initials || <Smartphone className="size-6" />}
                {connected && (
                  <span className="bg-success ring-card absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full text-white ring-2">
                    <Check className="size-3" />
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                  Conta vinculada
                </p>
                <p className="truncate text-lg font-semibold" title={name}>
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
          <div className="mt-6 flex flex-wrap gap-3">
            {connected ? (
              <Button asChild className="group">
                <Link href="/offers">
                  <Plus className="size-4" />
                  Preparar uma oferta
                  <ArrowRight className="size-4 transition-transform motion-safe:group-hover:translate-x-1" />
                </Link>
              </Button>
            ) : canConnect ? (
              <Button onClick={onConnect} disabled={busy} loading={busy}>
                <QrCode className="size-4" />
                Conectar WhatsApp
              </Button>
            ) : null}
            <Button asChild variant="outline" className="bg-background">
              <Link href="/connections">
                <Smartphone className="size-4" />
                Gerenciar contas
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center py-4 lg:py-8">
          {waitingQr ? (
            <div className="text-center">
              {session.qrCode ? (
                <div className="mx-auto w-fit rounded-3xl border bg-white p-4 shadow-sm">
                  <QRCodeSVG
                    value={session.qrCode}
                    size={216}
                    marginSize={4}
                    className="h-auto max-w-full"
                    title="QR Code para conectar seu WhatsApp"
                  />
                </div>
              ) : (
                <div className="bg-background flex size-60 flex-col items-center justify-center gap-3 rounded-3xl border">
                  <LoaderCircle className="size-8 motion-safe:animate-spin" />
                  <p className="text-sm">Gerando QR Code…</p>
                </div>
              )}
              <p className="text-muted-foreground mt-3 text-xs">
                A confirmação aparece automaticamente.
              </p>
            </div>
          ) : (
            <div
              aria-hidden="true"
              className={cn(styles.scene, connected && styles.active)}
            >
              <div className={styles.orbit} />
              <div className={styles.orbitInner} />
              <div className={styles.phone}>
                <div className="bg-primary/20 mx-auto mb-5 h-1.5 w-9 rounded-full" />
                <div className="border-primary/15 mb-4 flex items-center gap-2 border-b pb-3 text-xs font-semibold">
                  <MessageCircle className="size-4" />
                  PromoFlow
                </div>
                <div className="bg-primary/10 text-primary mx-auto flex size-16 items-center justify-center rounded-2xl">
                  {connected ? (
                    <CheckCircle2 className="size-9" />
                  ) : connecting ? (
                    <LoaderCircle className="size-9 motion-safe:animate-spin" />
                  ) : (
                    <Smartphone className="size-9" />
                  )}
                </div>
                <p className="mt-3 text-center text-xs font-semibold">
                  {connected
                    ? "Tudo conectado"
                    : ready
                      ? "Sessão salva"
                      : "Seu próximo passo"}
                </p>
                <div className="mt-5 space-y-2">
                  <div className="bg-primary/15 h-2 w-4/5 rounded-full" />
                  <div className="bg-primary/10 h-2 w-3/5 rounded-full" />
                </div>
                <div className="bg-primary/10 text-primary mt-4 flex items-center justify-between rounded-xl p-2">
                  <span className="bg-primary/20 h-1.5 w-14 rounded-full" />
                  <Send className="size-3.5" />
                </div>
              </div>
              <div className={cn(styles.floatingBadge, styles.topBadge)}>
                <Sparkles className="text-primary size-4" />
                <span>Mais flow na rotina</span>
              </div>
              <div className={cn(styles.floatingBadge, styles.bottomBadge)}>
                {connected ? (
                  <CheckCircle2 className="text-success size-4" />
                ) : (
                  <QrCode className="text-primary size-4" />
                )}
                <span>
                  {connected ? "Conta conectada" : "Conecte com QR Code"}
                </span>
              </div>
              {publishing && (
                <div className={styles.delivery}>
                  <Send className="size-4" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="relative grid gap-3 px-6 pb-6 sm:grid-cols-3 sm:px-8 lg:px-10">
        {[
          {
            label: "Conexão",
            value: connected
              ? "Conectada"
              : ready
                ? "Aguardando publicador"
                : connecting
                  ? "Em preparação"
                  : waitingQr
                    ? "Aguardando QR Code"
                    : "Desconectada",
            icon: connected ? CheckCircle2 : Smartphone,
            active: connected,
          },
          {
            label: "Publicador",
            value:
              session.worker?.status === "ONLINE"
                ? "Online"
                : "Sem comunicação",
            icon: session.worker?.status === "ONLINE" ? Send : WifiOff,
            active: session.worker?.status === "ONLINE",
          },
          {
            label: "Envios",
            value: session.isPaused
              ? "Pausados nesta conta"
              : publishing
                ? "Habilitados"
                : "Aguardando liberação",
            icon: Send,
            active: !!publishing,
          },
        ].map(({ label, value, icon: Icon, active }) => (
          <div
            key={label}
            className="whatsapp-connection-subcard flex items-center gap-3 rounded-2xl border px-4 py-3"
          >
            <span
              className={cn(
                "bg-background flex size-9 shrink-0 items-center justify-center rounded-xl",
                active ? "text-success" : "text-muted-foreground"
              )}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">{label}</p>
              <p className="text-sm font-semibold">{value}</p>
            </div>
          </div>
        ))}
      </div>
      {session.lastError && (
        <div className="relative px-6 pb-5 sm:px-8 lg:px-10">
          <Alert variant="destructive">
            <AlertDescription className="break-words">
              {session.lastError}
            </AlertDescription>
          </Alert>
        </div>
      )}
      <div className="border-primary/15 relative flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4 sm:px-8 lg:px-10">
        <p className="text-muted-foreground flex items-center gap-2 text-xs">
          <RefreshCw className="size-3.5" />
          Status atualizado automaticamente
        </p>
        <div className="flex flex-wrap gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing || busy}
          >
            <RefreshCw
              className={cn(
                "size-3.5",
                refreshing && "motion-safe:animate-spin"
              )}
            />
            Atualizar
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
              <LogOut className="size-3.5" />
              Desconectar
            </Button>
          )}
        </div>
      </div>
      {showWorkerIndicator && (
        <details className="border-primary/15 relative border-t px-6 py-4 sm:px-8 lg:px-10">
          <summary className="group text-muted-foreground flex cursor-pointer list-none items-center justify-between text-xs font-medium [&::-webkit-details-marker]:hidden">
            Detalhes do publicador
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="pt-4">
            <WorkerIndicator worker={session.worker} />
          </div>
        </details>
      )}
    </Card>
  );
}
