"use client";
import { useForm } from "react-hook-form";
import { RefreshCw } from "lucide-react";
import { WhatsAppCollectionSource } from "@/domains/collection/types";
import { updateWhatsAppCollectionSource } from "@/domains/collection/actions";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useServerAction } from "@/hooks/use-server-action";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { EmptyStateCard } from "@/components/feedback/empty-state-card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
export function AddWhatsAppSource({
  open,
  onOpenChange,
  sources,
  online,
  onSync,
  syncing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: WhatsAppCollectionSource[];
  online: boolean;
  onSync: () => void;
  syncing: boolean;
}) {
  const form = useForm({ defaultValues: { id: "" } });
  const action = useServerAction<unknown, { id: string; enabled: boolean }>({
    mutationFn: updateWhatsAppCollectionSource,
    invalidateQueries: [queryKeys.collection.all],
    successMessage: "Fonte adicionada ao monitoramento.",
    onSuccess: () => {
      form.reset();
      onOpenChange(false);
    },
  });
  const available = sources.filter(
    (source) => !source.captureSelected && source.connection?.status === "READY"
  );
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Adicionar fonte</SheetTitle>
          <SheetDescription>
            Escolha um grupo que sua conta já acompanha no WhatsApp.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5 px-4">
          <div className="bg-muted/30 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
            <p className="text-muted-foreground text-xs">
              Os grupos da conta são sincronizados automaticamente.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSync}
              disabled={syncing}
            >
              <RefreshCw
                className={
                  syncing ? "size-3.5 motion-safe:animate-spin" : "size-3.5"
                }
              />
              Atualizar lista
            </Button>
          </div>
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
                label="Grupo do WhatsApp"
                placeholder="Selecione uma fonte"
                searchPlaceholder="Buscar pelo nome do grupo"
                options={available.map((source) => ({
                  id: source.id,
                  name: source.name,
                }))}
                rules={{ required: "Selecione uma fonte." }}
              />
              <p className="text-muted-foreground text-sm">
                A captura acompanha mensagens novas. Nenhuma mensagem é enviada
                ao grupo ao adicioná-lo.
              </p>
              <Button
                type="submit"
                loading={action.isPending}
                disabled={action.isPending || !online}
              >
                Adicionar e ativar captura
              </Button>
            </form>
          ) : (
            <EmptyStateCard
              title="Nenhum novo grupo disponível"
              description="Conecte sua conta e aguarde a sincronização. Grupos já monitorados não aparecem nesta seleção."
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
