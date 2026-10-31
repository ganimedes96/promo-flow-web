import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/shadcn/utils";

export function SkeletonRegion({
  children,
  className,
  label = "Carregando conteúdo…",
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn(
        "w-full min-w-0 [&_[data-slot=skeleton]]:motion-reduce:animate-none",
        className
      )}
    >
      <span className="sr-only">{label}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}
function HeaderSkeleton() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="w-full space-y-3">
        <Skeleton className="h-7 w-52 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-9 w-32 shrink-0" />
    </div>
  );
}
export function ConnectionPanelSkeleton() {
  return (
    <SkeletonRegion label="Carregando sua conta do WhatsApp">
      <Card className="whatsapp-connection-card gap-0 rounded-3xl p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-5 w-40 rounded-full" />
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-10 w-3/5" />
            <Skeleton className="h-4 w-full max-w-lg" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-4 rounded-2xl border p-4">
              <Skeleton className="size-14 shrink-0 rounded-2xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
          <div className="flex min-h-64 items-center justify-center">
            <Skeleton className="h-64 w-40 rounded-3xl" />
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="mt-5 h-12 w-full rounded-xl" />
      </Card>
    </SkeletonRegion>
  );
}
export function ConnectionSheetSkeleton() {
  return (
    <SkeletonRegion
      label="Carregando conexão"
      className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7"
    >
      <div className="bg-card space-y-6 rounded-3xl border p-6">
        <Skeleton className="mx-auto size-20 rounded-3xl" />
        <Skeleton className="mx-auto h-6 w-36 rounded-full" />
        <Skeleton className="mx-auto h-6 w-4/5" />
        <Skeleton className="mx-auto h-4 w-full" />
        <Skeleton className="mx-auto h-4 w-3/4" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-10" />
      </div>
      <div className="mt-6 space-y-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-9" />
        ))}
      </div>
    </SkeletonRegion>
  );
}
export function ConnectionsGridSkeleton() {
  return (
    <SkeletonRegion label="Carregando conexões">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="gap-4">
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Skeleton className="size-11 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-14 rounded-xl" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-1/2" />
                <Skeleton className="h-9 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </SkeletonRegion>
  );
}
export function PromotionGridSkeleton() {
  return (
    <SkeletonRegion label="Carregando central de promoções">
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
      <Skeleton className="mt-7 mb-4 h-7 w-48" />
      <div className="space-y-3 rounded-xl border p-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    </SkeletonRegion>
  );
}
export function GroupListSkeleton() {
  return (
    <SkeletonRegion label="Carregando grupos">
      <div className="divide-y">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="size-4 shrink-0" />
            <Skeleton className="hidden size-11 shrink-0 rounded-xl sm:block" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="size-8" />
          </div>
        ))}
      </div>
    </SkeletonRegion>
  );
}
export function OfferFormSkeleton() {
  return (
    <SkeletonRegion
      label="Carregando formulário da oferta"
      className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7"
    >
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24 rounded-2xl" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10" />
            </div>
          ))}
          <Skeleton className="h-24" />
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
      <Skeleton className="mt-6 h-11" />
    </SkeletonRegion>
  );
}
export function PlansSkeleton() {
  return (
    <SkeletonRegion label="Carregando planos">
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="space-y-5">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-9 w-36" />
              {[0, 1, 2].map((row) => (
                <Skeleton key={row} className="h-4" />
              ))}
              <Skeleton className="h-10" />
            </CardContent>
          </Card>
        ))}
      </div>
    </SkeletonRegion>
  );
}
export function SubscriptionSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <SkeletonRegion label="Carregando assinatura">
        <Card>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="h-8 w-64 max-w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-36" />
          </CardContent>
        </Card>
      </SkeletonRegion>
      <PlansSkeleton />
    </div>
  );
}
function TableSkeleton({ filters = false }: { filters?: boolean }) {
  return (
    <SkeletonRegion label="Carregando listagem">
      <Card>
        <CardContent className="space-y-5">
          <HeaderSkeleton />
          {filters && (
            <div className="grid gap-4 rounded-2xl border p-5 md:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          )}
          <Skeleton className="h-9" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </CardContent>
      </Card>
    </SkeletonRegion>
  );
}
export type PageSkeletonVariant =
  | "panel"
  | "connections"
  | "groups"
  | "promotions"
  | "offers"
  | "users"
  | "subscription"
  | "generic";
export function PageSkeleton({
  variant = "generic",
}: {
  variant?: PageSkeletonVariant;
}) {
  if (variant === "subscription") return <SubscriptionSkeleton />;
  if (variant === "offers" || variant === "users")
    return <TableSkeleton filters={variant === "offers"} />;
  return (
    <div className="space-y-6">
      <SkeletonRegion>
        <HeaderSkeleton />
      </SkeletonRegion>
      {variant === "panel" ? (
        <ConnectionPanelSkeleton />
      ) : variant === "connections" ? (
        <>
          <SkeletonRegion>
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="mt-4 h-12 rounded-xl" />
          </SkeletonRegion>
          <ConnectionsGridSkeleton />
        </>
      ) : variant === "groups" ? (
        <>
          <SkeletonRegion>
            <div className="grid gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
            <Skeleton className="mt-6 h-20 rounded-2xl" />
            <Skeleton className="mt-6 h-24 rounded-2xl" />
          </SkeletonRegion>
          <GroupListSkeleton />
        </>
      ) : variant === "promotions" ? (
        <PromotionGridSkeleton />
      ) : (
        <SkeletonRegion>
          <Skeleton className="h-80 rounded-2xl" />
        </SkeletonRegion>
      )}
    </div>
  );
}
