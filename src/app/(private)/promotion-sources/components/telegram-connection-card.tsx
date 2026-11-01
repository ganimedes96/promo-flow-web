"use client";
import type { QueryKey } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { QRCodeSVG } from "qrcode.react";
import {
  Send,
  Radio,
  RefreshCw,
  Link2,
  LogOut,
  LockKeyhole,
  QrCode,
} from "lucide-react";
import { TelegramState } from "@/domains/telegram/types";
import { sendTelegramPassword } from "@/domains/telegram/actions";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
function PasswordForm({
  flowId,
  disabled,
  sendPassword = sendTelegramPassword,
  invalidations = [queryKeys.telegram.all],
}: {
  flowId: string;
  disabled: boolean;
  sendPassword?: typeof sendTelegramPassword;
  invalidations?: readonly QueryKey[];
}) {
  const form = useForm<{ password: string }>({
    defaultValues: { password: "" },
  });
  const action = useServerAction<unknown, { flowId: string; password: string }>(
    {
      mutationFn: sendPassword,
      invalidateQueries: invalidations,
      successMessage: "Senha enviada para o coletor.",
      onSuccess: () => form.reset(),
    }
  );
  return (
    <form
      className="bg-card space-y-3 rounded-2xl border p-5"
      onSubmit={form.handleSubmit(({ password }) =>
        action.mutate({ flowId, password })
      )}
    >
      <p className="flex items-center gap-2 text-sm font-semibold">
        <LockKeyhole className="size-4" /> Senha de duas etapas
      </p>
      <p className="text-muted-foreground text-xs">
        O Telegram solicitou sua senha adicional para concluir a conexão.
      </p>
      <ControlledInput
        control={form.control}
        name="password"
        type="password"
        label="Senha do Telegram"
        placeholder="Sua senha de duas etapas"
        autoComplete="off"
        rules={{ required: "Informe a senha." }}
        maxLength={256}
      />
      <Button
        disabled={disabled || action.isPending}
        loading={action.isPending}
        type="submit"
      >
        Confirmar senha
      </Button>
    </form>
  );
}
const labels = {
  DISCONNECTED: "Desconectado",
  CONNECTING: "Conectando",
  WAITING_QR: "Aguardando leitura",
  WAITING_PASSWORD: "Confirmar senha",
  READY: "Conectado",
  ERROR: "Precisa de atenção",
};
export function TelegramConnectionCard({
  state,
  busy,
  onAction,
  personal = false,
  collectorOnline,
  sendPassword,
  invalidations,
}: {
  state: TelegramState;
  personal?: boolean;
  collectorOnline?: boolean;
  sendPassword?: typeof sendTelegramPassword;
  invalidations?: readonly QueryKey[];
  busy: boolean;
  onAction: (action: "connect" | "disconnect" | "sync") => void;
}) {
  const [disconnecting, setDisconnecting] = useState(false);
  const ready = state.online && state.status === "READY";
  const connecting = ["CONNECTING", "WAITING_QR", "WAITING_PASSWORD"].includes(
    state.status
  );
  const serviceOnline = collectorOnline ?? state.online;
  const disabled = busy || state.commandPending || !serviceOnline;
  const badgeColor = ready
    ? "bg-emerald-700 text-white border-emerald-700"
    : !state.online
      ? "bg-orange-700 text-white border-orange-700"
      : state.status === "ERROR"
        ? "bg-rose-700 text-white border-rose-700"
        : "bg-blue-700 text-white border-blue-700";
  return (
    <>
      <Card className="from-primary/15 via-card to-card overflow-hidden rounded-3xl bg-gradient-to-br">
        <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="bg-primary/15 text-primary flex size-14 items-center justify-center rounded-2xl">
                <Send
                  className={
                    ready ? "size-7 motion-safe:animate-pulse" : "size-7"
                  }
                />
              </span>
              <div>
                <p className="text-muted-foreground text-xs uppercase">
                  Conexão do Telegram
                </p>
                <h2 className="text-xl font-semibold">
                  {ready
                    ? state.accountName || "Sua conta conectada"
                    : personal
                      ? "Conecte seu Telegram"
                      : "Sua curadoria começa aqui"}
                </h2>
                {ready && state.phone && (
                  <p className="text-muted-foreground text-sm">
                    +{state.phone.replace(/^\+/, "")}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={badgeColor}>
                {state.online
                  ? labels[state.status]
                  : personal
                    ? serviceOnline
                      ? "Aguardando conexão"
                      : "Serviço indisponível"
                    : "Coletor offline"}
              </Badge>
              <Badge variant="outline">
                <Radio className="size-3" />{" "}
                {personal
                  ? serviceOnline
                    ? "Captura disponível"
                    : "Captura indisponível"
                  : state.online
                    ? "Coletor local ativo"
                    : "Aguardando coletor local"}
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
              {personal
                ? ready
                  ? "Selecione canais e grupos para receber rascunhos na sua página de Ofertas. Nada é enviado automaticamente."
                  : "Sua conexão e suas fontes ficam somente na sua conta. Leia o QR Code pelo Telegram do celular."
                : ready
                  ? "Escolha os canais que quer acompanhar. As promoções entram diretamente em Gerenciar promoções como rascunhos."
                  : "Conecte pelo QR Code e escolha suas fontes. A conta e as fontes são exclusivas da curadoria administrativa."}
            </p>
            {!serviceOnline && (
              <Alert>
                <AlertDescription>
                  {personal ? (
                    "O serviço de captura está indisponível neste momento. Tente novamente em instantes ou entre em contato com o suporte."
                  ) : (
                    <>
                      Inicie <code>pnpm start</code> na pasta{" "}
                      <strong>promo-flow-telegram</strong>. O processo precisa
                      continuar rodando no computador para conectar e capturar.
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}
            {state.lastError && (
              <Alert variant="destructive">
                <AlertDescription>{state.lastError}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-wrap gap-2">
              {ready ? (
                <Button
                  variant="outline"
                  disabled={disabled}
                  onClick={() => onAction("sync")}
                >
                  <RefreshCw className="size-4" /> Atualizar canais
                </Button>
              ) : (
                <Button disabled={disabled} onClick={() => onAction("connect")}>
                  <QrCode className="size-4" />{" "}
                  {connecting ? "Gerar novo QR Code" : "Conectar Telegram"}
                </Button>
              )}
              {(ready || connecting) && (
                <Button
                  variant="outline"
                  disabled={busy || !serviceOnline}
                  onClick={() => setDisconnecting(true)}
                >
                  <LogOut className="size-4" />{" "}
                  {ready ? "Desconectar" : "Cancelar conexão"}
                </Button>
              )}
            </div>
            {state.commandPending && (
              <p
                className="text-muted-foreground flex items-center gap-2 text-xs"
                role="status"
              >
                <RefreshCw className="size-3 motion-safe:animate-spin" />{" "}
                Aguardando o coletor aplicar a solicitação…
              </p>
            )}
          </div>
          <div className="bg-background/70 flex min-h-48 items-center justify-center rounded-2xl border p-5">
            {state.online && state.status === "WAITING_QR" ? (
              <div className="space-y-3 text-center">
                {state.qrUrl ? (
                  <div className="rounded-xl bg-white p-3">
                    <QRCodeSVG value={state.qrUrl} size={188} level="M" />
                  </div>
                ) : (
                  <RefreshCw className="text-primary mx-auto size-12 motion-safe:animate-spin" />
                )}
                <p className="text-muted-foreground max-w-56 text-xs">
                  No Telegram: Configurações → Dispositivos → Conectar
                  dispositivo. Leia este QR Code.
                </p>
              </div>
            ) : state.online &&
              state.status === "WAITING_PASSWORD" &&
              state.flowId ? (
              <PasswordForm
                key={state.flowId}
                flowId={state.flowId}
                disabled={disabled}
                sendPassword={sendPassword}
                invalidations={invalidations}
              />
            ) : (
              <div className="text-center">
                <div className="bg-primary/10 text-primary mx-auto flex size-24 items-center justify-center rounded-full">
                  <Link2
                    className={
                      ready ? "size-12 motion-safe:animate-pulse" : "size-12"
                    }
                  />
                </div>
                <p className="mt-4 text-sm font-semibold">
                  {ready
                    ? "Telegram pronto para capturar"
                    : "Conecte suas fontes"}
                </p>
                <p className="text-muted-foreground mt-2 max-w-52 text-xs">
                  {ready
                    ? "A revisão continua sendo sua. Nada é publicado automaticamente."
                    : personal
                      ? "Você controla quais fontes serão acompanhadas."
                      : "Sua sessão permanece no coletor local."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={disconnecting} onOpenChange={setDisconnecting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desconectar o Telegram?</AlertDialogTitle>
            <AlertDialogDescription>
              A captura será interrompida e a sessão deste coletor será
              encerrada. As promoções capturadas ficam preservadas. Para
              conectar novamente, leia um novo QR Code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onAction("disconnect");
                setDisconnecting(false);
              }}
            >
              Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
