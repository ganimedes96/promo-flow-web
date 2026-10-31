"use client";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import type { FieldValues, UseControllerProps } from "react-hook-form";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { getCategories } from "../client";

export function ControlledProductCategory<T extends FieldValues>({
  sourceCategory,
  ...props
}: UseControllerProps<T> & { sourceCategory?: string | null }) {
  const { data: session } = useSession();
  const categories = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
    enabled: !!session?.user.id,
    staleTime: 300000,
  });
  return (
    <div className="space-y-2">
      <ControlledCombobox
        {...props}
        label="Categoria do produto"
        placeholder="Classificar automaticamente ao salvar"
        searchPlaceholder="Buscar categoria..."
        options={[
          { id: "auto", name: "Classificar automaticamente ao salvar" },
          ...(categories.data ?? []),
        ]}
        loading={categories.isPending}
      />
      <p className="text-muted-foreground text-xs leading-relaxed">
        Escolha uma categoria ou deixe o PromoFlow identificar pelo produto ao
        salvar. Você poderá alterar depois.
      </p>
      {sourceCategory && (
        <p className="text-muted-foreground text-xs">
          Na loja: <span className="font-medium">{sourceCategory}</span>
        </p>
      )}
      {categories.error && (
        <p role="status" className="text-warning text-xs">
          Não foi possível carregar as opções. A classificação automática
          continua disponível.
        </p>
      )}
    </div>
  );
}
