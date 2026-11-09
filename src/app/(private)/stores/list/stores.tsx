"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Store,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { getStores } from "@/domains/stores/client";
import { deleteStore } from "@/domains/stores/actions";
import {
  AffiliateStore,
  Marketplace,
  marketplaces,
  storeNames,
} from "@/domains/stores/types";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useServerAction } from "@/hooks/use-server-action";
import { StoreForm } from "../components/store-form";
export function Stores() {
  const { data: session } = useSession();
  const [editing, setEditing] = useState<Marketplace | null>(null);
  const [removing, setRemoving] = useState<AffiliateStore | null>(null);
  const stores = useQuery({
    queryKey: queryKeys.stores.list(session?.user.id),
    queryFn: getStores,
    enabled: !!session?.user.id,
    retry: false,
  });
  const remove = useServerAction({
    mutationFn: deleteStore,
    invalidateQueries: [queryKeys.stores.all],
    successMessage: "Configuração removida.",
    onSuccess: () => setRemoving(null),
  });
  const ordered = [...marketplaces].sort(
    (a, b) =>
      Number(
        stores.data?.some((store) => store.marketplace === b && store.isDefault)
      ) -
      Number(
        stores.data?.some((store) => store.marketplace === a && store.isDefault)
      )
  );
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Minhas lojas</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Organize suas contas de afiliado. Uma configuração por loja, até
            três no total.
          </p>
        </div>
        <Badge variant="secondary">{stores.data?.length ?? 0} de 3 lojas</Badge>
      </header>
      <div className="bg-primary/5 flex items-start gap-3 rounded-xl border p-4">
        <ShieldCheck className="text-primary mt-0.5 size-5 shrink-0" />
        <p className="text-muted-foreground text-sm">
          Suas senhas e sessões permanecem no Chrome. A conversão automática
          está disponível para Mercado Livre e Shopee; Amazon fica cadastradas
          para organizar suas informações.
        </p>
      </div>
      {stores.isError ? (
        <Card>
          <CardHeader>
            <CardTitle>Não foi possível carregar suas lojas</CardTitle>
            <CardDescription>
              Confira sua conexão e tente novamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => void stores.refetch()}>
              <RefreshCw />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : stores.isPending ? (
        <div
          className="grid gap-4 md:grid-cols-3"
          aria-label="Carregando lojas"
          role="status"
        >
          {marketplaces.map((item) => (
            <Skeleton key={item} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {ordered.map((marketplace) => {
            const store = stores.data?.find(
              (item) => item.marketplace === marketplace
            );
            return (
              <Card
                key={marketplace}
                className={
                  store?.isDefault
                    ? "border-primary/50 ring-primary/10 ring-2"
                    : ""
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
                      <Store />
                    </span>
                    {store?.isDefault && <Badge>Padrão</Badge>}
                  </div>
                  <CardTitle className="mt-3">
                    {storeNames[marketplace]}
                  </CardTitle>
                  <CardDescription>
                    {store
                      ? store.name
                      : "Sua conta de afiliado ainda não foi configurada."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Badge
                    variant={marketplace !== "AMAZON" ? "secondary" : "outline"}
                  >
                    {marketplace !== "AMAZON"
                      ? "Conversão pela extensão"
                      : "Conversão pela extensão"}
                  </Badge>
                  {store ? (
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-muted-foreground text-xs">
                          Perfil / identificação
                        </dt>
                        <dd
                          className="truncate"
                          title={store.affiliateProfile || undefined}
                        >
                          {store.affiliateProfile || "Não informado"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground text-xs">
                          Etiqueta
                        </dt>
                        <dd
                          className="truncate"
                          title={store.campaignTag || undefined}
                        >
                          {store.campaignTag ||
                            (marketplace === "MERCADO_LIVRE"
                              ? "Etiqueta atual do gerador"
                              : "Não informada")}
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Cadastre seu perfil e a etiqueta que você utiliza nas
                      campanhas.
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant={store ? "outline" : "default"}
                      className="flex-1"
                      onClick={() => setEditing(marketplace)}
                    >
                      {store ? <Pencil /> : <Plus />}
                      {store ? "Editar" : "Configurar"}
                    </Button>
                    {store && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir configuração ${storeNames[marketplace]}`}
                        onClick={() => setRemoving(store)}
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    )}
                  </div>
                  {store?.linkBuilderUrl && (
                    <a
                      href={store.linkBuilderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary flex items-center gap-1 text-xs font-medium"
                    >
                      Abrir painel da loja
                      <ArrowUpRight className="size-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <Sheet
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Configurar {editing && storeNames[editing]}</SheetTitle>
            <SheetDescription>
              Preencha as informações da sua conta de afiliado.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            {editing && (
              <StoreForm
                key={editing}
                marketplace={editing}
                store={stores.data?.find(
                  (store) => store.marketplace === editing
                )}
                onSaved={() => setEditing(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
      <AlertDialog
        open={!!removing}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setRemoving(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover configuração da loja?</AlertDialogTitle>
            <AlertDialogDescription>
              Suas ofertas e links já salvos serão mantidos. Para novas
              conversões, cadastre a loja novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={remove.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (removing) remove.mutate(removing.id);
              }}
            >
              {remove.isPending && <LoaderCircle className="animate-spin" />}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
