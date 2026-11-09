import { ControlledInput } from "@/components/form/controllers/controlled-input";
import type { Control } from "react-hook-form";
import type { StoreInput } from "@/domains/stores/types";
export function AmazonFields({
  control,
  disabled,
}: {
  control: Control<StoreInput>;
  disabled: boolean;
}) {
  return (
    <>
      <div className="bg-primary/5 space-y-2 rounded-xl border p-4 text-sm">
        <p className="font-semibold">Link pelo navegador</p>
        <p className="text-muted-foreground text-xs">
          A extensão tenta gerar seu link pela SiteStripe no Chrome conectado à sua conta. Confira se o ID abaixo corresponde ao ID de rastreamento selecionado na Amazon. A conexão com a Creators API ainda não está disponível.
        </p>
        <a
          href="https://associados.amazon.com.br/help/node/topic/GJMMT7G4C8K4Y3AY"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary text-xs underline"
        >
          Como usar a SiteStripe
        </a>
      </div>
      <ControlledInput
        control={control}
        name="affiliateProfile"
        label="ID de associado / rastreamento"
        placeholder="Ex.: minha-loja-20"
        maxLength={80}
        disabled={disabled}
      />
      <div className="space-y-2">
        <ControlledInput
          control={control}
          name="campaignTag"
          label="Etiqueta de campanha (opcional)"
          placeholder="Identificação para organizar suas campanhas"
          maxLength={100}
          disabled={disabled}
        />
        <p className="text-muted-foreground text-xs">
          Este campo serve para organizar sua configuração e não gera links
          automaticamente.
        </p>
      </div>
      <div className="space-y-2">
        <ControlledInput
          control={control}
          name="linkBuilderUrl"
          label="URL do painel de afiliados (opcional)"
          placeholder="https://..."
          maxLength={2048}
          disabled={disabled}
        />
        <p className="text-muted-foreground text-xs">
          Atalho para seu painel oficial de afiliados.
        </p>
      </div>
    </>
  );
}
