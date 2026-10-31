"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { MessageCircle, RefreshCw } from "lucide-react";
import { getWhatsAppCollectionSources } from "@/domains/collection/client";
import { updateWhatsAppCollectionSource } from "@/domains/collection/actions";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useServerAction } from "@/hooks/use-server-action";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { EmptyStateCard } from "@/components/feedback/empty-state-card";
import { PageSkeleton } from "@/components/feedback/loading-skeletons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
export function WhatsAppSources() {
  const { data: session } = useSession();
  const { control } = useForm({ defaultValues: { search: "" } });
  const search = useWatch({ control, name: "search" })
    .trim()
    .toLocaleLowerCase();
  const query = useQuery({
    queryKey: queryKeys.collection.whatsapp(session?.user.id),
    queryFn: getWhatsAppCollectionSources,
    enabled: !!session?.user,
    refetchInterval: (query) => (query.state.error ? false : 10000),
    refetchIntervalInBackground: false,
  });
  const toggle = useServerAction<unknown, { id: string; enabled: boolean }>({
    mutationFn: updateWhatsAppCollectionSource,
    invalidateQueries: [queryKeys.collection.all],
    successMessage: "Coleta atualizada.",
  });
  if (query.isPending) return <PageSkeleton variant="connections" />;
  if (query.isError)
    return (
      <ApiErrorCard
        title="Não foi possível consultar os grupos do WhatsApp"
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
  const groups = query.data ?? [];
  const visible = groups.filter((group) =>
    `${group.name} ${group.connection?.name ?? ""} ${group.accountPhone}`
      .toLocaleLowerCase()
      .includes(search)
  );
  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <MessageCircle className="text-primary" />
            Fontes do WhatsApp
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Escolha os grupos das suas conexões para receber promoções como
            rascunhos na Central.
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
      <Card>
        <CardContent className="space-y-2 pt-5 text-sm">
          <p>
            O worker e o coletor devem estar rodando no mesmo computador, com a
            integração local configurada.
          </p>
          <p className="text-muted-foreground">
            Somente novas mensagens recebidas nos grupos habilitados são
            capturadas. Mensagens próprias e conversas privadas são ignoradas.
            Nenhuma promoção é publicada automaticamente.
          </p>
          <Button asChild variant="link" className="h-auto px-0">
            <Link href="/connections">Gerenciar conexões</Link>
          </Button>
        </CardContent>
      </Card>
      <ControlledInput
        control={control}
        name="search"
        label="Buscar grupo ou conta"
        placeholder="Nome do grupo, conexão ou número"
      />
      {!visible.length ? (
        <EmptyStateCard
          title={
            search
              ? "Nenhum grupo encontrado"
              : "Conecte seu WhatsApp para escolher as fontes"
          }
          description={
            search
              ? "Tente outro nome ou número."
              : "Os grupos sincronizados nas contas do administrador aparecerão aqui."
          }
        />
      ) : (
        <div className="grid max-h-[65vh] gap-3 overflow-y-auto overscroll-contain pr-1 md:grid-cols-2">
          {visible.map((group) => (
            <Card key={group.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold" title={group.name}>
                    {group.name}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {group.connection?.name} · +{group.accountPhone}
                  </p>
                  <Badge
                    className={
                      group.captureEnabled
                        ? "mt-2 justify-center bg-emerald-500 text-white"
                        : "mt-2 justify-center bg-amber-400 text-amber-950"
                    }
                  >
                    {group.captureEnabled ? "Captura ativa" : "Captura pausada"}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant={group.captureEnabled ? "outline" : "default"}
                  disabled={toggle.isPending}
                  onClick={() =>
                    toggle.mutate({
                      id: group.id,
                      enabled: !group.captureEnabled,
                    })
                  }
                >
                  {group.captureEnabled ? "Pausar" : "Ativar captura"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
