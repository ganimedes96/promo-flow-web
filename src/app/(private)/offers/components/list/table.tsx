"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonRegion } from "@/components/feedback/loading-skeletons";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { OfferFilters } from "./filters";
import type { OfferListFilters } from "@/domains/offers/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FormSheet } from "@/components/form/containers/form-sheet";
import { EmptyStateCard } from "@/components/feedback/empty-state-card";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { getGroupedOffers } from "@/domains/offers/client";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { CreateOfferForm } from "../form/create";
import {
  OfferGroupActions,
  OfferDestinations,
  groupedColumns,
} from "./grouped-offers";
export function OffersTable() {
  const [page, setPage] = useState(1);
  const [filterReset, setFilterReset] = useState(0);
  const [filters, setFilters] = useState<OfferListFilters>({});
  const { data: session } = useSession();
  const perPage = 10;
  const list = useQuery({
    queryKey: queryKeys.offers.grouped({
      page,
      perPage,
      ...filters,
      userId: session?.user.id,
    }),
    queryFn: () => getGroupedOffers({ page, limit: perPage, ...filters }),
    enabled: !!session?.user.id,
    refetchInterval: (query) => {
      if (query.state.status === "error") return false;
      const hasPending = query.state.data?.data.some((group) =>
        group.destinations.some((offer) =>
          ["PROCESSING", "SCHEDULED", "PUBLISHING"].includes(offer.status)
        )
      );
      return hasPending ? 5000 : false;
    },
    staleTime: 5000,
    refetchOnWindowFocus: (query) => query.state.status !== "error",
    refetchIntervalInBackground: false,
    placeholderData: keepPreviousData,
  });
  const total = list.data?.pagination.total ?? 0;
  const lastPage = list.data?.pagination.lastPage ?? 1;
  const loading = list.isPending || list.isPlaceholderData;
  const empty =
    !loading && !list.error && !!list.data && !list.data.data.length;
  const filtered = Object.keys(filters).length > 0;
  const pages = [
    ...new Set(
      [1, page - 1, page, page + 1, lastPage].filter(
        (value) => value >= 1 && value <= lastPage
      )
    ),
  ].sort((a, b) => a - b);
  if (list.data && !list.isPlaceholderData && page > lastPage)
    setPage(lastPage);
  return (
    <Card className="max-w-full min-w-0 overflow-hidden">
      <CardHeader className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <CardTitle className="text-2xl">Ofertas</CardTitle>
          <CardDescription>
            Acompanhe horários e resultados das ofertas. O worker publica quando
            o envio estiver habilitado, respeitando 2 minutos por grupo. Expanda
            uma oferta para acompanhar os destinos.
          </CardDescription>
        </div>
        <CreateOfferButton />
      </CardHeader>
      <CardContent className="min-w-0">
        <OfferFilters
          key={filterReset}
          activeFilters={filters}
          onApply={(next) => {
            setFilters(next);
            setPage(1);
          }}
        />
        {list.error && (
          <ApiErrorCard
            title="Não foi possível carregar suas ofertas"
            description={list.error.message}
            onRetry={() => {
              void list.refetch();
            }}
            retrying={list.isFetching}
          />
        )}
        {loading && (
          <SkeletonRegion label="Carregando ofertas" className="mb-3">
            <Skeleton className="h-5 w-44" />
          </SkeletonRegion>
        )}
        {!loading && total > 0 && (
          <p className="text-muted-foreground mb-3 text-sm">
            {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} de{" "}
            {total} ofertas
          </p>
        )}
        {empty && (
          <EmptyStateCard
            variant={filtered ? "search" : "empty"}
            title={
              filtered
                ? "Oferta não encontrada"
                : "Sua primeira boa oferta começa aqui"
            }
            description={
              filtered
                ? "Nenhuma oferta corresponde à sua pesquisa. Confira o nome ou ajuste os filtros. Você também pode limpar a busca para ver todas as ofertas."
                : "Cadastre um produto, escolha seus grupos favoritos e acompanhe os próximos envios neste espaço."
            }
            action={
              filtered ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({});
                    setPage(1);
                    setFilterReset((current) => current + 1);
                  }}
                >
                  Limpar filtros
                </Button>
              ) : (
                <CreateOfferButton />
              )
            }
          />
        )}
        <div
          className="max-h-[65vh] max-w-full min-w-0 overflow-auto rounded-md lg:max-h-none lg:overflow-visible"
          role="region"
          aria-label="Tabela de ofertas"
          hidden={empty || (!!list.error && !list.data)}
          tabIndex={0}
        >
          <DataTable
            className="max-w-full min-w-0 [&_[data-slot=table-container]]:max-h-[65vh] [&_[data-slot=table-container]]:overflow-auto [&_table]:min-w-[920px] [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10"
            data={list.data?.data ?? []}
            columns={groupedColumns}
            actions={(group) => <OfferGroupActions group={group} />}
            renderExpanded={(group) => <OfferDestinations group={group} />}
            expandLabel="Ver destinos"
            loadingActionsCount={2}
            loading={loading}
            getRowKey={(offer) => offer.id}
            emptyMessage={
              Object.keys(filters).length
                ? "Nenhuma oferta encontrada. Tente ajustar ou limpar os filtros."
                : "Nenhuma oferta cadastrada."
            }
          />
        </div>
        {total > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm">
              Página {page} de {lastPage}
            </p>
            <Pagination
              className="mx-0 w-auto"
              aria-label="Paginação das ofertas"
            >
              <PaginationContent>
                <PaginationItem>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((current) => current - 1)}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                    Anterior
                  </Button>
                </PaginationItem>
                {pages.map((value, index) => (
                  <PaginationItem key={value} className="hidden sm:flex">
                    {index > 0 && value - pages[index - 1] > 1 && (
                      <PaginationEllipsis />
                    )}
                    <PaginationLink
                      href="#"
                      size="sm"
                      isActive={value === page}
                      aria-label={"Ir para a página " + value}
                      aria-disabled={loading}
                      tabIndex={loading ? -1 : 0}
                      onClick={(event) => {
                        event.preventDefault();
                        if (!loading) setPage(value);
                      }}
                    >
                      {value}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= lastPage || loading}
                    onClick={() => setPage((current) => current + 1)}
                    aria-label="Próxima página"
                  >
                    Próxima
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CreateOfferButton() {
  return (
    <FormSheet
      className="gap-6 overflow-y-auto px-6 pb-6 data-[side=right]:w-full sm:px-8 data-[side=right]:sm:max-w-4xl"
      title="Cadastrar oferta"
      description="Preencha uma vez e selecione um ou mais grupos favoritos de destino."
      buttonText="Nova oferta"
      formComponent={CreateOfferForm}
      formProps={{}}
    />
  );
}
