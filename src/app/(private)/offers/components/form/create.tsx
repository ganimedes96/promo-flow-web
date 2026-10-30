"use client";
import type { ImportedOfferDraft } from "@/domains/offers/extension-import";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledInputCurrency } from "@/components/form/controllers/controlled-input-currency";
import { ControlledTextarea } from "@/components/form/controllers/controlled-text-area";
import { ControlledMultiSelect } from "@/components/form/controllers/controlled-multi-select";
import { ControlledSingleCheckbox } from "@/components/form/controllers/controlled-single-checkbox";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reviseOffer } from "@/domains/offers/actions";
import { createOffers } from "@/domains/offers/actions";
import {
  CreateOffers,
  createOffersSchema,
  ReviseOffer,
  reviseOfferSchema,
  Offer,
  OfferFormValues,
} from "@/domains/offers/types";
import { getWhatsAppGroups } from "@/domains/whatsapp/client";
import { WhatsAppGroup } from "@/domains/whatsapp/types";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
export function CreateOfferForm({
  onSuccess,
  offer,
  initialDraft,
  sourcePromotionId,
}: {
  onSuccess?: () => void;
  offer?: Offer;
  initialDraft?: ImportedOfferDraft;
  sourcePromotionId?: string;
}) {
  const groups = useQuery({
    queryKey: queryKeys.whatsapp.groups,
    queryFn: getWhatsAppGroups,
    refetchInterval: 5000,
  });
  if (groups.isPending) return <p>Carregando grupos…</p>;
  if (groups.error)
    return (
      <Alert variant="destructive">
        <AlertDescription>{groups.error.message}</AlertDescription>
      </Alert>
    );
  const favorites = groups.data?.filter((group) => group.isFavorite) ?? [];
  return (
    <OfferFields
      groups={favorites}
      onSuccess={onSuccess}
      offer={offer}
      initialDraft={initialDraft}
      sourcePromotionId={sourcePromotionId}
    />
  );
}
function OfferFields({
  offer,
  groups,
  onSuccess,
  initialDraft,
  sourcePromotionId,
}: {
  groups: WhatsAppGroup[];
  offer?: Offer;
  onSuccess?: () => void;
  initialDraft?: ImportedOfferDraft;
  sourcePromotionId?: string;
}) {
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<OfferFormValues>({
    defaultValues: {
      title: offer?.title || initialDraft?.title || "",
      description: offer?.description || initialDraft?.description || "",
      sourceUrl: offer?.sourceUrl || initialDraft?.sourceUrl || "",
      affiliateUrl: offer?.affiliateUrl || initialDraft?.affiliateUrl || "",
      couponCode: offer?.couponCode || initialDraft?.couponCode || "",
      imageUrl: offer?.imageUrl || initialDraft?.imageUrls[0] || "",
      currentPrice: offer?.currentPrice
        ? Number(offer.currentPrice)
        : (initialDraft?.currentPrice ?? undefined),
      originalPrice: offer?.originalPrice
        ? Number(offer.originalPrice)
        : (initialDraft?.originalPrice ?? undefined),
      whatsappGroupId:
        offer?.whatsappGroup?.id ??
        groups.find((group) => group.isDefault)?.id ??
        "",
      whatsappGroupIds: groups
        .filter((group) => group.isDefault)
        .map((group) => group.id),
      addToQueue: false,
    },
  });
  const values = useWatch({ control });
  const importImages = initialDraft?.imageUrls ?? [];
  const saveRevision = useServerAction<Offer, ReviseOffer>({
    mutationFn: (body) => reviseOffer(offer!.id, body),
    successMessage: "Oferta atualizada.",
    invalidateQueries: [queryKeys.offers.all],
    onSuccess: () => onSuccess?.(),
  });
  const saveBatch = useServerAction<Offer[], CreateOffers>({
    mutationFn: createOffers,
    invalidateQueries: [queryKeys.offers.all],
    onSuccess: () => onSuccess?.(),
    successMessage: values.addToQueue
      ? "Oferta adicionada à fila dos grupos selecionados."
      : "Oferta cadastrada para os grupos selecionados.",
  });
  const save = offer ? saveRevision : saveBatch;
  const selectedGroups = groups.filter((group) =>
    values.whatsappGroupIds?.includes(group.id)
  );
  const money = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  const currentCents =
    typeof values.currentPrice === "number"
      ? Math.round(values.currentPrice * 100)
      : 0;
  const originalCents =
    typeof values.originalPrice === "number"
      ? Math.round(values.originalPrice * 100)
      : 0;
  const discount =
    currentCents > 0 && originalCents > currentCents
      ? Math.round(((originalCents - currentCents) / originalCents) * 10000) /
        100
      : null;
  const urlRule = {
    validate: (value: unknown) =>
      !value ||
      (typeof value === "string" && /^https?:\/\//i.test(value)) ||
      "Informe um link http ou https.",
  };
  return (
    <form
      className="space-y-5 pb-4"
      onSubmit={handleSubmit((values) => {
        const product = {
          ...values,
          affiliateUrl: values.affiliateUrl || undefined,
          couponCode: values.couponCode?.trim() || undefined,
        };
        if (offer) {
          if (!groups.some((group) => group.id === values.whatsappGroupId)) {
            setError("whatsappGroupId", {
              message: "Selecione um grupo que continue nos seus favoritos.",
            });
            return;
          }
          const parsed = reviseOfferSchema.safeParse(product);
          if (!parsed.success) {
            setError("root.server", {
              message:
                parsed.error.issues[0]?.message ??
                "Confira os dados da oferta.",
            });
            return;
          }
          saveRevision.mutate(parsed.data);
        } else {
          if (
            values.whatsappGroupIds.some(
              (id) => !groups.some((group) => group.id === id)
            )
          ) {
            setError("whatsappGroupIds", {
              message:
                "Um dos destinos deixou de ser favorito. Atualize a seleção.",
            });
            return;
          }
          const parsed = createOffersSchema.safeParse({
            ...product,
            sourcePromotionId,
          });
          if (!parsed.success) {
            setError("root.server", {
              message:
                parsed.error.issues[0]?.message ??
                "Confira os dados da oferta.",
            });
            return;
          }
          saveBatch.mutate(parsed.data);
        }
      })}
    >
      {!groups.length && (
        <Alert>
          <AlertDescription>
            Você pode revisar os dados abaixo. Para salvar, conecte o WhatsApp e
            marque um grupo como favorito.{" "}
            <Link
              href="/control-panel"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Abrir início em outra aba
            </Link>{" "}
            Depois volte aqui; a lista será atualizada automaticamente.
          </AlertDescription>
        </Alert>
      )}
      {offer ? (
        <ControlledCombobox
          control={control}
          name="whatsappGroupId"
          label="Grupo favorito de destino *"
          placeholder="Selecione um grupo favorito"
          searchPlaceholder="Buscar nos favoritos..."
          noOptionsMessage="Nenhum grupo favorito encontrado."
          options={groups}
          rules={{ required: "Selecione um grupo de destino." }}
          className="w-full"
        />
      ) : (
        <div className="space-y-3">
          <ControlledMultiSelect
            control={control}
            name="whatsappGroupIds"
            label="Grupos favoritos de destino *"
            options={groups}
            placeholder="Selecione um ou mais grupos favoritos"
            variant="default"
            maxCount={3}
            maxSelected={20}
            searchable
            rules={{
              required: "Selecione pelo menos um grupo.",
              validate: (ids) =>
                (Array.isArray(ids) && ids.length > 0 && ids.length <= 20) ||
                "Selecione de 1 a 20 grupos favoritos.",
            }}
          />
          <p className="text-muted-foreground text-xs">
            {selectedGroups.length} grupo(s) selecionado(s). Cada destino terá
            seu próprio status e horário na tabela de ofertas. Máximo de 20
            grupos.
          </p>
          <ControlledSingleCheckbox
            control={control}
            name="addToQueue"
            label="Adicionar a oferta à fila de todos os grupos selecionados"
            disabled={save.isPending}
          />
          {values.addToQueue && (
            <Alert>
              <AlertDescription>
                Ao salvar, a publicação será agendada em cada grupo, respeitando
                a fila e o intervalo de 2 minutos. Com o publicador ativo, os
                envios poderão começar assim que chegar a vez da oferta.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2">
        <ControlledInput
          control={control}
          name="sourceUrl"
          label="Link do produto"
          placeholder="Cole o link do produto ou meli.la"
          type="url"
          rules={{ required: "Informe o link do produto.", ...urlRule }}
        />
        <ControlledInput
          control={control}
          name="affiliateUrl"
          label="Link de afiliado (opcional)"
          placeholder="https://loja.com/link-afiliado"
          type="url"
          rules={urlRule}
        />
      </div>
      <ControlledInput
        control={control}
        name="title"
        label="Título"
        placeholder="Nome do produto"
        maxLength={200}
        rules={{ required: "Informe o título." }}
      />
      <ControlledTextarea
        control={control}
        name="description"
        label="Descrição"
        placeholder="Descreva os principais detalhes do produto"
        limit={2000}
        rules={{ required: "Informe a descrição." }}
      />
      <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-3">
        <ControlledInput
          control={control}
          name="couponCode"
          label="Cupom (opcional)"
          placeholder="Ex.: ARKSTORES"
          maxLength={100}
        />
        <ControlledInputCurrency
          control={control}
          name="currentPrice"
          label="Preço atual (R$)"
          placeholder="0,00"
          rules={{
            required: "Informe o preço atual.",
            min: { value: 0.01, message: "O preço deve ser maior que zero." },
          }}
        />
        <ControlledInputCurrency
          control={control}
          name="originalPrice"
          label="Preço original (opcional)"
          placeholder="0,00"
        />
      </div>
      {importImages.length > 1 && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">
            Escolha a imagem da oferta
          </legend>
          <div className="flex gap-3 overflow-x-auto py-2">
            {importImages.map((image, index) => (
              <button
                key={image}
                type="button"
                aria-label={"Usar imagem " + (index + 1)}
                aria-pressed={values.imageUrl === image}
                onClick={() =>
                  setValue("imageUrl", image, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className={
                  "bg-card focus-visible:outline-ring size-24 shrink-0 overflow-hidden rounded-md border-2 p-1 focus-visible:outline-2 " +
                  (values.imageUrl === image
                    ? "border-primary"
                    : "border-border")
                }
              >
                <Image
                  src={image}
                  alt={"Imagem " + (index + 1) + " do produto"}
                  width={88}
                  height={88}
                  unoptimized
                  className="size-full object-contain"
                />
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <ControlledInput
        control={control}
        name="imageUrl"
        label="Link da imagem"
        placeholder="https://loja.com/imagem.jpg"
        type="url"
        rules={{ required: "Informe a imagem.", ...urlRule }}
      />
      <Card>
        <CardHeader>
          <CardTitle>Prévia da oferta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {values.imageUrl && /^https?:\/\//i.test(values.imageUrl) && (
            <Image
              src={values.imageUrl}
              alt={values.title || "Imagem do produto"}
              width={300}
              height={300}
              unoptimized
              className="max-h-56 w-full rounded-md object-contain"
            />
          )}
          <p className="font-semibold">{values.title || "Título do produto"}</p>
          {discount !== null && typeof values.originalPrice === "number" && (
            <p className="text-muted-foreground">
              De: <s>{money(values.originalPrice)}</s>
            </p>
          )}
          <p>
            💵 Por:{" "}
            {typeof values.currentPrice === "number"
              ? money(values.currentPrice)
              : "Preço atual"}
          </p>
          {discount !== null && (
            <p className="text-success font-semibold">
              🔥 {discount.toLocaleString("pt-BR")}% de desconto
            </p>
          )}
          {values.couponCode?.trim() && (
            <p>🎟️ Cupom: {values.couponCode.trim()}</p>
          )}
          <p className="text-sm break-all">
            🛒 Link:{" "}
            {values.affiliateUrl || values.sourceUrl || "Link de compra"}
          </p>
          <p>❤️ Convide seus amigos</p>
          <p>👉 Link do grupo na descrição</p>
        </CardContent>
      </Card>
      {save.error && (
        <Alert variant="destructive">
          <AlertDescription>{save.error.message}</AlertDescription>
        </Alert>
      )}
      {errors.root?.server?.message && (
        <Alert variant="destructive">
          <AlertDescription>{errors.root.server.message}</AlertDescription>
        </Alert>
      )}
      <p className="text-muted-foreground text-sm">
        {offer
          ? "Salvar atualiza os dados para o próximo envio. Mensagens já publicadas permanecem no grupo."
          : values.addToQueue
            ? "A oferta será cadastrada e agendada nos grupos selecionados."
            : "A oferta será salva como pronta para cada grupo. Nenhuma mensagem será enviada agora."}
      </p>
      <Button
        type="submit"
        loading={save.isPending}
        disabled={save.isPending || !groups.length}
        className="w-full"
      >
        {offer
          ? "Salvar alterações"
          : values.addToQueue
            ? "Salvar e agendar nos grupos"
            : "Salvar para os grupos selecionados"}
      </Button>
    </form>
  );
}
