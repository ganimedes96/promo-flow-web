"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  ImageIcon,
  Package,
  Tag,
  CalendarClock,
  Save,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledInputCurrency } from "@/components/form/controllers/controlled-input-currency";
import { ControlledTextarea } from "@/components/form/controllers/controlled-text-area";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { ControlledSingleCheckbox } from "@/components/form/controllers/controlled-single-checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { savePromotion } from "@/domains/promotions/actions";
import {
  Promotion,
  PromotionInput,
  promotionSchema,
} from "@/domains/promotions/types";
import { useServerAction } from "@/hooks/use-server-action";

const stores = [
  { id: "MERCADO_LIVRE", name: "Mercado Livre" },
  { id: "AMAZON", name: "Amazon" },
  { id: "SHOPEE", name: "Shopee" },
];
const money = (value?: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "R$ 0,00";
type FormValues = PromotionInput & { validUntil: string };

export function PromotionForm({
  promotion,
  onSuccess,
  onCancel,
}: {
  promotion?: Promotion;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  const [failedImage, setFailedImage] = useState("");
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
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
  const values = useWatch({ control });
  const current = Number(values.currentPrice);
  const original = Number(values.originalPrice);
  const discount =
    original > current && current > 0
      ? Math.round((1 - current / original) * 100)
      : 0;
  const image = values.imageUrl?.trim() || "";
  const validImage = /^https:\/\//i.test(image) && image !== failedImage;
  const action = useServerAction<Promotion, PromotionInput & { id?: string }>({
    mutationFn: savePromotion,
    onSuccess,
  });

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={handleSubmit(({ validUntil, ...data }) => {
        const date = validUntil ? new Date(validUntil) : null;
        if (date && !Number.isFinite(date.getTime())) {
          setError("validUntil", { message: "Informe uma data válida." });
          return;
        }
        if (data.isPublished && date && date <= new Date()) {
          setError("validUntil", {
            message: "Escolha uma validade futura para publicar.",
          });
          return;
        }
        const parsed = promotionSchema.safeParse({
          ...data,
          expiresAt: date?.toISOString(),
        });
        if (!parsed.success) {
          for (const issue of parsed.error.issues) {
            setError(issue.path[0] as keyof FormValues, {
              message: issue.message,
            });
          }
          return;
        }
        action.mutate({ ...parsed.data, id: promotion?.id });
      })}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_250px]">
          <div className="min-w-0 space-y-5">
            <section className="bg-card space-y-5 rounded-2xl border p-5">
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
                  <Package className="size-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">Sobre o produto</h3>
                  <p className="text-muted-foreground text-xs">
                    Os detalhes que vão aparecer na central.
                  </p>
                </div>
              </div>
              <ControlledInput
                control={control}
                name="title"
                label="Nome do produto *"
                placeholder="Ex.: Fone Bluetooth com cancelamento de ruído"
                maxLength={200}
                rules={{ required: "Informe o produto." }}
              />
              <ControlledTextarea
                control={control}
                name="description"
                label="Descrição *"
                placeholder="Destaque os benefícios, a variação e as condições da oferta…"
                limit={2000}
                rules={{ required: "Informe a descrição." }}
              />
              <ControlledCombobox
                control={control}
                name="marketplace"
                label="Loja *"
                placeholder="Selecione a loja"
                options={stores}
              />
              <ControlledInput
                control={control}
                name="sourceUrl"
                label="Link do produto *"
                placeholder="https://..."
                type="url"
              />
              <div className="border-border/70 border-t pt-4">
                <ControlledInput
                  control={control}
                  name="imageUrl"
                  label="Imagem do produto *"
                  placeholder="Cole o endereço HTTPS da imagem"
                  type="url"
                />
                <p className="text-muted-foreground mt-2 text-xs">
                  Prefira uma imagem nítida. A prévia aparece ao lado.
                </p>
              </div>
            </section>

            <section className="bg-card space-y-5 rounded-2xl border p-5">
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
                  <Tag className="size-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">Preço e desconto</h3>
                  <p className="text-muted-foreground text-xs">
                    O desconto é calculado a partir dos preços.
                  </p>
                </div>
              </div>
              <div className="grid items-start gap-4 sm:grid-cols-2">
                <ControlledInputCurrency
                  control={control}
                  name="currentPrice"
                  label="Preço atual *"
                  placeholder="0,00"
                  rules={{
                    required: "Informe o preço atual.",
                    min: {
                      value: 0.01,
                      message: "Informe um valor maior que zero.",
                    },
                  }}
                />
                <ControlledInputCurrency
                  control={control}
                  name="originalPrice"
                  label="Preço original"
                  placeholder="Opcional"
                />
              </div>
              <ControlledInput
                control={control}
                name="couponCode"
                label="Cupom de desconto"
                placeholder="Ex.: OFERTA10 · opcional"
                maxLength={100}
              />
            </section>

            <section className="bg-card space-y-5 rounded-2xl border p-5">
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
                  <CalendarClock className="size-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">Disponibilidade</h3>
                  <p className="text-muted-foreground text-xs">
                    Escolha quando a promoção fica visível.
                  </p>
                </div>
              </div>
              <ControlledInput
                control={control}
                name="validUntil"
                label="Válida até"
                placeholder=""
                type="datetime-local"
              />
              <p className="text-muted-foreground -mt-3 text-xs">
                Opcional. Ao vencer, ela deixa de aparecer na central.
              </p>
              <div
                className={
                  "rounded-xl border p-4 transition-colors " +
                  (values.isPublished
                    ? "border-primary/30 bg-primary/10"
                    : "bg-muted/40")
                }
              >
                <ControlledSingleCheckbox
                  control={control}
                  name="isPublished"
                  label="Publicar na central"
                />
                <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                  {values.isPublished
                    ? "Os usuários poderão escolher esta promoção e preparar suas ofertas."
                    : "Salve como rascunho e publique quando estiver pronta."}
                </p>
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-0">
            <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
              <Eye className="size-3.5" /> Prévia na central
            </div>
            <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
              <div className="relative flex aspect-square items-center justify-center bg-white p-5">
                {validImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={values.title || "Prévia do produto"}
                    referrerPolicy="no-referrer"
                    className="size-full object-contain"
                    onError={() => setFailedImage(image)}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center text-slate-400">
                    <ImageIcon className="size-10 stroke-1" />
                    <p className="max-w-36 text-xs">
                      {image
                        ? "Não foi possível carregar esta imagem."
                        : "A imagem do produto aparece aqui"}
                    </p>
                  </div>
                )}
                {discount > 0 && (
                  <Badge className="absolute top-3 right-3 shadow-sm">
                    {discount}% OFF
                  </Badge>
                )}
              </div>
              <div className="space-y-3 p-4">
                <Badge variant="secondary" className="text-[10px]">
                  {stores.find((store) => store.id === values.marketplace)
                    ?.name || "Loja"}
                </Badge>
                <p className="line-clamp-3 text-sm leading-relaxed font-semibold">
                  {values.title || "Nome da sua próxima promoção"}
                </p>
                <div>
                  {discount > 0 && (
                    <p className="text-muted-foreground text-xs line-through">
                      {money(original)}
                    </p>
                  )}
                  <p className="text-primary text-2xl font-bold tracking-tight">
                    {money(values.currentPrice)}
                  </p>
                </div>
                {values.couponCode && (
                  <p className="bg-muted rounded-lg border border-dashed px-3 py-2 text-xs">
                    Cupom{" "}
                    <strong className="break-all">{values.couponCode}</strong>
                  </p>
                )}
                <div className="bg-primary/10 text-primary flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold">
                  Usar promoção <ArrowUpRight className="size-3.5" />
                </div>
              </div>
            </div>
            <p className="text-muted-foreground px-1 text-xs leading-relaxed">
              Cada usuário adiciona seu próprio link de afiliado e escolhe os
              grupos ao usar a promoção.
            </p>
          </aside>
        </div>
        {(action.error || errors.root) && (
          <Alert variant="destructive" className="mt-5">
            <AlertDescription>
              {action.error?.message || errors.root?.message}
            </AlertDescription>
          </Alert>
        )}
      </div>
      <div className="bg-background flex shrink-0 flex-wrap items-center justify-between gap-3 border-t px-5 py-4 sm:px-7">
        <p className="text-muted-foreground text-xs">
          {values.isPublished
            ? "Disponível para os usuários ao salvar"
            : "Rascunho · visível apenas para você"}
        </p>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              disabled={action.isPending}
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            loading={action.isPending}
            disabled={action.isPending}
          >
            <Save className="size-4" />
            {values.isPublished ? "Salvar e publicar" : "Salvar rascunho"}
          </Button>
        </div>
      </div>
    </form>
  );
}
