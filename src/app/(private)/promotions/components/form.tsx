"use client";
import { useForm } from "react-hook-form";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledInputCurrency } from "@/components/form/controllers/controlled-input-currency";
import { ControlledTextarea } from "@/components/form/controllers/controlled-text-area";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { ControlledSingleCheckbox } from "@/components/form/controllers/controlled-single-checkbox";
import { Button } from "@/components/ui/button";
import { savePromotion } from "@/domains/promotions/actions";
import { Promotion, PromotionInput } from "@/domains/promotions/types";
import { useServerAction } from "@/hooks/use-server-action";
export function PromotionForm({
  promotion,
  onSuccess,
}: {
  promotion?: Promotion;
  onSuccess: () => void;
}) {
  const { control, handleSubmit } = useForm<
    PromotionInput & { validUntil: string }
  >({
    defaultValues: {
      title: promotion?.title || "",
      description: promotion?.description || "",
      sourceUrl: promotion?.sourceUrl || "",
      imageUrl: promotion?.imageUrl || "",
      currentPrice: promotion ? Number(promotion.currentPrice) : undefined,
      originalPrice: promotion?.originalPrice
        ? Number(promotion.originalPrice)
        : undefined,
      couponCode: promotion?.couponCode || "",
      marketplace: promotion?.marketplace || "MERCADO_LIVRE",
      isPublished: promotion?.isPublished ?? false,
      validUntil: promotion?.expiresAt
        ? new Date(
            new Date(promotion.expiresAt).getTime() -
              new Date().getTimezoneOffset() * 60000
          )
            .toISOString()
            .slice(0, 16)
        : "",
    },
  });
  const action = useServerAction<Promotion, PromotionInput & { id?: string }>({
    mutationFn: savePromotion,
    onSuccess,
  });
  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(({ validUntil, ...data }) =>
        action.mutate({
          ...data,
          id: promotion?.id,
          expiresAt: validUntil
            ? new Date(validUntil).toISOString()
            : undefined,
        })
      )}
    >
      <ControlledInput
        placeholder=""
        control={control}
        name="title"
        label="Produto"
        rules={{ required: "Informe o produto." }}
      />
      <ControlledTextarea
        placeholder=""
        control={control}
        name="description"
        label="Descrição"
      />
      <ControlledCombobox
        placeholder="Selecione a loja"
        control={control}
        name="marketplace"
        label="Loja"
        options={[
          { id: "MERCADO_LIVRE", name: "Mercado Livre" },
          { id: "AMAZON", name: "Amazon" },
          { id: "SHOPEE", name: "Shopee" },
        ]}
      />
      <ControlledInput
        placeholder=""
        control={control}
        name="sourceUrl"
        label="Link original do produto"
      />
      <ControlledInput
        placeholder=""
        control={control}
        name="imageUrl"
        label="URL da imagem"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <ControlledInputCurrency
          control={control}
          name="currentPrice"
          label="Preço atual"
        />
        <ControlledInputCurrency
          control={control}
          name="originalPrice"
          label="Preço original (opcional)"
        />
      </div>
      <ControlledInput
        placeholder=""
        control={control}
        name="couponCode"
        label="Cupom (opcional)"
      />
      <ControlledInput
        placeholder=""
        control={control}
        name="validUntil"
        label="Válida até (opcional)"
        type="datetime-local"
      />
      <ControlledSingleCheckbox
        control={control}
        name="isPublished"
        label="Disponível na central para os usuários"
      />
      {action.error && (
        <p role="alert" className="text-destructive text-sm">
          {action.error.message}
        </p>
      )}
      <Button type="submit" loading={action.isPending}>
        Salvar promoção
      </Button>
    </form>
  );
}
