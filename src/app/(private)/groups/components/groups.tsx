"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm, useWatch } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  RefreshCw,
  Smartphone,
  Star,
  Users,
} from "lucide-react";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PageSkeleton } from "@/components/feedback/loading-skeletons";
import { EmptyStateCard } from "@/components/feedback/empty-state-card";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import {
  getWhatsAppConnections,
  getWhatsAppGroups,
} from "@/domains/whatsapp/client";
import {
  setFavoriteGroup,
  setFavoriteGroups,
  setTargetGroup,
} from "@/domains/whatsapp/actions";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { cn } from "@/lib/shadcn/utils";

const allConnections = "all";
const filters = [
  { id: "all", name: "Todos os grupos" },
  { id: "favorites", name: "Favoritos" },
  { id: "others", name: "Não favoritados" },
];
type GroupFilters = {
  search: string;
  connectionId: string;
  visibility: string;
};
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");

export function Groups() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const { control, reset } = useForm<GroupFilters>({
    defaultValues: {
      search: "",
      connectionId: allConnections,
      visibility: "all",
    },
  });
  const {
    search = "",
    connectionId = allConnections,
    visibility = "all",
  } = useWatch({ control });
  const connections = useQuery({
    queryKey: [...queryKeys.whatsapp.connections, session?.user.id],
    queryFn: getWhatsAppConnections,
    enabled: !!session?.user.id,
    refetchInterval: 5000,
  });
  const groups = useQuery({
    queryKey: [...queryKeys.whatsapp.groupsFor(), session?.user.id],
    queryFn: () => getWhatsAppGroups(),
    enabled: !!session?.user.id,
    refetchInterval: 5000,
  });
  const invalidations = [
    queryKeys.whatsapp.groups,
    queryKeys.whatsapp.connections,
  ];
  const favorite = useServerAction({
    mutationFn: setFavoriteGroup,
    invalidateQueries: invalidations,
    disableSuccessToast: true,
  });
  const target = useServerAction({
    mutationFn: setTargetGroup,
    invalidateQueries: invalidations,
    successMessage: "Grupo padrão atualizado para esta conexão.",
  });
  const batch = useServerAction({
    mutationFn: setFavoriteGroups,
    invalidateQueries: invalidations,
    onSettled: () => {
      setSelected([]);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.whatsapp.groups,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.whatsapp.connections,
      });
    },
  });
  const busy = favorite.isPending || target.isPending || batch.isPending;
  const rows = groups.data ?? [];
  const accounts = connections.data?.connections ?? [];
  const byConnection = new Map(
    accounts.map((account) => [account.id, account])
  );
  const filtered = rows
    .filter(
      (group) =>
        (connectionId === allConnections ||
          group.connectionId === connectionId) &&
        (visibility === "all" ||
          (visibility === "favorites"
            ? group.isFavorite
            : !group.isFavorite)) &&
        normalize(group.name).includes(normalize(search.trim()))
    )
    .sort(
      (a, b) =>
        Number(b.isFavorite) - Number(a.isFavorite) ||
        a.name.localeCompare(b.name, "pt-BR")
    );
  // Only visible selections may be changed by the bulk actions.
  const selectedVisible = filtered
    .filter((group) => selected.includes(group.id))
    .map((group) => group.id);
  const selectable = filtered.slice(0, 100);
  const allSelected =
    selectable.length > 0 &&
    selectable.every((group) => selected.includes(group.id));
  const refreshing = groups.isFetching || connections.isFetching;
  function refresh() {
    void groups.refetch();
    void connections.refetch();
  }
  if (groups.isPending || connections.isPending)
    return <PageSkeleton variant="groups" />;
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Grupos</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Organize os destinos das suas ofertas, separados por conta do
            WhatsApp.
          </p>
        </div>
        <Button variant="outline" onClick={refresh} disabled={refreshing}>
          <RefreshCw
            className={cn("size-4", refreshing && "motion-safe:animate-spin")}
          />
          Atualizar lista
        </Button>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Grupos disponíveis", value: rows.length, icon: Users },
          {
            label: "Favoritos para ofertas",
            value: rows.filter((group) => group.isFavorite).length,
            icon: Star,
          },
          {
            label: "Contas com sessão pronta",
            value: accounts.filter((account) => account.status === "READY")
              .length,
            icon: Smartphone,
          },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="gap-0 py-0">
            <CardContent className="flex items-center gap-4 p-5">
              <span className="bg-primary/10 text-primary rounded-xl p-3">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-2xl font-semibold">{value}</p>
                <p className="text-muted-foreground text-xs">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="border-primary/20 bg-primary/5 flex items-start gap-3 rounded-2xl border p-4 text-sm">
        <Star className="text-primary mt-0.5 size-4 shrink-0" />
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground font-medium">
            Escolha onde suas ofertas podem chegar.
          </strong>{" "}
          Favorite os grupos que deseja usar no cadastro. Cada conexão pode ter
          um grupo padrão. Favoritar um grupo não agenda nem envia mensagens.
        </p>
      </div>
      <Card className="gap-0 overflow-hidden py-0">
        <CardContent className="grid items-end gap-4 border-b p-5 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <ControlledInput
            control={control}
            name="search"
            label="Buscar grupo"
            placeholder="Digite o nome do grupo"
          />
          <ControlledCombobox
            control={control}
            name="connectionId"
            label="Conta do WhatsApp"
            placeholder="Todas as conexões"
            options={[
              { id: allConnections, name: "Todas as conexões" },
              ...accounts.map((account) => ({
                id: account.id,
                name:
                  account.name +
                  (account.connectedPhone
                    ? " · +" + account.connectedPhone
                    : ""),
              })),
            ]}
          />
          <ControlledCombobox
            control={control}
            name="visibility"
            label="Exibir"
            placeholder="Todos os grupos"
            options={filters}
          />
        </CardContent>
        {groups.error || connections.error ? (
          <div className="p-6">
            <ApiErrorCard
              title="Não foi possível carregar seus grupos"
              onRetry={refresh}
              retrying={refreshing}
            />
          </div>
        ) : !rows.length ? (
          <div className="p-5">
            <EmptyStateCard
              icon={Users}
              title="Seus grupos vão aparecer aqui"
              description="Conecte uma conta do WhatsApp e aguarde a sincronização. Depois, favorite os grupos que vão receber suas ofertas."
              action={
                <Button asChild>
                  <Link href="/connections">
                    Gerenciar conexões
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              }
            />
          </div>
        ) : !filtered.length ? (
          <div className="p-5">
            <EmptyStateCard
              variant="search"
              title="Nenhum grupo com esses filtros"
              description="Experimente outro nome, conexão ou filtro de favoritos para encontrar o destino certo."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    reset({
                      search: "",
                      connectionId: allConnections,
                      visibility: "all",
                    });
                    setSelected([]);
                  }}
                >
                  Limpar filtros
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="bg-muted/30 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <Checkbox
                  checked={
                    allSelected
                      ? true
                      : selectedVisible.length
                        ? "indeterminate"
                        : false
                  }
                  disabled={busy}
                  onCheckedChange={(checked) =>
                    setSelected(
                      checked === true
                        ? selectable.map((group) => group.id)
                        : []
                    )
                  }
                />
                Selecionar{" "}
                {filtered.length > 100 ? "primeiros 100" : "visíveis"}
              </label>
              <span className="text-muted-foreground text-xs">
                {filtered.length} de {rows.length} grupos
              </span>
            </div>
            {selectedVisible.length > 0 && (
              <div className="bg-primary/5 flex flex-wrap items-center gap-2 border-b px-5 py-3">
                <p className="mr-auto text-sm font-medium">
                  {selectedVisible.length} selecionados
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    batch.mutate({
                      groupIds: selectedVisible,
                      isFavorite: true,
                    })
                  }
                >
                  <Star className="size-4" />
                  Favoritar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() =>
                    batch.mutate({
                      groupIds: selectedVisible,
                      isFavorite: false,
                    })
                  }
                >
                  Remover favoritos
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => setSelected([])}
                >
                  Limpar
                </Button>
              </div>
            )}
            <ul className="max-h-[60vh] divide-y overflow-y-auto">
              {filtered.map((group) => {
                const account = group.connectionId
                  ? byConnection.get(group.connectionId)
                  : undefined;
                const checked = selectedVisible.includes(group.id);
                return (
                  <li
                    key={group.id}
                    className={cn(
                      "hover:bg-muted/30 flex flex-wrap items-center gap-3 px-5 py-4 transition-colors sm:flex-nowrap",
                      checked && "bg-primary/5"
                    )}
                  >
                    <Checkbox
                      aria-label={"Selecionar " + group.name}
                      checked={checked}
                      disabled={
                        busy || (!checked && selectedVisible.length >= 100)
                      }
                      onCheckedChange={(value) =>
                        setSelected(
                          value === true
                            ? [...selectedVisible, group.id]
                            : selectedVisible.filter((id) => id !== group.id)
                        )
                      }
                    />
                    <div
                      aria-hidden="true"
                      className={cn(
                        "hidden size-11 shrink-0 items-center justify-center rounded-xl sm:flex",
                        group.isFavorite
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Users className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1 basis-1/2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className="min-w-0 truncate font-medium"
                          title={group.name}
                        >
                          {group.name}
                        </p>
                        {group.isDefault && (
                          <Badge variant="secondary">
                            <Check className="size-3" />
                            Padrão
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1 truncate text-xs">
                        {account?.name ?? "Conta do WhatsApp"}
                        {group.accountPhone ? " · +" + group.accountPhone : ""}
                      </p>
                    </div>
                    <div className="ml-auto flex shrink-0 items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy || group.isDefault}
                        onClick={() => target.mutate({ groupId: group.id })}
                      >
                        {group.isDefault ? "Grupo padrão" : "Usar como padrão"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={
                          (group.isFavorite
                            ? "Remover dos favoritos: "
                            : "Favoritar: ") + group.name
                        }
                        aria-pressed={group.isFavorite}
                        title={
                          group.isFavorite
                            ? "Remover dos favoritos"
                            : "Favoritar grupo"
                        }
                        disabled={busy}
                        onClick={() =>
                          favorite.mutate({
                            groupId: group.id,
                            isFavorite: !group.isFavorite,
                          })
                        }
                      >
                        <Star
                          className={cn(
                            "size-5",
                            group.isFavorite
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          )}
                        />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}
