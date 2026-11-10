"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { ArrowRight, Send, RefreshCw } from "lucide-react";
import { AnimatedChannelIcon } from "@/components/brand/animated-channel-icon";
import { TelegramConnectionCard } from "../../promotion-sources/components/telegram-connection-card";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useServerAction } from "@/hooks/use-server-action";
import { getPersonalTelegram } from "@/domains/mirroring/client";
import {
  controlPersonalTelegram,
  sendPersonalTelegramPassword,
  updatePersonalTelegramSource,
  removePersonalTelegramSource,
} from "@/domains/mirroring/actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { ControlledMultiSelect } from "@/components/form/controllers/controlled-multi-select";
import { getWhatsAppGroups } from "@/domains/whatsapp/client";
import { MirrorDestinationSettings } from "./mirror-destination-settings";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { EmptyStateCard } from "@/components/feedback/empty-state-card";
import { PageSkeleton } from "@/components/feedback/loading-skeletons";
import { MirrorSourceCard } from "./mirror-source-card";
export function TelegramMirroring() {
  const { data: session } = useSession();
  const query = useQuery({
    queryKey: queryKeys.mirroring.telegram(session?.user.id),
    queryFn: getPersonalTelegram,
    enabled: !!session?.user.id,
    retry: false,
    refetchInterval: (q) => (q.state.error ? false : 5000),
    refetchIntervalInBackground: false,
  });
  const invalidations = [queryKeys.mirroring.all];
  const control = useServerAction({
    mutationFn: controlPersonalTelegram,
    invalidateQueries: invalidations,
    successMessage: "Solicitação enviada.",
  });
  const toggle = useServerAction({
    mutationFn: updatePersonalTelegramSource,
    invalidateQueries: invalidations,
    successMessage: "Fonte atualizada.",
    onSuccess: () => form.reset(),
  });
  const remove = useServerAction({
    mutationFn: removePersonalTelegramSource,
    invalidateQueries: invalidations,
    successMessage: "Fonte removida. Suas ofertas foram preservadas.",
  });
  const destinations = useQuery({
    queryKey: [...queryKeys.whatsapp.groupsFor(), session?.user.id],
    queryFn: () => getWhatsAppGroups(),
    enabled: !!session?.user.id,
  });
  const form = useForm({ defaultValues: { sourceId: "", destinationIds: [] as string[] } });
  const sourceId = useWatch({ control: form.control, name: "sourceId" });
  if (query.isPending) return <PageSkeleton variant="connections" />;
  if (query.isError || !query.data)
    return (
      <ApiErrorCard
        error={query.error}
        title="Não foi possível consultar sua conexão Telegram"
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  const state = query.data,
    selected = state.sources.filter((source) => source.selected),
    ready = state.online && state.status === "READY";
  const busy = toggle.isPending || remove.isPending;
  const favoriteDestinations = (destinations.data ?? [])
    .filter((group) => group.isFavorite)
    .map(({ id, name }) => ({ id, name }));
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-primary mb-2 flex items-center gap-2 text-xs font-semibold uppercase">
            <AnimatedChannelIcon platform="telegram" compact />
            Seus canais, seus achados
          </p>

          <p className="text-muted-foreground mt-2 text-sm">
            Acompanhe até {state.limit} origens no total, somando WhatsApp e
            Telegram.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/offers">
            Ver minhas ofertas
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </header>
      <TelegramConnectionCard
        state={state}
        personal
        collectorOnline={state.collectorOnline}
        busy={control.isPending}
        onAction={(action) => control.mutate({ action })}
        sendPassword={sendPersonalTelegramPassword}
        invalidations={invalidations}
      />
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">
              Adicionar canal ou grupo de origem
            </CardTitle>
            <Badge variant="secondary">
              {state.selectedCount} de {state.limit} origens
            </Badge>
          </div>
          <CardDescription>
            Escolha os destinos favoritos desta origem. Com a automação ativa,
            a oferta pode ser agendada após aplicar seu link. Sem destino, ela fica para revisão.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={form.handleSubmit((data) =>
              toggle.mutate({ id: data.sourceId, enabled: true, destinationIds: data.destinationIds })
            )}
            className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]"
          >
            <ControlledCombobox
              control={form.control}
              name="sourceId"
              label="Canal ou grupo do Telegram"
              placeholder="Busque pelo nome ou @canal"
              options={state.sources
                .filter((source) => !source.selected && source.isAvailable)
                .map((source) => ({
                  id: source.id,
                  name:
                    source.title +
                    (source.username ? " · @" + source.username : ""),
                }))}
              disabled={!ready || busy || state.selectedCount >= state.limit}
            />
            <ControlledMultiSelect
              control={form.control}
              name="destinationIds"
              label="Enviar para"
              placeholder="Escolher grupos favoritos"
              options={favoriteDestinations}
              loading={destinations.isPending}
              maxSelected={20}
              searchable
            />
            <Button
              type="submit"
              disabled={
                !ready ||
                busy ||
                !sourceId ||
                state.selectedCount >= state.limit
              }
            >
              Acompanhar fonte
            </Button>
          </form>
          {destinations.isError && <p className="text-destructive text-xs">Não foi possível carregar os destinos favoritos.</p>}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-muted-foreground text-xs">
              Grupos pausados também ocupam uma vaga. Não importamos mensagens
              antigas.
            </p>
            <Button
              size="sm"
              variant="ghost"
              disabled={!ready || control.isPending}
              onClick={() => control.mutate({ action: "sync" })}
            >
              <RefreshCw className="size-3.5" />
              Atualizar canais
            </Button>
          </div>
        </CardContent>
      </Card>
      {!selected.length ? (
        <EmptyStateCard
          icon={Send}
          title="Escolha sua primeira fonte do Telegram"
          description="Conecte sua conta, atualize os canais e escolha uma origem acima. As ofertas ficam somente na sua conta."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {selected.map((source) => (
            <MirrorSourceCard
              key={source.id}
              platform="telegram"
              name={source.title}
              account={
                source.username ? "@" + source.username : "Grupo privado"
              }
              enabled={source.enabled}
              available={source.isAvailable && ready}
              unavailableLabel="Aguardando conexão ou acesso"
              capturedCount={source.capturedCount}
              lastCapturedAt={source.lastCapturedAt}
              lastCheckedAt={source.lastCheckedAt}
              captureError={source.lastError}
              busy={busy}
              toggleDisabled={!source.enabled && !ready}
              onToggle={() =>
                toggle.mutate({ id: source.id, enabled: !source.enabled })
              }
              destinationSettings={(
                <MirrorDestinationSettings
                  key={source.mirrorDestinationIds.join(",")}
                  selected={source.mirrorDestinationIds}
                  options={favoriteDestinations}
                  busy={busy || destinations.isPending || destinations.isError}
                  onSave={(destinationIds) => toggle.mutate({ id: source.id, enabled: source.enabled, destinationIds })}
                />
              )}
              onRemove={() => remove.mutate(source.id)}
            />
          ))}
        </div>
      )}
      <p className="text-muted-foreground text-xs">
        As ofertas só podem ser agendadas depois de receberem seu link de afiliado.
      </p>
    </div>
  );
}
