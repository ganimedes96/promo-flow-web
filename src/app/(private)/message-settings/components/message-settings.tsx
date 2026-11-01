"use client";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import {
  CheckCheck,
  LoaderCircle,
  MessageCircle,
  RotateCcw,
  Save,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/feedback/loading-skeletons";
import { ApiErrorCard } from "@/components/feedback/api-error-card";
import { ControlledSingleCheckbox } from "@/components/form/controllers/controlled-single-checkbox";
import { ControlledCombobox } from "@/components/form/controllers/controlled-combobox";
import { ControlledInput } from "@/components/form/controllers/controlled-input";
import { ControlledTextarea } from "@/components/form/controllers/controlled-text-area";
import { queryKeys } from "@/lib/tanstack-query/keys";
import { useServerAction } from "@/hooks/use-server-action";
import { getMessageSettings } from "@/domains/message-settings/client";
import { saveMessageSettings } from "@/domains/message-settings/actions";
import {
  DEFAULT_MESSAGE_TEMPLATE,
  MessageTemplate,
  messageTemplateSchema,
} from "@/domains/message-settings/types";
import { MessagePreview } from "@/domains/message-settings/components/message-preview";
const fields = [
  { key: "showHeadline", label: "Chamada padrão" },
  { key: "showTitle", label: "Nome do produto" },
  { key: "showDescription", label: "Descrição (até 300 caracteres)" },
  { key: "showCurrentPrice", label: "Preço atual" },
  { key: "showOriginalPrice", label: "Preço original" },
  { key: "showDiscount", label: "Porcentagem de desconto" },
  { key: "showCoupon", label: "Cupom, quando disponível" },
  { key: "showLink", label: "Link de compra / afiliado" },
  { key: "showFooter", label: "Rodapé personalizado" },
] as const;
export function MessageSettings() {
  const { data: session } = useSession();
  const settings = useQuery({
    queryKey: queryKeys.messageSettings.forUser(session?.user.id),
    queryFn: getMessageSettings,
    enabled: !!session?.user.id,
    retry: false,
  });
  if (settings.isPending) return <PageSkeleton />;
  if (settings.isError || !settings.data)
    return (
      <ApiErrorCard
        error={settings.error}
        title="Não foi possível carregar seu padrão de mensagem"
        onRetry={() => void settings.refetch()}
        retrying={settings.isFetching}
      />
    );
  return <TemplateForm initial={settings.data} />;
}
function TemplateForm({ initial }: { initial: MessageTemplate }) {
  const form = useForm<MessageTemplate>({ defaultValues: initial });
  const values = useWatch({ control: form.control });
  const parsed = messageTemplateSchema.safeParse(values);
  const save = useServerAction({
    mutationFn: saveMessageSettings,
    invalidateQueries: [queryKeys.messageSettings.all],
    successMessage: "Seu padrão de mensagem foi salvo.",
    onSuccess: (response) =>
      form.reset(messageTemplateSchema.parse(response.data)),
  });
  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <MessageCircle className="text-primary" />
          Mensagem com a sua cara
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          Marque o que seus grupos recebem e acompanhe a prévia. Este padrão
          vale para todas as suas conexões do WhatsApp.
        </p>
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((data) => {
            const result = messageTemplateSchema.safeParse(data);
            if (!result.success) {
              form.setError("root", {
                message: "Confira os textos e as opções selecionadas.",
              });
              return;
            }
            if (
              result.data.watermarkEnabled &&
              !result.data.watermarkText.trim()
            ) {
              form.setError("watermarkText", {
                message: "Informe o texto da marca d’água.",
              });
              return;
            }
            if (result.data.showLinkPreview && !result.data.showLink) {
              form.setError("root", {
                message:
                  "Mantenha o link de compra para usar a prévia do link.",
              });
              return;
            }
            save.mutate(result.data);
          })}
        >
          <Card className="border-primary/25 overflow-hidden">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-base">
                Imagem ou prévia, com a sua marca
              </CardTitle>
              <CardDescription>
                Escolha como a oferta aparece no grupo. A marca d’água é
                aplicada somente à foto enviada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { id: "image", label: "Foto do produto" },
                  { id: "preview", label: "Prévia do link" },
                  { id: "text", label: "Somente texto" },
                ].map((mode) => {
                  const active =
                    mode.id ===
                    (values.showImage
                      ? "image"
                      : values.showLinkPreview
                        ? "preview"
                        : "text");
                  return (
                    <Button
                      key={mode.id}
                      type="button"
                      variant={active ? "default" : "outline"}
                      aria-pressed={active}
                      disabled={save.isPending}
                      onClick={() => {
                        form.setValue("showImage", mode.id === "image", {
                          shouldDirty: true,
                        });
                        form.setValue(
                          "showLinkPreview",
                          mode.id === "preview",
                          { shouldDirty: true }
                        );
                        if (mode.id === "preview")
                          form.setValue("showLink", true, {
                            shouldDirty: true,
                          });
                      }}
                    >
                      {mode.label}
                    </Button>
                  );
                })}
              </div>
              {values.showImage ? (
                <div className="bg-primary/5 space-y-4 rounded-xl border p-4">
                  <ControlledSingleCheckbox
                    control={form.control}
                    name="watermarkEnabled"
                    label="Aplicar minha marca d’água"
                    disabled={save.isPending}
                  />
                  <ControlledInput
                    control={form.control}
                    name="watermarkText"
                    label="Sua marca ou @"
                    placeholder="@seuperfil"
                    maxLength={40}
                    disabled={save.isPending || !values.watermarkEnabled}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ControlledCombobox
                      control={form.control}
                      name="watermarkPosition"
                      label="Posição"
                      placeholder="Escolha o canto"
                      options={[
                        { id: "bottom-right", name: "Inferior direito" },
                        { id: "bottom-left", name: "Inferior esquerdo" },
                        { id: "top-right", name: "Superior direito" },
                        { id: "top-left", name: "Superior esquerdo" },
                      ]}
                      disabled={save.isPending || !values.watermarkEnabled}
                    />
                    <ControlledCombobox
                      control={form.control}
                      name="watermarkOpacity"
                      label="Opacidade"
                      placeholder="Escolha a intensidade"
                      options={[
                        { id: 30, name: "Discreta · 30%" },
                        { id: 70, name: "Equilibrada · 70%" },
                        { id: 100, name: "Sólida · 100%" },
                      ]}
                      disabled={save.isPending || !values.watermarkEnabled}
                    />
                  </div>
                  <p className="text-muted-foreground text-xs">
                    O arquivo original é preservado. Sua marca é aplicada à
                    cópia enviada no WhatsApp.
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">
                  {values.showLinkPreview
                    ? "O WhatsApp tenta gerar a prévia do link de compra. Imagem, título e disponibilidade dependem da loja; não aplicamos marca d’água nessa prévia."
                    : "A oferta será enviada sem foto e sem solicitar prévia do link."}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Seu padrão</CardTitle>
              <CardDescription>
                Dados ausentes, como cupom ou preço anterior, não aparecem na
                mensagem.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <div
                  key={field.key}
                  className="bg-primary/5 rounded-xl border p-3 transition-colors"
                >
                  <ControlledSingleCheckbox
                    control={form.control}
                    name={field.key}
                    label={field.label}
                    disabled={save.isPending}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Suas palavras</CardTitle>
              <CardDescription>
                A frase de cada oferta pode substituir a chamada padrão.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <ControlledInput
                control={form.control}
                name="headline"
                label="Chamada padrão"
                placeholder="Ex.: Olha esse achado que separei para vocês!"
                maxLength={80}
                disabled={save.isPending || !values.showHeadline}
              />
              <ControlledTextarea
                control={form.control}
                name="footer"
                label="Rodapé"
                placeholder="Convide seus amigos e acompanhe os próximos achados."
                limit={200}
                disabled={save.isPending || !values.showFooter}
              />
              <p className="text-muted-foreground text-xs">
                A alteração vale para os próximos envios, inclusive ofertas já
                agendadas. Mensagens já publicadas não mudam.
              </p>
            </CardContent>
          </Card>
          {(save.error || form.formState.errors.root) && (
            <p role="alert" className="text-destructive text-sm">
              {save.error?.message || form.formState.errors.root?.message}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Save />
              )}
              Salvar meu padrão
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={save.isPending}
              onClick={() => form.reset(DEFAULT_MESSAGE_TEMPLATE)}
            >
              <RotateCcw />
              Restaurar na prévia
            </Button>
          </div>
          <p className="text-muted-foreground flex items-center gap-2 text-xs">
            <CheckCheck className="size-4" />A prévia não salva nem envia
            mensagens.
          </p>
        </form>
        <aside className="lg:sticky lg:top-6">
          <MessagePreview template={parsed.success ? parsed.data : initial} />
        </aside>
      </div>
    </div>
  );
}
