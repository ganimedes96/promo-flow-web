"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { Radio, ArrowRight, RefreshCw, Link2 } from "lucide-react";
import { AnimatedChannelIcon } from "@/components/brand/animated-channel-icon";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { ControlledMultiSelect } from "@/components/form/controllers/controlled-multi-select";
import { getWhatsAppGroups } from "@/domains/whatsapp/client";
import { MirrorDestinationSettings } from "./mirror-destination-settings";
import { PageSkeleton } from "@/components/feedback/loading-skeletons";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { EmptyStateCard } from "@/components/feedback/empty-state-card";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { getMirrorSources } from "@/domains/mirroring/client";
import {
  updateMirrorSource,
  removeMirrorSource,
} from "@/domains/mirroring/actions";
import { MirrorSourceCard } from "./mirror-source-card";
export function WhatsAppMirroring({ channels = false }: { channels?: boolean }) {
  const { data: session } = useSession();
  const query = useQuery({
    queryKey: queryKeys.mirroring.sources(session?.user.id),
    queryFn: getMirrorSources,
    enabled: !!session?.user.id,
    retry: false,
    refetchInterval: (q) => (q.state.error ? false : 30000),
    refetchIntervalInBackground: false,
  });
  const destinations = useQuery({
    queryKey: [...queryKeys.whatsapp.groupsFor(), session?.user.id],
    queryFn: () => getWhatsAppGroups(),
    enabled: !!session?.user.id,
  });
  const form = useForm({ defaultValues: { sourceId: "", destinationIds: [] as string[] } });
  const sourceId = useWatch({ control: form.control, name: "sourceId" });
  const update = useServerAction({
    mutationFn: updateMirrorSource,
    invalidateQueries: [queryKeys.mirroring.all],
    successMessage: "Origem atualizada.",
    onSuccess: () => form.reset(),
  });
  const remove = useServerAction({
    mutationFn: removeMirrorSource,
    invalidateQueries: [queryKeys.mirroring.all],
    successMessage: "Origem removida. As ofertas capturadas foram preservadas.",
  });
  if (query.isPending) return <PageSkeleton variant="groups" />;
  if (query.isError || !query.data)
    return (
      <ApiErrorCard
        error={query.error}
        title="Não foi possível carregar suas origens do WhatsApp"
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  const { sources, limit, selectedCount } = query.data;
  const availableSources = sources.filter((source) => source.isChannel === channels);
  const selected = availableSources.filter((s) => s.selected);
  const options = availableSources
    .filter((s) => !s.selected && s.available)
    .map((s) => ({ id: s.id, name: s.name + " · " + s.connectionName }));
  const busy = update.isPending || remove.isPending;
  const favoriteDestinations = (destinations.data ?? [])
    .filter((group) => group.isFavorite)
    .map(({ id, name }) => ({ id, name }));
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-primary mb-2 flex items-center gap-2 text-xs font-semibold uppercase">
            <AnimatedChannelIcon platform="whatsapp" compact />
            Seus próximos achados
          </p>

        </div>
        <Button
          variant="outline"
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
        >
          <RefreshCw className="size-4" />
          Atualizar
        </Button>
      </header>
      <Card className="border-primary/20 bg-primary/5 py-0">
        <CardContent className="flex flex-wrap items-center gap-3 px-4 py-3">
          <Badge className="shrink-0">{selectedCount} de {limit} origens</Badge>
          <p className="text-muted-foreground min-w-48 flex-1 text-sm">
            Defina destinos por origem para agendar automaticamente após aplicar
            seu link. Sem destino ou com a automação desligada, revise em Ofertas.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/offers">
              Ver minhas ofertas
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{channels ? "Adicionar canal de origem" : "Adicionar grupo de origem"}</CardTitle>
          <CardDescription>
            {channels
              ? "Escolha um canal disponível na conta conectada. Só as publicações feitas após ativar o espelhamento serão capturadas."
              : "Escolha um grupo de uma das suas contas conectadas. Grupos pausados também ocupam uma vaga."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit((data) =>
              update.mutate({ id: data.sourceId, enabled: true, destinationIds: data.destinationIds.filter((id) => id !== data.sourceId) })
            )}
            className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]"
          >
            <ControlledCombobox
              control={form.control}
              name="sourceId"
              label={channels ? "Canal que deseja acompanhar" : "Grupo que deseja acompanhar"}
              placeholder="Busque pelo nome"
              options={options}
              disabled={busy || selectedCount >= limit}
            />
            <ControlledMultiSelect
              control={form.control}
              name="destinationIds"
              label="Enviar para"
              placeholder="Escolher grupos favoritos"
              options={favoriteDestinations.filter((group) => group.id !== sourceId)}
              loading={destinations.isPending}
              maxSelected={20}
              searchable
            />
            <Button
              type="submit"
              disabled={busy || !sourceId || selectedCount >= limit}
            >
              {channels ? "Acompanhar canal" : "Acompanhar grupo"}
            </Button>
          </form>
          {selectedCount >= limit && (
            <p className="text-muted-foreground mt-3 text-xs">
              Seu limite de {limit} origens foi atingido. Remova uma origem para
              adicionar outra.
            </p>
          )}
          {!options.length && selectedCount < limit && (
            <p className="text-muted-foreground mt-3 text-xs">
              {channels ? "Siga um canal no WhatsApp da conta conectada. " : "Não há outros grupos disponíveis. "}
              <Link className="text-primary underline" href="/connections">
                Conecte seu WhatsApp
              </Link>{" "}
              e aguarde a sincronização.
            </p>
          )}
        </CardContent>
      </Card>
      {!selected.length ? (
        <EmptyStateCard
          icon={Radio}
          title="Escolha sua primeira fonte de achados"
          description={channels ? "Adicione um canal acima para acompanhar as próximas ofertas." : "Adicione um grupo acima. A captura começa depois que você escolhe a origem."}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {selected.map((source) => (
            <MirrorSourceCard
              key={source.id}
              platform="whatsapp"
              name={source.name}
              account={source.connectionName}
              enabled={source.enabled}
              available={source.available}
              unavailableLabel="Conta indisponível"
              capturedCount={source.capturedCount}
              lastCapturedAt={source.lastCapturedAt}
              busy={busy}
              toggleDisabled={!source.available && !source.enabled}
              onToggle={() =>
                update.mutate({ id: source.id, enabled: !source.enabled })
              }
              destinationSettings={(
                <MirrorDestinationSettings
                  key={source.destinationIds.join(",")}
                  selected={source.destinationIds}
                  options={favoriteDestinations.filter((group) => group.id !== source.id)}
                  busy={busy || destinations.isPending || destinations.isError}
                  onSave={(destinationIds) => update.mutate({ id: source.id, enabled: source.enabled, destinationIds })}
                />
              )}
              onRemove={() => remove.mutate(source.id)}
            />
          ))}
        </div>
      )}
      <p className="text-muted-foreground flex items-center gap-2 text-xs">
        <Link2 className="size-4 shrink-0" />
        Os dados ficam somente na sua conta e não entram na Central de
        promoções.
      </p>
    </div>
  );
}
