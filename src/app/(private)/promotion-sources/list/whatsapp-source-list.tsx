"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Pause, Play, Trash2, Search, Radio } from "lucide-react";
import { WhatsAppCollectionSource } from "@/domains/collection/types";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { EmptyStateCard } from "@/components/feedback/empty-state-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/date";
import { ListPagination } from "@/components/pagination";
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const date = (value: string | null) =>
  value ? formatDate(value, "dd/MM HH:mm") : "Ainda não";
export function WhatsAppSourceList({
  sources,
  online,
  busy,
  onToggle,
  onRemove,
  onAdd,
}: {
  sources: WhatsAppCollectionSource[];
  online: boolean;
  busy: boolean;
  onToggle: (source: WhatsAppCollectionSource) => void;
  onRemove: (source: WhatsAppCollectionSource) => void;
  onAdd: () => void;
}) {
  const form = useForm({ defaultValues: { search: "", status: "all" } });
  const [filters, setFilters] = useState({ search: "", status: "all" }),
    [page, setPage] = useState(1);
  const selected = sources.filter((source) => source.captureSelected);
  const items = selected.filter(
    (source) =>
      normalize(
        source.name + " " + source.connection?.name + " " + source.accountPhone
      ).includes(normalize(filters.search.trim())) &&
      (filters.status === "all" ||
        (filters.status === "active"
          ? source.captureEnabled
          : !source.captureEnabled))
  );
  const lastPage = Math.max(1, Math.ceil(items.length / 12)),
    currentPage = Math.min(page, lastPage);
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Grupos monitorados</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Ative ou pause cada fonte sem perder o histórico de capturas.
          </p>
        </div>
        <Button onClick={onAdd}>Adicionar fonte</Button>
      </div>
      <form
        className="bg-card grid items-end gap-3 rounded-2xl border p-4 sm:grid-cols-[minmax(0,1fr)_210px_auto_auto]"
        onSubmit={form.handleSubmit((values) => {
          setFilters(values);
          setPage(1);
        })}
      >
        <ControlledInput
          control={form.control}
          name="search"
          label="Buscar fonte"
          placeholder="Nome do grupo ou número"
        />
        <ControlledCombobox
          control={form.control}
          name="status"
          label="Situação"
          placeholder="Todas"
          options={[
            { id: "all", name: "Todas" },
            { id: "active", name: "Habilitadas" },
            { id: "paused", name: "Pausadas" },
          ]}
        />
        <Button type="submit" variant="outline">
          <Search className="size-4" />
          Filtrar
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            form.reset();
            setFilters({ search: "", status: "all" });
            setPage(1);
          }}
        >
          Limpar
        </Button>
      </form>
      {!selected.length ? (
        <EmptyStateCard
          icon={Radio}
          title="Escolha sua primeira fonte"
          description="Conecte o WhatsApp e adicione os grupos dos quais deseja receber promoções para revisar."
          action={<Button onClick={onAdd}>Adicionar fonte</Button>}
        />
      ) : !items.length ? (
        <EmptyStateCard
          title="Nenhuma fonte encontrada"
          description="Tente outro nome ou altere os filtros."
        />
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            {items
              .slice((currentPage - 1) * 12, currentPage * 12)
              .map((source) => (
                <Card
                  key={source.id}
                  className="motion-safe:animate-in motion-safe:fade-in"
                >
                  <CardContent className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3
                          className="truncate font-semibold"
                          title={source.name}
                        >
                          {source.name}
                        </h3>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {source.connection?.name} · +{source.accountPhone}
                        </p>
                      </div>
                      <Badge
                        className={
                          !source.captureEnabled
                            ? "border-orange-700 bg-orange-700 text-white"
                            : online && source.connection?.status === "READY"
                              ? "border-emerald-700 bg-emerald-700 text-white"
                              : "border-amber-300 bg-amber-300 text-amber-950"
                        }
                      >
                        {!source.captureEnabled
                          ? "Pausada"
                          : online && source.connection?.status === "READY"
                            ? "Captura habilitada"
                            : "Aguardando conexão"}
                      </Badge>
                    </div>
                    <dl className="bg-muted/40 grid gap-3 rounded-xl border p-3 text-xs sm:grid-cols-3">
                      <div>
                        <dt className="text-muted-foreground">Recebidas</dt>
                        <dd className="mt-1 font-semibold">
                          {source.capturedCount}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          Última verificação
                        </dt>
                        <dd className="mt-1 font-medium">
                          {date(source.lastCaptureCheckAt)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          Última captura
                        </dt>
                        <dd className="mt-1 font-medium">
                          {date(source.lastCapturedAt)}
                        </dd>
                      </div>
                    </dl>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => onToggle(source)}
                      >
                        {source.captureEnabled ? (
                          <Pause className="size-3.5" />
                        ) : (
                          <Play className="size-3.5" />
                        )}
                        {source.captureEnabled ? "Pausar" : "Retomar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => onRemove(source)}
                      >
                        <Trash2 className="size-3.5" />
                        Remover
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
          <ListPagination
            page={currentPage}
            totalPages={lastPage}
            onPage={setPage}
            label="Paginação das fontes do WhatsApp"
            summary={`${items.length} fontes`}
          />
        </>
      )}
    </section>
  );
}
