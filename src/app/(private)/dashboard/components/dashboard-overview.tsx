"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ChartNoAxesCombined,
  ArrowUpRight,
  CalendarClock,
  CircleCheck,
  Package,
  TriangleAlert,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getGroupedOffers } from "@/domains/offers/client";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { formatDate } from "@/utils/date";
import { offerDisplayStatus } from "@/domains/offers/display-status";
import { OfferStatus } from "@/domains/offers/offer-status";

const sampleSize = 40;
const DashboardChart = dynamic(() => import("./dashboard-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-40 w-full" />,
});

function tally(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return Array.from(counts, ([label, value]) => ({ label, value })).sort(
    (a, b) => b.value - a.value
  );
}

function Breakdown({
  title,
  description,
  data,
  trend,
}: {
  title: string;
  description: string;
  data: { label: string; value: number }[];
  trend?: boolean;
}) {
  return (
    <Card className="min-w-0 motion-safe:transition-shadow motion-safe:hover:shadow-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <DashboardChart data={data} trend={trend} />
        ) : (
          <p className="text-muted-foreground text-sm">
            Sem dados nesta amostra.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardOverview() {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const activity = useQuery({
    queryKey: queryKeys.offers.grouped({
      page: 1,
      perPage: sampleSize,
      userId,
    }),
    queryFn: () => getGroupedOffers({ page: 1, limit: sampleSize }),
    enabled: !!userId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const groups = activity.data?.data ?? [];
  const offers = groups.flatMap((group) => group.destinations);
  const deliveries = offers.filter((offer) => !!offer.whatsappGroup);
  const now = new Date().toISOString();
  const today = formatDate(now, "yyyy-MM-dd");
  const publishedToday = deliveries.filter(
    (offer) =>
      offer.publishedAt && formatDate(offer.publishedAt, "yyyy-MM-dd") === today
  );
  const next = deliveries
    .filter(
      (offer) =>
        offer.status === OfferStatus.SCHEDULED &&
        offer.scheduledAt &&
        !offer.queueBlockedReason
    )
    .sort((a, b) => (a.scheduledAt ?? "").localeCompare(b.scheduledAt ?? ""))
    .slice(0, 5);
  const attention = groups.filter(({ destinations }) =>
    destinations.some(
      (offer) =>
        offer.status === OfferStatus.FAILED ||
        (offer.status === OfferStatus.PUBLISHING && !!offer.errorMessage) ||
        (offer.mirrorAffiliateStatus === "PENDING" &&
          ["FAILED", "RECONNECT", "STORE_REQUIRED"].includes(
            offer.mirrorConversionStatus ?? ""
          ))
    )
  ).length;
  const blocked = deliveries.filter((offer) => offer.queueBlockedReason);
  const stats = [
    { title: "Ofertas recentes", value: groups.length, icon: Package },
    { title: "Precisam de ação", value: attention, icon: TriangleAlert },
    {
      title: "Destinos agendados",
      value: deliveries.filter((offer) => offer.status === OfferStatus.SCHEDULED).length,
      icon: CalendarClock,
    },
    {
      title: "Publicações hoje",
      value: publishedToday.length,
      icon: CircleCheck,
    },
  ];

  return (
    <div className="space-y-6">
      <header className="from-primary/20 via-card to-card relative overflow-hidden rounded-3xl border bg-linear-to-br p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="bg-primary/15 pointer-events-none absolute -top-16 -right-12 size-56 rounded-full blur-3xl motion-safe:animate-pulse"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-primary mb-2 flex items-center gap-2 text-sm font-semibold">
              <ChartNoAxesCombined className="size-4" /> Atividade do PromoFlow
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Visão geral
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Acompanhe suas ofertas, a fila e os destinos em um só lugar.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/offers">
              Ver ofertas <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      </header>
      {activity.isError ? (
        <ApiErrorCard
          title="Não foi possível carregar a visão geral"
          error={activity.error}
          onRetry={() => void activity.refetch()}
          retrying={activity.isFetching}
        />
      ) : activity.isPending ? (
        <div role="status" className="grid gap-4 sm:grid-cols-2">
          <span className="sr-only">Carregando visão geral</span>
          {["summary", "queue", "status", "activity"].map((key) => (
            <Skeleton key={key} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <p className="text-muted-foreground text-sm">
            Indicadores baseados nas últimas {groups.length} ofertas carregadas,
            até {sampleSize}. Horários de Brasília.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ title, value, icon: Icon }, index) => (
              <Card
                key={title}
                className="from-primary/10 to-card motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 bg-linear-to-br motion-safe:transition-transform motion-safe:duration-500 motion-safe:hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 70}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <CardContent className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-muted-foreground text-sm">{title}</p>
                    <p className="mt-1 text-3xl font-bold tabular-nums">
                      {value}
                    </p>
                  </div>
                  <span className="bg-primary/15 text-primary grid size-10 shrink-0 place-items-center rounded-xl">
                    <Icon className="size-5" />
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid items-start gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Próximos envios</CardTitle>
                <CardDescription>
                  Agendamentos sem bloqueio identificado na amostra.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {next.length ? (
                  <ul className="divide-y">
                    {next.map((offer) => (
                      <li
                        key={offer.id}
                        className="flex items-center justify-between gap-3 py-3 first:pt-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {offer.title ?? "Oferta"}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {offer.whatsappGroup?.name}
                          </p>
                        </div>
                        <time
                          dateTime={offer.scheduledAt ?? undefined}
                          className="shrink-0 text-xs font-semibold tabular-nums"
                        >
                          {formatDate(
                            offer.scheduledAt ?? undefined,
                            "dd/MM HH:mm"
                          )}
                        </time>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Nenhum próximo envio disponível na amostra.
                  </p>
                )}
              </CardContent>
            </Card>
            <Breakdown
              title="Motivos de espera"
              description="Bloqueios identificados nos destinos da fila."
              data={tally(
                blocked.map((offer) => offerDisplayStatus(offer).label)
              )}
            />
            <Breakdown
              title="Status dos envios"
              description="Distribuição dos destinos por situação."
              data={tally(
                deliveries.map((offer) => offerDisplayStatus(offer).label)
              )}
            />
            <Breakdown
              title="Publicações por grupo"
              description="Grupos com mais envios concluídos na amostra."
              data={tally(
                deliveries
                  .filter((offer) => offer.status === OfferStatus.PUBLISHED)
                  .map(
                    (offer) => offer.whatsappGroup?.name ?? "Grupo indisponível"
                  )
              ).slice(0, 5)}
            />
            <Breakdown
              title="Atividade recente"
              trend
              description="Ofertas por dia de cadastro, no horário de Brasília."
              data={tally(
                groups.map(({ product }) =>
                  formatDate(product.createdAt, "yyyy-MM-dd")
                )
              )
                .sort((a, b) => a.label.localeCompare(b.label))
                .slice(-7)
                .map(({ label, value }) => ({
                  label: label.slice(8) + "/" + label.slice(5, 7),
                  value,
                }))}
            />
          </div>
        </>
      )}
    </div>
  );
}
