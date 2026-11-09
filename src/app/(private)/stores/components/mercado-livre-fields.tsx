import { ControlledInput } from "@/components/form/controllers/controlled-input";
import type { Control } from "react-hook-form";
import type { StoreInput } from "@/domains/stores/types";
export function MercadoLivreFields({
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
        placeholder="Ex.: meu_perfil"
        maxLength={80}
        disabled={disabled}
      />
      <div className="space-y-2">
        <ControlledInput
          control={control}
          name="campaignTag"
          label="Etiqueta de campanha (opcional)"
          placeholder="Nome exato da etiqueta na loja"
          maxLength={100}
          disabled={disabled}
        />
        <p className="text-muted-foreground text-xs">
          Informe o nome exato para a extensão selecionar no gerador oficial. Em
          branco, será usada a etiqueta atual do gerador.
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
          Abra o gerador oficial do Mercado Livre e informe o endereço para a
          extensão usá-lo na conversão.
        </p>
      </div>
    </>
  );
}
