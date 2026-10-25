"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { previewProduct } from "@/domains/offers/actions";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledInputCurrency } from "@/components/form/controllers/controlled-input-currency";
import { ControlledTextarea } from "@/components/form/controllers/controlled-text-area";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reviseOffer } from "@/domains/offers/actions";
import { createOffer } from "@/domains/offers/actions";
import {
  CreateOffer,
  createOfferSchema,
  reviseOfferSchema,
  Offer,
  OfferFormValues,
  ProductPreview,
} from "@/domains/offers/types";
import { getWhatsAppGroups } from "@/domains/whatsapp/client";
import { WhatsAppGroup } from "@/domains/whatsapp/types";
import { useServerAction } from "@/hooks/use-server-action";
import { queryKeys } from "@/lib/tanstack-query/keys";
export function CreateOfferForm({
  onSuccess,
  offer,
}: {
  onSuccess?: () => void;
  offer?: Offer;
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
  if (!favorites.length)
    return (
      <Alert>
        <AlertDescription>
          Marque pelo menos um grupo como favorito na home para cadastrar uma
          oferta.{" "}
          <Link href="/dashboard" className="underline">
            Ir para o início
          </Link>
        </AlertDescription>
      </Alert>
    );
  return <OfferFields groups={favorites} onSuccess={onSuccess} offer={offer} />;
}
function OfferFields({
  offer,
  groups,
  onSuccess,
}: {
  groups: WhatsAppGroup[];
  offer?: Offer;
  onSuccess?: () => void;
}) {
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    getValues,
    clearErrors,
    formState: { errors },
  } = useForm<OfferFormValues>({
    defaultValues: {
      title: offer?.title || "",
      description: offer?.description || "",
      sourceUrl: offer?.sourceUrl || "",
      affiliateUrl: offer?.affiliateUrl || "",
      couponCode: offer?.couponCode || "",
      imageUrl: offer?.imageUrl || "",
      currentPrice: offer?.currentPrice
        ? Number(offer.currentPrice)
        : undefined,
      originalPrice: offer?.originalPrice
        ? Number(offer.originalPrice)
        : undefined,
      whatsappGroupId:
        offer?.whatsappGroup?.id ??
        groups.find((group) => group.isDefault)?.id ??
        "",
    },
  });
  const values = useWatch({ control });
  const [importImages, setImportImages] = useState<string[]>([]);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const product = useServerAction<ProductPreview, string>({
    mutationFn: previewProduct,
    disableSuccessToast: true,
    onSuccess: (response, requestedUrl) => {
      if (getValues("sourceUrl").trim() !== requestedUrl.trim()) {
        setImportNotice(
          "O link mudou durante a busca. Busque novamente para preencher os dados desse produto."
        );
        return;
      }
      const data = response.data;
      setImportImages(data.imageUrls ?? (data.imageUrl ? [data.imageUrl] : []));
      let filled = 0;
      if (data.title && !getValues("title").trim()) {
        setValue("title", data.title, {
          shouldDirty: true,
          shouldValidate: true,
        });
        filled++;
      }
      if (data.description && !getValues("description").trim()) {
        setValue("description", data.description, {
          shouldDirty: true,
          shouldValidate: true,
        });
        filled++;
      }
      if (data.imageUrl && !getValues("imageUrl").trim()) {
        setValue("imageUrl", data.imageUrl, {
          shouldDirty: true,
          shouldValidate: true,
        });
        filled++;
      }
      if (data.currentPrice !== null && getValues("currentPrice") == null) {
        setValue("currentPrice", data.currentPrice, {
          shouldDirty: true,
          shouldValidate: true,
        });
        filled++;
      }
      const effectivePrice = getValues("currentPrice");
      if (
        data.originalPrice != null &&
        getValues("originalPrice") == null &&
        effectivePrice != null &&
        data.originalPrice > effectivePrice
      ) {
        setValue("originalPrice", data.originalPrice, {
          shouldDirty: true,
          shouldValidate: true,
        });
        filled++;
      }
      if (data.sourceUrl && data.sourceUrl !== requestedUrl) {
        const sourceHost = new URL(requestedUrl).hostname.toLowerCase();
        if (sourceHost === "meli.la" || sourceHost === "www.meli.la") {
          if (!getValues("affiliateUrl").trim())
            setValue("affiliateUrl", requestedUrl, { shouldDirty: true });
          setValue("sourceUrl", data.sourceUrl, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      }
      setImportNotice(
        (filled
          ? filled + " campo(s) preenchido(s). Revise os dados antes de salvar."
          : "Os campos já preenchidos foram preservados. Limpe os campos que deseja buscar novamente.") +
          (data.warnings.length ? " " + data.warnings.join(" ") : "")
      );
    },
  });
  const save = useServerAction<Offer, CreateOffer>({
    mutationFn: (body) =>
      offer
        ? reviseOffer(offer.id, reviseOfferSchema.parse(body))
        : createOffer(body),
    successMessage: offer
      ? "Oferta atualizada."
      : "Oferta cadastrada como pronta.",
    invalidateQueries: [queryKeys.offers.all],
    onSuccess: () => onSuccess?.(),
  });
  const money = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
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
        if (!groups.some((group) => group.id === values.whatsappGroupId)) {
          setError("whatsappGroupId", {
            message: "Selecione um grupo que continue nos seus favoritos.",
          });
          return;
        }
        const parsed = (
          offer ? reviseOfferSchema : createOfferSchema
        ).safeParse({
          ...values,
          affiliateUrl: values.affiliateUrl || undefined,
          couponCode: values.couponCode?.trim() || undefined,
          whatsappGroupId: values.whatsappGroupId || undefined,
        });
        if (!parsed.success) {
          setError("root.server", {
            message:
              parsed.error.issues[0]?.message ?? "Confira os dados da oferta.",
          });
          return;
        }
        save.mutate(parsed.data);
      })}
    >
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
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          loading={product.isPending}
          disabled={product.isPending || save.isPending}
          onClick={() => {
            setImportNotice(null);
            setImportImages([]);
            const parsed = createOfferSchema.shape.sourceUrl.safeParse(
              getValues("sourceUrl")
            );
            if (!parsed.success) {
              setError("sourceUrl", {
                message: "Informe o link do produto antes de buscar os dados.",
              });
              return;
            }
            clearErrors("sourceUrl");
            product.mutate(parsed.data);
          }}
        >
          <Download className="size-4" aria-hidden="true" />
          Buscar dados do link
        </Button>
        <p className="text-muted-foreground text-xs">
          No Mercado Livre, busca título, descrição, imagens e preços atual e
          original quando disponíveis. Os campos preenchidos são preservados.
        </p>
        {importNotice && (
          <Alert>
            <AlertDescription>{importNotice}</AlertDescription>
          </Alert>
        )}
        {product.error && (
          <Alert variant="destructive">
            <AlertDescription>
              {product.error.message} Você pode continuar preenchendo
              manualmente.
            </AlertDescription>
          </Alert>
        )}
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
          <p>
            💵 Por:{" "}
            {typeof values.currentPrice === "number"
              ? money(values.currentPrice)
              : "Preço atual"}
          </p>
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
      {errors.root?.server?.message && (
        <Alert variant="destructive">
          <AlertDescription>{errors.root.server.message}</AlertDescription>
        </Alert>
      )}
      <p className="text-muted-foreground text-sm">
        {offer
          ? "Salvar atualiza os dados para o próximo envio. Mensagens já publicadas permanecem no grupo."
          : "A oferta será salva como pronta. Nenhuma mensagem será enviada ao grupo agora."}
      </p>
      <Button
        type="submit"
        loading={save.isPending}
        disabled={save.isPending || product.isPending}
        className="w-full"
      >
        {offer ? "Salvar alterações" : "Salvar oferta"}
      </Button>
    </form>
  );
}
