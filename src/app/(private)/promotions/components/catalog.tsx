"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
const money = (value: string) =>
  Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export function PromotionsCatalog({ manage = false }: { manage?: boolean }) {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Promotion | null | undefined>();
  const [using, setUsing] = useState<Promotion | null>(null);
  const [removing, setRemoving] = useState<Promotion | null>(null);
  const cache = useQueryClient();
  const list = useQuery({
    queryKey: queryKeys.promotions.list(page, manage, session?.user.id),
    queryFn: () => getPromotions(page, manage),
    enabled: !!session?.user,
  });
  const refresh = () => {
    void cache.invalidateQueries({ queryKey: queryKeys.promotions.all });
  };
  const deletion = useServerAction<unknown, { id: string }>({
    mutationFn: deletePromotion,
    onSuccess: () => {
      setRemoving(null);
      refresh();
    },
  });
  const items = list.data?.items || [];
  const lastPage = Math.max(1, Math.ceil((list.data?.total || 0) / 12));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {manage ? "Gerenciar promoções" : "Central de promoções"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {manage
              ? "Prepare os produtos e escolha quais ficam disponíveis."
              : "Escolha uma promoção, revise os dados e informe seu link de afiliado antes de salvar."}
          </p>
        </div>
        <div className="flex gap-2">
          {manage ? (
            <>
              <Button asChild variant="outline">
                <Link href="/promotions">Ver central</Link>
              </Button>
              <Button onClick={() => setEditing(null)}>Nova promoção</Button>
            </>
          ) : (
            session?.user.role === "admin" && (
              <Button asChild variant="outline">
                <Link href="/promotions/manage">Gerenciar central</Link>
              </Button>
            )
          )}
        </div>
      </div>
      {list.isPending ? (
        <p>Carregando promoções…</p>
      ) : list.error ? (
        <div role="alert">
          <p>Não foi possível carregar a central.</p>
          <Button onClick={() => list.refetch()}>Tentar novamente</Button>
        </div>
      ) : !items.length ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center">
            Nenhuma promoção {manage ? "cadastrada" : "disponível"} no momento.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => {
            const discount =
              p.originalPrice &&
              Number(p.originalPrice) > Number(p.currentPrice)
                ? Math.round(
                    (1 - Number(p.currentPrice) / Number(p.originalPrice)) * 100
                  )
                : 0;
            return (
              <Card key={p.id} className="overflow-hidden">
                <div className="flex h-48 items-center justify-center bg-white p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-contain"
                  />
                </div>
                <CardHeader>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {p.marketplace.replace("_", " ")}
                    </Badge>
                    {discount > 0 && <Badge>{discount}% OFF</Badge>}
                    {manage && (
                      <Badge variant="outline">
                        {!p.isPublished
                          ? "Rascunho"
                          : p.expiresAt && new Date(p.expiresAt) <= new Date()
                            ? "Expirada"
                            : "Publicada"}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 text-base">
                    {p.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    {discount > 0 && (
                      <p className="text-muted-foreground text-sm line-through">
                        {money(p.originalPrice!)}
                      </p>
                    )}
                    <p className="text-xl font-bold">{money(p.currentPrice)}</p>
                  </div>
                  {p.couponCode && (
                    <p className="text-sm">
                      Cupom: <strong>{p.couponCode}</strong>
                    </p>
                  )}
                  {p.expiresAt && (
                    <p className="text-muted-foreground text-xs">
                      Até {new Date(p.expiresAt).toLocaleString("pt-BR")}
                    </p>
                  )}
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {manage ? (
                      <>
                        <Button size="sm" onClick={() => setEditing(p)}>
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setRemoving(p)}
                        >
                          Excluir
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setUsing(p)}>Usar promoção</Button>
                    )}
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={p.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver na loja
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          disabled={page <= 1 || list.isFetching}
          onClick={() => setPage((v) => v - 1)}
        >
          Anterior
        </Button>
        <span className="text-sm">
          Página {page} de {lastPage}
        </span>
        <Button
          variant="outline"
          disabled={page >= lastPage || list.isFetching}
          onClick={() => setPage((v) => v + 1)}
        >
          Próxima
        </Button>
      </div>
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
                setEditing(undefined);
                refresh();
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
        <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
          <SheetHeader className="bg-primary/5 shrink-0 border-b px-5 py-5 pr-12 sm:px-7">
            <SheetTitle>Preparar minha oferta</SheetTitle>
          </SheetHeader>
          <div className="p-6">
            {using && (
              <CreateOfferForm
                key={using.id}
                sourcePromotionId={using.id}
                initialDraft={{
                  sourceUrl: using.sourceUrl,
                  title: using.title,
                  description: using.description,
                  imageUrls: [using.imageUrl],
                  currentPrice: Number(using.currentPrice),
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
