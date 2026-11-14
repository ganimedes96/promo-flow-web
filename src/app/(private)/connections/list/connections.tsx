"use client";
import {
  ActivityHistory,
  SupportReference,
} from "@/components/feedback/activity-history";
import { AnimatedChannelIcon } from "@/components/brand/animated-channel-icon";
import { TelegramLinkDialog } from "../create/telegram-link";
import { useCallback, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Send,
  Trash2,
  Smartphone,
  MoreHorizontal,
  Star,
  Pencil,
  Pause,
  Play,
  Users,
  ListOrdered,
} from "lucide-react";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { PageSkeleton } from "@/components/feedback/loading-skeletons";
import { EmptyStateCard } from "@/components/feedback/empty-state-card";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import {
  getConnectionBadgeStyle,
  connectionBadgeStyles,
} from "@/domains/whatsapp/badge-styles";
import { getWhatsAppConnections } from "@/domains/whatsapp/client";
import {
  saveWhatsAppConnection,
  deleteWhatsAppConnection,
  updateWhatsAppConnection,
  connectWhatsApp,
} from "@/domains/whatsapp/actions";
import { WhatsAppConnectionAccount } from "@/domains/whatsapp/connections";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { WhatsAppConnection } from "../../control-panel/components/whatsapp-connection";
import { WorkerIndicator } from "../../control-panel/components/worker-indicator";
const invalidations = [
  queryKeys.whatsapp.connections,
  queryKeys.whatsapp.session,
  queryKeys.whatsapp.groups,
  queryKeys.offers.all,
  queryKeys.billing.all,
];
export function Connections({
  initialTelegramOpen = false,
}: {
  initialTelegramOpen?: boolean;
}) {
  const { data: session } = useSession();
  const [editing, setEditing] = useState<
    WhatsAppConnectionAccount | null | undefined
  >();
  const [switchDefault, setSwitchDefault] = useState(false);
  const [telegramOpen, setTelegramOpen] = useState(initialTelegramOpen);
  const [selected, setSelected] = useState<string | null>(null);
  const [removing, setRemoving] = useState<WhatsAppConnectionAccount | null>(
    null
  );
  const remove = useServerAction({
    mutationFn: deleteWhatsAppConnection,
    invalidateQueries: invalidations,
    successMessage: "Conexão excluída. Histórico preservado.",
    onSuccess: () => {
      setRemoving(null);
      setSelected(null);
    },
  });
  const closeConnectionSheet = useCallback(() => setSelected(null), []);
  const list = useQuery({
    queryKey: [...queryKeys.whatsapp.connections, session?.user.id],
    queryFn: getWhatsAppConnections,
    enabled: !!session?.user.id,
    refetchInterval: (query) => query.state.error ? false : 30000,
  });
  const change = useServerAction({
    mutationFn: updateWhatsAppConnection,
    invalidateQueries: invalidations,
  });
  const connect = useServerAction({
    mutationFn: ({ id }: { id: string }) => connectWhatsApp(id),
    invalidateQueries: invalidations,
    onSuccess: (_result, variables) => setSelected(variables.id),
    successMessage: "Conexão solicitada. Leia o QR Code.",
  });
  const rows = list.data?.connections || [];
  const active = rows.filter((c) => c.status === "READY").length;
  if (list.isPending) return <PageSkeleton variant="connections" />;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Conexões</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Gerencie suas conexões de WhatsApp e Telegram e os destinos das
            ofertas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setTelegramOpen(true)}>
            <Send className="size-4" />
            Adicionar Telegram
          </Button>
          <Button onClick={() => setEditing(null)}>
            <Plus className="size-4" />
            Adicionar WhatsApp
          </Button>
        </div>
      </div>
      <WorkerIndicator worker={list.data?.worker} unavailable={!!list.error} />
      <div className="bg-primary/5 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3">
        <p className="text-muted-foreground text-sm">
          Os destinos e favoritos ficam na página de Grupos.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/groups">
            <Users className="size-4" />
            Gerenciar grupos
          </Link>
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{rows.length} conexões</Badge>
        <Badge variant="outline">{active} com sessão pronta</Badge>
      </div>
      {list.error ? (
        <ApiErrorCard
          error={list.error}
          title="Não foi possível carregar suas conexões"
          onRetry={() => {
            void list.refetch();
          }}
          retrying={list.isFetching}
        />
      ) : !rows.length ? (
        <EmptyStateCard
          icon={Smartphone}
          title="Seu primeiro WhatsApp começa aqui"
          description="Dê um nome à conexão e leia o QR Code. Depois, escolha seus grupos favoritos e prepare suas ofertas."
          action={
            <Button onClick={() => setEditing(null)}>
              <Plus className="size-4" />
              Adicionar meu WhatsApp
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((connection) => {
            const telegram = connection.provider === "TELEGRAM_BOT";
            const ready = connection.status === "READY";
            const connected = ready && list.data?.worker?.status === "ONLINE";
            const status = connected
              ? "Conectado"
              : ready
                ? "Aguardando publicador"
                : connection.status === "WAITING_QR"
                  ? "Leia o QR Code"
                  : connection.status === "CONNECTING" ||
                      connection.status === "AUTHENTICATED"
                    ? "Conectando"
                    : connection.status === "ERROR"
                      ? "Precisa de atenção"
                      : "Desconectado";
            return (
              <Card key={connection.id} className="gap-4 overflow-hidden">
                <CardHeader className="pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <AnimatedChannelIcon
                        platform={telegram ? "telegram" : "whatsapp"}
                      />
                      <div className="min-w-0">
                        <CardTitle
                          className="truncate text-base"
                          title={connection.name}
                        >
                          {connection.name}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {telegram
                            ? "Bot do Telegram"
                            : connection.connectedPhone
                              ? "+" + connection.connectedPhone
                              : "Número ainda não vinculado"}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={"Opções de " + connection.name}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => setEditing(connection)}
                        >
                          <Pencil className="size-4" />
                          Renomear
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={telegram || change.isPending}
                          onSelect={() =>
                            connection.isDefault
                              ? setSwitchDefault(true)
                              : change.mutate({
                                  id: connection.id,
                                  isDefault: true,
                                })
                          }
                        >
                          <Star className="size-4" />
                          {connection.isDefault
                            ? "Trocar conexão padrão"
                            : "Definir como padrão"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          disabled={remove.isPending}
                          onSelect={() => setRemoving(connection)}
                        >
                          <Trash2 className="size-4" />
                          Excluir conexão
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={getConnectionBadgeStyle(
                        connection.status,
                        connected
                      )}
                    >
                      {status}
                    </Badge>
                    <Badge variant="outline">
                      {telegram ? "Telegram" : "WhatsApp"}
                    </Badge>
                    {connection.isPaused && (
                      <Badge
                        variant="outline"
                        className={connectionBadgeStyles.waiting}
                      >
                        <Pause className="size-3" />
                        Envios pausados
                      </Badge>
                    )}
                    {connection.isDefault && (
                      <Badge
                        variant="outline"
                        className={connectionBadgeStyles.authenticated}
                      >
                        <Star className="size-3" />
                        Padrão
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground truncate text-sm">
                    {connection.connectedName ||
                      (telegram
                        ? "Bot de publicação"
                        : "Leia o QR Code para identificar esta conta")}
                  </p>
                  <div className="bg-muted/40 grid grid-cols-2 gap-3 rounded-xl p-3 text-xs">
                    <span className="flex items-center gap-2">
                      <Users className="text-muted-foreground size-4" />
                      {connection.groupCount ?? 0} grupos
                    </span>
                    <span className="flex items-center gap-2">
                      <ListOrdered className="text-muted-foreground size-4" />
                      {connection.pendingCount ?? 0} na fila
                    </span>
                  </div>
                  {connection.lastError && (
                    <div className="border-destructive/25 bg-destructive/5 space-y-2 rounded-lg border p-3">
                      <p className="text-destructive text-xs">
                        {connection.activityEvents?.[0]?.message ??
                          "Não foi possível preparar esta conexão. Tente novamente ou procure o suporte."}
                      </p>
                      {connection.activityEvents?.[0] && (
                        <SupportReference
                          event={connection.activityEvents[0]}
                        />
                      )}
                    </div>
                  )}
                  <ActivityHistory resource={{ connectionId: connection.id }} />
                  {!telegram && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-between"
                      disabled={change.isPending}
                      onClick={() =>
                        connection.isDefault
                          ? setSwitchDefault(true)
                          : change.mutate({
                              id: connection.id,
                              isDefault: true,
                            })
                      }
                    >
                      <span className="flex items-center gap-2">
                        <Star
                          className={`size-3.5 ${connection.isDefault ? "fill-current" : ""}`}
                        />
                        {connection.isDefault
                          ? "Conexão padrão"
                          : "Usar como padrão"}
                      </span>
                      {connection.isDefault && (
                        <span className="text-muted-foreground text-xs">
                          Trocar
                        </span>
                      )}
                    </Button>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={ready ? "outline" : "default"}
                      disabled={connect.isPending}
                      onClick={() =>
                        telegram
                          ? setTelegramOpen(true)
                          : connection.status === "DISCONNECTED" ||
                              connection.status === "ERROR"
                            ? connect.mutate({ id: connection.id })
                            : setSelected(connection.id)
                      }
                    >
                      {telegram
                        ? "Vincular grupo / canal"
                        : ready
                          ? "Gerenciar conexão"
                          : "Conectar / ver QR"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={change.isPending}
                      onClick={() =>
                        change.mutate({
                          id: connection.id,
                          isPaused: !connection.isPaused,
                        })
                      }
                    >
                      {connection.isPaused ? (
                        <Play className="size-3.5" />
                      ) : (
                        <Pause className="size-3.5" />
                      )}
                      {connection.isPaused ? "Retomar" : "Pausar envios"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <Dialog
        open={editing !== undefined}
        onOpenChange={(open) => {
          if (!open) setEditing(undefined);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Renomear conexão" : "Adicionar WhatsApp"}
            </DialogTitle>
          </DialogHeader>
          <ConnectionNameForm
            key={editing?.id || "new"}
            connection={editing || undefined}
            onSuccess={(connection) => {
              const isNew = !editing;
              setEditing(undefined);
              if (isNew) connect.mutate({ id: connection.id });
            }}
          />
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!removing}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setRemoving(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {removing?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {removing?.provider === "TELEGRAM_BOT"
                ? "O bot deixará de publicar nos destinos desta conexão. Os agendamentos serão cancelados e o histórico será preservado. Para remover o bot do Telegram, retire-o dos grupos e canais pelo próprio Telegram."
                : "Esta conexão será removida e a sessão será encerrada quando o publicador receber a atualização. Os agendamentos dela serão cancelados e os grupos sairão dos favoritos e do espelhamento. O histórico de ofertas será preservado. Para usar novamente, adicione outra conexão."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {remove.error && (
            <p role="alert" className="text-destructive text-sm">
              {remove.error.message}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>
              Voltar
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => {
                if (removing) remove.mutate(removing.id);
              }}
            >
              <Trash2 className="size-4" />
              {remove.isPending ? "Excluindo…" : "Excluir conexão"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={switchDefault} onOpenChange={setSwitchDefault}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trocar conexão padrão</DialogTitle>
            <DialogDescription>
              Escolha outra conta do WhatsApp. A conexão anterior deixa de ser
              padrão automaticamente. Seus agendamentos mantêm os destinos já
              escolhidos.
            </DialogDescription>
          </DialogHeader>
          <DefaultConnectionForm
            connections={rows.filter(
              (row) => row.provider !== "TELEGRAM_BOT" && !row.isDefault
            )}
            onSuccess={() => setSwitchDefault(false)}
          />
        </DialogContent>
      </Dialog>
      <TelegramLinkDialog open={telegramOpen} onOpenChange={setTelegramOpen} />
      <Sheet
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent className="gap-0 overflow-hidden data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
          <SheetHeader className="shrink-0 px-5 pt-6 pr-14 pb-5 sm:px-7 sm:pr-14">
            <SheetTitle className="truncate text-lg">
              {rows.find((c) => c.id === selected)?.name || "Gerenciar conexão"}
            </SheetTitle>
            <SheetDescription>
              Gerencie a conta vinculada a esta conexão.
            </SheetDescription>
          </SheetHeader>
          {selected && (
            <WhatsAppConnection
              key={selected}
              connectionId={selected}
              showWorkerIndicator={false}
              variant="sheet"
              onConnected={closeConnectionSheet}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
function ConnectionNameForm({
  connection,
  onSuccess,
}: {
  connection?: WhatsAppConnectionAccount;
  onSuccess: (connection: WhatsAppConnectionAccount) => void;
}) {
  const { control, handleSubmit } = useForm<{ name: string }>({
    defaultValues: { name: connection?.name || "" },
  });
  const save = useServerAction({
    mutationFn: saveWhatsAppConnection,
    invalidateQueries: invalidations,
    onSuccess: (response) => onSuccess(response.data),
  });
  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((body) =>
        save.mutate({ ...body, id: connection?.id })
      )}
    >
      <p className="text-muted-foreground text-sm">
        Use um nome fácil de reconhecer, como “Loja principal” ou “Ofertas de
        tecnologia”. Cada conexão tem seus próprios grupos.
      </p>
      <ControlledInput
        control={control}
        name="name"
        label="Nome da conexão"
        placeholder="Ex.: Achadinhos da loja"
        maxLength={80}
        rules={{
          required: "Informe um nome.",
          validate: (value) => !!value.trim() || "Informe um nome.",
        }}
      />
      {save.error && (
        <p role="alert" className="text-destructive text-sm">
          {save.error.message}
        </p>
      )}
      <Button
        type="submit"
        className="w-full"
        loading={save.isPending}
        disabled={save.isPending}
      >
        {connection ? "Salvar nome" : "Criar e conectar WhatsApp"}
      </Button>
    </form>
  );
}

function DefaultConnectionForm({
  connections,
  onSuccess,
}: {
  connections: WhatsAppConnectionAccount[];
  onSuccess: () => void;
}) {
  const form = useForm<{ connectionId: string }>({
    defaultValues: { connectionId: connections[0]?.id ?? "" },
  });
  const save = useServerAction({
    mutationFn: updateWhatsAppConnection,
    invalidateQueries: invalidations,
    successMessage: "Conexão padrão alterada.",
    onSuccess,
  });
  if (!connections.length)
    return (
      <p className="bg-primary/5 rounded-xl border p-4 text-sm">
        Você precisa adicionar outra conexão do WhatsApp para trocar o padrão. O
        Telegram é escolhido separadamente como destino nas ofertas.
      </p>
    );
  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(({ connectionId }) =>
        save.mutate({ id: connectionId, isDefault: true })
      )}
    >
      <ControlledCombobox
        control={form.control}
        name="connectionId"
        label="Nova conexão padrão"
        placeholder="Escolha uma conexão"
        options={connections.map((row) => ({
          id: row.id,
          name:
            row.name + (row.connectedPhone ? " · +" + row.connectedPhone : ""),
        }))}
        rules={{ required: "Selecione uma conexão." }}
        disabled={save.isPending}
      />
      {save.error && (
        <p role="alert" className="text-destructive text-sm">
          {save.error.message}
        </p>
      )}
      <Button type="submit" disabled={save.isPending} className="w-full">
        <Star className="size-4" />
        {save.isPending ? "Alterando…" : "Confirmar troca"}
      </Button>
    </form>
  );
}
