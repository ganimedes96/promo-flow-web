"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ControlledMultiSelect } from "@/components/form/controllers/controlled-multi-select";

export function MirrorDestinationSettings({
  selected,
  options,
  busy,
  onSave,
}: {
  selected: string[];
  options: { id: string; name: string }[];
  busy: boolean;
  onSave: (ids: string[]) => void;
}) {
  const { control, handleSubmit, formState } = useForm({
    defaultValues: { destinationIds: selected },
  });
  const unavailable = selected
    .filter((id) => !options.some((option) => option.id === id))
    .map((id) => ({ id, name: "Destino indisponível" }));

  return (
    <form
      className="space-y-2 border-t pt-4"
      onSubmit={handleSubmit(({ destinationIds }) => onSave(destinationIds))}
    >
      <ControlledMultiSelect
        control={control}
        name="destinationIds"
        label="Enviar para"
        options={[...options, ...unavailable]}
        placeholder="Sem destino · revisão manual"
        maxSelected={20}
        searchable
      />
      <Button type="submit" size="sm" variant="outline" disabled={busy || !formState.isDirty}>
        Salvar destinos
      </Button>
    </form>
  );
}
