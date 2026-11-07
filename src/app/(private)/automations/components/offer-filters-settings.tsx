import type { Control } from "react-hook-form";
import { ControlledMultiSelect } from "@/components/form/controllers/controlled-multi-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { stores, type ScheduleFormValues } from "./automation-types";

export function OfferFiltersSettings({
  control,
  categories,
}: {
  control: Control<ScheduleFormValues>;
  categories: { id: string; name: string }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Filtros de ofertas</CardTitle>
        <CardDescription>
          Escolha as lojas e categorias que podem entrar na fila automática.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ControlledMultiSelect
          control={control}
          name="marketplaces"
          label="Lojas permitidas"
          options={stores}
        />
        <ControlledMultiSelect
          control={control}
          name="categoryIds"
          label="Categorias permitidas"
          options={categories}
          placeholder="Todas as categorias"
          searchable
        />
        <p className="text-muted-foreground text-xs">
          Ao escolher categorias, ofertas sem classificação ficam para revisão.
          Na Amazon, informe um link direto com a mesma tag de afiliado
          cadastrada em Lojas.
        </p>
      </CardContent>
    </Card>
  );
}
