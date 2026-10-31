"use client";
import { useCallback, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Smartphone,
  MoreHorizontal,
  Star,
  Pencil,
  Pause,
  Play,
  Users,
  ListOrdered,
} from "lucide-react";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { PageSkeleton } from "@/components/feedback/loading-skeletons";
import { EmptyStateCard } from "@/components/feedback/empty-state-card";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { getWhatsAppConnections } from "@/domains/whatsapp/client";
import {
  saveWhatsAppConnection,
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
];
export function Connections() {
  const { data: session } = useSession();
  const [editing, setEditing] = useState<
    WhatsAppConnectionAccount | null | undefined
  >();
  const [selected, setSelected] = useState<string | null>(null);
  const closeConnectionSheet = useCallback(() => setSelected(null), []);
  const list = useQuery({
    queryKey: [...queryKeys.whatsapp.connections, session?.user.id],
    queryFn: getWhatsAppConnections,
    enabled: !!session?.user.id,
    refetchInterval: 5000,
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
            Gerencie seus números do WhatsApp, grupos e envios em um só lugar.
          </p>
        </div>
        <Button onClick={() => setEditing(null)}>
          <Plus className="size-4" />
          Adicionar WhatsApp
        </Button>
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
                      <span
                        className={
                          "flex size-11 shrink-0 items-center justify-center rounded-xl " +
                          (connected
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground")
                        }
                      >
                        <Smartphone className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <CardTitle
                          className="truncate text-base"
                          title={connection.name}
                        >
                          {connection.name}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {connection.connectedPhone
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
                          disabled={connection.isDefault || change.isPending}
                          onSelect={() =>
                            change.mutate({
                              id: connection.id,
                              isDefault: true,
                            })
                          }
                        >
                          <Star className="size-4" />
                          Definir como padrão
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={
                        connected
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-warning/30 bg-warning/10 text-warning"
                      }
                    >
                      {status}
                    </Badge>
                    {connection.isPaused && (
                      <Badge variant="secondary">Envios pausados</Badge>
                    )}
                    {connection.isDefault && (
                      <Badge variant="secondary">
                        <Star className="size-3" />
                        Padrão
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground truncate text-sm">
                    {connection.connectedName ||
                      "Leia o QR Code para identificar esta conta"}
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
                    <p
                      className="text-destructive line-clamp-2 text-xs"
                      title={connection.lastError}
                    >
                      {connection.lastError}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={ready ? "outline" : "default"}
                      disabled={connect.isPending}
                      onClick={() =>
                        connection.status === "DISCONNECTED" ||
                        connection.status === "ERROR"
                          ? connect.mutate({ id: connection.id })
                          : setSelected(connection.id)
                      }
                    >
                      {ready ? "Gerenciar conexão" : "Conectar / ver QR"}
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
