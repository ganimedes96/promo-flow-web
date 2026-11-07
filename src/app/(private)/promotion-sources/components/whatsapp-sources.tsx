"use client";
import { useCallback, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import {
  MessageCircle,
  RefreshCw,
  Inbox,
  Radio,
  Send,
  Smartphone,
  QrCode,
  LogOut,
  Plus,
} from "lucide-react";
import { getWhatsAppCollectionSources } from "@/domains/collection/client";
import {
  updateWhatsAppCollectionSource,
  removeWhatsAppCollectionSource,
  connectWhatsAppSource,
} from "@/domains/collection/actions";
import { WhatsAppCollectionSource } from "@/domains/collection/types";
import { getWhatsAppConnections } from "@/domains/whatsapp/client";
import { disconnectWhatsApp } from "@/domains/whatsapp/actions";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useServerAction } from "@/hooks/use-server-action";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { PageSkeleton } from "@/components/feedback/loading-skeletons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { WhatsAppConnection } from "../../control-panel/components/whatsapp-connection";
import { WhatsAppSourceList } from "../list/whatsapp-source-list";
import { AddWhatsAppSource } from "../create/add-whatsapp-source";
const invalidations = [
  queryKeys.collection.all,
  queryKeys.whatsapp.connections,
  queryKeys.whatsapp.session,
  queryKeys.whatsapp.groups,
];
export function WhatsAppSources() {
  const { data: session } = useSession();
  const form = useForm({ defaultValues: { connectionId: "" } });
  const connectionId = useWatch({
    control: form.control,
    name: "connectionId",
  });
  const [adding, setAdding] = useState(false),
    [connecting, setConnecting] = useState<string | null>(null),
    [disconnecting, setDisconnecting] = useState(false),
    [removing, setRemoving] = useState<WhatsAppCollectionSource | null>(null);
  const query = useQuery({
    queryKey: queryKeys.collection.whatsapp(session?.user.id),
    queryFn: getWhatsAppCollectionSources,
    enabled: !!session?.user,
    refetchInterval: (query) => (query.state.error ? false : 10000),
    refetchIntervalInBackground: false,
  });
  const accounts = useQuery({
    queryKey: [...queryKeys.whatsapp.connections, session?.user.id],
    queryFn: getWhatsAppConnections,
    enabled: !!session?.user,
    refetchInterval: (query) => (query.state.error ? false : 10000),
    refetchIntervalInBackground: false,
  });
  const connect = useServerAction<{ id: string }, { id?: string }>({
    mutationFn: connectWhatsAppSource,
    invalidateQueries: invalidations,
    successMessage: "Leia o QR Code para conectar.",
    onSuccess: (response) => {
      form.setValue("connectionId", response.data.id);
      setConnecting(response.data.id);
    },
  });
  const disconnect = useServerAction({
    mutationFn: ({ id }: { id: string }) => disconnectWhatsApp(id),
    invalidateQueries: invalidations,
    successMessage: "Desconexão solicitada.",
    onSuccess: () => setDisconnecting(false),
  });
  const toggle = useServerAction<unknown, { id: string; enabled: boolean }>({
    mutationFn: updateWhatsAppCollectionSource,
    invalidateQueries: [queryKeys.collection.all],
    successMessage: "Fonte atualizada.",
  });
  const removal = useServerAction<unknown, { id: string }>({
    mutationFn: removeWhatsAppCollectionSource,
    invalidateQueries: [queryKeys.collection.all],
    successMessage: "Fonte removida do monitoramento.",
    onSuccess: () => setRemoving(null),
  });
  const refresh = () => {
    void query.refetch();
    void accounts.refetch();
  };
  const { refetch: refetchSources } = query;
  const { refetch: refetchAccounts } = accounts;
  const onConnected = useCallback(() => {
    setConnecting(null);
    void refetchSources();
    void refetchAccounts();
  }, [refetchSources, refetchAccounts]);
  if (query.isPending || accounts.isPending)
    return <PageSkeleton variant="connections" />;
  if (query.isError || accounts.isError)
    return (
      <ApiErrorCard
        error={query.error || accounts.error}
        title="Não foi possível consultar as fontes do WhatsApp"
        onRetry={refresh}
        retrying={query.isFetching || accounts.isFetching}
      />
    );
  const rows = accounts.data?.connections ?? [];
  const account = rows.find((row) => row.id === connectionId) || rows[0];
  const sources = (query.data ?? []).filter(
    (source) => source.connectionId === account?.id
  );
  const selected = sources.filter((source) => source.captureSelected);
  const workerOnline = accounts.data?.worker?.status === "ONLINE";
  const ready = account?.status === "READY" && workerOnline;
  const busy = connect.isPending || disconnect.isPending;
  return (
    <div className="min-w-0 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-primary mb-2 flex items-center gap-2 text-xs font-semibold uppercase">
            <Radio className="size-4" />
            Curadoria administrativa
          </p>
          <h1 className="text-2xl font-semibold">Fontes de promoções</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Gerencie sua conta do WhatsApp e os grupos que enviam rascunhos para
            a Central.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/promotions/manage">
              <Inbox className="size-4" />
              Gerenciar promoções
            </Link>
          </Button>
          <Button
            variant="ghost"
            disabled={query.isFetching || accounts.isFetching}
            onClick={refresh}
            aria-label="Atualizar gerenciamento"
          >
            <RefreshCw
              className={
                query.isFetching || accounts.isFetching
                  ? "size-4 motion-safe:animate-spin"
                  : "size-4"
              }
            />
          </Button>
        </div>
      </header>
      <Card className="from-primary/15 via-card to-card overflow-hidden rounded-3xl bg-gradient-to-br">
        <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="bg-primary/15 text-primary flex size-14 items-center justify-center rounded-2xl">
                <MessageCircle
                  className={
                    ready ? "size-7 motion-safe:animate-pulse" : "size-7"
                  }
                />
              </span>
              <div>
                <p className="text-muted-foreground text-xs uppercase">
                  Conexão do WhatsApp
                </p>
                <h2 className="text-xl font-semibold">
                  {ready
                    ? account.connectedName || account.name
                    : "Sua curadoria começa aqui"}
                </h2>
                {account?.connectedPhone && (
                  <p className="text-muted-foreground text-sm">
                    +{account.connectedPhone}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                className={
                  ready
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-orange-700 bg-orange-700 text-white"
                }
              >
                {ready
                  ? "Conectado"
                  : account?.status === "WAITING_QR"
                    ? "Aguardando leitura"
                    : "Aguardando conexão"}
              </Badge>
              <Badge variant="outline">
                <Radio className="size-3" />
                {workerOnline
                  ? "Worker local ativo"
                  : "Aguardando worker local"}
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
              {ready
                ? "Escolha os grupos que quer acompanhar. As promoções entram diretamente em Gerenciar promoções como rascunhos."
                : "Conecte pelo QR Code e escolha suas fontes. Use uma conta existente ou adicione uma conta para sua curadoria."}
            </p>
            {rows.length > 0 && (
              <ControlledCombobox
                control={form.control}
                name="connectionId"
                label="Conta para acompanhar"
                placeholder={account?.name || "Selecione uma conta"}
                options={rows.map((row) => ({
                  id: row.id,
                  name:
                    row.name +
                    (row.connectedPhone ? " · +" + row.connectedPhone : ""),
                }))}
              />
            )}
            {!workerOnline && (
              <Alert>
                <AlertDescription>
                  Inicie o worker e o coletor local para conectar e receber
                  novas promoções.
                </AlertDescription>
              </Alert>
            )}
            {account?.lastError && (
              <Alert variant="destructive">
                <AlertDescription>{account.lastError}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-wrap gap-2">
              {ready ? (
                <>
                  <Button
                    variant="outline"
                    onClick={refresh}
                    disabled={query.isFetching}
                  >
                    <RefreshCw className="size-4" />
                    Atualizar grupos
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setConnecting(account.id)}
                  >
                    <Smartphone className="size-4" />
                    Ver conexão
                  </Button>
                </>
              ) : (
                <Button
                  disabled={busy || !workerOnline}
                  onClick={() => connect.mutate({ id: account?.id })}
                >
                  <QrCode className="size-4" />
                  {account?.status === "WAITING_QR"
                    ? "Gerar novo QR Code"
                    : "Conectar WhatsApp"}
                </Button>
              )}
              {account && account.status !== "DISCONNECTED" && (
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => setDisconnecting(true)}
                >
                  <LogOut className="size-4" />
                  Desconectar
                </Button>
              )}
              {rows.length > 0 && (
                <Button
                  variant="ghost"
                  disabled={busy || !workerOnline}
                  onClick={() => connect.mutate({})}
                >
                  <Plus className="size-4" />
                  Adicionar conta
                </Button>
              )}
            </div>
          </div>
          <div className="bg-background/70 flex min-h-48 flex-col items-center justify-center gap-4 rounded-2xl border p-5 text-center">
            <div className="bg-primary/15 text-primary flex size-20 items-center justify-center rounded-3xl">
              <Smartphone
                className={
                  ready ? "size-10 motion-safe:animate-pulse" : "size-10"
                }
              />
            </div>
            <div>
              <p className="font-semibold">
                {ready ? "Conta pronta para acompanhar" : "Conecte sua conta"}
              </p>
              <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                {ready
                  ? "Adicione os grupos que deseja acompanhar na lista de fontes."
                  : "O QR Code abre aqui na página. Leia pelo WhatsApp do seu celular."}
              </p>
            </div>
            <Badge variant="outline">
              {selected.length} fontes monitoradas
            </Badge>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Fontes monitoradas", value: selected.length, icon: Radio },
          {
            label: "Fontes habilitadas",
            value: selected.filter((source) => source.captureEnabled).length,
            icon: Send,
          },
          {
            label: "Promoções recebidas",
            value: sources.reduce(
              (sum, source) => sum + source.capturedCount,
              0
            ),
            icon: Inbox,
          },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-4">
              <span className="bg-primary/10 text-primary rounded-xl p-3">
                <item.icon className="size-5" />
              </span>
              <div>
                <p className="text-muted-foreground text-xs">{item.label}</p>
                <p className="text-2xl font-semibold">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <WhatsAppSourceList
        sources={sources}
        online={!!workerOnline}
        busy={toggle.isPending || removal.isPending}
        onToggle={(source) =>
          toggle.mutate({ id: source.id, enabled: !source.captureEnabled })
        }
        onRemove={setRemoving}
        onAdd={() => {
          setAdding(true);
          void query.refetch();
        }}
      />
      <AddWhatsAppSource
        key={account?.id || "none"}
        open={adding}
        onOpenChange={setAdding}
        sources={sources}
        online={!!ready}
        onSync={refresh}
        syncing={query.isFetching}
      />
      <Sheet
        open={!!connecting}
        onOpenChange={(open) => {
          if (!open) setConnecting(null);
        }}
      >
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
          <SheetHeader className="border-b p-6">
            <SheetTitle>Conectar WhatsApp</SheetTitle>
            <SheetDescription>
              Leia o QR Code para preparar a captura das suas fontes.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {connecting && (
              <WhatsAppConnection
                connectionId={connecting}
                variant="sheet"
                showWorkerIndicator={false}
                onConnected={onConnected}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
      <AlertDialog
        open={!!removing}
        onOpenChange={(open) => {
          if (!open && !removal.isPending) setRemoving(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover fonte?</AlertDialogTitle>
            <AlertDialogDescription>
              O grupo {removing?.name} deixará de ser acompanhado. O histórico
              será preservado. Sua conta não sairá do grupo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removal.isPending}>
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={removal.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (removing) removal.mutate({ id: removing.id });
              }}
            >
              Remover fonte
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={disconnecting} onOpenChange={setDisconnecting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desconectar WhatsApp?</AlertDialogTitle>
            <AlertDialogDescription>
              A captura será interrompida nesta conta. Ela também deixará de
              enviar ofertas agendadas até ser conectada novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disconnect.isPending}>
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={disconnect.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (account) disconnect.mutate({ id: account.id });
              }}
            >
              Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
