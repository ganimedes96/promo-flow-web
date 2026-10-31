"use client";
import { useState } from "react";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { EmptyStateCard } from "@/components/feedback/empty-state-card";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutList, Plus, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { getPromotions } from "@/domains/promotions/client";
import { deletePromotion } from "@/domains/promotions/actions";
import { Promotion } from "@/domains/promotions/types";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { CreateOfferForm } from "../../offers/components/form/create";
import { PromotionForm } from "./form";
import {
  PromotionHighlights,
  PromotionHighlightsSkeleton,
  PromotionTable,
} from "./catalog-content";

export function PromotionsCatalog({ manage = false }: { manage?: boolean }) {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Promotion | null | undefined>();
  const [using, setUsing] = useState<Promotion | null>(null);
  const [removing, setRemoving] = useState<Promotion | null>(null);
  const list = useQuery({
    queryKey: queryKeys.promotions.list(
      page,
      manage,
      session?.user.id,
      !manage
    ),
    queryFn: () => getPromotions(page, manage, !manage),
    enabled: !!session?.user,
    refetchOnWindowFocus: "always",
    placeholderData: keepPreviousData,
    refetchInterval: (query) => (manage && !query.state.error ? 10000 : false),
    refetchIntervalInBackground: false,
  });
  const latest = useQuery({
    queryKey: queryKeys.promotions.list(1, false, session?.user.id),
    queryFn: () => getPromotions(1, false),
    enabled: !!session?.user && !manage,
    refetchOnWindowFocus: "always",
  });
  const deletion = useServerAction<unknown, { id: string }>({
    mutationFn: deletePromotion,
    invalidateQueries: [queryKeys.promotions.all],
    onSuccess: () => setRemoving(null),
  });
  const items = list.data?.items ?? [];
  const highlights = manage ? [] : (latest.data?.items ?? []).slice(0, 3);
  const total = list.data?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / 12));
  const initialLoading = list.isPending || (!manage && latest.isPending);
  const error = list.error || (!manage && latest.error);
  const available = total + highlights.length;
  const actions = {
    onUse: setUsing,
    onEdit: setEditing,
    onRemove: setRemoving,
  };
  if (list.data && !list.isPlaceholderData && page > lastPage)
    setPage(lastPage);
  return (
    <div className="min-w-0 space-y-7">
      <header className="from-primary/10 via-card to-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-gradient-to-br p-5 sm:p-6">
        <div className="max-w-2xl">
          <p className="text-primary mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="size-4" />
            {manage
              ? "Curadoria da central"
              : "Uma boa escolha faz a diferença"}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {manage ? "Gerenciar promoções" : "Central de promoções"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {manage
              ? "Organize os produtos, revise os preços e escolha o que fica disponível para os usuários."
              : "Descubra as novidades, compare as oportunidades e prepare sua oferta com o seu link de afiliado."}
          </p>
          {!initialLoading && !error && (
            <Badge variant="secondary" className="mt-3">
              {available}{" "}
              {manage ? "promoções cadastradas" : "promoções disponíveis"}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {manage ? (
            <>
              <Button asChild variant="outline">
                <Link href="/promotions">Ver central</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/promotion-sources">Fontes de promoções</Link>
              </Button>
              <Button onClick={() => setEditing(null)}>
                <Plus className="size-4" />
                Nova promoção
              </Button>
            </>
          ) : (
            session?.user.role === "admin" && (
              <Button asChild variant="outline">
                <Link href="/promotions/manage">Gerenciar central</Link>
              </Button>
            )
          )}
        </div>
      </header>

      {initialLoading ? (
        <div className="space-y-7">
          {!manage && <PromotionHighlightsSkeleton />}
          <PromotionTable items={[]} manage={manage} loading {...actions} />
        </div>
      ) : error ? (
        <ApiErrorCard
          title="Não foi possível carregar as promoções"
          onRetry={() => {
            void list.refetch();
            if (!manage) void latest.refetch();
          }}
          retrying={list.isFetching || (!manage && latest.isFetching)}
        />
      ) : !available ? (
        <EmptyStateCard
          title={
            manage
              ? "Vamos preparar a primeira promoção?"
              : "Novas boas ofertas estão por vir"
          }
          description={
            manage
              ? "Cadastre os dados do produto e publique quando estiver pronto."
              : "Ainda não há promoções disponíveis na central. Enquanto isso, você pode preparar suas próprias ofertas."
          }
          action={
            manage ? (
              <Button onClick={() => setEditing(null)}>
                Cadastrar promoção
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href="/offers">Ir para minhas ofertas</Link>
              </Button>
            )
          }
        />
      ) : (
        <>
          {!manage && (
            <PromotionHighlights items={highlights} onUse={setUsing} />
          )}
          {total > 0 ? (
            <section className="min-w-0 space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <LayoutList className="text-primary size-5" />
                    {manage ? "Catálogo de promoções" : "Mais oportunidades"}
                  </h2>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {manage
                      ? "Rascunhos, publicadas e expiradas em uma única visão."
                      : "O restante da central, em uma lista para comparar com facilidade."}
                  </p>
                </div>
                <span className="text-muted-foreground text-xs">
                  {total} {manage ? "produtos" : "outras promoções"}
                </span>
              </div>
              <PromotionTable
                items={items}
                manage={manage}
                loading={list.isPlaceholderData}
                {...actions}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-muted-foreground text-xs">
                  Página {page} de {lastPage}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || list.isFetching}
                    onClick={() => setPage((value) => value - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= lastPage || list.isFetching}
                    onClick={() => setPage((value) => value + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </section>
          ) : (
            <p className="bg-muted/20 text-muted-foreground rounded-xl border border-dashed px-4 py-3 text-center text-sm">
              Por enquanto, essas são todas as promoções disponíveis. Novidades
              aparecem no topo.
            </p>
          )}
        </>
      )}
      <Sheet
        open={editing !== undefined}
        onOpenChange={(open) => {
          if (!open) setEditing(undefined);
        }}
      >
        <SheetContent className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-5xl">
          <SheetHeader className="bg-primary/5 shrink-0 border-b px-5 py-5 pr-12 sm:px-7">
            <SheetTitle>
              {editing ? "Editar promoção" : "Nova promoção"}
            </SheetTitle>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col">
            <PromotionForm
              key={editing?.id || "new"}
              promotion={editing || undefined}
              onCancel={() => setEditing(undefined)}
              onSuccess={() => {
                if (!editing) setPage(1);
                setEditing(undefined);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
      <Sheet
        open={!!using}
        onOpenChange={(open) => {
          if (!open) setUsing(null);
        }}
      >
        <SheetContent className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-5xl">
          <SheetHeader className="bg-primary/5 shrink-0 border-b px-5 py-5 pr-12 sm:px-7">
            <SheetTitle>Preparar minha oferta</SheetTitle>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col">
            {using && (
              <CreateOfferForm
                key={using.id}
                sourcePromotionId={using.id}
                initialDraft={{
                  sourceUrl: using.sourceUrl,
                  categoryId: using.categoryId ?? undefined,
                  sourceCategory: using.sourceCategory ?? undefined,
                  title: using.title,
                  description: using.description,
                  imageUrls: using.imageUrl ? [using.imageUrl] : [],
                  currentPrice: using.currentPrice
                    ? Number(using.currentPrice)
                    : undefined,
                  originalPrice: using.originalPrice
                    ? Number(using.originalPrice)
                    : undefined,
                  couponCode: using.couponCode || "",
                  affiliateUrl: "",
                }}
                onSuccess={() => setUsing(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
      <AlertDialog
        open={!!removing}
        onOpenChange={(open) => {
          if (!open && !deletion.isPending) setRemoving(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir promoção?</AlertDialogTitle>
            <AlertDialogDescription>
              A promoção sai da central. As ofertas já criadas pelos usuários
              serão preservadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deletion.error && (
            <p role="alert" className="text-destructive">
              {deletion.error.message}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletion.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deletion.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (removing) deletion.mutate({ id: removing.id });
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
