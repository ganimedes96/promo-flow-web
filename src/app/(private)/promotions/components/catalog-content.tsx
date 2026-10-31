"use client";

import {
  ArrowUpRight,
  Clock3,
  ExternalLink,
  Pencil,
  Sparkles,
  Ticket,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonRegion } from "@/components/feedback/loading-skeletons";
import type { Promotion } from "@/domains/promotions/types";
import { formatDate } from "@/utils/date";
import { PromotionImage } from "./promotion-image";

const stores: Record<string, string> = {
  MERCADO_LIVRE: "Mercado Livre",
  AMAZON: "Amazon",
  SHOPEE: "Shopee",
};
const money = (value: string) =>
  Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
function discount(promotion: Promotion) {
  return promotion.originalPrice &&
    Number(promotion.originalPrice) > Number(promotion.currentPrice)
    ? Math.round(
        (1 - Number(promotion.currentPrice) / Number(promotion.originalPrice)) *
          100
      )
    : 0;
}
type PromotionActions = {
  onUse: (promotion: Promotion) => void;
  onEdit: (promotion: Promotion) => void;
  onRemove: (promotion: Promotion) => void;
};
function Price({
  promotion,
  large = false,
}: {
  promotion: Promotion;
  large?: boolean;
}) {
  return (
    <div>
      {discount(promotion) > 0 && (
        <p className="text-muted-foreground text-xs line-through">
          {money(promotion.originalPrice!)}
        </p>
      )}
      <p
        className={
          large ? "text-2xl font-bold tracking-tight" : "font-semibold"
        }
      >
        {money(promotion.currentPrice)}
      </p>
    </div>
  );
}
export function PromotionHighlights({
  items,
  onUse,
}: {
  items: Promotion[];
  onUse: PromotionActions["onUse"];
}) {
  if (!items.length) return null;
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-primary mb-1 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="size-4" />
            Acabaram de chegar
          </p>
          <h2 className="text-xl font-semibold tracking-tight">
            Novidades em destaque
          </h2>
        </div>
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Clock3 className="size-3.5" />
          As últimas adicionadas à central
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((promotion) => {
          const off = discount(promotion);
          return (
            <Card
              key={promotion.id}
              className="group gap-0 overflow-hidden rounded-2xl py-0 transition-shadow hover:shadow-lg motion-safe:duration-300"
            >
              <div className="relative overflow-hidden">
                <PromotionImage
                  src={promotion.imageUrl}
                  title={promotion.title}
                />
                <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                  <Badge className="bg-background text-foreground border shadow-sm">
                    {stores[promotion.marketplace] ?? promotion.marketplace}
                  </Badge>
                  {off > 0 && <Badge>{off}% OFF</Badge>}
                </div>
              </div>
              <CardContent className="space-y-4 p-5">
                {promotion.category && (
                  <Badge variant="secondary">{promotion.category.name}</Badge>
                )}
                {promotion.category && (
                  <Badge variant="secondary">{promotion.category.name}</Badge>
                )}
                <h3
                  className="line-clamp-2 min-h-12 text-base leading-6 font-semibold"
                  title={promotion.title}
                >
                  {promotion.title}
                </h3>
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <Price promotion={promotion} large />
                  {promotion.couponCode && (
                    <span className="border-primary/30 bg-primary/5 text-primary flex max-w-full items-center gap-1.5 rounded-lg border border-dashed px-2 py-1 text-xs">
                      <Ticket className="size-3.5 shrink-0" />
                      <span className="truncate" title={promotion.couponCode}>
                        {promotion.couponCode}
                      </span>
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground line-clamp-2 min-h-10 text-xs leading-5">
                  {promotion.description}
                </p>
                {promotion.expiresAt && (
                  <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <Clock3 className="size-3.5" />
                    Até {formatDate(promotion.expiresAt, "dd/MM/yyyy HH:mm")}
                  </p>
                )}
                <div className="flex items-center gap-2 border-t pt-4">
                  <Button className="flex-1" onClick={() => onUse(promotion)}>
                    Preparar minha oferta
                    <ArrowUpRight className="size-4 transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" />
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="icon"
                    aria-label={"Ver na loja: " + promotion.title}
                  >
                    <a
                      href={promotion.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
export function PromotionTable({
  items,
  loading,
  manage,
  onUse,
  onEdit,
  onRemove,
}: {
  items: Promotion[];
  loading?: boolean;
  manage: boolean;
} & PromotionActions) {
  const columns: ColumnDef<Promotion>[] = [
    {
      key: "title",
      header: "Produto",
      primary: true,
      className: "min-w-64 max-w-96",
      render: (_value, promotion) => (
        <div className="flex items-center gap-3">
          <PromotionImage
            src={promotion.imageUrl}
            title={promotion.title}
            compact
          />
          <div className="min-w-0">
            {promotion.category && (
              <p className="text-primary mb-1 text-xs">
                {promotion.category.name}
              </p>
            )}
            <p
              className="line-clamp-2 max-w-72 text-sm font-medium"
              title={promotion.title}
            >
              {promotion.title}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Adicionada em {formatDate(promotion.createdAt)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "marketplace",
      header: "Loja",
      render: (_value, promotion) => (
        <Badge variant="secondary">
          {stores[promotion.marketplace] ?? promotion.marketplace}
        </Badge>
      ),
    },
    {
      key: "currentPrice",
      header: "Preço",
      className: "min-w-28",
      render: (_value, promotion) => <Price promotion={promotion} />,
    },
    {
      key: "originalPrice",
      header: "Desconto",
      render: (_value, promotion) =>
        discount(promotion) > 0 ? (
          <Badge
            variant="outline"
            className="border-success/30 bg-success/10 text-success"
          >
            {discount(promotion)}% OFF
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "couponCode",
      header: "Cupom",
      className: "max-w-40",
      render: (_value, promotion) =>
        promotion.couponCode ? (
          <span
            className="block max-w-36 truncate text-xs font-medium"
            title={promotion.couponCode}
          >
            {promotion.couponCode}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    ...(manage
      ? [
          {
            key: "isPublished" as const,
            header: "Disponibilidade",
            isStatus: true,
            render: (_value: unknown, promotion: Promotion) => {
              const expired =
                promotion.expiresAt &&
                new Date(promotion.expiresAt) <= new Date();
              return (
                <Badge
                  variant="outline"
                  className={
                    !promotion.isPublished
                      ? "text-muted-foreground"
                      : expired
                        ? "border-warning/30 bg-warning/10 text-warning"
                        : "border-success/30 bg-success/10 text-success"
                  }
                >
                  {!promotion.isPublished
                    ? "Rascunho"
                    : expired
                      ? "Expirada"
                      : "Publicada"}
                </Badge>
              );
            },
          },
        ]
      : []),
  ];
  return (
    <DataTable
      data={items}
      columns={columns}
      loading={loading}
      loadingRows={6}
      loadingActionsCount={2}
      getRowKey={(promotion) => promotion.id}
      className="[&_[data-slot=table-container]]:max-h-[65vh] [&_[data-slot=table-container]]:overflow-auto [&_td]:py-3 [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10"
      actionsHeader="Ações"
      actions={(promotion) => (
        <div className="flex flex-wrap justify-center gap-2">
          {manage ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(promotion)}
              >
                <Pencil className="size-3.5" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={"Excluir promoção: " + promotion.title}
                onClick={() => onRemove(promotion)}
                className="text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => onUse(promotion)}>
              Usar promoção
              <ArrowUpRight className="size-3.5" />
            </Button>
          )}
          <Button
            asChild
            variant="outline"
            size="icon"
            aria-label={"Ver na loja: " + promotion.title}
          >
            <a
              href={promotion.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="size-4" />
            </a>
          </Button>
        </div>
      )}
    />
  );
}
export function PromotionHighlightsSkeleton() {
  return (
    <SkeletonRegion label="Carregando novidades">
      <Skeleton className="mb-4 h-7 w-56" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="gap-0 overflow-hidden rounded-2xl py-0">
            <Skeleton className="h-48 rounded-none" />
            <CardContent className="space-y-4 p-5">
              <Skeleton className="h-12" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </CardContent>
          </Card>
        ))}
      </div>
    </SkeletonRegion>
  );
}
