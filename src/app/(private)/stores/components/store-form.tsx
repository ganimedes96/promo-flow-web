"use client";
import { useForm } from "react-hook-form";
import { LoaderCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledSwitch } from "@/components/form/controllers/controlled-switch";
import {
  AffiliateStore,
  Marketplace,
  StoreInput,
  storeInputSchema,
  storeNames,
} from "@/domains/stores/types";
import { saveStore } from "@/domains/stores/actions";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useServerAction } from "@/hooks/use-server-action";
export function StoreForm({
  marketplace,
  store,
  onSaved,
}: {
  marketplace: Marketplace;
  store?: AffiliateStore;
  onSaved: () => void;
}) {
  const form = useForm<StoreInput>({
    defaultValues: {
      linkBuilderUrl:
        store?.linkBuilderUrl ??
        (marketplace === "MERCADO_LIVRE"
          ? "https://www.mercadolivre.com.br/afiliados/linkbuilder#hub"
          : marketplace === "SHOPEE"
            ? "https://affiliate.shopee.com.br/offer/custom_link"
            : ""),
      name: store?.name ?? `Minha conta ${storeNames[marketplace]}`,
      affiliateProfile: store?.affiliateProfile ?? "",
      campaignTag: store?.campaignTag ?? "",
      isDefault: store?.isDefault ?? false,
    },
  });
  const save = useServerAction({
    mutationFn: (data: StoreInput) => saveStore(marketplace, data),
    invalidateQueries: [queryKeys.stores.all],
    successMessage: "Configuração da loja salva.",
    onSuccess: onSaved,
  });
  return (
    <form
      onSubmit={form.handleSubmit((data) => {
        const parsed = storeInputSchema.safeParse(data);
        if (!parsed.success) {
          for (const issue of parsed.error.issues) {
            const field = issue.path[0];
            if (
              field === "name" ||
              field === "affiliateProfile" ||
              field === "campaignTag" ||
              field === "isDefault" ||
              field === "linkBuilderUrl"
            )
              form.setError(field, { message: issue.message });
          }
          return;
        }
        save.mutate(parsed.data);
      })}
      className="space-y-6"
    >
      <div className="bg-muted/60 rounded-xl border p-4 text-sm">
        <p className="font-semibold">{storeNames[marketplace]}</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Uma configuração por plataforma. Suas informações ficam vinculadas
          somente à sua conta.
        </p>
      </div>
      <ControlledInput
        control={form.control}
        name="name"
        label="Nome da configuração *"
        placeholder="Ex.: Minha conta de afiliado"
        maxLength={80}
        disabled={save.isPending}
      />
      <ControlledInput
        control={form.control}
        name="affiliateProfile"
        label={
          marketplace === "AMAZON"
            ? "Identificação de afiliado / tag"
            : "Identificação do perfil de afiliado"
        }
        placeholder={
          marketplace === "MERCADO_LIVRE"
            ? "Ex.: meu_perfil"
            : "Seu identificador no programa de afiliados"
        }
        maxLength={80}
        disabled={save.isPending}
      />
      <div className="space-y-2">
        <ControlledInput
          control={form.control}
          name="campaignTag"
          label={
            marketplace === "SHOPEE"
              ? "Sub_id 1 (opcional)"
              : "Etiqueta de campanha (opcional)"
          }
          placeholder={
            marketplace === "SHOPEE"
              ? "Ex.: promoflow"
              : "Nome exato da etiqueta na loja"
          }
          maxLength={100}
          disabled={save.isPending}
        />
        <p className="text-muted-foreground text-xs">
          {marketplace === "MERCADO_LIVRE"
            ? "Informe o nome exato para a extensão selecionar no gerador oficial. Em branco, será usada a etiqueta atual do gerador."
            : marketplace === "SHOPEE"
              ? "A extensão preenche este identificador no Sub_id 1 do conversor oficial. Deixe vazio para não informar campanha."
              : "Informação salva para organizar suas campanhas. A conversão automática desta plataforma ainda não está disponível."}
        </p>
      </div>
      <div className="space-y-2">
        <ControlledInput
          control={form.control}
          name="linkBuilderUrl"
          label={
            marketplace !== "AMAZON"
              ? "URL do gerador de links"
              : "URL do painel de afiliados (opcional)"
          }
          placeholder="https://..."
          maxLength={2048}
          disabled={save.isPending}
        />
        <p className="text-muted-foreground text-xs">
          {marketplace === "MERCADO_LIVRE"
            ? "Abra o Gerador de links oficial do Mercado Livre, copie o endereço da barra do navegador e cole aqui. A extensão usará esse endereço durante a conversão."
            : marketplace === "SHOPEE"
              ? "Use https://affiliate.shopee.com.br/offer/custom_link, o conversor oficial da Shopee."
              : "Informe um endereço oficial da loja. Por enquanto, será usado apenas como atalho para o seu painel."}
        </p>
      </div>
      <ControlledSwitch
        control={form.control}
        name="isDefault"
        label="Definir como loja padrão"
        description="Aparece primeiro na sua listagem de lojas."
        disabled={save.isPending}
      />
      <p className="text-muted-foreground text-xs">
        Não informe senha, token ou cookies. O perfil identifica sua
        configuração; o login da loja continua no seu navegador.
      </p>
      {save.error && (
        <p role="alert" className="text-destructive text-sm">
          {save.error.message}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={save.isPending}>
        {save.isPending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        Salvar configuração
      </Button>
    </form>
  );
}
