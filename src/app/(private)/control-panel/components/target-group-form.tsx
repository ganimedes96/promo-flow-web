"use client";
import { useForm } from "react-hook-form";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { Button } from "@/components/ui/button";
import { WhatsAppGroup } from "@/domains/whatsapp/types";
import { setTargetGroup } from "@/domains/whatsapp/actions";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
export function TargetGroupForm({ groups }: { groups: WhatsAppGroup[] }) {
  const selected = groups.find((group) => group.isDefault);
  const { control, handleSubmit } = useForm<{ groupId: string }>({
    defaultValues: { groupId: selected?.id ?? "" },
  });
  const save = useServerAction({
    mutationFn: setTargetGroup,
    invalidateQueries: [queryKeys.whatsapp.groups],
    successMessage: "Grupo padrão salvo.",
  });
  return (
    <form
      onSubmit={handleSubmit((body) => save.mutate(body))}
      className="space-y-4"
    >
      <ControlledCombobox
        control={control}
        name="groupId"
        label="Grupo padrão de destino *"
        placeholder="Selecione um grupo"
        searchPlaceholder="Buscar grupo pelo nome..."
        noOptionsMessage="Nenhum grupo encontrado."
        options={groups}
        rules={{ required: "Selecione o grupo de destino." }}
        disabled={save.isPending}
        className="w-full"
      />
      <p className="text-muted-foreground text-sm">
        {selected
          ? "Grupo atual: " + selected.name
          : "Nenhum grupo padrão definido."}{" "}
        Você poderá escolher outro grupo em cada oferta.
      </p>
      <Button
        type="submit"
        disabled={save.isPending || !groups.length}
        loading={save.isPending}
      >
        Salvar grupo padrão
      </Button>
    </form>
  );
}
