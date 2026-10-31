"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Inbox, Radio, RefreshCw, Send } from "lucide-react";
import { getTelegramState } from "@/domains/telegram/client";
import {
  controlTelegram,
  removeTelegramSource,
  updateTelegramSource,
} from "@/domains/telegram/actions";
import { TelegramSource } from "@/domains/telegram/types";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useServerAction } from "@/hooks/use-server-action";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { PageSkeleton } from "@/components/feedback/loading-skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { TelegramConnectionCard } from "./telegram-connection-card";
import { SourceList } from "./source-list";
import { AddSource } from "./add-source";
export function SourcesManager() {
  const { data: session } = useSession();
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<TelegramSource | null>(null);
  const query = useQuery({
    queryKey: queryKeys.telegram.status(session?.user.id),
    queryFn: getTelegramState,
    enabled: !!session?.user,
    refetchInterval: (query) => (query.state.error ? false : 5000),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: "always",
  });
  const connection = useServerAction<
    unknown,
    { action: "connect" | "disconnect" | "sync" }
  >({
    mutationFn: controlTelegram,
    invalidateQueries: [queryKeys.telegram.all],
    successMessage: "Solicitação enviada ao coletor.",
  });
  const synchronization = useServerAction<unknown, { action: "sync" }>({
    mutationFn: controlTelegram,
    invalidateQueries: [queryKeys.telegram.all],
    disableSuccessToast: true,
  });
  const toggle = useServerAction<unknown, { id: string; enabled: boolean }>({
    mutationFn: updateTelegramSource,
    invalidateQueries: [queryKeys.telegram.all],
    successMessage: "Fonte atualizada.",
  });
  const removal = useServerAction<unknown, { id: string }>({
    mutationFn: removeTelegramSource,
    invalidateQueries: [queryKeys.telegram.all],
    successMessage: "Fonte removida do monitoramento.",
    onSuccess: () => setRemoving(null),
  });
  if (query.isPending) return <PageSkeleton variant="connections" />;
  if (query.isError || !query.data)
    return (
      <ApiErrorCard
        title="Não foi possível consultar as fontes"
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  const state = query.data;
  const selected = state.sources.filter((source) => source.selected);
  return (
    <div className="min-w-0 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-primary mb-2 flex items-center gap-2 text-xs font-semibold uppercase">
            <Radio className="size-4" /> Curadoria administrativa
          </p>
          <h1 className="text-2xl font-semibold">Fontes de promoções</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Gerencie sua conta e os canais que alimentam a caixa de entrada.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/promotions/manage">
              <Inbox className="size-4" /> Gerenciar promoções
            </Link>
          </Button>
          <Button
            variant="ghost"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
            aria-label="Atualizar gerenciamento"
          >
            <RefreshCw
              className={
                query.isFetching ? "size-4 motion-safe:animate-spin" : "size-4"
              }
            />
          </Button>
        </div>
      </header>
      <TelegramConnectionCard
        state={state}
        busy={connection.isPending}
        onAction={(action) => connection.mutate({ action })}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Fontes monitoradas", value: selected.length, icon: Radio },
          {
            label: "Fontes habilitadas",
            value: selected.filter(
              (source) => source.enabled && source.isAvailable
            ).length,
            icon: Send,
          },
          {
            label: "Promoções recebidas",
            value: state.sources.reduce(
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
      <SourceList
        sources={state.sources}
        online={state.online && state.status === "READY"}
        busy={toggle.isPending || removal.isPending}
        onToggle={(source) =>
          toggle.mutate({ id: source.id, enabled: !source.enabled })
        }
        onRemove={setRemoving}
        onAdd={() => {
          setAdding(true);
          if (
            state.online &&
            state.status === "READY" &&
            !synchronization.isPending
          )
            synchronization.mutate({ action: "sync" });
        }}
      />
      <AddSource
        open={adding}
        onOpenChange={setAdding}
        onSync={() => synchronization.mutate({ action: "sync" })}
        syncing={synchronization.isPending}
        lastSyncAt={state.lastSyncAt}
        sources={state.sources}
        online={state.online && state.status === "READY"}
      />
      <AlertDialog
        open={!!removing}
        onOpenChange={(open) => {
          if (!open && !removal.isPending) setRemoving(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover fonte do monitoramento?</AlertDialogTitle>
            <AlertDialogDescription>
              A captura de {removing?.title} será interrompida. As promoções já
              recebidas continuarão na caixa de entrada. Você pode adicionar a
              fonte novamente depois.
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
    </div>
  );
}
