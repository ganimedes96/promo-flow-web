import { ControlledInput } from "@/components/form/controllers/controlled-input";
import type { Control } from "react-hook-form";
import type { StoreInput } from "@/domains/stores/types";
export function ShopeeFields({
  control,
  disabled,
}: {
  control: Control<StoreInput>;
  disabled: boolean;
}) {
  return (
    <>
      <ControlledInput
        control={control}
        name="affiliateProfile"
        label="Identificação do perfil de afiliado"
        placeholder="Seu identificador no programa de afiliados"
        maxLength={80}
        disabled={disabled}
      />
      <div className="space-y-2">
        <ControlledInput
          control={control}
          name="campaignTag"
          label="Sub_id 1 (opcional)"
          placeholder="Ex.: promoflow"
          maxLength={100}
          disabled={disabled}
        />
        <p className="text-muted-foreground text-xs">
          A extensão preenche este identificador no Sub_id 1 do conversor
          oficial. Deixe vazio para não informar campanha.
        </p>
      </div>
      <div className="space-y-2">
        <ControlledInput
          control={control}
          name="linkBuilderUrl"
          label="URL do gerador de links"
          placeholder="https://..."
          maxLength={2048}
          disabled={disabled}
        />
        <p className="text-muted-foreground text-xs">
          Use https://affiliate.shopee.com.br/offer/custom_link, o conversor
          oficial da Shopee.
        </p>
      </div>
    </>
  );
}
