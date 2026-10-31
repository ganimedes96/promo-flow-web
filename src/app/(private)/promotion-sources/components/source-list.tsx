"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Radio, Pause, Play, Trash2, ExternalLink, Search } from "lucide-react";
import { TelegramSource } from "@/domains/telegram/types";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { EmptyStateCard } from "@/components/feedback/empty-state-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/date";
const date = (value: string | null) =>
  value ? formatDate(value, "dd/MM HH:mm") : "Ainda não";
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function SourceList({
  sources,
  online,
  busy,
  onToggle,
  onRemove,
  onAdd,
}: {
  sources: TelegramSource[];
  online: boolean;
  busy: boolean;
  onToggle: (source: TelegramSource) => void;
  onRemove: (source: TelegramSource) => void;
  onAdd: () => void;
}) {
  const form = useForm({ defaultValues: { search: "", status: "all" } });
  const [filters, setFilters] = useState({ search: "", status: "all" });
  const [page, setPage] = useState(1);
  const selected = sources.filter((source) => source.selected);
  const items = selected.filter(
    (source) =>
      normalize(source.title + " " + (source.username || "")).includes(
        normalize(filters.search.trim())
      ) &&
      (filters.status === "all" ||
        (filters.status === "active"
          ? source.enabled && source.isAvailable
          : filters.status === "paused"
            ? !source.enabled
            : !source.isAvailable))
  );
  const lastPage = Math.max(1, Math.ceil(items.length / 12));
  const currentPage = Math.min(page, lastPage);
  const clear = () => {
    form.reset();
    setFilters({ search: "", status: "all" });
    setPage(1);
  };
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Canais monitorados</h2>
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
          placeholder="Nome ou @canal"
        />
        <ControlledCombobox
          control={form.control}
          name="status"
          label="Situação"
          placeholder="Todas"
          options={[
            { id: "all", name: "Todas" },
            { id: "active", name: "Capturando" },
            { id: "paused", name: "Pausadas" },
            { id: "unavailable", name: "Sem acesso" },
          ]}
        />
        <Button type="submit" variant="outline">
          <Search className="size-4" /> Filtrar
        </Button>
        <Button type="button" variant="ghost" onClick={clear}>
          Limpar
        </Button>
      </form>
      {!selected.length ? (
        <EmptyStateCard
          icon={Radio}
          title="Escolha sua primeira fonte"
          description="Conecte o Telegram, atualize os canais e adicione aqueles dos quais deseja receber promoções para revisar."
          action={<Button onClick={onAdd}>Selecionar canal</Button>}
        />
      ) : !items.length ? (
        <EmptyStateCard
          variant="search"
          title="Fonte não encontrada"
          description="Nenhuma fonte corresponde aos filtros informados."
          action={
            <Button variant="outline" onClick={clear}>
              Limpar filtros
            </Button>
          }
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
                          title={source.title}
                        >
                          {source.title}
                        </h3>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {source.username
                            ? "@" + source.username
                            : "Grupo privado da sua conta"}
                        </p>
                      </div>
                      <Badge
                        className={
                          !source.isAvailable
                            ? "border-rose-700 bg-rose-700 text-white"
                            : source.enabled
                              ? online
                                ? "border-emerald-700 bg-emerald-700 text-white"
                                : "border-amber-300 bg-amber-300 text-amber-950"
                              : "border-orange-700 bg-orange-700 text-white"
                        }
                      >
                        {!source.isAvailable
                          ? "Sem acesso"
                          : source.enabled
                            ? online
                              ? "Captura ativa"
                              : "Aguardando coletor"
                            : "Pausada"}
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
                          {date(source.lastCheckedAt)}
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
                    {source.lastError && (
                      <p className="text-destructive text-xs" role="status">
                        {source.lastError}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          busy || (!source.enabled && !source.isAvailable)
                        }
                        onClick={() => onToggle(source)}
                      >
                        {source.enabled ? (
                          <Pause className="size-3.5" />
                        ) : (
                          <Play className="size-3.5" />
                        )}
                        {source.enabled ? "Pausar" : "Retomar"}
                      </Button>
                      {source.username && (
                        <Button size="sm" variant="ghost" asChild>
                          <a
                            href={`https://t.me/${source.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="size-3.5" /> Abrir canal
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => onRemove(source)}
                      >
                        <Trash2 className="size-3.5" /> Remover
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs">
              {items.length} fontes · página {currentPage} de {lastPage}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                disabled={currentPage >= lastPage}
                onClick={() => setPage(currentPage + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
