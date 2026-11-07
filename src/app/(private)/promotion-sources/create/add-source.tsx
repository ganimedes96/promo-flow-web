"use client";
import { RefreshCw } from "lucide-react";
import { formatDate } from "@/utils/date";
import { useForm } from "react-hook-form";
import { TelegramSource } from "@/domains/telegram/types";
import { updateTelegramSource } from "@/domains/telegram/actions";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useServerAction } from "@/hooks/use-server-action";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EmptyStateCard } from "@/components/feedback/empty-state-card";
export function AddSource({
  open,
  onOpenChange,
  sources,
  online,
  onSync,
  syncing,
  lastSyncAt,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: TelegramSource[];
  online: boolean;
  onSync: () => void;
  syncing: boolean;
  lastSyncAt: string | null;
}) {
  const form = useForm<{ id: string }>({ defaultValues: { id: "" } });
  const action = useServerAction<unknown, { id: string; enabled: boolean }>({
    mutationFn: updateTelegramSource,
    invalidateQueries: [queryKeys.telegram.all],
    successMessage: "Fonte adicionada ao monitoramento.",
    onSuccess: () => {
      form.reset();
      onOpenChange(false);
    },
  });
  const available = sources.filter(
    (source) => !source.selected && source.isAvailable
  );
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Adicionar fonte</SheetTitle>
          <SheetDescription>
            Escolha um canal ou grupo que sua conta já acompanha no Telegram.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5 px-4">
          <div className="bg-muted/30 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
            <p className="text-muted-foreground text-xs">
              {lastSyncAt
                ? `Última atualização: ${formatDate(lastSyncAt, "HH:mm:ss")}`
                : "Aguardando a primeira sincronização"}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSync}
              disabled={!online || syncing}
            >
              <RefreshCw
                className={
                  syncing ? "size-3.5 motion-safe:animate-spin" : "size-3.5"
                }
              />{" "}
              Atualizar canais
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            Entrou em um novo grupo no Telegram? Atualize os canais. A lista é
            renovada sem reiniciar o coletor.
          </p>
          {available.length ? (
            <form
              className="space-y-5"
              onSubmit={form.handleSubmit(({ id }) =>
                action.mutate({ id, enabled: true })
              )}
            >
              <ControlledCombobox
                control={form.control}
                name="id"
                label="Canal ou grupo"
                placeholder="Selecione uma fonte"
                searchPlaceholder="Buscar pelo nome do canal"
                options={available.map((source) => ({
                  id: source.id,
                  name:
                    source.title +
                    (source.username ? ` · @${source.username}` : ""),
                }))}
                rules={{ required: "Selecione uma fonte." }}
              />
              <p className="text-muted-foreground text-sm">
                A captura acompanha mensagens novas a partir da primeira
                verificação. O coletor não entra em grupos automaticamente.
              </p>
              <Button
                type="submit"
                disabled={action.isPending || !online}
                loading={action.isPending}
              >
                Adicionar e ativar captura
              </Button>
            </form>
          ) : (
            <EmptyStateCard
              title="Nenhum novo canal disponível"
              description="Atualize os canais da sua conta. Novas fontes precisam estar acessíveis no Telegram antes de aparecer aqui."
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
