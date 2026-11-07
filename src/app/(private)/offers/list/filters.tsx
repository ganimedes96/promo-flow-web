"use client";

import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { ControlledDatePicker } from "@/components/form/controllers/controlled-date-picker";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getOfferFilterGroups } from "@/domains/offers/client";
import type { Offer, OfferListFilters } from "@/domains/offers/types";
import { getWhatsAppConnections } from "@/domains/whatsapp/client";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { TIMEZONE } from "@/utils/date";
import { useQuery } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { ChevronDown, CircleHelp, Filter, Search, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { Collapsible } from "radix-ui";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  OFFER_PREPARATION_STATUS_INFO,
  OFFER_STATUS_INFO,
  OFFER_WAIT_REASON_INFO,
} from "@/domains/offers/offer-status";
import { statusColors, statusLabels } from "./helpers";
import { OfferStatus } from "@/domains/offers/offer-status";

type FilterValues = {
  waitReason: string;
  search: string;
  status: Offer["status"] | "all";
  connectionId: string;
  groupId: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
};
const defaults: FilterValues = {
  waitReason: "all",
  search: "",
  status: "all",
  connectionId: "all",
  groupId: "all",
  dateFrom: undefined,
  dateTo: undefined,
};

export function OfferFilters({
  activeFilters,
  onApply,
}: {
  activeFilters: OfferListFilters;
  onApply: (filters: OfferListFilters) => void;
}) {
  const [open, setOpen] = useState(true);
  const { data: session } = useSession();
  const { control, handleSubmit, reset, setError } = useForm<FilterValues>({
    defaultValues: defaults,
  });
  const connections = useQuery({
    queryKey: [...queryKeys.whatsapp.connections, session?.user.id],
    queryFn: getWhatsAppConnections,
    enabled: !!session?.user.id,
    staleTime: 30000,
  });
  const groups = useQuery({
    queryKey: queryKeys.offers.filterGroups(session?.user.id),
    queryFn: getOfferFilterGroups,
    enabled: !!session?.user.id,
    staleTime: 30000,
  });
  const count = Object.values(activeFilters).filter(Boolean).length;
  const accounts = new Map(
    connections.data?.connections.map((account) => [account.id, account.name])
  );
  return (
    <form
      className="bg-muted/20 mb-5 space-y-4 rounded-2xl border p-4 sm:p-5"
      onSubmit={handleSubmit((values) => {
        if (
          values.dateFrom &&
          values.dateTo &&
          format(values.dateFrom, "yyyy-MM-dd") >
            format(values.dateTo, "yyyy-MM-dd")
        ) {
          setError("dateTo", {
            message: "A data final deve ser igual ou posterior à inicial.",
          });
          return;
        }
        onApply({
          ...(activeFilters.needsAction
            ? { needsAction: activeFilters.needsAction }
            : {}),
          ...(values.waitReason !== "all"
            ? { waitReason: values.waitReason }
            : {}),
          ...(values.search.trim() ? { search: values.search.trim() } : {}),
          ...(values.status !== "all" ? { status: values.status } : {}),
          ...(values.connectionId !== "all"
            ? { connectionId: values.connectionId }
            : {}),
          ...(values.groupId !== "all" ? { groupId: values.groupId } : {}),
          ...(values.dateFrom
            ? {
                createdFrom: fromZonedTime(
                  format(values.dateFrom, "yyyy-MM-dd") + "T00:00:00",
                  TIMEZONE
                ).toISOString(),
              }
            : {}),
          ...(values.dateTo
            ? {
                createdBefore: fromZonedTime(
                  format(addDays(values.dateTo, 1), "yyyy-MM-dd") + "T00:00:00",
                  TIMEZONE
                ).toISOString(),
              }
            : {}),
        });
      })}
    >
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={activeFilters.needsAction ? "default" : "outline"}
          aria-pressed={!!activeFilters.needsAction}
          onClick={() => {
            const next = { ...activeFilters };
            if (next.needsAction) delete next.needsAction;
            else next.needsAction = "true";
            onApply(next);
          }}
        >
          Precisam de ação
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <CircleHelp className="size-4" />
              Guia dos status
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-xl">
            <SheetHeader className="border-b px-5 py-5">
              <SheetTitle className="text-lg">Entenda os status</SheetTitle>
              <SheetDescription className="text-sm leading-relaxed">
                O status mostra em que etapa a oferta está. Quando há uma
                espera, o motivo indica o que precisa acontecer para continuar.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 px-5 py-5">
              <StatusGuide
                title="Status da oferta"
                tone="green"
                items={Object.entries(OFFER_STATUS_INFO).map(([status, info]) => ({
                  ...info,
                  badgeClass: statusColors[status as OfferStatus],
                }))}
              />
              <StatusGuide
                title="Preparação e afiliado"
                tone="violet"
                items={Object.values(OFFER_PREPARATION_STATUS_INFO)}
              />
              <StatusGuide
                title="Motivos de espera"
                tone="amber"
                items={Object.values(OFFER_WAIT_REASON_INFO)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <Collapsible.Root
        open={open}
        onOpenChange={setOpen}
        className="space-y-4"
      >
        <Collapsible.Trigger asChild>
          <button
            type="button"
            className="focus-visible:ring-ring flex w-full flex-wrap items-center justify-between gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <span className="flex flex-wrap items-center gap-2">
              <Filter className="text-primary size-4" />
              <span className="text-sm font-semibold">
                Encontre suas ofertas
              </span>
              {count > 0 && (
                <Badge variant="secondary">{count} filtros ativos</Badge>
              )}
            </span>
            <span className="text-muted-foreground flex items-center gap-2 text-xs">
              {open ? "Recolher filtros" : "Exibir filtros"}
              <ChevronDown
                className={`size-4 motion-safe:transition-transform ${open ? "rotate-180" : ""}`}
              />
            </span>
          </button>
        </Collapsible.Trigger>
        <Collapsible.Content className="motion-safe:animate-in motion-safe:fade-in space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ControlledCombobox
              control={control}
              name="groupId"
              label="Grupo de destino"
              placeholder="Todos os grupos"
              searchPlaceholder="Buscar grupo..."
              options={[
                { id: "all", name: "Todos os grupos" },
                ...(groups.data ?? []).map((group) => ({
                  id: group.id,
                  name:
                    group.name +
                    (group.connectionId && accounts.get(group.connectionId)
                      ? " · " + accounts.get(group.connectionId)
                      : ""),
                })),
              ]}
            />
            <ControlledCombobox
              control={control}
              name="status"
              label="Status do envio"
              placeholder="Todos os status"
              options={[
                { id: "all", name: "Todos os status" },
                ...Object.entries(statusLabels).map(([id, name]) => ({
                  id,
                  name,
                })),
              ]}
            />
            <ControlledCombobox
              control={control}
              name="connectionId"
              label="Conexão de envio"
              placeholder="Todas as conexões"
              options={[
                { id: "all", name: "Todas as conexões" },
                ...(connections.data?.connections ?? []).map((account) => ({
                  id: account.id,
                  name: account.name,
                })),
              ]}
            />
            <ControlledCombobox
              control={control}
              name="waitReason"
              label="Motivo da espera"
              placeholder="Todos os motivos"
              options={[
                { id: "all", name: "Todos os motivos" },
                ...Object.entries(OFFER_WAIT_REASON_INFO).map(([id, info]) => ({
                  id,
                  name: info.label,
                })),
              ]}
            />
            <ControlledInput
              control={control}
              name="search"
              label="Produto ou link"
              placeholder="Buscar pelo nome ou link"
              maxLength={200}
            />
            <ControlledDatePicker
              control={control}
              name="dateFrom"
              label="Cadastradas a partir de"
              placeholder="Selecione a data inicial"
            />
            <ControlledDatePicker
              control={control}
              name="dateTo"
              label="Cadastradas até"
              placeholder="Selecione a data final"
            />
          </div>
          {(connections.error || groups.error) && (
            <p role="status" className="text-warning text-xs">
              Não foi possível carregar todas as opções de conexão ou grupo. Os
              demais filtros continuam disponíveis.{" "}
              <button
                type="button"
                className="underline"
                onClick={() => {
                  connections.refetch();
                  groups.refetch();
                }}
              >
                Tentar novamente
              </button>
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-muted-foreground max-w-lg text-xs leading-relaxed">
              O período considera o cadastro, no horário de Brasília. Ofertas
              com destinos correspondentes aparecem com todos os destinos ao
              expandir.
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  reset(defaults);
                  onApply({});
                }}
              >
                <X className="size-4" />
                Limpar
              </Button>
              <Button type="submit">
                <Search className="size-4" />
                Aplicar filtros
              </Button>
            </div>
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </form>
  );
}

function StatusGuide({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "green" | "violet" | "amber";
  items: Array<{ label: string; help: string; badgeClass?: string }>;
}) {
  const palette = {
    green: {
      panel: "border-emerald-300/70 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/25",
      title: "text-emerald-900 dark:text-emerald-200",
      row: "border-emerald-200/80 bg-white/80 dark:border-emerald-900/70 dark:bg-background/70",
      badge: "border-emerald-300 bg-emerald-100 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    },
    violet: {
      panel: "border-violet-300/70 bg-violet-50/70 dark:border-violet-900 dark:bg-violet-950/25",
      title: "text-violet-900 dark:text-violet-200",
      row: "border-violet-200/80 bg-white/80 dark:border-violet-900/70 dark:bg-background/70",
      badge: "border-violet-300 bg-violet-100 text-violet-950 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200",
    },
    amber: {
      panel: "border-amber-300/70 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/25",
      title: "text-amber-900 dark:text-amber-200",
      row: "border-amber-200/80 bg-white/80 dark:border-amber-900/70 dark:bg-background/70",
      badge: "border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
    },
  }[tone];

  return (
    <section className={`space-y-3 rounded-xl border p-3 sm:p-4 ${palette.panel}`}>
      <h3 className={`text-sm font-bold tracking-wide ${palette.title}`}>{title}</h3>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.label} className={`space-y-2 rounded-lg border p-3 ${palette.row}`}>
            <span
              className={`inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-xs leading-none font-semibold ${item.badgeClass ?? palette.badge}`}
            >
              {item.label}
            </span>
            <p className="text-foreground/85 text-sm leading-relaxed">
              {item.help}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
