"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import {
  Radio,
  ArrowRight,
  RefreshCw,
  Pause,
  Play,
  Trash2,
  Link2,
} from "lucide-react";
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
import { formatDate } from "@/utils/date";
export function Mirroring() {
  const { data: session } = useSession();
  const query = useQuery({
    queryKey: queryKeys.mirroring.sources(session?.user.id),
    queryFn: getMirrorSources,
    enabled: !!session?.user.id,
    retry: false,
    refetchInterval: (q) => (q.state.error ? false : 10000),
    refetchIntervalInBackground: false,
  });
  const form = useForm({ defaultValues: { sourceId: "" } });
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
        title="Não foi possível carregar seus grupos de origem"
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  const { sources, limit, selectedCount } = query.data;
  const selected = sources.filter((s) => s.selected);
  const options = sources
    .filter((s) => !s.selected && s.available)
    .map((s) => ({ id: s.id, name: s.name + " · " + s.connectionName }));
  const busy = update.isPending || remove.isPending;
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-primary mb-2 flex items-center gap-2 text-xs font-semibold uppercase">
            <Radio className="size-4" />
            Seus próximos achados
          </p>
          <h1 className="text-2xl font-semibold">Espelhar grupos</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Acompanhe até {limit} grupos do seu WhatsApp e prepare as ofertas
            com seu próprio link.
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
      <Card className="border-primary/20 bg-primary/5 overflow-hidden">
        <CardContent className="grid gap-5 p-6 md:grid-cols-[1fr_auto]">
          <div>
            <Badge className="mb-3">
              {selectedCount} de {limit} origens
            </Badge>
            <h2 className="text-xl font-semibold">
              Do grupo que você acompanha para o seu fluxo
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed">
              Capturamos novas mensagens com links de produtos. Elas entram em
              Ofertas, sem destino e sem envio automático. A extensão atualizada
              converte os links do Mercado Livre pela sua conta, mesmo com o
              site fechado, enquanto o Chrome estiver aberto. Depois, escolha o
              grupo na tabela e revise antes de agendar.
            </p>
            <p className="text-muted-foreground mt-2 text-xs">
              Requer extensão 0.13.0 ou superior, conectada à sua conta no
              ambiente selecionado. Amazon e Shopee precisam do seu link
              informado manualmente. Só serão acompanhadas mensagens novas
              enquanto os serviços de coleta estiverem ativos.
            </p>
          </div>
          <Button asChild className="self-center">
            <Link href="/offers">
              Ver minhas ofertas
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adicionar grupo de origem</CardTitle>
          <CardDescription>
            Escolha um grupo de uma das suas contas conectadas. Grupos pausados
            também ocupam uma vaga.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit((data) =>
              update.mutate({ id: data.sourceId, enabled: true })
            )}
            className="grid items-end gap-4 sm:grid-cols-[1fr_auto]"
          >
            <ControlledCombobox
              control={form.control}
              name="sourceId"
              label="Grupo que deseja acompanhar"
              placeholder="Busque pelo nome"
              options={options}
              disabled={busy || selectedCount >= limit}
            />
            <Button
              type="submit"
              disabled={busy || !sourceId || selectedCount >= limit}
            >
              Acompanhar grupo
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
              Não há outros grupos disponíveis.{" "}
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
          description="Adicione um grupo acima. Nenhuma conversa será acompanhada sem você escolher uma origem."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {selected.map((source) => (
            <Card key={source.id} className="border-primary/20">
              <CardHeader>
                <div className="flex justify-between gap-2">
                  <Badge
                    className={
                      source.enabled && source.available
                        ? "bg-emerald-700 text-white"
                        : "bg-orange-600 text-white"
                    }
                  >
                    {!source.available
                      ? "Conta indisponível"
                      : source.enabled
                        ? "Habilitado"
                        : "Pausado"}
                  </Badge>
                  <Radio className="text-primary size-4" />
                </div>
                <CardTitle
                  className="mt-2 truncate text-base"
                  title={source.name}
                >
                  {source.name}
                </CardTitle>
                <CardDescription>{source.connectionName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-semibold">
                    {source.capturedCount}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    ofertas capturadas
                  </p>
                  {source.lastCapturedAt && (
                    <p className="text-muted-foreground mt-2 text-xs">
                      Última captura:{" "}
                      {formatDate(source.lastCapturedAt, "dd/MM HH:mm")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy || (!source.available && !source.enabled)}
                    onClick={() =>
                      update.mutate({ id: source.id, enabled: !source.enabled })
                    }
                  >
                    {source.enabled ? (
                      <Pause className="size-3" />
                    ) : (
                      <Play className="size-3" />
                    )}
                    {source.enabled ? "Pausar" : "Retomar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    aria-label={"Remover origem " + source.name}
                    onClick={() => remove.mutate(source.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
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
