"use client";
import { getMirrorSources } from "@/domains/mirroring/client";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonRegion } from "@/components/feedback/loading-skeletons";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { OfferFilters } from "./filters";
import type { OfferListFilters } from "@/domains/offers/types";
import { OfferStatus } from "@/domains/offers/offer-status";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ListPagination } from "@/components/pagination";
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
import { CreateOfferForm } from "../create/create";
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
  const mirrorSources = useQuery({
    queryKey: queryKeys.mirroring.sources(session?.user.id),
    queryFn: getMirrorSources,
    enabled: !!session?.user.id,
    staleTime: 30000,
    retry: false,
  });
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
        group.destinations.some(
          (offer) =>
            new Set<OfferStatus>([OfferStatus.PROCESSING, OfferStatus.SCHEDULED, OfferStatus.PUBLISHING]).has(offer.status) ||
            offer.mirrorAffiliateStatus === "PENDING"
        )
      );
      return hasPending
        ? 5000
        : (mirrorSources.data?.selectedCount ?? 0) > 0
          ? 10000
          : page === 1 ? 30000 : false;
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
            error={list.error}
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
          onClick={(event) => {
            const target = event.target;
            if (
              !(target instanceof Element) ||
              target.closest(
                'button,a,input,select,textarea,label,summary,[role="button"],[role="link"],[contenteditable="true"]'
              )
            )
              return;
            if (window.getSelection()?.isCollapsed === false) return;
            const row = target.closest("tr");
            if (!row || !event.currentTarget.contains(row)) return;
            // Reuse the table's accessible expansion control without changing action buttons.
            const trigger = row.querySelector<HTMLButtonElement>(
              ":scope > td:first-child > button[aria-expanded][aria-controls]"
            );
            trigger?.click();
          }}
          hidden={empty || (!!list.error && !list.data)}
          tabIndex={0}
        >
          <DataTable
            className="[&_tbody>tr:has(>td>button[aria-expanded])]:hover:bg-primary/10 max-w-full min-w-0 **:data-[slot=table-container]:max-h-[65vh] **:data-[slot=table-container]:overflow-auto [&_table]:min-w-230 [&_tbody>tr:has(>td>button[aria-expanded])]:cursor-pointer [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10"
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
          <div className="mt-4">
            <ListPagination
              page={page}
              totalPages={lastPage}
              onPage={setPage}
              busy={loading}
              label="Paginação das ofertas"
            />
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
